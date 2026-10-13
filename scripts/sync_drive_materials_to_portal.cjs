const { DatabaseSync } = require("node:sqlite");
const fs = require("fs");
const path = require("path");

const db = new DatabaseSync("data/nass_portal.db");

// Verify courses exist in DB
const courseRows = db.prepare("SELECT id, code, title, level, semester FROM courses").all();
const courseMap = {};
for (const c of courseRows) {
  courseMap[c.code] = c;
}

const newMaterials = [
  // Past Examination Questions
  {
    course_code: "MTH 201",
    title: "MAT 201: Mathematical Methods I Past Examination Paper (2021/2022)",
    resource_type: "past_question",
    file_name: "mat201_past_question.pdf",
    file_path: "/resources/materials/mat201_past_question.pdf",
    academic_year: "2021/2022",
    semester: 1
  },
  {
    course_code: "COS 202",
    title: "COS 202: Computer Programming II Past Examination Paper",
    resource_type: "past_question",
    file_name: "csc202_past_question.pdf",
    file_path: "/resources/materials/csc202_past_question.pdf",
    academic_year: "2023/2024",
    semester: 2
  },
  {
    course_code: "GST 312",
    title: "GST 312: Peace and Conflict Resolution CBT Exam & Practice Questions",
    resource_type: "past_question",
    file_name: "gst312_cbt_practice_questions.pdf",
    file_path: "/resources/materials/gst312_cbt_practice_questions.pdf",
    academic_year: "2024/2025",
    semester: 2
  },

  // 100 Level Lecture Materials & Textbooks
  {
    course_code: "NAU-BIO 102",
    title: "BIO 102: General Biology II Complete Study Compendium",
    resource_type: "lecture_note",
    file_name: "bio102_general_biology_notes.pdf",
    file_path: "/resources/materials/bio102_general_biology_notes.pdf",
    academic_year: "2024/2025",
    semester: 2
  },
  {
    course_code: "NAU-BIO 102",
    title: "BIO 102: General Biology II Lecture Notes by Dr. Okolie",
    resource_type: "lecture_note",
    file_name: "bio102_okolie_lecture_notes.pdf",
    file_path: "/resources/materials/bio102_okolie_lecture_notes.pdf",
    academic_year: "2024/2025",
    semester: 2
  },
  {
    course_code: "NAU-BIO 102",
    title: "BIO 102: Mode of Cellular Respiration in Animals and Plants",
    resource_type: "lecture_note",
    file_name: "bio102_respiration_animals_plants.pdf",
    file_path: "/resources/materials/bio102_respiration_animals_plants.pdf",
    academic_year: "2024/2025",
    semester: 2
  },
  {
    course_code: "NAU-BIO 102",
    title: "BIO 102: Virology, Viral Structure & Replication Dynamics",
    resource_type: "lecture_note",
    file_name: "bio102_virus_notes.pdf",
    file_path: "/resources/materials/bio102_virus_notes.pdf",
    academic_year: "2024/2025",
    semester: 2
  },
  {
    course_code: "NAU-BIO 102",
    title: "BIO 102: Ecological Adaptations & Modes of Nutrition",
    resource_type: "lecture_note",
    file_name: "bio102_ecological_adaptations.pdf",
    file_path: "/resources/materials/bio102_ecological_adaptations.pdf",
    academic_year: "2024/2025",
    semester: 2
  },
  {
    course_code: "NAU-BIO 102",
    title: "BIO 102: General Biology II Lecture Handout by Mr. Chisom",
    resource_type: "lecture_note",
    file_name: "bio102_chisom_lecture_notes.pdf",
    file_path: "/resources/materials/bio102_chisom_lecture_notes.pdf",
    academic_year: "2024/2025",
    semester: 2
  },
  {
    course_code: "NAU-BIO 102",
    title: "BIO 102: Systematic Classification of Bacteria and Fungi",
    resource_type: "lecture_note",
    file_name: "bio102_bacteria_and_fungi_classification.pdf",
    file_path: "/resources/materials/bio102_bacteria_and_fungi_classification.pdf",
    academic_year: "2024/2025",
    semester: 2
  },
  {
    course_code: "NAU-BIO 102",
    title: "BIO 102: Principles and Methods of Cell and Tissue Culture",
    resource_type: "lecture_note",
    file_name: "bio102_cell_culture_techniques.pdf",
    file_path: "/resources/materials/bio102_cell_culture_techniques.pdf",
    academic_year: "2024/2025",
    semester: 2
  },
  {
    course_code: "NAU-BIO 102",
    title: "BIO 102: Comprehensive Biology Course Study Pack by Dr. Iweze",
    resource_type: "lecture_note",
    file_name: "bio102_iweze_compressed.pdf",
    file_path: "/resources/materials/bio102_iweze_compressed.pdf",
    academic_year: "2024/2025",
    semester: 2
  },
  {
    course_code: "BUA 102",
    title: "BUA 102: Introduction to Business II Comprehensive Lecture Notes",
    resource_type: "lecture_note",
    file_name: "bua102_introduction_to_business.pdf",
    file_path: "/resources/materials/bua102_introduction_to_business.pdf",
    academic_year: "2024/2025",
    semester: 2
  },
  {
    course_code: "COS 102",
    title: "COS 102: Introduction to Problem Solving & Algorithmic Methods",
    resource_type: "lecture_note",
    file_name: "cos102_introduction_to_problem_solving.pdf",
    file_path: "/resources/materials/cos102_introduction_to_problem_solving.pdf",
    academic_year: "2024/2025",
    semester: 2
  },
  {
    course_code: "MTH 102",
    title: "MTH 102: Elementary Mathematics II (Calculus & Coordinate Geometry)",
    resource_type: "lecture_note",
    file_name: "mat102_calculus_coordinate_geometry.pdf",
    file_path: "/resources/materials/mat102_calculus_coordinate_geometry.pdf",
    academic_year: "2024/2025",
    semester: 2
  },
  {
    course_code: "MTH 102",
    title: "MTH 102: Analytic Geometry & Conic Sections Lecture Module",
    resource_type: "lecture_note",
    file_name: "mat102_conics_section_lecture_notes.pdf",
    file_path: "/resources/materials/mat102_conics_section_lecture_notes.pdf",
    academic_year: "2024/2025",
    semester: 2
  },
  {
    course_code: "NAU-PHY 102",
    title: "PHY 102: General Physics II (Electricity, Magnetism & Modern Physics) Textbook",
    resource_type: "textbook",
    file_name: "phy102_general_physics_textbook.pdf",
    file_path: "/resources/materials/phy102_general_physics_textbook.pdf",
    academic_year: "2024/2025",
    semester: 2
  },
  {
    course_code: "NAU-PHY 102",
    title: "PHY 102: Electricity, Magnetism & Atomic Physics Lecture Notes",
    resource_type: "lecture_note",
    file_name: "phy102_electricity_magnetism_notes.pdf",
    file_path: "/resources/materials/phy102_electricity_magnetism_notes.pdf",
    academic_year: "2024/2025",
    semester: 2
  },
  {
    course_code: "STA 111",
    title: "STA 111: Introduction to Descriptive Statistics Course Module",
    resource_type: "lecture_note",
    file_name: "sta111_probability_note.pdf",
    file_path: "/resources/materials/sta111_probability_note.pdf",
    academic_year: "2025/2026",
    semester: 1
  },
  {
    course_code: "STA 121",
    title: "STA 121: Statistical Inference I - Foundation Slide Modules",
    resource_type: "lecture_note",
    file_name: "sta121_slides.pdf",
    file_path: "/resources/materials/sta121_slides.pdf",
    academic_year: "2025/2026",
    semester: 1
  },
  {
    course_code: "STA 111",
    title: "Schaum's Outline of Theory and Problems of Statistics",
    resource_type: "textbook",
    file_name: "schaums_outline_statistics.pdf",
    file_path: "/resources/materials/schaums_outline_statistics.pdf",
    academic_year: "2025/2026",
    semester: 1
  },
  {
    course_code: "STA 112",
    title: "Schaum's Outline of Probability, Random Variables & Random Processes",
    resource_type: "textbook",
    file_name: "schaums_probability.pdf",
    file_path: "/resources/materials/schaums_probability.pdf",
    academic_year: "2025/2026",
    semester: 2
  },

  // 200 Level Lecture Materials
  {
    course_code: "ENT 211",
    title: "ENT 211: Entrepreneurship and Innovation Official Study Compendium",
    resource_type: "lecture_note",
    file_name: "ent211_entrepreneurship_textbook_2024.pdf",
    file_path: "/resources/materials/ent211_entrepreneurship_textbook_2024.pdf",
    academic_year: "2024/2025",
    semester: 1
  },
  {
    course_code: "NAU-MTH 202",
    title: "MTH 202: Elementary Differential Equations Comprehensive Lecture Notes",
    resource_type: "lecture_note",
    file_name: "mat202_mathematical_methods_notes.pdf",
    file_path: "/resources/materials/mat202_mathematical_methods_notes.pdf",
    academic_year: "2024/2025",
    semester: 2
  },
  {
    course_code: "MTH 204",
    title: "MTH 204: Linear Algebra II - Module 1 (Vector Spaces & Subspaces)",
    resource_type: "lecture_note",
    file_name: "mth204_lecture_note_part1.pdf",
    file_path: "/resources/materials/mth204_lecture_note_part1.pdf",
    academic_year: "2024/2025",
    semester: 2
  },
  {
    course_code: "MTH 204",
    title: "MTH 204: Linear Algebra II - Module 2 (Linear Transformations & Matrices)",
    resource_type: "lecture_note",
    file_name: "mth204_lecture_note_part2.pdf",
    file_path: "/resources/materials/mth204_lecture_note_part2.pdf",
    academic_year: "2024/2025",
    semester: 2
  },
  {
    course_code: "MTH 204",
    title: "MTH 204: Linear Algebra II - Module 3 (Eigenvalues & Quadratic Forms)",
    resource_type: "lecture_note",
    file_name: "mth204_lecture_note_part3.pdf",
    file_path: "/resources/materials/mth204_lecture_note_part3.pdf",
    academic_year: "2024/2025",
    semester: 2
  },
  {
    course_code: "MTH 231",
    title: "MTH 231: Introduction to Real Analysis - Theory of Limits & Continuity",
    resource_type: "lecture_note",
    file_name: "mth231_limits_note.pdf",
    file_path: "/resources/materials/mth231_limits_note.pdf",
    academic_year: "2024/2025",
    semester: 1
  },
  {
    course_code: "MTH 231",
    title: "MTH 231: Mathematical Methods Official Lecture Notes",
    resource_type: "lecture_note",
    file_name: "mth231_lecture_note_2024_2025.pdf",
    file_path: "/resources/materials/mth231_lecture_note_2024_2025.pdf",
    academic_year: "2024/2025",
    semester: 1
  },
  {
    course_code: "STA 231",
    title: "STA 231: Statistical Computing II - Practical Index Numbers in R",
    resource_type: "lecture_note",
    file_name: "sta231_index_numbers_in_r.pdf",
    file_path: "/resources/materials/sta231_index_numbers_in_r.pdf",
    academic_year: "2025/2026",
    semester: 1
  },
  {
    course_code: "NAU-STA 214",
    title: "STA 214: Probability & Probability Distributions Extended Compendium",
    resource_type: "lecture_note",
    file_name: "sta214_note.pdf",
    file_path: "/resources/materials/sta214_note.pdf",
    academic_year: "2024/2025",
    semester: 2
  },

  // 300 Level Lecture Materials
  {
    course_code: "ENT 312",
    title: "ENT 312: Venture Creation - Chapters 1 to 15 Master Study Guide",
    resource_type: "lecture_note",
    file_name: "ent312_entrepreneurship.pdf",
    file_path: "/resources/materials/ent312_entrepreneurship.pdf",
    academic_year: "2024/2025",
    semester: 2
  },
  {
    course_code: "GST 312",
    title: "GST 312: Peace and Conflict Resolution - 12 Chapters Master Summary",
    resource_type: "lecture_note",
    file_name: "gst312_peace_conflict_summary.pdf",
    file_path: "/resources/materials/gst312_peace_conflict_summary.pdf",
    academic_year: "2024/2025",
    semester: 2
  },
  {
    course_code: "STA 312",
    title: "STA 312: Theory and Applications of Order Statistics",
    resource_type: "lecture_note",
    file_name: "sta312_order_statistics.pdf",
    file_path: "/resources/materials/sta312_order_statistics.pdf",
    academic_year: "2024/2025",
    semester: 2
  },
  {
    course_code: "STA 312",
    title: "STA 312: Bivariate Probability Distributions & Random Variable Transformations",
    resource_type: "lecture_note",
    file_name: "sta312_bivariate_distribution.pdf",
    file_path: "/resources/materials/sta312_bivariate_distribution.pdf",
    academic_year: "2024/2025",
    semester: 2
  },
  {
    course_code: "STA 312",
    title: "STA 312: Probability Distribution Theory Comprehensive Module",
    resource_type: "lecture_note",
    file_name: "sta312_lecture_module.pdf",
    file_path: "/resources/materials/sta312_lecture_module.pdf",
    academic_year: "2024/2025",
    semester: 2
  },
  {
    course_code: "STA 312",
    title: "STA 312: Advanced Distribution Theory & Moment Generating Proofs",
    resource_type: "lecture_note",
    file_name: "sta312_advanced_distribution_notes.pdf",
    file_path: "/resources/materials/sta312_advanced_distribution_notes.pdf",
    academic_year: "2024/2025",
    semester: 2
  },
  {
    course_code: "STA 331",
    title: "STA 331: Regression Analysis - Module 2 (Simple Linear Regression Model)",
    resource_type: "lecture_note",
    file_name: "sta331_regression_module_2.pdf",
    file_path: "/resources/materials/sta331_regression_module_2.pdf",
    academic_year: "2025/2026",
    semester: 1
  },
  {
    course_code: "STA 331",
    title: "STA 331: Regression Analysis - Module 3 (Multiple Linear Regression)",
    resource_type: "lecture_note",
    file_name: "sta331_regression_module_3.pdf",
    file_path: "/resources/materials/sta331_regression_module_3.pdf",
    academic_year: "2025/2026",
    semester: 1
  },
  {
    course_code: "STA 331",
    title: "STA 331: Regression Analysis - Module 4 (Model Diagnostics & Residual Analysis)",
    resource_type: "lecture_note",
    file_name: "sta331_regression_module_4_main.pdf",
    file_path: "/resources/materials/sta331_regression_module_4_main.pdf",
    academic_year: "2025/2026",
    semester: 1
  },
  {
    course_code: "STA 331",
    title: "STA 331: Regression Analysis - Module 5 (Multicollinearity & Remedial Methods)",
    resource_type: "lecture_note",
    file_name: "sta331_regression_module_5.pdf",
    file_path: "/resources/materials/sta331_regression_module_5.pdf",
    academic_year: "2025/2026",
    semester: 1
  },
  {
    course_code: "STA 331",
    title: "STA 331: Regression Analysis - Module 6 (Heteroscedasticity & Autocorrelation Tests)",
    resource_type: "lecture_note",
    file_name: "sta331_regression_module_6.pdf",
    file_path: "/resources/materials/sta331_regression_module_6.pdf",
    academic_year: "2025/2026",
    semester: 1
  },
  {
    course_code: "NAU-STA 361",
    title: "STA 361: Mathematical Demography, Mortality Measures & Life Tables",
    resource_type: "lecture_note",
    file_name: "sta331_391_demography.pdf",
    file_path: "/resources/materials/sta331_391_demography.pdf",
    academic_year: "2025/2026",
    semester: 1
  },
  {
    course_code: "NAU-STA 371",
    title: "STA 371: Operations Research I Comprehensive Course Notes by Dr. Ikediuwa",
    resource_type: "lecture_note",
    file_name: "sta371_operations_research_dr_ikediuwa.pdf",
    file_path: "/resources/materials/sta371_operations_research_dr_ikediuwa.pdf",
    academic_year: "2025/2026",
    semester: 1
  },
  {
    course_code: "NAU-STA 341",
    title: "STA 341: Applied Regression Analysis Practical Handbook",
    resource_type: "lecture_note",
    file_name: "stat322_regression_analysis.pdf",
    file_path: "/resources/materials/stat322_regression_analysis.pdf",
    academic_year: "2025/2026",
    semester: 1
  },
  {
    course_code: "NAU-STA 381",
    title: "STA 381: Biometry & Biological Assay Experimental Design",
    resource_type: "lecture_note",
    file_name: "stat324_biometrics.pdf",
    file_path: "/resources/materials/stat324_biometrics.pdf",
    academic_year: "2025/2026",
    semester: 1
  }
];

// Check existing resources in DB
const existingResources = db.prepare("SELECT * FROM course_resources").all();
const existingFilePaths = new Set(existingResources.map(r => r.file_path));

const insertStmt = db.prepare(`
  INSERT INTO course_resources (course_id, title, resource_type, file_name, file_path, file_size, academic_year, semester, created_at, updated_at)
  VALUES (?, ?, ?, ?, ?, ?, ?, ?, datetime('now'), datetime('now'))
`);

let inserted = 0;
for (const m of newMaterials) {
  const course = courseMap[m.course_code];
  if (!course) {
    console.warn(`Course code not found: ${m.course_code}`);
    continue;
  }

  // Get file size
  let fileSize = 0;
  const localFile = path.join(".", m.file_path);
  if (fs.existsSync(localFile)) {
    fileSize = fs.statSync(localFile).size;
  }

  if (!existingFilePaths.has(m.file_path)) {
    insertStmt.run(
      course.id,
      m.title,
      m.resource_type,
      m.file_name,
      m.file_path,
      fileSize,
      m.academic_year,
      m.semester
    );
    existingFilePaths.add(m.file_path);
    inserted++;
  } else {
    // Update title to clean title
    db.prepare(`
      UPDATE course_resources
      SET title = ?, resource_type = ?, file_size = COALESCE(NULLIF(?, 0), file_size), updated_at = datetime('now')
      WHERE file_path = ?
    `).run(m.title, m.resource_type, fileSize, m.file_path);
  }
}

console.log(`Inserted ${inserted} new materials into course_resources table.`);

// Fetch all resources with course info to rebuild course_resources_seed.json
const allResources = db.prepare(`
  SELECT cr.*, c.code, c.title as course_title, c.level as course_level, c.semester as course_semester
  FROM course_resources cr
  JOIN courses c ON cr.course_id = c.id
  ORDER BY c.level, c.code, cr.id
`).all();

fs.writeFileSync("data/course_resources_seed.json", JSON.stringify(allResources, null, 2));
console.log(`Updated data/course_resources_seed.json with ${allResources.length} total entries.`);

// Also update backup json
const backupPath = "data/portal_state_backup.json";
if (fs.existsSync(backupPath)) {
  const backup = JSON.parse(fs.readFileSync(backupPath, "utf8"));
  backup.course_resources = allResources;
  fs.writeFileSync(backupPath, JSON.stringify(backup, null, 2));
  console.log("Updated data/portal_state_backup.json successfully.");
}
