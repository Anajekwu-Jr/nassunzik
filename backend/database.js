import { DatabaseSync } from 'node:sqlite';
import fs from 'node:fs';
import path from 'node:path';
import bcrypt from 'bcryptjs';

const isVercel = Boolean(process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_NAME);
const ROOT_DATA_DIR = path.resolve(process.cwd(), 'data');

let DB_DIR = ROOT_DATA_DIR;
let DB_PATH = path.join(DB_DIR, 'nass_portal.db');

if (isVercel) {
  DB_DIR = '/tmp';
  DB_PATH = path.join(DB_DIR, 'nass_portal.db');
  
  if (!fs.existsSync(DB_PATH)) {
    const bundledDb = path.join(ROOT_DATA_DIR, 'nass_portal.db');
    if (fs.existsSync(bundledDb)) {
      try {
        fs.copyFileSync(bundledDb, DB_PATH);
      } catch (err) {
        console.warn('Could not copy bundled DB to /tmp, will initialize freshly:', err.message);
      }
    }
  }
} else {
  if (!fs.existsSync(DB_DIR)) {
    fs.mkdirSync(DB_DIR, { recursive: true });
  }
}

const db = new DatabaseSync(DB_PATH);

// Enable foreign keys and WAL mode for performance
db.exec('PRAGMA foreign_keys = ON;');

export function initDatabase() {
  // 1. Users table (Admins, Editors, Super Admins)
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      role TEXT NOT NULL DEFAULT 'ADMIN', -- 'SUPER_ADMIN', 'ADMIN', 'EDITOR'
      full_name TEXT NOT NULL,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at TEXT NOT NULL DEFAULT (datetime('now'))
    );
  `);

  // 2. Courses table
  db.exec(`
    CREATE TABLE IF NOT EXISTS courses (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      code TEXT UNIQUE NOT NULL, -- e.g. 'STA 111'
      title TEXT NOT NULL,       -- e.g. 'Descriptive Statistics'
      level INTEGER NOT NULL,    -- 100, 200, 300, 400
      semester INTEGER NOT NULL, -- 1 or 2
      credit_units INTEGER NOT NULL DEFAULT 3,
      status TEXT DEFAULT 'Compulsory', -- 'Compulsory', 'Elective'
      description TEXT NOT NULL,
      outline TEXT,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at TEXT NOT NULL DEFAULT (datetime('now'))
    );
  `);

  try {
    db.exec("ALTER TABLE courses ADD COLUMN status TEXT DEFAULT 'Compulsory';");
  } catch (_) {}

  // 3. Course resources (past questions, syllabi, lecture notes)
  db.exec(`
    CREATE TABLE IF NOT EXISTS course_resources (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      course_id INTEGER NOT NULL,
      title TEXT NOT NULL,
      resource_type TEXT NOT NULL, -- 'past_question', 'outline', 'lecture_note', 'textbook'
      file_name TEXT NOT NULL,
      file_path TEXT NOT NULL,
      file_size INTEGER DEFAULT 0,
      academic_year TEXT,          -- e.g. '2023/2024'
      semester INTEGER,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at TEXT NOT NULL DEFAULT (datetime('now')),
      FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE
    );
  `);

  // 4. Staff (Lecturers, HOD, Staff Adviser)
  db.exec(`
    CREATE TABLE IF NOT EXISTS staff (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      title TEXT NOT NULL,          -- e.g. 'Head of Department', 'Professor', 'Senior Lecturer'
      role_category TEXT NOT NULL,  -- 'HOD', 'ADVISER', 'ACADEMIC', 'NON_ACADEMIC'
      qualifications TEXT NOT NULL, -- e.g. 'B.Sc, M.Sc, Ph.D (Statistics), FSS'
      specialization TEXT,          -- e.g. 'Stochastic Processes, Biostatistics'
      email TEXT,
      phone TEXT,
      office TEXT,
      photo_url TEXT,
      bio TEXT,
      display_order INTEGER DEFAULT 0,
      cirs_url TEXT,
      cirs_id TEXT,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at TEXT NOT NULL DEFAULT (datetime('now'))
    );
  `);

  // Ensure cirs columns exist for migrated tables
  try { db.exec("ALTER TABLE staff ADD COLUMN cirs_url TEXT;"); } catch (_) {}
  try { db.exec("ALTER TABLE staff ADD COLUMN cirs_id TEXT;"); } catch (_) {}

  // 5. Executives (NASS UNIZIK Student Executives)
  db.exec(`
    CREATE TABLE IF NOT EXISTS executives (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      office TEXT NOT NULL,        -- 'President', 'Vice President', 'Secretary General', etc.
      level INTEGER NOT NULL,      -- 300, 400
      phone TEXT,
      email TEXT,
      photo_url TEXT,
      bio TEXT,
      tenure TEXT NOT NULL,        -- e.g. '2025/2026'
      display_order INTEGER DEFAULT 0,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at TEXT NOT NULL DEFAULT (datetime('now'))
    );
  `);

  // 6. Timetable
  db.exec(`
    CREATE TABLE IF NOT EXISTS timetable (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      level INTEGER NOT NULL,      -- 100, 200, 300, 400
      semester INTEGER NOT NULL,   -- 1, 2
      day TEXT NOT NULL,           -- 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'
      start_time TEXT NOT NULL,    -- '08:00 AM'
      end_time TEXT NOT NULL,      -- '10:00 AM'
      course_code TEXT NOT NULL,   -- 'STA 211'
      course_title TEXT NOT NULL,
      lecturer TEXT NOT NULL,
      venue TEXT NOT NULL,         -- 'LT 1', 'Statistics Lab 2'
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at TEXT NOT NULL DEFAULT (datetime('now'))
    );
  `);

  // 7. News
  db.exec(`
    CREATE TABLE IF NOT EXISTS news (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      slug TEXT UNIQUE NOT NULL,
      summary TEXT NOT NULL,
      content TEXT NOT NULL,
      category TEXT NOT NULL,       -- 'Academic', 'Association', 'Events', 'General'
      author TEXT NOT NULL DEFAULT 'NASS Secretariat',
      featured_image TEXT,
      published_at TEXT NOT NULL DEFAULT (datetime('now')),
      is_featured INTEGER DEFAULT 0,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at TEXT NOT NULL DEFAULT (datetime('now'))
    );
  `);

  // 8. Events
  db.exec(`
    CREATE TABLE IF NOT EXISTS events (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      event_date TEXT NOT NULL,    -- YYYY-MM-DD
      event_time TEXT NOT NULL,    -- '10:00 AM'
      venue TEXT NOT NULL,
      description TEXT NOT NULL,
      category TEXT NOT NULL,      -- 'Workshop', 'Conference', 'Social', 'Seminar', 'Orientation'
      status TEXT NOT NULL DEFAULT 'UPCOMING', -- 'UPCOMING', 'ONGOING', 'PAST'
      registration_url TEXT,
      banner_image TEXT,
      is_featured INTEGER DEFAULT 0,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at TEXT NOT NULL DEFAULT (datetime('now'))
    );
  `);

  // 9. SIWES Resources
  db.exec(`
    CREATE TABLE IF NOT EXISTS siwes_resources (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      description TEXT NOT NULL,
      category TEXT NOT NULL,      -- 'Guide', 'Logbook Sample', 'Technical Report', 'Forms'
      file_name TEXT NOT NULL,
      file_path TEXT NOT NULL,
      file_size INTEGER DEFAULT 0,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at TEXT NOT NULL DEFAULT (datetime('now'))
    );
  `);

  // 10. Project Resources
  db.exec(`
    CREATE TABLE IF NOT EXISTS project_resources (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      description TEXT NOT NULL,
      category TEXT NOT NULL,      -- 'Topic Guidelines', 'Proposal Template', 'Data Analysis in R/Python', 'Defense Guide', 'Sample Thesis'
      file_name TEXT NOT NULL,
      file_path TEXT NOT NULL,
      file_size INTEGER DEFAULT 0,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at TEXT NOT NULL DEFAULT (datetime('now'))
    );
  `);

  // 11. Archive / Gallery
  db.exec(`
    CREATE TABLE IF NOT EXISTS gallery (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      year INTEGER NOT NULL,       -- e.g. 2026, 2025
      event_name TEXT NOT NULL,    -- 'Orientation', 'NASS Week', 'Seminar', 'Dinner'
      image_url TEXT NOT NULL,
      description TEXT,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at TEXT NOT NULL DEFAULT (datetime('now'))
    );
  `);

  // 12. Contacts
  db.exec(`
    CREATE TABLE IF NOT EXISTS contacts (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      role_or_title TEXT NOT NULL,
      department_or_level TEXT NOT NULL,
      email TEXT,
      phone TEXT,
      office_location TEXT,
      contact_type TEXT NOT NULL, -- 'HOD', 'ADVISER', 'EXECUTIVE', 'COURSE_REP', 'HELPDESK'
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at TEXT NOT NULL DEFAULT (datetime('now'))
    );
  `);

  // 13. Announcements
  db.exec(`
    CREATE TABLE IF NOT EXISTS announcements (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      content TEXT NOT NULL,
      priority TEXT NOT NULL DEFAULT 'NORMAL', -- 'URGENT', 'IMPORTANT', 'NORMAL'
      image_url TEXT,
      is_active INTEGER DEFAULT 1,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at TEXT NOT NULL DEFAULT (datetime('now'))
    );
  `);

  // Migration helper: ensure image_url exists on announcements
  try {
    db.exec("ALTER TABLE announcements ADD COLUMN image_url TEXT;");
  } catch (e) {
    // Column already exists
  }

  // 14. Site Settings
  db.exec(`
    CREATE TABLE IF NOT EXISTS site_settings (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL,
      updated_at TEXT NOT NULL DEFAULT (datetime('now'))
    );
  `);

  // 15. FAQs
  db.exec(`
    CREATE TABLE IF NOT EXISTS faqs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      question TEXT NOT NULL,
      answer TEXT NOT NULL,
      category TEXT NOT NULL DEFAULT 'General', -- 'Academic', 'SIWES', 'Projects', 'Registration', 'General'
      sort_order INTEGER DEFAULT 0,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at TEXT NOT NULL DEFAULT (datetime('now'))
    );
  `);

  // Safe migrations for newly added columns
  try {
    db.exec(`ALTER TABLE events ADD COLUMN is_featured INTEGER DEFAULT 0;`);
  } catch (_) {}

  seedInitialData();
}

function seedInitialData() {
  // Check if users table is populated
  const userCount = db.prepare('SELECT COUNT(*) as count FROM users').get();
  if (userCount.count === 0) {
    const salt = bcrypt.genSaltSync(10);
    const hash = bcrypt.hashSync('thenextstandard27!', salt);
    const insertUser = db.prepare(`
      INSERT INTO users (username, email, password_hash, role, full_name)
      VALUES (?, ?, ?, ?, ?)
    `);
    insertUser.run('admin', 'admin@nass-unizik.org', hash, 'SUPER_ADMIN', 'NASS Chief Administrator');
    insertUser.run('editor', 'editor@nass-unizik.org', hash, 'EDITOR', 'NASS Editorial Board');
  }

  // Check if site settings are set
  const settingsCount = db.prepare('SELECT COUNT(*) as count FROM site_settings').get();
  if (settingsCount.count < 10) {
    const insertSetting = db.prepare('INSERT INTO site_settings (key, value) VALUES (?, ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value');
    insertSetting.run('department_name', 'Department of Statistics');
    insertSetting.run('university', 'Nnamdi Azikiwe University (UNIZIK)');
    insertSetting.run('faculty', 'Faculty of Physical Sciences');
    insertSetting.run('location', 'Awka, Anambra State, Nigeria');
    insertSetting.run('motto', 'Facts from Figures');
    insertSetting.run('email', 'statistics@unizik.edu.ng');
    insertSetting.run('phone', '+234 803 123 4567');
    insertSetting.run('session', '2025/2026');
    insertSetting.run('semester', 'First Semester');
    insertSetting.run('hod_name', 'Prof Francis Chukwuemeka Eze');
    insertSetting.run('hod_title', 'Head of Department (HOD), Statistics');
    insertSetting.run('hod_image', '/resources/images/staff_hod.jpg');
    insertSetting.run('hod_welcome', 'On behalf of the academic and technical staff of the Department of Statistics, Nnamdi Azikiwe University (UNIZIK), I warmly welcome all new and returning students, researchers, and visitors to our departmental portal. Statistics is the cornerstone of modern scientific discovery, evidence-based policymaking, artificial intelligence, and economic planning. Guided by our motto, "Facts from Figures", our curriculum is rigorously crafted to equip students with mathematical mastery, probabilistic depth, and cutting-edge computational skills in R, Python, and modern data analytical tools. This portal serves as an authoritative central repository for course catalogs, past questions, lecture timetables, and academic guidance. We encourage every student to utilize these resources diligently as you pursue academic excellence.');
    insertSetting.run('about_history', 'The Department of Statistics at Nnamdi Azikiwe University (UNIZIK), Awka, is situated within the Faculty of Physical Sciences. Since its inception, the department has grown into a premier national center for statistical education, applied demographic research, biometric modeling, and econometrics. Our programs are designed to cultivate intellectual rigor, computational agility, and ethical integrity. Today, data is the central currency of human decision-making: from biomedical clinical trials to algorithmic trading, artificial intelligence, national census tracking, and climate informatics. Our graduates lead statistical divisions in the civil service, global technology companies, and multilateral development banks.');
    insertSetting.run('about_vision', 'To be a globally recognized center of statistical excellence, producing top-tier statisticians and data scientists capable of pioneering innovations in quantitative methodology and transforming socioeconomic development.');
    insertSetting.run('about_mission', 'To provide robust undergraduate and postgraduate education steeped in mathematical foundations and computational technology, fostering high-impact empirical research that provides actionable solutions to industry and governance.');
    insertSetting.run('about_philosophy', 'The philosophy of the Department of Statistics is rooted in the conviction that empirical reality is best understood and optimized through rigorous probabilistic reasoning, mathematical formulation, and computational data exploration. We nurture students to transition from descriptive observers into predictive modelers and strategic decision architects.');
    insertSetting.run('about_facilities', 'The department features a 60-seat Computational Statistics & Data Science Laboratory equipped with modern workstations, statistical suites (R, Python, SPSS, Stata, SAS), a high-speed fiber internet backbone, departmental library holding over 1,500 specialized statistical reference volumes, and seminar presentation auditoriums.');
    insertSetting.run('stat_students', '300+');
    insertSetting.run('stat_faculty', '28');
    insertSetting.run('stat_courses', '45+');
    insertSetting.run('stat_papers', '200+');
    insertSetting.run('stat_graduates', '1000+');
    insertSetting.run('stat_accreditation', 'Full NUC Accreditation');
    insertSetting.run('office_hours', 'Monday – Friday: 8:00 AM – 4:00 PM');
    insertSetting.run('office_location', 'Statistics Admintrative Office, Ground floor, New Physical Sciences Building, science village, Unizik, Awka');
  }

  // Seed Announcements if empty
  const annCount = db.prepare('SELECT COUNT(*) as count FROM announcements').get();
  if (annCount.count === 0) {
    const insertAnn = db.prepare(`
      INSERT INTO announcements (title, content, priority, is_active)
      VALUES (?, ?, ?, ?)
    `);
    insertAnn.run(
      'Resumption of First Semester 2025/2026 Academic Session',
      'All statistics students are reminded that departmental course registration and verification of payments closes on Friday, October 30th. Ensure your course advisors sign your green files.',
      'URGENT',
      1
    );
    insertAnn.run(
      'SIWES Orientation & Placement Submission Deadline',
      '300 Level students embarking on the 6-month Industrial Training must submit their acceptance letters to the Departmental SIWES Coordinator before the end of the month.',
      'IMPORTANT',
      1
    );
    insertAnn.run(
      'NASS Annual Statistics Bootcamp & R/Python Workshop',
      'Registration is now open for the hands-on data analytics and statistical modeling bootcamp covering R, SPSS, and Python.',
      'NORMAL',
      1
    );
  }

  // Seed Courses if empty
  const courseCount = db.prepare('SELECT COUNT(*) as count FROM courses').get();
  if (courseCount.count === 0) {
    const insertCourse = db.prepare(`
      INSERT INTO courses (code, title, level, semester, credit_units, description, outline)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `);

    // 100 Level
    insertCourse.run(
      'STA 111',
      'Descriptive Statistics',
      100,
      1,
      3,
      'Definition, nature and scope of statistics. Frequency distribution, measures of central tendency, dispersion, skewness and kurtosis.',
      'Unit 1: Nature of statistical inquiries.\nUnit 2: Tabular and graphical presentation.\nUnit 3: Mean, Median, Mode, Quantiles.\nUnit 4: Variance, Standard Deviation, Mean Deviation.\nUnit 5: Moments, Skewness and Kurtosis.'
    );
    insertCourse.run(
      'STA 121',
      'Introduction to Probability I',
      100,
      1,
      2,
      'Basic concepts of probability, sample spaces, events, addition and multiplication theorems, conditional probability and Bayes theorem.',
      'Unit 1: Set theory and sample space.\nUnit 2: Probability axioms and rules.\nUnit 3: Conditional probability and Independence.\nUnit 4: Bayes theorem and applications.'
    );
    insertCourse.run(
      'STA 132',
      'Statistical Computing I',
      100,
      2,
      2,
      'Introduction to computational statistical tools, basic spreadsheets (Excel) and introduction to statistical programming environments.',
      'Unit 1: Spreadsheet basics for data organization.\nUnit 2: Descriptive metrics in software.\nUnit 3: Plotting and charting data.\nUnit 4: Introduction to command-line statistical scripting.'
    );

    // 200 Level
    insertCourse.run(
      'STA 211',
      'Probability Distributions I',
      200,
      1,
      3,
      'Discrete and continuous random variables, probability mass and density functions, mathematical expectation, moments and moment generating functions.',
      'Unit 1: Discrete distributions (Binomial, Poisson, Geometric, Hypergeometric).\nUnit 2: Continuous distributions (Uniform, Normal, Exponential, Gamma).\nUnit 3: Expectation, Variance and Moment Generating Functions.\nUnit 4: Chebyshev inequality.'
    );
    insertCourse.run(
      'STA 221',
      'Statistical Inference I',
      200,
      1,
      3,
      'Population and samples, sampling distributions, point estimation, properties of good estimators (unbiasedness, consistency, efficiency, sufficiency).',
      'Unit 1: Concepts of estimation and inference.\nUnit 2: Maximum Likelihood Estimation (MLE) and Method of Moments.\nUnit 3: Confidence intervals for means, proportions and variances.\nUnit 4: Introduction to Hypothesis Testing.'
    );
    insertCourse.run(
      'STA 232',
      'Sampling Techniques I',
      200,
      2,
      2,
      'Principles of sample surveys, simple random sampling with and without replacement, stratified random sampling, cluster sampling and systematic sampling.',
      'Unit 1: Census vs Sample Survey.\nUnit 2: Simple Random Sampling estimators.\nUnit 3: Stratified Sampling and allocation strategies (Neyman, Proportional).\nUnit 4: Systematic and Cluster sampling designs.'
    );

    // 300 Level
    insertCourse.run(
      'STA 311',
      'Mathematical Statistics I',
      300,
      1,
      3,
      'Distribution of functions of random variables, transformation techniques, order statistics, bivariate and multivariate distributions, characteristic functions.',
      'Unit 1: Jacobians of transformations.\nUnit 2: Joint MGF and characteristic functions.\nUnit 3: Order statistics and their distributions.\nUnit 4: Sampling distributions (t, Chi-Square, F distributions).'
    );
    insertCourse.run(
      'STA 321',
      'Design and Analysis of Experiments I',
      300,
      1,
      3,
      'Principles of experimental design: replication, randomization, local control. Completely Randomized Design (CRD), Randomized Complete Block Design (RCBD), Latin Square Design (LSD).',
      'Unit 1: Fundamentals and linear statistical models.\nUnit 2: One-way ANOVA and CRD.\nUnit 3: Two-way ANOVA without interaction (RCBD).\nUnit 4: Latin Square Design and post-hoc multiple comparisons (Duncan, Tukey, LSD).'
    );
    insertCourse.run(
      'STA 331',
      'Regression Analysis',
      300,
      1,
      3,
      'Simple linear regression, least squares estimation, properties of estimators, inference on parameters, coefficient of determination, multiple linear regression and matrix approach.',
      'Unit 1: Simple linear regression derivation.\nUnit 2: Tests of hypothesis and confidence intervals.\nUnit 3: Multiple regression model in matrix form.\nUnit 4: Residual diagnostics, multicollinearity and model selection.'
    );
    insertCourse.run(
      'STA 399',
      'Students Industrial Work Experience Scheme (SIWES)',
      300,
      2,
      6,
      'Six months of industrial training in statistical and research departments of government agencies, banks, hospitals, research institutes or corporate industries.',
      'Practical attachment in industry applying statistical data collection, data quality validation, automated reporting, database querying and industrial research.'
    );

    // 400 Level
    insertCourse.run(
      'STA 401',
      'Statistical Inference II',
      400,
      1,
      3,
      'Uniformly Most Powerful (UMP) tests, Neyman-Pearson lemma, Likelihood Ratio Tests (LRT), interval estimation, Bayesian estimation and decision theory.',
      'Unit 1: Most Powerful and UMP tests.\nUnit 2: Neyman-Pearson theorem and proofs.\nUnit 3: Likelihood Ratio Criterion and asymptotic distributions.\nUnit 4: Bayesian priors, posteriors and loss functions.'
    );
    insertCourse.run(
      'STA 411',
      'Time Series Analysis',
      400,
      1,
      3,
      'Components of time series, stationary and non-stationary processes, autocorrelation and partial autocorrelation functions, AR, MA, ARMA, and ARIMA modeling, Box-Jenkins methodology.',
      'Unit 1: Trend, Seasonal and Cyclical decomposition.\nUnit 2: Autocovariance, Autocorrelation (ACF) and PACF.\nUnit 3: Stationarity testing (ADF, Phillips-Perron).\nUnit 4: ARMA & ARIMA parameter estimation, diagnostics and forecasting.'
    );
    insertCourse.run(
      'STA 421',
      'Multivariate Statistical Methods',
      400,
      1,
      3,
      'Multivariate normal distribution, estimation of mean vector and covariance matrix, Hotellings T-squared, MANOVA, Principal Component Analysis (PCA) and Factor Analysis.',
      'Unit 1: Multivariate random vectors and dispersion matrices.\nUnit 2: Hotellings T2 test for single and two independent samples.\nUnit 3: Principal Component Analysis (PCA) derivation and variance explained.\nUnit 4: Factor Analysis and Discriminant Analysis.'
    );
    insertCourse.run(
      'STA 431',
      'Stochastic Processes',
      400,
      1,
      3,
      'Markov chains, transition probability matrices, classification of states, Chapman-Kolmogorov equations, stationary distributions, Poisson processes and queuing systems.',
      'Unit 1: Discrete time Markov Chains and transition graphs.\nUnit 2: Transient, recurrent, absorbing and periodic states.\nUnit 3: Limiting distributions and ergodicity.\nUnit 4: Continuous-time Poisson process and M/M/1 queuing model.'
    );
    insertCourse.run(
      'STA 499',
      'Final Year Research Project',
      400,
      2,
      6,
      'Supervised individual empirical or theoretical statistical research project defended before an external and internal board of examiners.',
      'Proposal, Literature review, Methodology, Rigorous Data Analysis, Findings, Statistical interpretation, Report compilation and oral defense.'
    );
  }

  // Course Resources & Past Questions: initialized clean, ready for official Drive integration
  // (Demo and sample PDFs removed per user request)

  // Seed / Sync Staff with Official Departmental CIRS Roster
  const officialStaffPath = path.join(DB_DIR, "official_cirs_staff.json");
  let staffList = [];
  if (fs.existsSync(officialStaffPath)) {
    try {
      staffList = JSON.parse(fs.readFileSync(officialStaffPath, "utf-8"));
    } catch (_) {}
  }

  // Seed staff roster if empty
  const staffCount = db.prepare("SELECT COUNT(*) as count FROM staff").get();
  if (staffCount.count === 0 && staffList.length > 0) {
    const insertStaff = db.prepare(`
      INSERT INTO staff (name, title, role_category, qualifications, specialization, email, phone, office, photo_url, bio, display_order, cirs_url, cirs_id, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime("now"))
    `);

    staffList.forEach(s => {
      insertStaff.run(
        s.name,
        s.title,
        s.role_category,
        s.qualifications || "",
        s.specialization || "",
        s.email || "",
        s.phone || "",
        s.office || "",
        s.photo_url || "/resources/images/staff_default.jpg",
        s.bio || "",
        s.display_order || 10,
        s.cirs_url || "",
        s.cirs_id || ""
      );
    });
  }

  // Seed or synchronize Executives with official portraits from Google Drive
  const officialExecs = [
    {
      name: 'Comr. Anajekwu Chidera Patrick (PhanCore)',
      office: 'President & Executive Lead',
      level: 400,
      phone: '08087955696',
      email: 'cp.anajekwu@stu.unizik.edu.ng',
      photo_url: '/resources/images/executives/president.png?v=2',
      bio: 'Leading the Executive Administration with dedication to student welfare, academic excellence, data skills development, and industrial linkages.',
      tenure: '2026/2027',
      display_order: 1
    },
    {
      name: 'Comr. Obunadike Vivian Chiemerie',
      office: 'Vice President',
      level: 400,
      phone: '+234 916 664 5452',
      email: 'cv.obunadike@stu.unizik.edu.ng',
      photo_url: '/resources/images/executives/vice_president.jpg?v=2',
      bio: 'Vice President of NASS UNIZIK Chapter, leading executive committee oversight, student welfare coordination, and collaborative departmental development.',
      tenure: '2026/2027',
      display_order: 2
    },
    {
      name: 'Comr. Chidozie Rejoice Ogochukwu',
      office: 'Secretary General',
      level: 400,
      phone: '+234 812 345 6791',
      email: 'secgen@nass-unizik.org',
      photo_url: '/resources/images/executives/secretary_general.jpg?v=2',
      bio: 'Managing administrative correspondence, official secretarial records, meeting archives, and departmental notifications.',
      tenure: '2026/2027',
      display_order: 3
    },
    {
      name: 'Comr. Ejefonye Mmesoma Stephanie',
      office: 'Director of Academics',
      level: 300,
      phone: '07062399227',
      email: 'm.ejefonye@stu.unizik.edu.ng',
      photo_url: '/resources/images/executives/director_of_academics.jpg?v=2',
      bio: 'Directing academic affairs and scholastic development for statistics undergraduates. Coordinating course study circles, syllabus coverage, tutorial classes, and past question archives.',
      tenure: '2026/2027',
      display_order: 4
    },
    {
      name: 'Comr. Chinedu Chidinma Veronica',
      office: 'Financial Secretary',
      level: 400,
      phone: '09022372647',
      email: 'vc.chinedu@stu.unizik.edu.ng',
      photo_url: '/resources/images/executives/financial_secretary.jpg?v=2',
      bio: 'Responsible for departmental association dues records, fiscal receipts, statutory accounting, and financial transparency.',
      tenure: '2026/2027',
      display_order: 5
    },
    {
      name: 'Comr. Ezenwelu Chiamaka Princess',
      office: 'Treasurer',
      level: 400,
      phone: '09071473090',
      email: 'cp.ezenwelu@stu.unizik.edu.ng',
      photo_url: '/resources/images/executives/treasurer.jpg?v=2',
      bio: 'Custodian of association funds, managing treasury disbursements, banking transactions, and financial custody.',
      tenure: '2026/2027',
      display_order: 6
    },
    {
      name: 'Comr. Ugochukwu Franklin',
      office: 'Director of Sports',
      level: 400,
      phone: '08165607073',
      email: 'f_878.ugochukwu@stu.unizik.edu.ng',
      photo_url: '/resources/images/executives/director_of_sports.jpg?v=2',
      bio: 'Coordinating departmental athletic events, Dean Cup championships, inter-level football fixtures, and student fitness activities.',
      tenure: '2026/2027',
      display_order: 7
    },
    {
      name: 'Comr. Offorkee Chidera Elvis',
      office: 'Director of Socials',
      level: 300,
      phone: '08144016159/09050148729',
      email: '',
      photo_url: '/resources/images/executives/director_of_socials.jpg?v=2',
      bio: 'Chief coordinator of the Annual NASS Week, freshmen orientation banquet, cultural festivals, student welfare, and social engagements.',
      tenure: '2026/2027',
      display_order: 8
    }
  ];

  // Cleanly synchronize executives table
  db.exec('DELETE FROM executives');
  const insertExec = db.prepare(`
    INSERT INTO executives (id, name, office, level, phone, email, photo_url, bio, tenure, display_order, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'), datetime('now'))
  `);
  officialExecs.forEach((ex, idx) => {
    insertExec.run(
      idx + 1,
      ex.name,
      ex.office,
      ex.level,
      ex.phone,
      ex.email,
      ex.photo_url,
      ex.bio,
      ex.tenure,
      ex.display_order
    );
  });

  // Seed Timetable if empty
  const ttCount = db.prepare('SELECT COUNT(*) as count FROM timetable').get();
  if (ttCount.count === 0) {
    const insertTT = db.prepare(`
      INSERT INTO timetable (level, semester, day, start_time, end_time, course_code, course_title, lecturer, venue)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    // Official First Semester 2026/2027 Lecture Timetable (Approved by Prof F.C. Eze HOD & G.C. Okoye Timetable Officer)
    const officialTimetable = [
      // 100 Level (First Semester)
      { level: 100, semester: 1, day: 'Monday', start_time: '08:00 AM', end_time: '10:00 AM', course_code: 'GST 111', course_title: 'Communication in English / General Studies', lecturer: 'General Studies Directorate', venue: 'GS Auditorium' },
      { level: 100, semester: 1, day: 'Tuesday', start_time: '08:00 AM', end_time: '10:00 AM', course_code: 'MTH 101', course_title: 'Elementary Mathematics I', lecturer: 'Department of Mathematics', venue: 'Faculty Hall / Maths LT' },
      { level: 100, semester: 1, day: 'Tuesday', start_time: '12:00 PM', end_time: '02:00 PM', course_code: 'PHY 101', course_title: 'General Physics I', lecturer: 'Department of Physics', venue: 'Physics Lecture Theatre' },
      { level: 100, semester: 1, day: 'Wednesday', start_time: '08:00 AM', end_time: '10:00 AM', course_code: 'COS 101', course_title: 'Introduction to Computer Science', lecturer: 'Department of Computer Science', venue: 'Computer Science Hall' },
      { level: 100, semester: 1, day: 'Wednesday', start_time: '10:00 AM', end_time: '12:00 PM', course_code: 'STA 121', course_title: 'Statistical Inference I', lecturer: 'Obiora-Ilouno, Ibeakuzie and Obulezi', venue: 'STAT Hall' },
      { level: 100, semester: 1, day: 'Wednesday', start_time: '12:00 PM', end_time: '02:00 PM', course_code: 'PHY 101', course_title: 'General Physics I', lecturer: 'Department of Physics', venue: 'Physics Lecture Theatre' },
      { level: 100, semester: 1, day: 'Thursday', start_time: '10:00 AM', end_time: '11:00 AM', course_code: 'CSC 101', course_title: 'Introduction to Computer Science', lecturer: 'Department of Computer Science', venue: 'Computer Science Lab' },
      { level: 100, semester: 1, day: 'Friday', start_time: '09:00 AM', end_time: '10:00 AM', course_code: 'MTH 101', course_title: 'Elementary Mathematics I', lecturer: 'Department of Mathematics', venue: 'Faculty Hall' },
      { level: 100, semester: 1, day: 'Friday', start_time: '10:00 AM', end_time: '12:00 PM', course_code: 'STA 111', course_title: 'Descriptive Statistics', lecturer: 'Uzuke, Okoye, Anabike, Eriobu, Chukwunenye', venue: 'STAT Hall' },
      { level: 100, semester: 1, day: 'Friday', start_time: '01:00 PM', end_time: '03:00 PM', course_code: 'NAU-BIO 101', course_title: 'General Biology I', lecturer: 'Department of Biological Sciences', venue: 'Biological Sciences Lecture Hall' },

      // 200 Level (First Semester)
      { level: 200, semester: 1, day: 'Monday', start_time: '01:00 PM', end_time: '03:00 PM', course_code: 'STA 211', course_title: 'Probability II', lecturer: 'G. A. Osuji and C. I. Nnabude', venue: 'STAT Hall' },
      { level: 200, semester: 1, day: 'Tuesday', start_time: '08:00 AM', end_time: '10:00 AM', course_code: 'STA 231', course_title: 'Statistical Computing II', lecturer: 'H. O. Etaga and Orji G. O', venue: 'STAT LAB' },
      { level: 200, semester: 1, day: 'Tuesday', start_time: '10:00 AM', end_time: '12:00 PM', course_code: 'COS 201', course_title: 'Computer Programming I', lecturer: 'Department of Computer Science', venue: 'Computer Science Lab' },
      { level: 200, semester: 1, day: 'Tuesday', start_time: '01:00 PM', end_time: '02:00 PM', course_code: 'MTH 201', course_title: 'Linear Algebra I', lecturer: 'Department of Mathematics', venue: 'Mathematics Lecture Hall' },
      { level: 200, semester: 1, day: 'Tuesday', start_time: '01:00 PM', end_time: '03:00 PM', course_code: 'STA 221', course_title: 'Statistical Inference II', lecturer: 'V. C. Chukwunenye and C. E. Onyenekwe', venue: 'STAT Hall' },
      { level: 200, semester: 1, day: 'Tuesday', start_time: '02:00 PM', end_time: '03:00 PM', course_code: 'MTH 231', course_title: 'Introduction to Mathematical Methods', lecturer: 'Department of Mathematics', venue: 'Mathematics Lecture Hall' },
      { level: 200, semester: 1, day: 'Wednesday', start_time: '08:00 AM', end_time: '09:00 AM', course_code: 'MTH 231', course_title: 'Introduction to Mathematical Methods', lecturer: 'Department of Mathematics', venue: 'Mathematics Lecture Hall' },
      { level: 200, semester: 1, day: 'Wednesday', start_time: '09:00 AM', end_time: '10:00 AM', course_code: 'ENT 211', course_title: 'Entrepreneurship and Innovation 2', lecturer: 'Entrepreneurship Studies Unit', venue: 'UNIZIK Entrepreneurship Centre' },
      { level: 200, semester: 1, day: 'Wednesday', start_time: '10:00 AM', end_time: '12:00 PM', course_code: 'IFT 211', course_title: 'Digital Logic Design', lecturer: 'Department of Information Technology', venue: 'Faculty Complex Hall' },
      { level: 200, semester: 1, day: 'Wednesday', start_time: '10:00 AM', end_time: '12:00 PM', course_code: 'MTH 231', course_title: 'Introduction to Mathematical Methods', lecturer: 'Department of Mathematics', venue: 'Old Maths Hall' },
      { level: 200, semester: 1, day: 'Wednesday', start_time: '02:00 PM', end_time: '03:00 PM', course_code: 'STA 211', course_title: 'Probability II', lecturer: 'G. A. Osuji and C. I. Nnabude', venue: 'STAT Hall' },
      { level: 200, semester: 1, day: 'Wednesday', start_time: '02:00 PM', end_time: '03:00 PM', course_code: 'STA 221', course_title: 'Statistical Inference II', lecturer: 'V. C. Chukwunenye and C. E. Onyenekwe', venue: 'STAT Hall' },
      { level: 200, semester: 1, day: 'Thursday', start_time: '08:00 AM', end_time: '10:00 AM', course_code: 'CSC 201', course_title: 'Computer Programming I', lecturer: 'Department of Computer Science', venue: 'Computer Science Lab' },
      { level: 200, semester: 1, day: 'Thursday', start_time: '08:00 AM', end_time: '10:00 AM', course_code: 'MTH 201', course_title: 'Linear Algebra I', lecturer: 'Department of Mathematics', venue: 'Mathematics Lecture Hall' },
      { level: 200, semester: 1, day: 'Thursday', start_time: '12:00 PM', end_time: '02:00 PM', course_code: 'STA 201', course_title: 'Statistics for Agricultural & Biological Sciences', lecturer: 'Awopeju, Ikediuwa, Odum, Omoruyi, Aforka, Eriobu, Oladimeji', venue: 'STAT Hall' },
      { level: 200, semester: 1, day: 'Friday', start_time: '12:00 PM', end_time: '01:00 PM', course_code: 'CSC 201', course_title: 'Computer Programming I', lecturer: 'Department of Computer Science', venue: 'Departmental Computing Lab' },

      // 300 Level (First Semester)
      { level: 300, semester: 1, day: 'Monday', start_time: '08:00 AM', end_time: '10:00 AM', course_code: 'STA 311', course_title: 'Probability III', lecturer: 'J. O. Obulezi and C. C. Nnanatu', venue: 'STAT Hall' },
      { level: 300, semester: 1, day: 'Monday', start_time: '11:00 AM', end_time: '01:00 PM', course_code: 'STA 321', course_title: 'Statistical Inference III', lecturer: 'E. U. Umeh and C. I. Nnabude', venue: 'STAT Hall' },
      { level: 300, semester: 1, day: 'Tuesday', start_time: '10:00 AM', end_time: '12:00 PM', course_code: 'NAU-STA 341', course_title: 'Regression Analysis I', lecturer: 'H. O. Etaga and K. F. Aforka', venue: 'STAT Hall' },
      { level: 300, semester: 1, day: 'Tuesday', start_time: '12:00 PM', end_time: '02:00 PM', course_code: 'NAU-STA 351', course_title: 'Analysis of Variance I', lecturer: 'L. O. Ngonadi and V. C. Chukwunenye', venue: 'STAT Hall' },
      { level: 300, semester: 1, day: 'Wednesday', start_time: '09:00 AM', end_time: '11:00 AM', course_code: 'NAU-STA 361', course_title: 'Demography', lecturer: 'C. A. Uzuke and G. C. Okoye', venue: 'STAT Hall' },
      { level: 300, semester: 1, day: 'Wednesday', start_time: '12:00 PM', end_time: '02:00 PM', course_code: 'NAU-STA 371', course_title: 'Operations Research I', lecturer: 'H. O. Obiora-Ilouno and S. Enogwe', venue: 'STAT Hall' },
      { level: 300, semester: 1, day: 'Thursday', start_time: '10:00 AM', end_time: '12:00 PM', course_code: 'NAU-STA 381', course_title: 'Biometry', lecturer: 'P. O. Ibeakuzie and C. E. Onyenekwe', venue: 'STAT Hall' },
      { level: 300, semester: 1, day: 'Thursday', start_time: '12:00 PM', end_time: '02:00 PM', course_code: 'STA 331', course_title: 'Statistical Computing III', lecturer: 'L. O. Ngonadi, Enogwe and I. F. Okpala', venue: 'STAT LAB' },

      // 400 Level (First Semester)
      { level: 400, semester: 1, day: 'Monday', start_time: '09:00 AM', end_time: '11:00 AM', course_code: 'STA 411', course_title: 'Probability IV', lecturer: 'G. A Osuji and C. I. Anabike', venue: 'STAT Hall' },
      { level: 400, semester: 1, day: 'Monday', start_time: '12:00 PM', end_time: '02:00 PM', course_code: 'NAU-STA 421', course_title: 'Times Analysis', lecturer: 'U. C. Ikediuwa and J. O. Odum', venue: 'STAT Hall' },
      { level: 400, semester: 1, day: 'Tuesday', start_time: '08:00 AM', end_time: '10:00 AM', course_code: 'STA 413', course_title: 'Statistical Inference IV', lecturer: 'E. U. Umeh and A. K. Abidemi', venue: 'STAT Hall' },
      { level: 400, semester: 1, day: 'Tuesday', start_time: '11:00 AM', end_time: '01:00 PM', course_code: 'NAU-STA 441', course_title: 'Regression Analysis II', lecturer: 'C. H. Nwankwo and A. K. Abidemi', venue: 'STAT Hall' },
      { level: 400, semester: 1, day: 'Wednesday', start_time: '08:00 AM', end_time: '10:00 AM', course_code: 'NAU-STA 451', course_title: 'Design And Analysis of Experiments', lecturer: 'F. C. Eze and L. O. Ngonadi', venue: 'STAT Hall' },
      { level: 400, semester: 1, day: 'Wednesday', start_time: '11:00 AM', end_time: '01:00 PM', course_code: 'NAU-STA 461', course_title: 'Multivariate Analysis I', lecturer: 'S. I. Onyeagu and C. I Nnabude', venue: 'STAT Hall' },
      { level: 400, semester: 1, day: 'Wednesday', start_time: '01:00 PM', end_time: '02:00 PM', course_code: 'STA 411', course_title: 'Probability IV', lecturer: 'G. A Osuji and C. I. Anabike', venue: 'STAT Hall' },
      { level: 400, semester: 1, day: 'Thursday', start_time: '08:00 AM', end_time: '10:00 AM', course_code: 'STA 491', course_title: 'Seminar', lecturer: 'C. E. Onyenekwe', venue: 'STAT Hall' },
      { level: 400, semester: 1, day: 'Thursday', start_time: '11:00 AM', end_time: '01:00 PM', course_code: 'STA 471', course_title: 'Operations Research II', lecturer: 'H. O. Obiora-Ilouno and S. Enogwe', venue: 'STAT Hall' },
      { level: 400, semester: 1, day: 'Thursday', start_time: '11:00 AM', end_time: '01:00 PM', course_code: 'STA 481', course_title: 'Statistical Quality Control I', lecturer: 'H. O. Etaga and K. F. Aforka', venue: 'STAT Hall' },
      { level: 400, semester: 1, day: 'Thursday', start_time: '01:00 PM', end_time: '02:00 PM', course_code: 'STA 413', course_title: 'Statistical Inference IV', lecturer: 'E. U. Umeh and A. K. Abidemi', venue: 'STAT Hall' }
    ];

    for (const tt of officialTimetable) {
      insertTT.run(tt.level, tt.semester, tt.day, tt.start_time, tt.end_time, tt.course_code, tt.course_title, tt.lecturer, tt.venue);
    }
  }

  // Seed News if empty
  const newsCount = db.prepare('SELECT COUNT(*) as count FROM news').get();
  if (newsCount.count === 0) {
    const insertNews = db.prepare(`
      INSERT INTO news (title, slug, summary, content, category, author, featured_image, published_at, is_featured)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    insertNews.run(
      'UNIZIK Senate Approves First Semester 2026/2027 Academic Calendar: Key Resumption, Matriculation & Exam Dates',
      'unizik-senate-approves-2026-2027-academic-calendar',
      'The Senate of Nnamdi Azikiwe University, at its 246th meeting on September 30, 2026, officially approved the 2026/2027 Academic Calendar (Ref: NAU/R/E/032/97) for regular undergraduate students.',
      'The Senate of Nnamdi Azikiwe University, at its 246th meeting held on Wednesday, 30th September 2026, formally approved the Academic Calendar of Events for the 2026/2027 Academic Session for all regular undergraduate students.\n\nIn an internal memorandum released by the Office of the Registrar (Ref. No.: NAU/R/E/032/97, dated 2nd October 2026), the university outlined key milestones for the First Semester:\n\n• Resumption & Registration (New Students): Monday, October 12, 2026\n• Resumption, Tuition Payment & Course Registration (Returning Students): Wednesday, October 14, 2026\n• Convocation Ceremonies (2024/2025 & 2025/2026): Sunday, November 15 – Friday, November 20, 2026\n• University-Wide Quiz: Monday, November 30, 2026\n• Vacation, Christmas & Election Break: Wednesday, December 23, 2026 – Saturday, January 22, 2027\n• All Students Return to Campus: Saturday, January 23, 2027\n• First Semester Lectures Resume: Monday, January 25, 2027\n• Matriculation Ceremony: Friday, January 29, 2027\n• Revision Week: Monday, February 15, 2027\n• First Semester Degree Examinations (CBE & PBE): Monday, February 22 – Friday, March 19, 2027\n• School of General Studies (GS) Examinations: Monday, March 15 – Friday, March 19, 2027\n• End of First Semester Examinations: Friday, March 19, 2027\n• Vacation and Easter Break: Saturday, March 20 – Friday, April 2, 2027',
      'Academic Notice',
      'Office of the Registrar / NASS Academic Desk',
      '/resources/images/event_workshop.jpg',
      '2026-10-02 08:00:00',
      1
    );

    insertNews.run(
      'Resumption Schedule: Fresh Students Resume Oct 12, Returning Students Resume Oct 14, 2026',
      'official-resumption-dates-2026-2027',
      'Staggered resumption schedule for the 2026/2027 session: Freshmen continue registration on October 12, while returning students return October 14, 2026 for fees payment and course enrolment.',
      'In compliance with university directives from the Registrar, the Department of Statistics announces resumption protocols for all undergraduate cohorts:\n\n1. New Students (100 Level & Direct Entry): Resumption is slated for Monday, October 12, 2026.\n\n2. Old Students (200L, 300L & 400L): Returning undergraduates return to campus on Wednesday, October 14, 2026.\n\nCourse registration slips must be presented to Level Course Advisers for physical endorsement.',
      'Resumption',
      'NASS Secretariat',
      '/resources/images/event_orientation.jpg',
      '2026-10-02 11:30:00',
      1
    );

    insertNews.run(
      'Matriculation Ceremony for 2026/2027 Freshmen Scheduled for Friday, January 29, 2027',
      'matriculation-ceremony-january-29-2027',
      'The University Senate has fixed Friday, January 29, 2027, for the official Matriculation Ceremony for all newly admitted undergraduates across all faculties.',
      'The Registrar\'s Office has announced that the 2026/2027 Matriculation Ceremony for regular undergraduate students will hold on Friday, January 29, 2027. All 100 Level students must complete clearance and course registration prior to matriculation.',
      'Matriculation',
      'NASS Executive Council',
      '/resources/images/event_siwes.jpg',
      '2026-10-03 09:00:00',
      1
    );

    insertNews.run(
      'First Semester Examination Dates Announced: Monday, February 22 to Friday, March 19, 2027',
      'first-semester-examination-dates-2026-2027',
      'First Semester Degree Examinations (CBE & PBE) commence February 22, 2027. Revision Week begins February 15, and General Studies (GS) exams run March 15–19, 2027.',
      'The Department of Statistics notifies all students of approved examination schedules:\n\n• Revision Week: Monday, February 15 – Saturday, February 20, 2027\n• First Semester Degree Exams (CBE & PBE): Monday, February 22 – Friday, March 19, 2027\n• School of General Studies (GS) Exams: Monday, March 15 – Friday, March 19, 2027\n• End of First Semester Examinations: Friday, March 19, 2027\n• Vacation & Easter Break: Saturday, March 20 – Friday, April 2, 2027',
      'Examinations',
      'NASS Academic Directorate',
      '/resources/images/event_workshop.jpg',
      '2026-10-03 14:00:00',
      1
    );
  }

  // Seed Events if empty
  const eventCount = db.prepare('SELECT COUNT(*) as count FROM events').get();
  if (eventCount.count === 0) {
    const insertEvent = db.prepare(`
      INSERT INTO events (title, event_date, event_time, venue, description, category, status, registration_url, banner_image)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    insertEvent.run(
      'Resumption of New Students & Lectures Begin',
      '2026-10-12',
      '08:00 AM - 04:00 PM',
      'Department of Statistics & Faculty Lecture Theatres',
      'New students continue clearance, documentation, and introductory lectures begin for the 2026/2027 academic session.',
      'Resumption',
      'UPCOMING',
      '#',
      '/resources/images/event_orientation.jpg'
    );

    insertEvent.run(
      'Resumption of Returning Students & Course Enrolment',
      '2026-10-14',
      '08:00 AM - 05:00 PM',
      'Department of Statistics Building, UNIZIK Main Campus',
      'Old students return to campus. Payment of school charges, course registration, and full lectures commence.',
      'Resumption',
      'UPCOMING',
      '#',
      '/resources/images/event_workshop.jpg'
    );

    insertEvent.run(
      '2026/2027 Matriculation Ceremony',
      '2027-01-29',
      '09:00 AM - 01:00 PM',
      'Faculty of Physical Sciences Grounds',
      'Formal oath-taking and matriculation ceremony for all 2026/2027 fresh undergraduate students.',
      'Matriculation',
      'UPCOMING',
      '#',
      '/resources/images/event_orientation.jpg'
    );

    insertEvent.run(
      'First Semester Degree Examinations (CBE & PBE)',
      '2027-02-22',
      '08:30 AM - 05:00 PM',
      'Faculty Examination Halls & CBT Centers',
      'First semester degree examinations commence for regular students (both Computer-Based and Paper-Based exams) through March 19, 2027.',
      'Examination',
      'UPCOMING',
      '#',
      '/resources/images/event_siwes.jpg'
    );
  }

  // Seed SIWES Resources if empty
  const siwesCount = db.prepare('SELECT COUNT(*) as count FROM siwes_resources').get();
  if (siwesCount.count === 0) {
    const insertSIWES = db.prepare(`
      INSERT INTO siwes_resources (title, description, category, file_name, file_path, file_size)
      VALUES (?, ?, ?, ?, ?, ?)
    `);

    insertSIWES.run(
      'Official UNIZIK SIWES Logbook Completion Guide',
      'Step-by-step instructions on filling daily entries, weekly summaries, diagrams, and industry-based supervisor sign-offs.',
      'Logbook Sample',
      'UNIZIK_SIWES_Logbook_Guide_2026.pdf',
      '/resources/documents/sample_siwes_guide.pdf',
      1250000
    );

    insertSIWES.run(
      'Model Industrial Training (SIWES) Technical Report',
      'Standard template report containing organization background, statistical projects handled, data pipelines, challenges, and recommendations.',
      'Technical Report',
      'Model_SIWES_Technical_Report_Format.docx',
      '/resources/documents/sample_siwes_guide.pdf',
      2450000
    );

    insertSIWES.run(
      'SIWES Placement Acceptance Letter Form (ITF-8 Form)',
      'Official form to be filled by the employer and submitted to the departmental coordinator within 2 weeks of assumption.',
      'Forms',
      'ITF_Form_8_Acceptance_Verification.pdf',
      '/resources/documents/sample_siwes_guide.pdf',
      620000
    );
  }

  // Seed Project Resources if empty
  const projCount = db.prepare('SELECT COUNT(*) as count FROM project_resources').get();
  if (projCount.count === 0) {
    const insertProj = db.prepare(`
      INSERT INTO project_resources (title, description, category, file_name, file_path, file_size)
      VALUES (?, ?, ?, ?, ?, ?)
    `);

    insertProj.run(
      'Final Year Research Project Proposal Template & Criteria',
      'Standard format for chapter 1 submission: background, statement of problem, objectives, research questions, and significance.',
      'Proposal Template',
      'NASS_Final_Year_Project_Proposal_Template.docx',
      '/resources/documents/sample_project_guide.pdf',
      850000
    );

    insertProj.run(
      'Empirical Statistical Methodology & Analysis Guidebook',
      'How to format data analysis in Chapter 4, reporting ANOVA tables, p-values, regression equations, and hypothesis verdicts.',
      'Data Analysis in R/Python',
      'Empirical_Data_Analysis_Methodology_Manual.pdf',
      '/resources/documents/sample_project_guide.pdf',
      1820000
    );

    insertProj.run(
      'Oral Defense Preparation & Powerpoint Slide Framework',
      'Guide on how to structure a 10-minute slide deck for the departmental project defense panel.',
      'Defense Guide',
      'NASS_Project_Defense_Presentation_Template.pptx',
      '/resources/documents/sample_project_guide.pdf',
      1420000
    );
  }

  // Seed Gallery if empty
  const galCount = db.prepare('SELECT COUNT(*) as count FROM gallery').get();
  if (galCount.count === 0) {
    const insertGal = db.prepare(`
      INSERT INTO gallery (title, year, event_name, image_url, description)
      VALUES (?, ?, ?, ?, ?)
    `);

    insertGal.run('2026 Freshmen Academic Orientation', 2026, 'Orientation', '/resources/images/gallery_orientation_2026.jpg', 'Welcoming the new 100-level statistics cohort into the department.');
    insertGal.run('2025 NASS Annual Dinner & Awards Ceremony', 2025, 'Dinner', '/resources/images/gallery_dinner_2025.jpg', 'Celebrating academic excellence, graduating seniors, and outstanding lecturers.');
    insertGal.run('Hands-on Biostatistics & Data Modeling Bootcamp', 2025, 'Workshop', '/resources/images/gallery_bootcamp_2025.jpg', 'Students collaborating on live datasets in RStudio at the Statistics Computer Lab.');
    insertGal.run('Inter-Departmental Football Tournament Final', 2025, 'NASS Week', '/resources/images/gallery_sports_2025.jpg', 'Statistics Football Team lifting the Faculty Dean cup.');
    insertGal.run('2025 NASS Executive Elections & Inauguration', 2025, 'Election', '/resources/images/gallery_election_2025.jpg', 'Swearing in of the current executive council led by Comr. Okoli.');
    insertGal.run('Alumni Mentorship & Tech Career Fireside Chat', 2024, 'Seminar', '/resources/images/gallery_alumni_2024.jpg', 'Senior data scientists in Nigerian banking sharing industry tips with undergraduates.');
  }

  // Seed Contacts if empty
  const contactCount = db.prepare('SELECT COUNT(*) as count FROM contacts').get();
  if (contactCount.count === 0) {
    const insertContact = db.prepare(`
      INSERT INTO contacts (name, role_or_title, department_or_level, email, phone, office_location, contact_type)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `);

    insertContact.run('Prof Francis Chukwuemeka Eze', 'Head of Department', 'Department of Statistics', 'hod.statistics@unizik.edu.ng', '+234 803 555 0101', 'Statistics Office 101', 'HOD');
    insertContact.run('Dr Okechukwu Jeremiah Obulezi', 'Staff Adviser, NASS', 'Academic Staff', 'adviser.nass@unizik.edu.ng', '+234 803 555 0102', 'Statistics Room 108', 'ADVISER');
    insertContact.run('Comr. Anajekwu Chidera Patrick (PhanCore)', 'NASS President & Executive Lead', '400 Level / NASS Executive', 'cp.anajekwu@stu.unizik.edu.ng', '08087955696', 'NASS Secretariat, Statistics Wing', 'EXECUTIVE');
    insertContact.run('Comr. Obunadike Vivian Chiemerie', 'Vice President, NASS', '400 Level / NASS Executive', 'cv.obunadike@stu.unizik.edu.ng', '+234 916 664 5452', 'NASS Secretariat, Statistics Wing', 'EXECUTIVE');
    insertContact.run('Comr. Chidozie Rejoice Ogochukwu', 'Secretary General, NASS', '400 Level / NASS Executive', 'secgen@nass-unizik.org', '+234 812 345 6791', 'NASS Secretariat, Statistics Wing', 'EXECUTIVE');
    insertContact.run('Comr. Ejefonye Mmesoma Stephanie', 'Director of Academics, NASS', '300 Level / NASS Executive', 'm.ejefonye@stu.unizik.edu.ng', '07062399227', 'NASS Secretariat, Statistics Wing', 'EXECUTIVE');
    insertContact.run('Comr. Chinedu Chidinma Veronica', 'Financial Secretary, NASS', '400 Level / NASS Executive', 'vc.chinedu@stu.unizik.edu.ng', '09022372647', 'NASS Secretariat, Statistics Wing', 'EXECUTIVE');
    insertContact.run('Comr. Ezenwelu Chiamaka Princess', 'Treasurer, NASS', '400 Level / NASS Executive', 'cp.ezenwelu@stu.unizik.edu.ng', '09071473090', 'NASS Secretariat, Statistics Wing', 'EXECUTIVE');
    insertContact.run('Comr. Ugochukwu Franklin', 'Director of Sports, NASS', '400 Level / NASS Executive', 'f_878.ugochukwu@stu.unizik.edu.ng', '08165607073', 'NASS Secretariat, Statistics Wing', 'EXECUTIVE');
    insertContact.run('Comr. Offorkee Chidera Elvis', 'Director of Socials, NASS', '300 Level / NASS Executive', '', '08144016159/09050148729', 'NASS Secretariat, Statistics Wing', 'EXECUTIVE');
    insertContact.run('Vacant', '400 Level Course Representative', '400 Level Class', '', '', 'Elections Forthcoming', 'COURSE_REP');
    insertContact.run('Vacant', '300 Level Course Representative', '300 Level Class', '', '', 'Elections Forthcoming', 'COURSE_REP');
    insertContact.run('Vacant', '200 Level Course Representative', '200 Level Class', '', '', 'Elections Forthcoming', 'COURSE_REP');
    insertContact.run('Vacant', '100 Level Course Representative', '100 Level Class', '', '', 'Elections Forthcoming', 'COURSE_REP');
    insertContact.run('NASS Student Support & Academic Helpdesk', 'Student Help Desk', 'Secretariat', 'help@nass-unizik.org', '+234 800 6277 4357', 'NASS Secretariat, Statistics Block Ground Floor', 'HELPDESK');
  }

  // Ensure SIWES coordinator contact is removed and Course Reps are vacant in existing databases
  try {
    db.prepare("DELETE FROM contacts WHERE role_or_title LIKE '%SIWES%' OR name LIKE '%Nwosu%'").run();
    db.prepare("UPDATE contacts SET name = 'Vacant', email = '', phone = '', office_location = 'Elections Forthcoming' WHERE contact_type = 'COURSE_REP'").run();
    db.prepare("UPDATE site_settings SET value = '300+' WHERE key = 'stat_students'").run();
    db.prepare("UPDATE site_settings SET value = '1000+' WHERE key = 'stat_graduates'").run();
  } catch (syncErr) {
    console.error('Error synchronizing contacts and site_settings:', syncErr);
  }

  // Seed FAQs if empty
  const faqCount = db.prepare('SELECT COUNT(*) as count FROM faqs').get();
  if (faqCount.count === 0) {
    const insertFaq = db.prepare(`
      INSERT INTO faqs (question, answer, category, sort_order)
      VALUES (?, ?, ?, ?)
    `);

    insertFaq.run(
      'What are the minimum credit units required to graduate from Statistics at UNIZIK?',
      'Undergraduate students must register and pass all departmental and faculty required core courses across levels 100 to 400, accumulating a minimum of 130 to 144 credit units depending on direct entry or UTME matriculation mode.',
      'Academic',
      1
    );

    insertFaq.run(
      'When is the SIWES industrial training scheduled and how long does it last?',
      'SIWES takes place at the 300 Level during the second semester break and lasts for a mandatory period of six (6) months. Students submit weekly logbooks, undergo institutional supervision, and defend their technical report.',
      'SIWES',
      2
    );

    insertFaq.run(
      'What statistical software packages are accepted for final-year project analysis?',
      'The Department of Statistics standardly approves R (RStudio), Python (Pandas/Statsmodels/Scikit-Learn), SPSS, and SAS. Code scripts, reproducibility files, and raw data matrices must be submitted alongside the thesis.',
      'Projects',
      3
    );

    insertFaq.run(
      'How can I get departmental course registration forms signed by the Academic Adviser?',
      'Download your generated course registration slip from the UNIZIK portal, print three (3) copies, and visit your level course adviser during official consultation hours (Mondays and Wednesdays, 10:00 AM - 1:00 PM).',
      'Registration',
      4
    );

    insertFaq.run(
      'Where is the NASS Secretariat located on campus?',
      'The NASS Secretariat is located on the Ground Floor of the Faculty of Physical Sciences / Department of Statistics Building, UNIZIK Awka Main Campus.',
      'General',
      5
    );

    insertFaq.run(
      'How do I access past examination questions and course lecture notes?',
      'Students can download archived past questions and syllabi directly from the Academic Resources & Timetable section on this portal or visit the NASS Departmental Library.',
      'Academic',
      6
    );
  }

  // If snapshot backup exists, restore any custom settings
  importSnapshot();

  console.log('Database initialized and seeded successfully.');
}

export function exportSnapshot() {
  try {
    const tables = ['site_settings', 'courses', 'course_resources', 'staff', 'executives', 'news', 'events', 'siwes', 'projects', 'timetable', 'announcements', 'faqs'];
    const backup = {};
    for (const table of tables) {
      try {
        backup[table] = db.prepare('SELECT * FROM ' + table).all();
      } catch (_) {
        backup[table] = [];
      }
    }
    const targetFile = isVercel
      ? path.join('/tmp', 'portal_state_backup.json')
      : path.join(ROOT_DATA_DIR, 'portal_state_backup.json');
    fs.writeFileSync(targetFile, JSON.stringify(backup, null, 2));
  } catch (err) {
    console.error('Error exporting snapshot:', err);
  }
}

export function importSnapshot() {
  let backupFile = path.join(ROOT_DATA_DIR, 'portal_state_backup.json');
  if (isVercel && fs.existsSync(path.join('/tmp', 'portal_state_backup.json'))) {
    backupFile = path.join('/tmp', 'portal_state_backup.json');
  } else if (!fs.existsSync(backupFile)) {
    backupFile = path.join(DB_DIR, 'portal_state_backup.json');
  }
  if (!fs.existsSync(backupFile)) return false;
  try {
    const raw = fs.readFileSync(backupFile, 'utf-8');
    const data = JSON.parse(raw);
    if (data.site_settings && Array.isArray(data.site_settings)) {
      const stmt = db.prepare('INSERT INTO site_settings (key, value) VALUES (?, ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value');
      for (const s of data.site_settings) {
        if (s.key && s.value !== undefined) stmt.run(s.key, s.value);
      }
    }
    if (data.courses && Array.isArray(data.courses)) {
      const insCourse = db.prepare(`
        INSERT INTO courses (id, code, title, level, semester, credit_units, status, description, outline)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        ON CONFLICT(id) DO UPDATE SET
          code = excluded.code,
          title = excluded.title,
          level = excluded.level,
          semester = excluded.semester,
          credit_units = excluded.credit_units,
          status = excluded.status,
          description = excluded.description,
          outline = excluded.outline
      `);
      for (const c of data.courses) {
        insCourse.run(c.id, c.code, c.title, c.level, c.semester, c.credit_units || 3, c.status || 'Compulsory', c.description || '', c.outline || '');
      }
    }
    if (data.course_resources && Array.isArray(data.course_resources) && data.course_resources.length > 0) {
      const insRes = db.prepare(`
        INSERT INTO course_resources (id, course_id, title, resource_type, file_name, file_path, file_size, academic_year, semester)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        ON CONFLICT(id) DO UPDATE SET
          course_id = excluded.course_id,
          title = excluded.title,
          resource_type = excluded.resource_type,
          file_name = excluded.file_name,
          file_path = excluded.file_path,
          file_size = excluded.file_size,
          academic_year = excluded.academic_year,
          semester = excluded.semester
      `);
      for (const r of data.course_resources) {
        insRes.run(
          r.id,
          r.course_id,
          r.title,
          r.resource_type || 'lecture_note',
          r.file_name,
          r.file_path,
          r.file_size || 0,
          r.academic_year || '2026/2027',
          r.semester || 1
        );
      }
    }
    if (data.staff && Array.isArray(data.staff) && data.staff.length > 0) {
      const insStaff = db.prepare(`
        INSERT INTO staff (id, name, title, role_category, qualifications, specialization, email, phone, office, photo_url, bio, display_order, cirs_url, cirs_id)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ON CONFLICT(id) DO UPDATE SET
          name = excluded.name,
          title = excluded.title,
          role_category = excluded.role_category,
          qualifications = excluded.qualifications,
          specialization = excluded.specialization,
          email = excluded.email,
          phone = excluded.phone,
          office = excluded.office,
          photo_url = excluded.photo_url,
          bio = excluded.bio,
          display_order = excluded.display_order,
          cirs_url = excluded.cirs_url,
          cirs_id = excluded.cirs_id
      `);
      for (const s of data.staff) {
        insStaff.run(
          s.id,
          s.name,
          s.title,
          s.role_category,
          s.qualifications || '',
          s.specialization || '',
          s.email || '',
          s.phone || '',
          s.office || '',
          s.photo_url || '/resources/images/staff_default.jpg',
          s.bio || '',
          s.display_order || 10,
          s.cirs_url || '',
          s.cirs_id || ''
        );
      }
    }
    return true;
  } catch (err) {
    console.error('Error importing snapshot:', err);
    return false;
  }
}

export { db };
