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
    title: 'Computer Applications in Statistics',
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
    title: 'Distribution Theory',
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
    title: 'Regression Analysis I',
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
    title: 'Operations Research I',
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
    "id": 188,
    "title": "BUA 102: Introduction to Business II Comprehensive Lecture Notes",
    "course_code": "BUA 102",
    "course_title": "Introduction To Business II",
    "resource_type": "lecture_note",
    "file_name": "bua102_introduction_to_business.pdf",
    "file_path": "/resources/materials/bua102_introduction_to_business.pdf",
    "file_size": "151 KB",
    "level": 100,
    "semester": 2,
    "academic_year": "2024/2025",
    "download_url": "/resources/materials/bua102_introduction_to_business.pdf"
  },
  {
    "id": 189,
    "title": "COS 102: Introduction to Problem Solving & Algorithmic Methods",
    "course_code": "COS 102",
    "course_title": "Computer Programming II",
    "resource_type": "lecture_note",
    "file_name": "cos102_introduction_to_problem_solving.pdf",
    "file_path": "/resources/materials/cos102_introduction_to_problem_solving.pdf",
    "file_size": "3.8 MB",
    "level": 100,
    "semester": 2,
    "academic_year": "2024/2025",
    "download_url": "/resources/materials/cos102_introduction_to_problem_solving.pdf"
  },
  {
    "id": 190,
    "title": "MTH 102: Elementary Mathematics II (Calculus & Coordinate Geometry)",
    "course_code": "MTH 102",
    "course_title": "Elementary Mathematics II",
    "resource_type": "lecture_note",
    "file_name": "mat102_calculus_coordinate_geometry.pdf",
    "file_path": "/resources/materials/mat102_calculus_coordinate_geometry.pdf",
    "file_size": "17.5 MB",
    "level": 100,
    "semester": 2,
    "academic_year": "2024/2025",
    "download_url": "/resources/materials/mat102_calculus_coordinate_geometry.pdf"
  },
  {
    "id": 191,
    "title": "MTH 102: Analytic Geometry & Conic Sections Lecture Module",
    "course_code": "MTH 102",
    "course_title": "Elementary Mathematics II",
    "resource_type": "lecture_note",
    "file_name": "mat102_conics_section_lecture_notes.pdf",
    "file_path": "/resources/materials/mat102_conics_section_lecture_notes.pdf",
    "file_size": "3.1 MB",
    "level": 100,
    "semester": 2,
    "academic_year": "2024/2025",
    "download_url": "/resources/materials/mat102_conics_section_lecture_notes.pdf"
  },
  {
    "id": 179,
    "title": "BIO 102: General Biology II Complete Study Compendium",
    "course_code": "NAU-BIO 102",
    "course_title": "General Biology II",
    "resource_type": "lecture_note",
    "file_name": "bio102_general_biology_notes.pdf",
    "file_path": "/resources/materials/bio102_general_biology_notes.pdf",
    "file_size": "344 KB",
    "level": 100,
    "semester": 2,
    "academic_year": "2024/2025",
    "download_url": "/resources/materials/bio102_general_biology_notes.pdf"
  },
  {
    "id": 180,
    "title": "BIO 102: General Biology II Lecture Notes by Dr. Okolie",
    "course_code": "NAU-BIO 102",
    "course_title": "General Biology II",
    "resource_type": "lecture_note",
    "file_name": "bio102_okolie_lecture_notes.pdf",
    "file_path": "/resources/materials/bio102_okolie_lecture_notes.pdf",
    "file_size": "444 KB",
    "level": 100,
    "semester": 2,
    "academic_year": "2024/2025",
    "download_url": "/resources/materials/bio102_okolie_lecture_notes.pdf"
  },
  {
    "id": 181,
    "title": "BIO 102: Mode of Cellular Respiration in Animals and Plants",
    "course_code": "NAU-BIO 102",
    "course_title": "General Biology II",
    "resource_type": "lecture_note",
    "file_name": "bio102_respiration_animals_plants.pdf",
    "file_path": "/resources/materials/bio102_respiration_animals_plants.pdf",
    "file_size": "989 KB",
    "level": 100,
    "semester": 2,
    "academic_year": "2024/2025",
    "download_url": "/resources/materials/bio102_respiration_animals_plants.pdf"
  },
  {
    "id": 182,
    "title": "BIO 102: Virology, Viral Structure & Replication Dynamics",
    "course_code": "NAU-BIO 102",
    "course_title": "General Biology II",
    "resource_type": "lecture_note",
    "file_name": "bio102_virus_notes.pdf",
    "file_path": "/resources/materials/bio102_virus_notes.pdf",
    "file_size": "234 KB",
    "level": 100,
    "semester": 2,
    "academic_year": "2024/2025",
    "download_url": "/resources/materials/bio102_virus_notes.pdf"
  },
  {
    "id": 183,
    "title": "BIO 102: Ecological Adaptations & Modes of Nutrition",
    "course_code": "NAU-BIO 102",
    "course_title": "General Biology II",
    "resource_type": "lecture_note",
    "file_name": "bio102_ecological_adaptations.pdf",
    "file_path": "/resources/materials/bio102_ecological_adaptations.pdf",
    "file_size": "1022 KB",
    "level": 100,
    "semester": 2,
    "academic_year": "2024/2025",
    "download_url": "/resources/materials/bio102_ecological_adaptations.pdf"
  },
  {
    "id": 184,
    "title": "BIO 102: General Biology II Lecture Handout by Mr. Chisom",
    "course_code": "NAU-BIO 102",
    "course_title": "General Biology II",
    "resource_type": "lecture_note",
    "file_name": "bio102_chisom_lecture_notes.pdf",
    "file_path": "/resources/materials/bio102_chisom_lecture_notes.pdf",
    "file_size": "94 KB",
    "level": 100,
    "semester": 2,
    "academic_year": "2024/2025",
    "download_url": "/resources/materials/bio102_chisom_lecture_notes.pdf"
  },
  {
    "id": 185,
    "title": "BIO 102: Systematic Classification of Bacteria and Fungi",
    "course_code": "NAU-BIO 102",
    "course_title": "General Biology II",
    "resource_type": "lecture_note",
    "file_name": "bio102_bacteria_and_fungi_classification.pdf",
    "file_path": "/resources/materials/bio102_bacteria_and_fungi_classification.pdf",
    "file_size": "734 KB",
    "level": 100,
    "semester": 2,
    "academic_year": "2024/2025",
    "download_url": "/resources/materials/bio102_bacteria_and_fungi_classification.pdf"
  },
  {
    "id": 186,
    "title": "BIO 102: Principles and Methods of Cell and Tissue Culture",
    "course_code": "NAU-BIO 102",
    "course_title": "General Biology II",
    "resource_type": "lecture_note",
    "file_name": "bio102_cell_culture_techniques.pdf",
    "file_path": "/resources/materials/bio102_cell_culture_techniques.pdf",
    "file_size": "8.1 MB",
    "level": 100,
    "semester": 2,
    "academic_year": "2024/2025",
    "download_url": "/resources/materials/bio102_cell_culture_techniques.pdf"
  },
  {
    "id": 187,
    "title": "BIO 102: Comprehensive Biology Course Study Pack by Dr. Iweze",
    "course_code": "NAU-BIO 102",
    "course_title": "General Biology II",
    "resource_type": "lecture_note",
    "file_name": "bio102_iweze_compressed.pdf",
    "file_path": "/resources/materials/bio102_iweze_compressed.pdf",
    "file_size": "3.8 MB",
    "level": 100,
    "semester": 2,
    "academic_year": "2024/2025",
    "download_url": "/resources/materials/bio102_iweze_compressed.pdf"
  },
  {
    "id": 192,
    "title": "PHY 102: General Physics II (Electricity, Magnetism & Modern Physics) Textbook",
    "course_code": "NAU-PHY 102",
    "course_title": "Physics II",
    "resource_type": "textbook",
    "file_name": "phy102_general_physics_textbook.pdf",
    "file_path": "/resources/materials/phy102_general_physics_textbook.pdf",
    "file_size": "42.5 MB",
    "level": 100,
    "semester": 2,
    "academic_year": "2024/2025",
    "download_url": "/resources/materials/phy102_general_physics_textbook.pdf"
  },
  {
    "id": 193,
    "title": "PHY 102: Electricity, Magnetism & Atomic Physics Lecture Notes",
    "course_code": "NAU-PHY 102",
    "course_title": "Physics II",
    "resource_type": "lecture_note",
    "file_name": "phy102_electricity_magnetism_notes.pdf",
    "file_path": "/resources/materials/phy102_electricity_magnetism_notes.pdf",
    "file_size": "890 KB",
    "level": 100,
    "semester": 2,
    "academic_year": "2024/2025",
    "download_url": "/resources/materials/phy102_electricity_magnetism_notes.pdf"
  },
  {
    "id": 113,
    "title": "STA 111: Introduction to Descriptive Statistics Course Module",
    "course_code": "STA 111",
    "course_title": "Descriptive Statistics",
    "resource_type": "lecture_note",
    "file_name": "sta111_probability_note.pdf",
    "file_path": "/resources/materials/sta111_probability_note.pdf",
    "file_size": "2.8 MB",
    "level": 100,
    "semester": 1,
    "academic_year": "2026/2027",
    "download_url": "/resources/materials/sta111_probability_note.pdf"
  },
  {
    "id": 114,
    "title": "Schaum's Outline of Theory and Problems of Statistics",
    "course_code": "STA 111",
    "course_title": "Descriptive Statistics",
    "resource_type": "textbook",
    "file_name": "schaums_outline_statistics.pdf",
    "file_path": "/resources/materials/schaums_outline_statistics.pdf",
    "file_size": "4.2 MB",
    "level": 100,
    "semester": 1,
    "academic_year": "2026/2027",
    "download_url": "/resources/materials/schaums_outline_statistics.pdf"
  },
  {
    "id": 137,
    "title": "Official Statistical Tables & Distribution Values (Exam Compendium)",
    "course_code": "STA 111",
    "course_title": "Descriptive Statistics",
    "resource_type": "textbook",
    "file_name": "Statistical_Tables.pdf",
    "file_path": "/resources/documents/Statistical_Tables.pdf",
    "file_size": "43 KB",
    "level": 100,
    "semester": 1,
    "academic_year": "2026/2027",
    "download_url": "/resources/documents/Statistical_Tables.pdf"
  },
  {
    "id": 115,
    "title": "Schaum's Outline of Probability, Random Variables & Random Processes",
    "course_code": "STA 112",
    "course_title": "Probability 1",
    "resource_type": "textbook",
    "file_name": "schaums_probability.pdf",
    "file_path": "/resources/materials/schaums_probability.pdf",
    "file_size": "8.1 MB",
    "level": 100,
    "semester": 1,
    "academic_year": "2026/2027",
    "download_url": "/resources/materials/schaums_probability.pdf"
  },
  {
    "id": 116,
    "title": "STA 121: Statistical Inference I - Foundation Slide Modules",
    "course_code": "STA 121",
    "course_title": "Statistical Inference I",
    "resource_type": "lecture_note",
    "file_name": "sta121_slides.pdf",
    "file_path": "/resources/materials/sta121_slides.pdf",
    "file_size": "1.1 MB",
    "level": 100,
    "semester": 1,
    "academic_year": "2026/2027",
    "download_url": "/resources/materials/sta121_slides.pdf"
  },
  {
    "id": 93,
    "title": "COS 201: Complete Lecture Note on C++ Programming",
    "course_code": "COS 201",
    "course_title": "Computer Programming I",
    "resource_type": "lecture_note",
    "file_name": "COS_201_Lecture_Note_on_C_Plus_Plus.pdf",
    "file_path": "/resources/documents/COS_201_Lecture_Note_on_C_Plus_Plus.pdf",
    "file_size": "975 KB",
    "level": 200,
    "semester": 1,
    "academic_year": "2026/2027",
    "download_url": "/resources/documents/COS_201_Lecture_Note_on_C_Plus_Plus.pdf"
  },
  {
    "id": 118,
    "title": "COS 201: Complete Lecture Note on C++ Programming Language",
    "course_code": "COS 201",
    "course_title": "Computer Programming I",
    "resource_type": "lecture_note",
    "file_name": "cos201_cpp_lecture_notes.pdf",
    "file_path": "/resources/materials/cos201_cpp_lecture_notes.pdf",
    "file_size": "975 KB",
    "level": 200,
    "semester": 1,
    "academic_year": "2026/2027",
    "download_url": "/resources/materials/cos201_cpp_lecture_notes.pdf"
  },
  {
    "id": 94,
    "title": "COS 202: Computer Programming II Study & Practice Module",
    "course_code": "COS 202",
    "course_title": "Computer Programming II",
    "resource_type": "lecture_note",
    "file_name": "CSC_202_Course_Material_and_Practice_Module.pdf",
    "file_path": "/resources/documents/CSC_202_Course_Material_and_Practice_Module.pdf",
    "file_size": "761 KB",
    "level": 200,
    "semester": 2,
    "academic_year": "2026/2027",
    "download_url": "/resources/documents/CSC_202_Course_Material_and_Practice_Module.pdf"
  },
  {
    "id": 119,
    "title": "COS 202: Computer Programming II Past Examination Paper",
    "course_code": "COS 202",
    "course_title": "Computer Programming II",
    "resource_type": "past_question",
    "file_name": "csc202_past_question.pdf",
    "file_path": "/resources/materials/csc202_past_question.pdf",
    "file_size": "761 KB",
    "level": 200,
    "semester": 1,
    "academic_year": "2026/2027",
    "download_url": "/resources/materials/csc202_past_question.pdf"
  },
  {
    "id": 194,
    "title": "ENT 211: Entrepreneurship and Innovation Official Study Compendium",
    "course_code": "ENT 211",
    "course_title": "Entrepreneurship and Innovation 2",
    "resource_type": "lecture_note",
    "file_name": "ent211_entrepreneurship_textbook_2024.pdf",
    "file_path": "/resources/materials/ent211_entrepreneurship_textbook_2024.pdf",
    "file_size": "779 KB",
    "level": 200,
    "semester": 1,
    "academic_year": "2024/2025",
    "download_url": "/resources/materials/ent211_entrepreneurship_textbook_2024.pdf"
  },
  {
    "id": 120,
    "title": "MAT 201: Mathematical Methods I Past Examination Paper (2021/2022)",
    "course_code": "MTH 201",
    "course_title": "Linear Algebra I",
    "resource_type": "past_question",
    "file_name": "mat201_past_question.pdf",
    "file_path": "/resources/materials/mat201_past_question.pdf",
    "file_size": "1.2 MB",
    "level": 200,
    "semester": 1,
    "academic_year": "2026/2027",
    "download_url": "/resources/materials/mat201_past_question.pdf"
  },
  {
    "id": 195,
    "title": "MTH 204: Linear Algebra II - Module 1 (Vector Spaces & Subspaces)",
    "course_code": "MTH 204",
    "course_title": "Linear Algebra II",
    "resource_type": "lecture_note",
    "file_name": "mth204_lecture_note_part1.pdf",
    "file_path": "/resources/materials/mth204_lecture_note_part1.pdf",
    "file_size": "120 KB",
    "level": 200,
    "semester": 2,
    "academic_year": "2024/2025",
    "download_url": "/resources/materials/mth204_lecture_note_part1.pdf"
  },
  {
    "id": 196,
    "title": "MTH 204: Linear Algebra II - Module 2 (Linear Transformations & Matrices)",
    "course_code": "MTH 204",
    "course_title": "Linear Algebra II",
    "resource_type": "lecture_note",
    "file_name": "mth204_lecture_note_part2.pdf",
    "file_path": "/resources/materials/mth204_lecture_note_part2.pdf",
    "file_size": "89 KB",
    "level": 200,
    "semester": 2,
    "academic_year": "2024/2025",
    "download_url": "/resources/materials/mth204_lecture_note_part2.pdf"
  },
  {
    "id": 197,
    "title": "MTH 204: Linear Algebra II - Module 3 (Eigenvalues & Quadratic Forms)",
    "course_code": "MTH 204",
    "course_title": "Linear Algebra II",
    "resource_type": "lecture_note",
    "file_name": "mth204_lecture_note_part3.pdf",
    "file_path": "/resources/materials/mth204_lecture_note_part3.pdf",
    "file_size": "279 KB",
    "level": 200,
    "semester": 2,
    "academic_year": "2024/2025",
    "download_url": "/resources/materials/mth204_lecture_note_part3.pdf"
  },
  {
    "id": 122,
    "title": "MTH 231: Introduction to Real Analysis - Theory of Limits & Continuity",
    "course_code": "MTH 231",
    "course_title": "Introduction to Mathematical Methods",
    "resource_type": "lecture_note",
    "file_name": "mth231_limits_note.pdf",
    "file_path": "/resources/materials/mth231_limits_note.pdf",
    "file_size": "1.4 MB",
    "level": 200,
    "semester": 1,
    "academic_year": "2026/2027",
    "download_url": "/resources/materials/mth231_limits_note.pdf"
  },
  {
    "id": 198,
    "title": "MTH 231: Mathematical Methods Official Lecture Notes",
    "course_code": "MTH 231",
    "course_title": "Introduction to Mathematical Methods",
    "resource_type": "lecture_note",
    "file_name": "mth231_lecture_note_2024_2025.pdf",
    "file_path": "/resources/materials/mth231_lecture_note_2024_2025.pdf",
    "file_size": "600 KB",
    "level": 200,
    "semester": 1,
    "academic_year": "2024/2025",
    "download_url": "/resources/materials/mth231_lecture_note_2024_2025.pdf"
  },
  {
    "id": 121,
    "title": "MTH 202: Elementary Differential Equations Comprehensive Lecture Notes",
    "course_code": "NAU-MTH 202",
    "course_title": "Elementary Differential Equation II",
    "resource_type": "lecture_note",
    "file_name": "mat202_mathematical_methods_notes.pdf",
    "file_path": "/resources/materials/mat202_mathematical_methods_notes.pdf",
    "file_size": "8.2 MB",
    "level": 200,
    "semester": 1,
    "academic_year": "2026/2027",
    "download_url": "/resources/materials/mat202_mathematical_methods_notes.pdf"
  },
  {
    "id": 123,
    "title": "STA 214: Probability & Probability Distributions Extended Compendium",
    "course_code": "NAU-STA 214",
    "course_title": "Probability and Probability Distribution",
    "resource_type": "lecture_note",
    "file_name": "sta214_note.pdf",
    "file_path": "/resources/materials/sta214_note.pdf",
    "file_size": "15.3 MB",
    "level": 200,
    "semester": 1,
    "academic_year": "2026/2027",
    "download_url": "/resources/materials/sta214_note.pdf"
  },
  {
    "id": 199,
    "title": "STA 231: Statistical Computing II - Practical Index Numbers in R",
    "course_code": "STA 231",
    "course_title": "Statistical Computing II",
    "resource_type": "lecture_note",
    "file_name": "sta231_index_numbers_in_r.pdf",
    "file_path": "/resources/materials/sta231_index_numbers_in_r.pdf",
    "file_size": "422 KB",
    "level": 200,
    "semester": 1,
    "academic_year": "2025/2026",
    "download_url": "/resources/materials/sta231_index_numbers_in_r.pdf"
  },
  {
    "id": 112,
    "title": "ENT 312: Venture Creation – Chapters 1 to 15 Complete Lecture Notes",
    "course_code": "ENT 312",
    "course_title": "Venture Creation",
    "resource_type": "lecture_note",
    "file_name": "ENT_312_Chapters_1_to_15_Complete_Notes.pdf",
    "file_path": "/resources/documents/ENT_312_Chapters_1_to_15_Complete_Notes.pdf",
    "file_size": "915 KB",
    "level": 300,
    "semester": 2,
    "academic_year": "2026/2027",
    "download_url": "/resources/documents/ENT_312_Chapters_1_to_15_Complete_Notes.pdf"
  },
  {
    "id": 135,
    "title": "ENT 312: Venture Creation - Chapters 1 to 15 Master Study Guide",
    "course_code": "ENT 312",
    "course_title": "Venture Creation",
    "resource_type": "lecture_note",
    "file_name": "ent312_entrepreneurship.pdf",
    "file_path": "/resources/materials/ent312_entrepreneurship.pdf",
    "file_size": "915 KB",
    "level": 300,
    "semester": 1,
    "academic_year": "2026/2027",
    "download_url": "/resources/materials/ent312_entrepreneurship.pdf"
  },
  {
    "id": 110,
    "title": "GST 312: Peace and Conflict Resolution – Complete 12 Chapters Master Summary",
    "course_code": "GST 312",
    "course_title": "Peace and Conflict Resolution",
    "resource_type": "lecture_note",
    "file_name": "GST_312_Complete_12_Chapters_Master_Summary.pdf",
    "file_path": "/resources/documents/GST_312_Complete_12_Chapters_Master_Summary.pdf",
    "file_size": "268 KB",
    "level": 300,
    "semester": 2,
    "academic_year": "2026/2027",
    "download_url": "/resources/documents/GST_312_Complete_12_Chapters_Master_Summary.pdf"
  },
  {
    "id": 111,
    "title": "GST 312: Peace and Conflict Resolution – CBT Practice & Course Material",
    "course_code": "GST 312",
    "course_title": "Peace and Conflict Resolution",
    "resource_type": "lecture_note",
    "file_name": "GST_312_Peace_and_Conflict_CBT_Study_Material.pdf",
    "file_path": "/resources/documents/GST_312_Peace_and_Conflict_CBT_Study_Material.pdf",
    "file_size": "76 KB",
    "level": 300,
    "semester": 2,
    "academic_year": "2026/2027",
    "download_url": "/resources/documents/GST_312_Peace_and_Conflict_CBT_Study_Material.pdf"
  },
  {
    "id": 136,
    "title": "GST 312: Peace and Conflict Resolution - 12 Chapters Master Summary",
    "course_code": "GST 312",
    "course_title": "Peace and Conflict Resolution",
    "resource_type": "lecture_note",
    "file_name": "gst312_peace_conflict_summary.pdf",
    "file_path": "/resources/materials/gst312_peace_conflict_summary.pdf",
    "file_size": "268 KB",
    "level": 300,
    "semester": 1,
    "academic_year": "2026/2027",
    "download_url": "/resources/materials/gst312_peace_conflict_summary.pdf"
  },
  {
    "id": 178,
    "title": "GST 312: Peace and Conflict Resolution CBT Exam & Practice Questions",
    "course_code": "GST 312",
    "course_title": "Peace and Conflict Resolution",
    "resource_type": "past_question",
    "file_name": "gst312_cbt_practice_questions.pdf",
    "file_path": "/resources/materials/gst312_cbt_practice_questions.pdf",
    "file_size": "76 KB",
    "level": 300,
    "semester": 2,
    "academic_year": "2024/2025",
    "download_url": "/resources/materials/gst312_cbt_practice_questions.pdf"
  },
  {
    "id": 109,
    "title": "STA 322: Statistical Quality Control & Experimental Studies",
    "course_code": "NAU-STA 322",
    "course_title": "Statistical Quality Control I",
    "resource_type": "lecture_note",
    "file_name": "STA_322_Course_Material.pdf",
    "file_path": "/resources/documents/STA_322_Course_Material.pdf",
    "file_size": "1.4 MB",
    "level": 300,
    "semester": 2,
    "academic_year": "2026/2027",
    "download_url": "/resources/documents/STA_322_Course_Material.pdf"
  },
  {
    "id": 130,
    "title": "STA 341: Applied Regression Analysis Practical Handbook",
    "course_code": "NAU-STA 322",
    "course_title": "Statistical Quality Control I",
    "resource_type": "lecture_note",
    "file_name": "stat322_regression_analysis.pdf",
    "file_path": "/resources/materials/stat322_regression_analysis.pdf",
    "file_size": "1.4 MB",
    "level": 300,
    "semester": 1,
    "academic_year": "2026/2027",
    "download_url": "/resources/materials/stat322_regression_analysis.pdf"
  },
  {
    "id": 151,
    "title": "Regression Analysis Course Master Compendium",
    "course_code": "NAU-STA 341",
    "course_title": "Regression Analysis I",
    "resource_type": "lecture_note",
    "file_name": "STA_331_Regression_Analysis_Course_Compendium.pdf",
    "file_path": "/resources/documents/STA_331_Regression_Analysis_Course_Compendium.pdf",
    "file_size": "3.7 MB",
    "level": 300,
    "semester": 1,
    "academic_year": "2026/2027",
    "download_url": "/resources/documents/STA_331_Regression_Analysis_Course_Compendium.pdf"
  },
  {
    "id": 134,
    "title": "STA 361: Mathematical Demography, Mortality Measures & Life Tables",
    "course_code": "NAU-STA 361",
    "course_title": "Demography",
    "resource_type": "lecture_note",
    "file_name": "sta331_391_demography.pdf",
    "file_path": "/resources/materials/sta331_391_demography.pdf",
    "file_size": "321 KB",
    "level": 300,
    "semester": 1,
    "academic_year": "2026/2027",
    "download_url": "/resources/materials/sta331_391_demography.pdf"
  },
  {
    "id": 133,
    "title": "STA 371: Operations Research I Comprehensive Course Notes by Dr. Ikediuwa",
    "course_code": "NAU-STA 371",
    "course_title": "Operations Research I",
    "resource_type": "lecture_note",
    "file_name": "sta371_operations_research_dr_ikediuwa.pdf",
    "file_path": "/resources/materials/sta371_operations_research_dr_ikediuwa.pdf",
    "file_size": "3.8 MB",
    "level": 300,
    "semester": 1,
    "academic_year": "2026/2027",
    "download_url": "/resources/materials/sta371_operations_research_dr_ikediuwa.pdf"
  },
  {
    "id": 157,
    "title": "STA 381: Biometry & Biological Assay Experimental Design",
    "course_code": "NAU-STA 381",
    "course_title": "Biometry",
    "resource_type": "lecture_note",
    "file_name": "stat324_biometrics.pdf",
    "file_path": "/resources/materials/stat324_biometrics.pdf",
    "file_size": "18.0 MB",
    "level": 300,
    "semester": 1,
    "academic_year": "2026/2027",
    "download_url": "/resources/materials/stat324_biometrics.pdf"
  },
  {
    "id": 103,
    "title": "STA 312: Distribution Theory – Order Statistics (Module 1)",
    "course_code": "STA 312",
    "course_title": "Distribution theory I",
    "resource_type": "lecture_note",
    "file_name": "STA_312_Order_Statistics_Part_1.pdf",
    "file_path": "/resources/documents/STA_312_Order_Statistics_Part_1.pdf",
    "file_size": "182 KB",
    "level": 300,
    "semester": 2,
    "academic_year": "2026/2027",
    "download_url": "/resources/documents/STA_312_Order_Statistics_Part_1.pdf"
  },
  {
    "id": 104,
    "title": "STA 312: Distribution Theory – Order Statistics (Module 2)",
    "course_code": "STA 312",
    "course_title": "Distribution theory I",
    "resource_type": "lecture_note",
    "file_name": "STA_312_Order_Statistics_Part_2.pdf",
    "file_path": "/resources/documents/STA_312_Order_Statistics_Part_2.pdf",
    "file_size": "183 KB",
    "level": 300,
    "semester": 2,
    "academic_year": "2026/2027",
    "download_url": "/resources/documents/STA_312_Order_Statistics_Part_2.pdf"
  },
  {
    "id": 105,
    "title": "STA 312: Distribution Theory – Order Statistics (Module 3)",
    "course_code": "STA 312",
    "course_title": "Distribution theory I",
    "resource_type": "lecture_note",
    "file_name": "STA_312_Order_Statistics_Part_3.pdf",
    "file_path": "/resources/documents/STA_312_Order_Statistics_Part_3.pdf",
    "file_size": "183 KB",
    "level": 300,
    "semester": 2,
    "academic_year": "2026/2027",
    "download_url": "/resources/documents/STA_312_Order_Statistics_Part_3.pdf"
  },
  {
    "id": 106,
    "title": "STA 312: Distribution Theory – Bivariate Distributions & Marginals",
    "course_code": "STA 312",
    "course_title": "Distribution theory I",
    "resource_type": "lecture_note",
    "file_name": "STA_312_Bivariate_Distributions_Theory.pdf",
    "file_path": "/resources/documents/STA_312_Bivariate_Distributions_Theory.pdf",
    "file_size": "291 KB",
    "level": 300,
    "semester": 2,
    "academic_year": "2026/2027",
    "download_url": "/resources/documents/STA_312_Bivariate_Distributions_Theory.pdf"
  },
  {
    "id": 107,
    "title": "STA 312: Distribution Theory – Core Mathematical Theorems & Proofs",
    "course_code": "STA 312",
    "course_title": "Distribution theory I",
    "resource_type": "lecture_note",
    "file_name": "STA_312_New_Module_Mathematical_Proofs.pdf",
    "file_path": "/resources/documents/STA_312_New_Module_Mathematical_Proofs.pdf",
    "file_size": "210 KB",
    "level": 300,
    "semester": 2,
    "academic_year": "2026/2027",
    "download_url": "/resources/documents/STA_312_New_Module_Mathematical_Proofs.pdf"
  },
  {
    "id": 108,
    "title": "STA 312: Distribution Theory – Lecture Module 3G (Continuous Models)",
    "course_code": "STA 312",
    "course_title": "Distribution theory I",
    "resource_type": "lecture_note",
    "file_name": "STA_312_Lecture_Module_3G.pdf",
    "file_path": "/resources/documents/STA_312_Lecture_Module_3G.pdf",
    "file_size": "288 KB",
    "level": 300,
    "semester": 2,
    "academic_year": "2026/2027",
    "download_url": "/resources/documents/STA_312_Lecture_Module_3G.pdf"
  },
  {
    "id": 126,
    "title": "STA 312: Theory and Applications of Order Statistics",
    "course_code": "STA 312",
    "course_title": "Distribution theory I",
    "resource_type": "lecture_note",
    "file_name": "sta312_order_statistics.pdf",
    "file_path": "/resources/materials/sta312_order_statistics.pdf",
    "file_size": "182 KB",
    "level": 300,
    "semester": 1,
    "academic_year": "2026/2027",
    "download_url": "/resources/materials/sta312_order_statistics.pdf"
  },
  {
    "id": 127,
    "title": "STA 312: Bivariate Probability Distributions & Random Variable Transformations",
    "course_code": "STA 312",
    "course_title": "Distribution theory I",
    "resource_type": "lecture_note",
    "file_name": "sta312_bivariate_distribution.pdf",
    "file_path": "/resources/materials/sta312_bivariate_distribution.pdf",
    "file_size": "291 KB",
    "level": 300,
    "semester": 1,
    "academic_year": "2026/2027",
    "download_url": "/resources/materials/sta312_bivariate_distribution.pdf"
  },
  {
    "id": 128,
    "title": "STA 312: Probability Distribution Theory Comprehensive Module",
    "course_code": "STA 312",
    "course_title": "Distribution theory I",
    "resource_type": "lecture_note",
    "file_name": "sta312_lecture_module.pdf",
    "file_path": "/resources/materials/sta312_lecture_module.pdf",
    "file_size": "288 KB",
    "level": 300,
    "semester": 1,
    "academic_year": "2026/2027",
    "download_url": "/resources/materials/sta312_lecture_module.pdf"
  },
  {
    "id": 200,
    "title": "STA 312: Advanced Distribution Theory & Moment Generating Proofs",
    "course_code": "STA 312",
    "course_title": "Distribution theory I",
    "resource_type": "lecture_note",
    "file_name": "sta312_advanced_distribution_notes.pdf",
    "file_path": "/resources/materials/sta312_advanced_distribution_notes.pdf",
    "file_size": "6.6 MB",
    "level": 300,
    "semester": 2,
    "academic_year": "2024/2025",
    "download_url": "/resources/materials/sta312_advanced_distribution_notes.pdf"
  },
  {
    "id": 96,
    "title": "STA 331: Lecture 2 – Simple Linear Regression & Estimators",
    "course_code": "STA 331",
    "course_title": "Statistical Computing III",
    "resource_type": "lecture_note",
    "file_name": "STA_331_Lecture_02_Simple_Linear_Regression.pdf",
    "file_path": "/resources/documents/STA_331_Lecture_02_Simple_Linear_Regression.pdf",
    "file_size": "209 KB",
    "level": 300,
    "semester": 1,
    "academic_year": "2026/2027",
    "download_url": "/resources/documents/STA_331_Lecture_02_Simple_Linear_Regression.pdf"
  },
  {
    "id": 97,
    "title": "STA 331: Lecture 3 – Multiple Regression & Matrix Formulation",
    "course_code": "STA 331",
    "course_title": "Statistical Computing III",
    "resource_type": "lecture_note",
    "file_name": "STA_331_Lecture_03_Multiple_Regression_Model.pdf",
    "file_path": "/resources/documents/STA_331_Lecture_03_Multiple_Regression_Model.pdf",
    "file_size": "591 KB",
    "level": 300,
    "semester": 1,
    "academic_year": "2026/2027",
    "download_url": "/resources/documents/STA_331_Lecture_03_Multiple_Regression_Model.pdf"
  },
  {
    "id": 98,
    "title": "STA 331: Lecture 4 – Model Diagnostics & Analysis of Variance",
    "course_code": "STA 331",
    "course_title": "Statistical Computing III",
    "resource_type": "lecture_note",
    "file_name": "STA_331_Lecture_04_Model_Diagnostics_and_ANOVA.pdf",
    "file_path": "/resources/documents/STA_331_Lecture_04_Model_Diagnostics_and_ANOVA.pdf",
    "file_size": "243 KB",
    "level": 300,
    "semester": 1,
    "academic_year": "2026/2027",
    "download_url": "/resources/documents/STA_331_Lecture_04_Model_Diagnostics_and_ANOVA.pdf"
  },
  {
    "id": 99,
    "title": "STA 331: Lecture 4 Part 1 – Supplementary Residual Proofs",
    "course_code": "STA 331",
    "course_title": "Statistical Computing III",
    "resource_type": "lecture_note",
    "file_name": "STA_331_Lecture_04_Supplementary_Proofs.pdf",
    "file_path": "/resources/documents/STA_331_Lecture_04_Supplementary_Proofs.pdf",
    "file_size": "325 KB",
    "level": 300,
    "semester": 1,
    "academic_year": "2026/2027",
    "download_url": "/resources/documents/STA_331_Lecture_04_Supplementary_Proofs.pdf"
  },
  {
    "id": 100,
    "title": "STA 331: Lecture 5 – Hypothesis Testing & Confidence Intervals",
    "course_code": "STA 331",
    "course_title": "Statistical Computing III",
    "resource_type": "lecture_note",
    "file_name": "STA_331_Lecture_05_Hypothesis_Testing_in_Regression.pdf",
    "file_path": "/resources/documents/STA_331_Lecture_05_Hypothesis_Testing_in_Regression.pdf",
    "file_size": "123 KB",
    "level": 300,
    "semester": 1,
    "academic_year": "2026/2027",
    "download_url": "/resources/documents/STA_331_Lecture_05_Hypothesis_Testing_in_Regression.pdf"
  },
  {
    "id": 101,
    "title": "STA 331: Lecture 6 – Multicollinearity Diagnostics & Remedies",
    "course_code": "STA 331",
    "course_title": "Statistical Computing III",
    "resource_type": "lecture_note",
    "file_name": "STA_331_Lecture_06_Multicollinearity_and_Remedies.pdf",
    "file_path": "/resources/documents/STA_331_Lecture_06_Multicollinearity_and_Remedies.pdf",
    "file_size": "200 KB",
    "level": 300,
    "semester": 1,
    "academic_year": "2026/2027",
    "download_url": "/resources/documents/STA_331_Lecture_06_Multicollinearity_and_Remedies.pdf"
  },
  {
    "id": 102,
    "title": "STA 331: Lecture 7 – Autocorrelation & Variable Transformations",
    "course_code": "STA 331",
    "course_title": "Statistical Computing III",
    "resource_type": "lecture_note",
    "file_name": "STA_331_Lecture_07_Autocorrelation_and_Transformations.pdf",
    "file_path": "/resources/documents/STA_331_Lecture_07_Autocorrelation_and_Transformations.pdf",
    "file_size": "238 KB",
    "level": 300,
    "semester": 1,
    "academic_year": "2026/2027",
    "download_url": "/resources/documents/STA_331_Lecture_07_Autocorrelation_and_Transformations.pdf"
  },
  {
    "id": 201,
    "title": "STA 331: Regression Analysis - Module 2 (Simple Linear Regression Model)",
    "course_code": "STA 331",
    "course_title": "Statistical Computing III",
    "resource_type": "lecture_note",
    "file_name": "sta331_regression_module_2.pdf",
    "file_path": "/resources/materials/sta331_regression_module_2.pdf",
    "file_size": "209 KB",
    "level": 300,
    "semester": 1,
    "academic_year": "2025/2026",
    "download_url": "/resources/materials/sta331_regression_module_2.pdf"
  },
  {
    "id": 202,
    "title": "STA 331: Regression Analysis - Module 3 (Multiple Linear Regression)",
    "course_code": "STA 331",
    "course_title": "Statistical Computing III",
    "resource_type": "lecture_note",
    "file_name": "sta331_regression_module_3.pdf",
    "file_path": "/resources/materials/sta331_regression_module_3.pdf",
    "file_size": "591 KB",
    "level": 300,
    "semester": 1,
    "academic_year": "2025/2026",
    "download_url": "/resources/materials/sta331_regression_module_3.pdf"
  },
  {
    "id": 203,
    "title": "STA 331: Regression Analysis - Module 4 (Model Diagnostics & Residual Analysis)",
    "course_code": "STA 331",
    "course_title": "Statistical Computing III",
    "resource_type": "lecture_note",
    "file_name": "sta331_regression_module_4_main.pdf",
    "file_path": "/resources/materials/sta331_regression_module_4_main.pdf",
    "file_size": "243 KB",
    "level": 300,
    "semester": 1,
    "academic_year": "2025/2026",
    "download_url": "/resources/materials/sta331_regression_module_4_main.pdf"
  },
  {
    "id": 204,
    "title": "STA 331: Regression Analysis - Module 5 (Multicollinearity & Remedial Methods)",
    "course_code": "STA 331",
    "course_title": "Statistical Computing III",
    "resource_type": "lecture_note",
    "file_name": "sta331_regression_module_5.pdf",
    "file_path": "/resources/materials/sta331_regression_module_5.pdf",
    "file_size": "123 KB",
    "level": 300,
    "semester": 1,
    "academic_year": "2025/2026",
    "download_url": "/resources/materials/sta331_regression_module_5.pdf"
  },
  {
    "id": 205,
    "title": "STA 331: Regression Analysis - Module 6 (Heteroscedasticity & Autocorrelation Tests)",
    "course_code": "STA 331",
    "course_title": "Statistical Computing III",
    "resource_type": "lecture_note",
    "file_name": "sta331_regression_module_6.pdf",
    "file_path": "/resources/materials/sta331_regression_module_6.pdf",
    "file_size": "200 KB",
    "level": 300,
    "semester": 1,
    "academic_year": "2025/2026",
    "download_url": "/resources/materials/sta331_regression_module_6.pdf"
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
  // 100 Level (First Semester)
  { id: 1, level: 100, semester: 1, day: 'Monday', start_time: '08:00 AM', end_time: '10:00 AM', course_code: 'GST 111', course_title: 'Communication in English / General Studies', venue: 'GS Auditorium', lecturer: 'General Studies Directorate' },
  { id: 2, level: 100, semester: 1, day: 'Tuesday', start_time: '08:00 AM', end_time: '10:00 AM', course_code: 'MTH 101', course_title: 'Elementary Mathematics I', venue: 'Faculty Hall / Maths LT', lecturer: 'Department of Mathematics' },
  { id: 3, level: 100, semester: 1, day: 'Tuesday', start_time: '12:00 PM', end_time: '02:00 PM', course_code: 'PHY 101', course_title: 'General Physics I', venue: 'Physics Lecture Theatre', lecturer: 'Department of Physics' },
  { id: 4, level: 100, semester: 1, day: 'Wednesday', start_time: '08:00 AM', end_time: '10:00 AM', course_code: 'COS 101', course_title: 'Introduction to Computer Science', venue: 'Computer Science Hall', lecturer: 'Department of Computer Science' },
  { id: 5, level: 100, semester: 1, day: 'Wednesday', start_time: '10:00 AM', end_time: '12:00 PM', course_code: 'STA 121', course_title: 'Statistical Inference I', venue: 'STAT Hall', lecturer: 'Obiora-Ilouno, Ibeakuzie and Obulezi' },
  { id: 6, level: 100, semester: 1, day: 'Wednesday', start_time: '12:00 PM', end_time: '02:00 PM', course_code: 'PHY 101', course_title: 'General Physics I', venue: 'Physics Lecture Theatre', lecturer: 'Department of Physics' },
  { id: 7, level: 100, semester: 1, day: 'Thursday', start_time: '10:00 AM', end_time: '11:00 AM', course_code: 'CSC 101', course_title: 'Introduction to Computer Science', venue: 'Computer Science Lab', lecturer: 'Department of Computer Science' },
  { id: 8, level: 100, semester: 1, day: 'Friday', start_time: '09:00 AM', end_time: '10:00 AM', course_code: 'MTH 101', course_title: 'Elementary Mathematics I', venue: 'Faculty Hall', lecturer: 'Department of Mathematics' },
  { id: 9, level: 100, semester: 1, day: 'Friday', start_time: '10:00 AM', end_time: '12:00 PM', course_code: 'STA 111', course_title: 'Descriptive Statistics', venue: 'STAT Hall', lecturer: 'Uzuke, Okoye, Anabike, Eriobu, Chukwunenye' },
  { id: 10, level: 100, semester: 1, day: 'Friday', start_time: '01:00 PM', end_time: '03:00 PM', course_code: 'NAU-BIO 101', course_title: 'General Biology I', venue: 'Biological Sciences Lecture Hall', lecturer: 'Department of Biological Sciences' },

  // 200 Level (First Semester)
  { id: 11, level: 200, semester: 1, day: 'Monday', start_time: '01:00 PM', end_time: '03:00 PM', course_code: 'STA 211', course_title: 'Probability II', venue: 'STAT Hall', lecturer: 'G. A. Osuji and C. I. Nnabude' },
  { id: 12, level: 200, semester: 1, day: 'Tuesday', start_time: '08:00 AM', end_time: '10:00 AM', course_code: 'STA 231', course_title: 'Statistical Computing II', venue: 'STAT LAB', lecturer: 'H. O. Etaga and Orji G. O' },
  { id: 13, level: 200, semester: 1, day: 'Tuesday', start_time: '10:00 AM', end_time: '12:00 PM', course_code: 'COS 201', course_title: 'Computer Programming I', venue: 'Computer Science Lab', lecturer: 'Department of Computer Science' },
  { id: 14, level: 200, semester: 1, day: 'Tuesday', start_time: '01:00 PM', end_time: '02:00 PM', course_code: 'MTH 201', course_title: 'Linear Algebra I', venue: 'Mathematics Lecture Hall', lecturer: 'Department of Mathematics' },
  { id: 15, level: 200, semester: 1, day: 'Tuesday', start_time: '01:00 PM', end_time: '03:00 PM', course_code: 'STA 221', course_title: 'Statistical Inference II', venue: 'STAT Hall', lecturer: 'V. C. Chukwunenye and C. E. Onyenekwe' },
  { id: 16, level: 200, semester: 1, day: 'Tuesday', start_time: '02:00 PM', end_time: '03:00 PM', course_code: 'MTH 231', course_title: 'Introduction to Mathematical Methods', venue: 'Mathematics Lecture Hall', lecturer: 'Department of Mathematics' },
  { id: 17, level: 200, semester: 1, day: 'Wednesday', start_time: '08:00 AM', end_time: '09:00 AM', course_code: 'MTH 231', course_title: 'Introduction to Mathematical Methods', venue: 'Mathematics Lecture Hall', lecturer: 'Department of Mathematics' },
  { id: 18, level: 200, semester: 1, day: 'Wednesday', start_time: '09:00 AM', end_time: '10:00 AM', course_code: 'ENT 211', course_title: 'Entrepreneurship and Innovation 2', venue: 'UNIZIK Entrepreneurship Centre', lecturer: 'Entrepreneurship Studies Unit' },
  { id: 19, level: 200, semester: 1, day: 'Wednesday', start_time: '10:00 AM', end_time: '12:00 PM', course_code: 'IFT 211', course_title: 'Digital Logic Design', venue: 'Faculty Complex Hall', lecturer: 'Department of Information Technology' },
  { id: 20, level: 200, semester: 1, day: 'Wednesday', start_time: '10:00 AM', end_time: '12:00 PM', course_code: 'MTH 231', course_title: 'Introduction to Mathematical Methods', venue: 'Old Maths Hall', lecturer: 'Department of Mathematics' },
  { id: 21, level: 200, semester: 1, day: 'Wednesday', start_time: '02:00 PM', end_time: '03:00 PM', course_code: 'STA 211', course_title: 'Probability II', venue: 'STAT Hall', lecturer: 'G. A. Osuji and C. I. Nnabude' },
  { id: 22, level: 200, semester: 1, day: 'Wednesday', start_time: '02:00 PM', end_time: '03:00 PM', course_code: 'STA 221', course_title: 'Statistical Inference II', venue: 'STAT Hall', lecturer: 'V. C. Chukwunenye and C. E. Onyenekwe' },
  { id: 23, level: 200, semester: 1, day: 'Thursday', start_time: '08:00 AM', end_time: '10:00 AM', course_code: 'CSC 201', course_title: 'Computer Programming I', venue: 'Computer Science Lab', lecturer: 'Department of Computer Science' },
  { id: 24, level: 200, semester: 1, day: 'Thursday', start_time: '08:00 AM', end_time: '10:00 AM', course_code: 'MTH 201', course_title: 'Linear Algebra I', venue: 'Mathematics Lecture Hall', lecturer: 'Department of Mathematics' },
  { id: 25, level: 200, semester: 1, day: 'Thursday', start_time: '12:00 PM', end_time: '02:00 PM', course_code: 'STA 201', course_title: 'Statistics for Agricultural & Biological Sciences', venue: 'STAT Hall', lecturer: 'Awopeju, Ikediuwa, Odum, Omoruyi, Aforka, Eriobu, Oladimeji' },
  { id: 26, level: 200, semester: 1, day: 'Friday', start_time: '12:00 PM', end_time: '01:00 PM', course_code: 'CSC 201', course_title: 'Computer Programming I', venue: 'Departmental Computing Lab', lecturer: 'Department of Computer Science' },

  // 300 Level (First Semester)
  { id: 27, level: 300, semester: 1, day: 'Monday', start_time: '08:00 AM', end_time: '10:00 AM', course_code: 'STA 311', course_title: 'Probability III', venue: 'STAT Hall', lecturer: 'J. O. Obulezi and C. C. Nnanatu' },
  { id: 28, level: 300, semester: 1, day: 'Monday', start_time: '11:00 AM', end_time: '01:00 PM', course_code: 'STA 321', course_title: 'Statistical Inference III', venue: 'STAT Hall', lecturer: 'E. U. Umeh and C. I. Nnabude' },
  { id: 29, level: 300, semester: 1, day: 'Tuesday', start_time: '10:00 AM', end_time: '12:00 PM', course_code: 'NAU-STA 341', course_title: 'Regression Analysis I', venue: 'STAT Hall', lecturer: 'H. O. Etaga and K. F. Aforka' },
  { id: 30, level: 300, semester: 1, day: 'Tuesday', start_time: '12:00 PM', end_time: '02:00 PM', course_code: 'NAU-STA 351', course_title: 'Analysis of Variance I', venue: 'STAT Hall', lecturer: 'L. O. Ngonadi and V. C. Chukwunenye' },
  { id: 31, level: 300, semester: 1, day: 'Wednesday', start_time: '09:00 AM', end_time: '11:00 AM', course_code: 'NAU-STA 361', course_title: 'Demography', venue: 'STAT Hall', lecturer: 'C. A. Uzuke and G. C. Okoye' },
  { id: 32, level: 300, semester: 1, day: 'Wednesday', start_time: '12:00 PM', end_time: '02:00 PM', course_code: 'NAU-STA 371', course_title: 'Operations Research I', venue: 'STAT Hall', lecturer: 'H. O. Obiora-Ilouno and S. Enogwe' },
  { id: 33, level: 300, semester: 1, day: 'Thursday', start_time: '10:00 AM', end_time: '12:00 PM', course_code: 'NAU-STA 381', course_title: 'Biometry', venue: 'STAT Hall', lecturer: 'P. O. Ibeakuzie and C. E. Onyenekwe' },
  { id: 34, level: 300, semester: 1, day: 'Thursday', start_time: '12:00 PM', end_time: '02:00 PM', course_code: 'STA 331', course_title: 'Statistical Computing III', venue: 'STAT LAB', lecturer: 'L. O. Ngonadi, Enogwe and I. F. Okpala' },

  // 400 Level (First Semester)
  { id: 35, level: 400, semester: 1, day: 'Monday', start_time: '09:00 AM', end_time: '11:00 AM', course_code: 'STA 411', course_title: 'Probability IV', venue: 'STAT Hall', lecturer: 'G. A Osuji and C. I. Anabike' },
  { id: 36, level: 400, semester: 1, day: 'Monday', start_time: '12:00 PM', end_time: '02:00 PM', course_code: 'NAU-STA 421', course_title: 'Times Analysis', venue: 'STAT Hall', lecturer: 'U. C. Ikediuwa and J. O. Odum' },
  { id: 37, level: 400, semester: 1, day: 'Tuesday', start_time: '08:00 AM', end_time: '10:00 AM', course_code: 'STA 413', course_title: 'Statistical Inference IV', venue: 'STAT Hall', lecturer: 'E. U. Umeh and A. K. Abidemi' },
  { id: 38, level: 400, semester: 1, day: 'Tuesday', start_time: '11:00 AM', end_time: '01:00 PM', course_code: 'NAU-STA 441', course_title: 'Regression Analysis II', venue: 'STAT Hall', lecturer: 'C. H. Nwankwo and A. K. Abidemi' },
  { id: 39, level: 400, semester: 1, day: 'Wednesday', start_time: '08:00 AM', end_time: '10:00 AM', course_code: 'NAU-STA 451', course_title: 'Design And Analysis of Experiments', venue: 'STAT Hall', lecturer: 'F. C. Eze and L. O. Ngonadi' },
  { id: 40, level: 400, semester: 1, day: 'Wednesday', start_time: '11:00 AM', end_time: '01:00 PM', course_code: 'NAU-STA 461', course_title: 'Multivariate Analysis I', venue: 'STAT Hall', lecturer: 'S. I. Onyeagu and C. I Nnabude' },
  { id: 41, level: 400, semester: 1, day: 'Wednesday', start_time: '01:00 PM', end_time: '02:00 PM', course_code: 'STA 411', course_title: 'Probability IV', venue: 'STAT Hall', lecturer: 'G. A Osuji and C. I. Anabike' },
  { id: 42, level: 400, semester: 1, day: 'Thursday', start_time: '08:00 AM', end_time: '10:00 AM', course_code: 'STA 491', course_title: 'Seminar', venue: 'STAT Hall', lecturer: 'C. E. Onyenekwe' },
  { id: 43, level: 400, semester: 1, day: 'Thursday', start_time: '11:00 AM', end_time: '01:00 PM', course_code: 'STA 471', course_title: 'Operations Research II', venue: 'STAT Hall', lecturer: 'H. O. Obiora-Ilouno and S. Enogwe' },
  { id: 44, level: 400, semester: 1, day: 'Thursday', start_time: '11:00 AM', end_time: '01:00 PM', course_code: 'STA 481', course_title: 'Statistical Quality Control I', venue: 'STAT Hall', lecturer: 'H. O. Etaga and K. F. Aforka' },
  { id: 45, level: 400, semester: 1, day: 'Thursday', start_time: '01:00 PM', end_time: '02:00 PM', course_code: 'STA 413', course_title: 'Statistical Inference IV', venue: 'STAT Hall', lecturer: 'E. U. Umeh and A. K. Abidemi' }
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
