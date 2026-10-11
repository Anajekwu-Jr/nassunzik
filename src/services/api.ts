import {
  Course,
  CourseResource,
  StaffMember,
  Executive,
  TimetableSlot,
  EventItem,
  Announcement,
  ContactEntry,
  SearchResultItem,
  AcademicLevel,
  SemesterNumber
} from '../types';

const API_BASE = '/api';
const CACHE_KEY = 'nass_unizik_mobile_cache_v3';

// Baseline fallback data baked into client so app launches in <30ms offline or on cold start
const DEFAULT_COURSES: Course[] = [
  {
    id: 1,
    code: 'STA 111',
    title: 'Descriptive Statistics & Exploratory Data Analysis',
    level: 100,
    semester: 1,
    units: 3,
    description: 'Foundations of statistical science, data collection methods, frequency distributions, measures of central tendency, dispersion, skewness, and kurtosis.',
    outline: 'Introduction to statistics and measurement scales; Tabular & graphical presentation; Frequency polygons & ogives; Measures of location (Mean, Median, Mode); Measures of dispersion (Variance, Std Dev); Introduction to index numbers.',
    lecturer: 'Dr. E.C. Nwobi / Dr. S.U. Enogwe'
  },
  {
    id: 2,
    code: 'STA 112',
    title: 'Probability Theory I',
    level: 100,
    semester: 2,
    units: 3,
    description: 'Axiomatic foundation of probability, sample spaces, combinatorial analysis, conditional probability, Bayes theorem, independent events, and random variables.',
    outline: 'Sample spaces and events; Permutations and combinations; Classical vs empirical probability; Conditional probability & Bayes Rule; Discrete random variables; Mathematical expectation and variance.',
    lecturer: 'Dr. C.D. Ezeke'
  },
  {
    id: 3,
    code: 'STA 211',
    title: 'Statistical Inference I',
    level: 200,
    semester: 1,
    units: 3,
    description: 'Point and interval estimation principles, properties of good estimators (unbiasedness, consistency, efficiency), method of moments, maximum likelihood estimation.',
    outline: 'Sampling distributions (Z, t, Chi-square, F); Central Limit Theorem; Point estimation criteria; Cramer-Rao Lower Bound; Confidence intervals for single and two population means/proportions.',
    lecturer: 'Prof. P.U. Naval / Dr. P.C. Nwokocha'
  },
  {
    id: 4,
    code: 'STA 214',
    title: 'Computer Applications in Statistics (R & Python)',
    level: 200,
    semester: 2,
    units: 3,
    description: 'Hands-on statistical computing using R programming and Python. Data wrangling with tidyverse and pandas, plotting with ggplot2, simulation studies.',
    outline: 'R environment setup & data structures; Vectorized arithmetic; Data frames & tibbles; Descriptive statistics algorithms; Random number generation; Monte Carlo simulations; Introduction to Python NumPy & Pandas.',
    lecturer: 'Dr. S.U. Enogwe'
  },
  {
    id: 5,
    code: 'STA 312',
    title: 'Distribution Theory & Order Statistics',
    level: 300,
    semester: 1,
    units: 3,
    description: 'Advanced univariate and multivariate distributions, moment generating functions, characteristic functions, distributions of functions of random variables, order statistics.',
    outline: 'Joint and marginal distributions; Conditional expectation; Bivariate Normal distribution; Transformation techniques; Order statistics distributions of min, max and median; Sample quantiles.',
    lecturer: 'Dr. S.U. Enogwe / Dr. E.C. Nwobi'
  },
  {
    id: 6,
    code: 'STA 341',
    title: 'Regression Analysis I (Linear Models)',
    level: 300,
    semester: 1,
    units: 3,
    description: 'Simple and multiple linear regression, least squares estimation, Gauss-Markov theorem, ANOVA decomposition, residual diagnostics, multi-collinearity detection.',
    outline: 'Simple linear regression formulation; Matrix formulation of multiple regression; Hypothesis testing in regression; R-squared and Adjusted R-squared; Residual analysis & normality tests; Outlier detection.',
    lecturer: 'Dr. P.C. Nwokocha / Dr. S.U. Enogwe'
  },
  {
    id: 7,
    code: 'STA 371',
    title: 'Operations Research I (Optimization & Linear Programming)',
    level: 300,
    semester: 2,
    units: 3,
    description: 'Linear programming models, simplex algorithms, duality theory, sensitivity analysis, transportation and assignment problems, network analysis.',
    outline: 'Formulation of optimization problems; Graphical LP method; Simplex algorithm; Two-Phase simplex; Duality theorem; Transportation simplex; Assignment Hungarian algorithm.',
    lecturer: 'Dr. E.C. Ikediuwa'
  },
  {
    id: 8,
    code: 'STA 411',
    title: 'Time Series Analysis & Forecasting',
    level: 400,
    semester: 1,
    units: 3,
    description: 'Stochastic processes, stationary and non-stationary time series, autocorrelation, partial autocorrelation, AR, MA, ARMA, ARIMA modeling, Box-Jenkins methodology.',
    outline: 'Components of time series; Classical decomposition; Stationarity testing (ADF test); Autocorrelation and Partial Autocorrelation; Box-Jenkins model identification, estimation and diagnostic checking; Forecasting.',
    lecturer: 'Prof. P.U. Naval'
  },
  {
    id: 9,
    code: 'STA 421',
    title: 'Design and Analysis of Experiments II',
    level: 400,
    semester: 1,
    units: 3,
    description: 'Factorial designs, confounding, fractional factorial experiments, split-plot designs, response surface methodology, analysis of covariance.',
    outline: '2^k and 3^k factorial designs; Complete and partial confounding; Fractional factorials; Split-plot and strip-plot layouts; Analysis of Covariance (ANCOVA); Response Surface Methodology.',
    lecturer: 'Dr. C.D. Ezeke'
  },
  {
    id: 10,
    code: 'STA 431',
    title: 'Multivariate Statistical Analysis',
    level: 400,
    semester: 2,
    units: 3,
    description: 'Multivariate normal distribution, Hotelling T-squared, MANOVA, principal component analysis (PCA), factor analysis, discriminant analysis, cluster analysis.',
    outline: 'Properties of multivariate normal distribution; Hotelling T^2 tests; One-way and two-way MANOVA; Principal Component Analysis; Factor analysis models; Linear discriminant functions; K-means clustering.',
    lecturer: 'Dr. P.C. Nwokocha'
  }
];

const DEFAULT_RESOURCES: CourseResource[] = [
  {
    id: 101,
    title: 'Official UNIZIK Departmental Statistical Tables & Formulas',
    course_code: 'ALL STA',
    course_title: 'Statistical Science Standard Compendium',
    resource_type: 'table',
    file_name: 'Statistical_Tables.pdf',
    file_path: '/downloads/Statistical_Tables.pdf',
    file_size: '44 KB',
    academic_year: '2026/2027 Standard Edition',
    download_url: '/downloads/Statistical_Tables.pdf'
  },
  {
    id: 102,
    title: 'STA 111 Probability & Statistics Complete Lecture Notes',
    course_code: 'STA 111',
    course_title: 'Descriptive Statistics & Probability',
    resource_type: 'lecture_note',
    file_name: 'sta111_probability_note.pdf',
    file_path: '/resources/materials/sta111_probability_note.pdf',
    file_size: '2.4 MB',
    level: 100,
    semester: 1,
    academic_year: '2026/2027',
    download_url: '/resources/materials/sta111_probability_note.pdf'
  },
  {
    id: 103,
    title: 'STA 121 Statistical Computing Presentation Slides',
    course_code: 'STA 121',
    course_title: 'Statistical Computing I',
    resource_type: 'lecture_note',
    file_name: 'sta121_slides.pdf',
    file_path: '/resources/materials/sta121_slides.pdf',
    file_size: '1.8 MB',
    level: 100,
    semester: 2,
    academic_year: '2026/2027',
    download_url: '/resources/materials/sta121_slides.pdf'
  },
  {
    id: 104,
    title: 'STA 214 Computer Applications in Statistics (R Code & Labs)',
    course_code: 'STA 214',
    course_title: 'Computer Applications in Statistics',
    resource_type: 'lecture_note',
    file_name: 'sta214_note.pdf',
    file_path: '/resources/materials/sta214_note.pdf',
    file_size: '3.1 MB',
    level: 200,
    semester: 2,
    academic_year: '2026/2027',
    download_url: '/resources/materials/sta214_note.pdf'
  },
  {
    id: 105,
    title: 'STA 312 Order Statistics & Distribution Theory Lecture Module',
    course_code: 'STA 312',
    course_title: 'Distribution Theory',
    resource_type: 'lecture_note',
    file_name: 'sta312_order_statistics.pdf',
    file_path: '/resources/materials/sta312_order_statistics.pdf',
    file_size: '2.8 MB',
    level: 300,
    semester: 1,
    academic_year: '2026/2027',
    download_url: '/resources/materials/sta312_order_statistics.pdf'
  },
  {
    id: 106,
    title: 'STA 341 Regression Analysis Comprehensive Lecture Series',
    course_code: 'STA 341',
    course_title: 'Regression Analysis I',
    resource_type: 'lecture_note',
    file_name: 'stat322_regression_analysis.pdf',
    file_path: '/resources/materials/stat322_regression_analysis.pdf',
    file_size: '4.2 MB',
    level: 300,
    semester: 1,
    academic_year: '2026/2027',
    download_url: '/resources/materials/stat322_regression_analysis.pdf'
  },
  {
    id: 107,
    title: 'STA 371 Operations Research Lecture Compendium (Dr. Ikediuwa)',
    course_code: 'STA 371',
    course_title: 'Operations Research I',
    resource_type: 'lecture_note',
    file_name: 'sta371_operations_research_dr_ikediuwa.pdf',
    file_path: '/resources/materials/sta371_operations_research_dr_ikediuwa.pdf',
    file_size: '3.5 MB',
    level: 300,
    semester: 2,
    academic_year: '2026/2027',
    download_url: '/resources/materials/sta371_operations_research_dr_ikediuwa.pdf'
  },
  {
    id: 108,
    title: 'SIWES Industrial Training Technical Report Guide & Logbook Rules',
    course_code: 'STA 399',
    course_title: 'SIWES Industrial Attachment',
    resource_type: 'siwes',
    file_name: 'siwes_technical_report_guide.pdf',
    file_path: '/resources/documents/siwes/siwes_technical_report_guide.pdf',
    file_size: '890 KB',
    level: 300,
    semester: 2,
    academic_year: '2026/2027',
    download_url: '/resources/documents/siwes/siwes_technical_report_guide.pdf'
  },
  {
    id: 109,
    title: 'CSC 202 Data Structures & Algorithms Past Question Archive',
    course_code: 'CSC 202',
    course_title: 'Data Structures & Algorithms',
    resource_type: 'past_question',
    file_name: 'csc202_past_question.pdf',
    file_path: '/resources/materials/csc202_past_question.pdf',
    file_size: '1.2 MB',
    level: 200,
    semester: 2,
    academic_year: '2024–2026 Archive',
    download_url: '/resources/materials/csc202_past_question.pdf'
  },
  {
    id: 110,
    title: 'MAT 201 Mathematical Methods I Past Examination Papers',
    course_code: 'MAT 201',
    course_title: 'Mathematical Methods I',
    resource_type: 'past_question',
    file_name: 'mat201_past_question.pdf',
    file_path: '/resources/materials/mat201_past_question.pdf',
    file_size: '1.5 MB',
    level: 200,
    semester: 1,
    academic_year: '2023–2025 Archive',
    download_url: '/resources/materials/mat201_past_question.pdf'
  }
];

const DEFAULT_STAFF: StaffMember[] = [
  {
    id: 1,
    name: 'Prof. P.U. Naval',
    title: 'Professor',
    role_category: 'HOD',
    qualifications: 'B.Sc. (Hons) Nsukka, M.Sc. Ibadan, Ph.D. UNIZIK, CStat, FSSN',
    specialization: 'Time Series Analysis, Stochastic Modeling, Biostatistics',
    email: 'pu.naval@unizik.edu.ng',
    phone: '+234 803 342 1190',
    office: 'HOD Office, Department of Statistics, Faculty of Physical Sciences Complex',
    photo_url: '/resources/images/staff_hod.jpg',
    bio: 'Professor of Statistics and Head of Department. Pioneer researcher in environmental time series modeling, ARIMA forecasting, and statistical quality engineering across African eco-regions.',
    display_order: 1
  },
  {
    id: 2,
    name: 'Dr. Samuel Ugochukwu Enogwe',
    title: 'Senior Lecturer',
    role_category: 'SENIOR_LECTURER',
    qualifications: 'HND (Distinction), B.Sc. (First Class Honours), M.Sc. (5.00 CGPA), Ph.D. (Best Graduating Ph.D.), PGD Economics',
    specialization: 'Operations Research, Non-Markovian Queueing Systems, Econometric Modeling, Statistical Software (R/Python)',
    email: 'su.enogwe@unizik.edu.ng',
    phone: '+234 806 728 9012',
    office: 'Office 204, Statistics Wing, Physical Sciences Complex',
    photo_url: '/resources/images/staff/dr_enogwe.jpg',
    bio: 'Distinguished researcher with 31+ peer-reviewed journal articles. Secretary of Departmental Academic Quality Assurance Committee and lead computational instructor for R and Python.',
    display_order: 2
  },
  {
    id: 3,
    name: 'Dr. E.C. Nwobi',
    title: 'Associate Professor',
    role_category: 'PROFESSOR',
    qualifications: 'B.Sc., M.Sc., Ph.D. UNIZIK, MNSS',
    specialization: 'Sample Survey Theory, Demographic Analysis, Experimental Design',
    email: 'ec.nwobi@unizik.edu.ng',
    phone: '+234 803 711 4455',
    office: 'Room 108, Faculty of Physical Sciences',
    photo_url: '/resources/images/staff/dr_nwobi.jpg',
    bio: 'Renowned expert in survey methodology, complex sampling weights, and demographic transition metrics in developing economies.',
    display_order: 3
  },
  {
    id: 4,
    name: 'Dr. C.D. Ezeke',
    title: 'Senior Lecturer',
    role_category: 'SENIOR_LECTURER',
    qualifications: 'B.Sc., M.Sc., Ph.D., PSSN',
    specialization: 'Probability Distributions, Extreme Value Theory, Reliability Engineering',
    email: 'cd.ezeke@unizik.edu.ng',
    phone: '+234 802 334 8872',
    office: 'Room 210, Physical Sciences Complex',
    photo_url: '/resources/images/staff/dr_ezeke.jpg',
    bio: 'Lead lecturer in Probability Theory and Experimental Designs, supervising advanced undergraduate and postgraduate researchers in reliability models.',
    display_order: 4
  },
  {
    id: 5,
    name: 'Dr. P.C. Nwokocha',
    title: 'Senior Lecturer',
    role_category: 'SENIOR_LECTURER',
    qualifications: 'B.Sc., M.Sc., Ph.D., IORMS',
    specialization: 'Multivariate Analysis, Statistical Optimization, Industrial Applications',
    email: 'pc.nwokocha@unizik.edu.ng',
    phone: '+234 803 456 7890',
    office: 'Room 214, Statistics Wing',
    photo_url: '/resources/images/staff/dr_nwokocha.jpg',
    bio: 'Active member of the Institute of Operational Research and Management Science of Nigeria, specializing in multi-criteria fleet management models.',
    display_order: 5
  }
];

const DEFAULT_EXECUTIVES: Executive[] = [
  {
    id: 1,
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
    id: 2,
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
    id: 3,
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
    id: 4,
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
    id: 5,
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
    id: 6,
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
    id: 7,
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
    id: 8,
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

const DEFAULT_EVENTS: EventItem[] = [
  {
    id: 1,
    title: 'Departmental Academic Colloquium & Research Symposium',
    date: 'Wednesday, Oct 28, 2026',
    time: '10:00 AM – 1:00 PM',
    venue: 'Faculty of Physical Sciences Auditorium, Awka Campus',
    description: 'Presentation of cutting-edge research in statistical machine learning, biometrics, and econometrics. Keynote address by Prof. P.U. Naval on Big Data Analytics in Emerging Economies.',
    organizer: 'Department of Statistics Seminar Committee',
    photo_url: '/resources/images/event_default.jpg',
    is_upcoming: true
  },
  {
    id: 2,
    title: 'NASS Annual Statistics Week & Hackathon 2026',
    date: 'Nov 16 – Nov 20, 2026',
    time: '9:00 AM Daily',
    venue: 'Statistics Wing & Multipurpose Hall',
    description: 'A 5-day celebration of data science, inter-level mathematical quizzes, R/Python coding challenge, Dean Cup football matches, and gala dinner awards night.',
    organizer: 'National Association of Statistics Students (NASS)',
    photo_url: '/resources/images/gallery/vantora_class_2027.jpg',
    is_upcoming: true
  },
  {
    id: 3,
    title: 'HOD Cup Inter-Level Championship Finals',
    date: 'Friday, Oct 16, 2026',
    time: '3:30 PM',
    venue: 'UNIZIK University Sports Complex Stadium',
    description: 'Annual football tournament pitting the best departmental players across 100L through 400L. Defending champions Vantora 27 face off against Probix 26.',
    organizer: 'NASS Sports Directorate',
    photo_url: '/resources/images/gallery/hod_cup_runner_up_2025_2026.jpg',
    is_upcoming: false
  },
  {
    id: 4,
    title: 'Vantora 27 SIWES Industrial Attachment Oral Defense',
    date: 'September 24, 2026',
    time: '9:00 AM',
    venue: 'Departmental Boardroom & Statistics Computer Lab',
    description: 'Rigorous presentation and defense of 6-month industrial experience by 300 Level students before academic panelists and external assessors.',
    organizer: 'Departmental SIWES Board & Prof. Osuji',
    photo_url: '/resources/images/gallery/prof_osuji_vantora27_siwes_defense_2026.jpg',
    is_upcoming: false
  }
];

const DEFAULT_ANNOUNCEMENTS: Announcement[] = [
  {
    id: 1,
    title: 'Commencement of 2026/2027 Harmattan Semester Course Registration',
    content: 'All undergraduate students across 100L, 200L, 300L, and 400L are directed to complete their online course registrations on the portal before the statutory deadline. Ensure verified academic adviser endorsement before submitting signed forms to the General Office.',
    priority: 'high',
    date: 'Oct 05, 2026',
    author: 'Head of Department'
  },
  {
    id: 2,
    title: 'Official Statistical Tables Compendium Available in Portal',
    content: 'Students enrolled in STA 111, STA 112, STA 211, STA 312, and STA 341 are reminded to access the UNIZIK Official Statistical Tables (Standard Normal, Student t, Chi-Square, F-distribution) directly inside the portal for classroom and examination use.',
    priority: 'high',
    date: 'Oct 02, 2026',
    author: 'Academic Directorate (Comr. Ejefonye M.)'
  },
  {
    id: 3,
    title: 'Departmental R & Python Data Science Weekend Clinic',
    content: 'The NASS Academic Committee in partnership with NAU-LISA will host weekly statistical computing workshops every Saturday at 11:00 AM in the departmental computer laboratory. Bring your laptops.',
    priority: 'normal',
    date: 'Sep 28, 2026',
    author: 'NASS Secretariat'
  }
];

const DEFAULT_TIMETABLE: TimetableSlot[] = [
  { id: 1, level: 100, semester: 1, day: 'Monday', start_time: '08:00', end_time: '10:00', course_code: 'STA 111', course_title: 'Descriptive Statistics', venue: 'LT 1 Physical Sciences', lecturer: 'Dr. E.C. Nwobi' },
  { id: 2, level: 100, semester: 1, day: 'Wednesday', start_time: '10:00', end_time: '12:00', course_code: 'MAT 101', course_title: 'Elementary Mathematics I', venue: 'Faculty Auditorium', lecturer: 'Mathematics Dept' },
  { id: 3, level: 200, semester: 1, day: 'Monday', start_time: '10:00', end_time: '12:00', course_code: 'STA 211', course_title: 'Statistical Inference I', venue: 'Statistics Hall A', lecturer: 'Dr. P.C. Nwokocha' },
  { id: 4, level: 200, semester: 1, day: 'Thursday', start_time: '02:00', end_time: '04:00', course_code: 'STA 214', course_title: 'Computer Applications in Stats', venue: 'Computer Lab 1', lecturer: 'Dr. S.U. Enogwe' },
  { id: 5, level: 300, semester: 1, day: 'Tuesday', start_time: '09:00', end_time: '11:00', course_code: 'STA 312', course_title: 'Distribution Theory', venue: 'Statistics Lab B', lecturer: 'Dr. S.U. Enogwe' },
  { id: 6, level: 300, semester: 1, day: 'Wednesday', start_time: '08:00', end_time: '10:00', course_code: 'STA 341', course_title: 'Regression Analysis I', venue: 'Statistics Hall A', lecturer: 'Dr. P.C. Nwokocha' },
  { id: 7, level: 400, semester: 1, day: 'Monday', start_time: '12:00', end_time: '02:00', course_code: 'STA 411', course_title: 'Time Series Analysis', venue: 'Boardroom / Room 204', lecturer: 'Prof. P.U. Naval' },
  { id: 8, level: 400, semester: 1, day: 'Thursday', start_time: '10:00', end_time: '12:00', course_code: 'STA 421', course_title: 'Design of Experiments II', venue: 'Room 210', lecturer: 'Dr. C.D. Ezeke' }
];

// Cache helper
function getLocalCache<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    if (!raw) return fallback;
    const data = JSON.parse(raw);
    return (data[key] as T) || fallback;
  } catch {
    return fallback;
  }
}

function setLocalCache(key: string, value: any) {
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    const data = raw ? JSON.parse(raw) : {};
    data[key] = value;
    data._timestamp = Date.now();
    localStorage.setItem(CACHE_KEY, JSON.stringify(data));
  } catch (e) {
    console.warn('Cache write error:', e);
  }
}

export const StatsAPI = {
  async getCourses(level?: AcademicLevel, semester?: SemesterNumber): Promise<Course[]> {
    try {
      const params = new URLSearchParams();
      if (level) params.append('level', level.toString());
      if (semester) params.append('semester', semester.toString());
      
      const res = await fetch(`${API_BASE}/courses?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data) && data.length > 0) {
          setLocalCache('courses', data);
          return data;
        }
      }
    } catch (err) {
      console.warn('Using cached courses:', err);
    }
    const cached = getLocalCache<Course[]>('courses', DEFAULT_COURSES);
    return cached.filter(c => (!level || c.level === level) && (!semester || c.semester === semester));
  },

  async getCourseDetails(id: number | string): Promise<Course | null> {
    try {
      const res = await fetch(`${API_BASE}/courses/${id}`);
      if (res.ok) {
        return await res.json();
      }
    } catch (err) {
      console.warn('Course detail fetch error:', err);
    }
    const courses = getLocalCache<Course[]>('courses', DEFAULT_COURSES);
    return courses.find(c => c.id === Number(id) || c.code === id) || null;
  },

  async getResources(category?: string, level?: AcademicLevel, semester?: SemesterNumber): Promise<CourseResource[]> {
    try {
      const res = await fetch(`${API_BASE}/materials`);
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data) && data.length > 0) {
          setLocalCache('resources', data);
          return data;
        }
      }
    } catch (err) {
      console.warn('Using cached resources:', err);
    }
    const cached = getLocalCache<CourseResource[]>('resources', DEFAULT_RESOURCES);
    return cached.filter(r => {
      if (category && category !== 'all' && r.resource_type !== category) return false;
      if (level && r.level && r.level !== level) return false;
      if (semester && r.semester && r.semester !== semester) return false;
      return true;
    });
  },

  async getStaff(): Promise<StaffMember[]> {
    try {
      const res = await fetch(`${API_BASE}/staff`);
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data) && data.length > 0) {
          setLocalCache('staff', data);
          return data;
        }
      }
    } catch (err) {
      console.warn('Using cached staff:', err);
    }
    return getLocalCache<StaffMember[]>('staff', DEFAULT_STAFF);
  },

  async getExecutives(): Promise<Executive[]> {
    try {
      const res = await fetch(`${API_BASE}/executives`);
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data) && data.length > 0) {
          setLocalCache('executives', data);
          return data;
        }
      }
    } catch (err) {
      console.warn('Using cached executives:', err);
    }
    return getLocalCache<Executive[]>('executives', DEFAULT_EXECUTIVES);
  },

  async getEvents(): Promise<EventItem[]> {
    try {
      const res = await fetch(`${API_BASE}/events`);
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data) && data.length > 0) {
          setLocalCache('events', data);
          return data;
        }
      }
    } catch (err) {
      console.warn('Using cached events:', err);
    }
    return getLocalCache<EventItem[]>('events', DEFAULT_EVENTS);
  },

  async getAnnouncements(): Promise<Announcement[]> {
    try {
      const res = await fetch(`${API_BASE}/announcements`);
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data) && data.length > 0) {
          setLocalCache('announcements', data);
          return data;
        }
      }
    } catch (err) {
      console.warn('Using cached announcements:', err);
    }
    return getLocalCache<Announcement[]>('announcements', DEFAULT_ANNOUNCEMENTS);
  },

  async getTimetable(level?: AcademicLevel, semester?: SemesterNumber): Promise<TimetableSlot[]> {
    try {
      const params = new URLSearchParams();
      if (level) params.append('level', level.toString());
      if (semester) params.append('semester', semester.toString());
      const res = await fetch(`${API_BASE}/timetable?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data) && data.length > 0) {
          setLocalCache('timetable', data);
          return data;
        }
      }
    } catch (err) {
      console.warn('Using cached timetable:', err);
    }
    const cached = getLocalCache<TimetableSlot[]>('timetable', DEFAULT_TIMETABLE);
    return cached.filter(t => (!level || t.level === level) && (!semester || t.semester === semester));
  },

  async searchGlobal(query: string): Promise<SearchResultItem[]> {
    const q = query.trim().toLowerCase();
    if (q.length < 2) return [];

    try {
      const res = await fetch(`${API_BASE}/search?q=${encodeURIComponent(query)}`);
      if (res.ok) {
        const data = await res.json();
        if (data.results && Array.isArray(data.results)) {
          return data.results.map((item: any) => ({
            id: item.id || Math.random(),
            type: item.type || 'resource',
            title: item.title || item.name || '',
            subtitle: item.subtitle || item.code || item.role || '',
            details: item.details || item.description || '',
            actionPayload: item
          }));
        }
      }
    } catch {
      // Fallback local search
    }

    // Local instant fuzzy search across cached entities
    const courses = getLocalCache<Course[]>('courses', DEFAULT_COURSES);
    const resources = getLocalCache<CourseResource[]>('resources', DEFAULT_RESOURCES);
    const staff = getLocalCache<StaffMember[]>('staff', DEFAULT_STAFF);
    const execs = getLocalCache<Executive[]>('executives', DEFAULT_EXECUTIVES);
    const events = getLocalCache<EventItem[]>('events', DEFAULT_EVENTS);

    const matches: SearchResultItem[] = [];

    courses.forEach(c => {
      if (c.code.toLowerCase().includes(q) || c.title.toLowerCase().includes(q) || c.description.toLowerCase().includes(q)) {
        matches.push({
          id: `c-${c.id}`,
          type: 'course',
          title: `${c.code}: ${c.title}`,
          subtitle: `${c.level} Level · ${c.units} Units · Semester ${c.semester}`,
          details: c.description,
          actionPayload: c
        });
      }
    });

    resources.forEach(r => {
      if (r.title.toLowerCase().includes(q) || r.file_name.toLowerCase().includes(q) || (r.course_code && r.course_code.toLowerCase().includes(q))) {
        matches.push({
          id: `r-${r.id}`,
          type: 'resource',
          title: r.title,
          subtitle: `${r.course_code || 'General'} · ${r.resource_type.toUpperCase()} · ${r.file_size || ''}`,
          details: r.file_name,
          actionPayload: r
        });
      }
    });

    staff.forEach(s => {
      if (s.name.toLowerCase().includes(q) || s.specialization.toLowerCase().includes(q) || s.office.toLowerCase().includes(q)) {
        matches.push({
          id: `s-${s.id}`,
          type: 'staff',
          title: s.name,
          subtitle: `${s.title} · ${s.role_category}`,
          details: s.specialization,
          actionPayload: s
        });
      }
    });

    execs.forEach(e => {
      if (e.name.toLowerCase().includes(q) || e.office.toLowerCase().includes(q)) {
        matches.push({
          id: `e-${e.id}`,
          type: 'executive',
          title: e.name,
          subtitle: `${e.office} · ${e.level} Level`,
          details: e.bio,
          actionPayload: e
        });
      }
    });

    events.forEach(ev => {
      if (ev.title.toLowerCase().includes(q) || ev.description.toLowerCase().includes(q)) {
        matches.push({
          id: `ev-${ev.id}`,
          type: 'event',
          title: ev.title,
          subtitle: `${ev.date} · ${ev.venue}`,
          details: ev.description,
          actionPayload: ev
        });
      }
    });

    return matches;
  }
};
