import sqlite3
import json

courses_data = [
    # ---------------- 100 LEVEL FIRST SEMESTER (21 CU) ----------------
    {
        "code": "GST 111",
        "title": "Communication in English",
        "level": 100,
        "semester": 1,
        "credit_units": 2,
        "status": "Compulsory",
        "description": "Effective communication in English, grammatical structure, reading comprehension, study skills, phonetics, sentence construction, note-taking, and academic essay composition.",
        "outline": "Unit 1: Study skills, active listening and note-taking techniques.\nUnit 2: Grammatical structures, sentence types, clauses, and concord.\nUnit 3: Phonetics, phonology, and accurate pronunciation.\nUnit 4: Reading comprehension and vocabulary expansion.\nUnit 5: Academic paragraph and formal essay development."
    },
    {
        "code": "NAU GST 113",
        "title": "Humanities",
        "level": 100,
        "semester": 1,
        "credit_units": 2,
        "status": "Compulsory",
        "description": "Introduction to humanities, cultural heritage, social institutions, philosophy, arts, literature, ethics, and human values in contemporary African society.",
        "outline": "Unit 1: The concept, nature, and branches of humanities.\nUnit 2: African traditional civilization and colonial impact.\nUnit 3: Philosophy, moral ethics, and social justice.\nUnit 4: Arts, music, and literary expressions in Nigeria.\nUnit 5: Contemporary globalization, cultural preservation, and national identity."
    },
    {
        "code": "COS 101",
        "title": "Introduction to Computer Science",
        "level": 100,
        "semester": 1,
        "credit_units": 3,
        "status": "Compulsory",
        "description": "Foundations of computer systems, computer hardware architecture, system software, binary and hexadecimal arithmetic, problem-solving algorithms, flowcharts, and operating system concepts.",
        "outline": "Unit 1: History and generational evolution of computers.\nUnit 2: Hardware architecture: CPU, memory, I/O devices, and storage.\nUnit 3: Number systems: binary, octal, decimal, and hexadecimal conversions.\nUnit 4: Logic gates and Boolean representation.\nUnit 5: Algorithm design, pseudocode, flowchart conventions, and intro to programming."
    },
    {
        "code": "MTH 101",
        "title": "Elementary Mathematics I",
        "level": 100,
        "semester": 1,
        "credit_units": 2,
        "status": "Compulsory",
        "description": "Elementary set theory, subsets, operations on sets, Venn diagrams, real number system, indices, surds, logarithms, quadratic equations, progressions (AP & GP), and mathematical induction.",
        "outline": "Unit 1: Set theory: union, intersection, complement, Cartesian products, and Venn diagrams.\nUnit 2: Real number axioms, inequalities, and absolute values.\nUnit 3: Indices, logarithms, surds, and radical equations.\nUnit 4: Theory of quadratic equations, roots, and polynomial factorization.\nUnit 5: Arithmetic and Geometric Progressions, binomial theorem, and induction."
    },
    {
        "code": "STA 111",
        "title": "Descriptive Statistics",
        "level": 100,
        "semester": 1,
        "credit_units": 3,
        "status": "Compulsory",
        "description": "Definition, nature, and scope of statistics. Methods of data collection, classification, tabulation, frequency distributions, graphical representation, measures of central tendency, dispersion, skewness, and kurtosis.",
        "outline": "Unit 1: Nature of statistical inquiry, primary and secondary data collection.\nUnit 2: Frequency distribution tables, histograms, ogives, frequency polygons, and pie charts.\nUnit 3: Measures of central tendency: Mean (arithmetic, geometric, harmonic), Median, Mode, Quantiles.\nUnit 4: Measures of dispersion: Range, Mean Deviation, Variance, Standard Deviation, and Quartile Deviation.\nUnit 5: Moments, Pearsonian and Bowley measures of Skewness and Kurtosis."
    },
    {
        "code": "STA 121",
        "title": "Statistical Inference I",
        "level": 100,
        "semester": 1,
        "credit_units": 3,
        "status": "Compulsory",
        "description": "Basic concepts of statistical inference, populations, random sampling, introduction to probability concepts, point and interval estimation for large samples, and elementary formulation of hypothesis testing.",
        "outline": "Unit 1: Population and sample definitions, parameter vs statistic.\nUnit 2: Random sampling techniques and sampling distributions.\nUnit 3: Point estimation concepts: unbiasedness, consistency, and standard errors.\nUnit 4: Confidence interval construction for population mean and proportion.\nUnit 5: Introduction to statistical hypotheses: Null, Alternative, Type I & II errors, and Z-tests."
    },
    {
        "code": "NAU-PHY101",
        "title": "General Physics I",
        "level": 100,
        "semester": 1,
        "credit_units": 2,
        "status": "Compulsory",
        "description": "Mechanics, thermal physics, properties of matter, dimensional analysis, rectilinear motion, Newton's laws of motion, work, energy, power, rotational dynamics, elasticity, and fluids.",
        "outline": "Unit 1: Units, physical dimensions, and dimensional analysis.\nUnit 2: Kinematics: vectors, projectiles, velocity, and acceleration.\nUnit 3: Newton's laws, friction, momentum conservation, and collisions.\nUnit 4: Circular motion, gravitation, work, power, and kinetic/potential energy.\nUnit 5: Hydrostatics, Archimedes' principle, surface tension, viscosity, and thermal expansion."
    },
    {
        "code": "NAU-BIO 101",
        "title": "General Biology",
        "level": 100,
        "semester": 1,
        "credit_units": 2,
        "status": "Compulsory",
        "description": "Fundamental biological principles, ultrastructure of living cells, cellular reproduction, mitosis, meiosis, Mendelian genetics, diversity of living organisms, ecology, and energy flow in ecosystems.",
        "outline": "Unit 1: Chemical basis of life, macromolecule structure and biological enzymes.\nUnit 2: Cellular anatomy: prokaryotic vs eukaryotic organelles and membrane transport.\nUnit 3: Cell division: mitosis, meiosis, and gametogenesis.\nUnit 4: Classical Mendelian genetics, monohybrid/dihybrid crosses, and sex linkage.\nUnit 5: Principles of ecology, ecosystems, trophic pyramids, and environmental conservation."
    },
    {
        "code": "ECO 111",
        "title": "Principles of Economics",
        "level": 100,
        "semester": 1,
        "credit_units": 2,
        "status": "Elective",
        "description": "Fundamental concepts of microeconomics, scarcity, choice, scale of preference, opportunity cost, laws of demand and supply, elasticity, consumer behavior, and price mechanisms.",
        "outline": "Unit 1: Basic economic problems: scarcity, choice, opportunity cost, and production possibility curves.\nUnit 2: Demand theory: determinants, demand function, and law of demand.\nUnit 3: Supply theory: determinants, supply elasticity, and market equilibrium.\nUnit 4: Price elasticity, income elasticity, and cross-price elasticity of demand.\nUnit 5: Consumer behavior: cardinal utility theory vs ordinal indifference curve approaches."
    },
    {
        "code": "BUA 101",
        "title": "Introduction of Business",
        "level": 100,
        "semester": 1,
        "credit_units": 2,
        "status": "Elective",
        "description": "Nature and scope of business enterprises, environmental factors affecting business, forms of business ownership (sole proprietorship, partnership, companies), management functions, and ethical practices in Nigeria.",
        "outline": "Unit 1: Conceptual scope of business, profit motive, and social responsibilities.\nUnit 2: Business environments: economic, legal, socio-cultural, and technological factors.\nUnit 3: Forms of ownership: sole proprietorship, partnership, limited liability company, cooperatives.\nUnit 4: Core functional areas: human resources, operations, accounting, and marketing.\nUnit 5: Business planning, risk management, and government regulatory frameworks in Nigeria."
    },

    # ---------------- 100 LEVEL SECOND SEMESTER (23 CU) ----------------
    {
        "code": "GST 112",
        "title": "Nigerian Peoples and Culture",
        "level": 100,
        "semester": 2,
        "credit_units": 2,
        "status": "Compulsory",
        "description": "Evolution of traditional Nigerian communities, pre-colonial political systems, ethnic nationalities, inter-group interactions, colonial administrative impact, military rule, and modern socio-cultural development.",
        "outline": "Unit 1: Pre-colonial political institutions in Northern, Western, and Eastern Nigeria.\nUnit 2: Cultural norms, indigenous craftsmanship, religion, and social organization.\nUnit 3: Colonial conquest, amalgamation of 1914, and indirect rule systems.\nUnit 4: Post-independence political dynamics, nationalism, and federalism.\nUnit 5: Ethnic harmony, national integration, and civic responsibility in modern Nigeria."
    },
    {
        "code": "NAU GST 114",
        "title": "Basic Igbo Studies",
        "level": 100,
        "semester": 2,
        "credit_units": 2,
        "status": "Compulsory",
        "description": "Study of Igbo orthography, grammar, vocabulary, proverbs, idioms, oral narratives, cultural worldview, traditional institutions, and socio-economic systems of the Igbo people.",
        "outline": "Unit 1: Igbo alphabet, vowels, consonants, tone marking, and orthographic rules.\nUnit 2: Parts of speech, sentence building, and translation exercises.\nUnit 3: Traditional Igbo social hierarchy, title-taking (Ozo), age grades, and kingship.\nUnit 4: Igbo folklore, riddles, moral values, and idiomatic expressions (Ilu).\nUnit 5: Contemporary Igbo language preservation, digital literacy, and cultural heritage."
    },
    {
        "code": "STA 112",
        "title": "Probability 1",
        "level": 100,
        "semester": 2,
        "credit_units": 3,
        "status": "Compulsory",
        "description": "Sample spaces, events, axiomatic definition of probability, addition and multiplication rules, conditional probability, independent events, Bayes' theorem, discrete random variables, and probability mass functions.",
        "outline": "Unit 1: Random experiments, elementary outcomes, events, and sample spaces.\nUnit 2: Axiomatic probability foundations and basic set-theoretic theorems.\nUnit 3: Conditional probability, multiplication rule, and partition of sample spaces.\nUnit 4: Law of total probability and Bayes' Theorem with diagnostic applications.\nUnit 5: Random variables, probability mass functions, and cumulative distribution functions."
    },
    {
        "code": "STA 122",
        "title": "Statistical computing 1",
        "level": 100,
        "semester": 2,
        "credit_units": 3,
        "status": "Compulsory",
        "description": "Practical statistical computing using modern tools (Excel spreadsheets, R, and SPSS). Data entry, data cleansing, tabular presentations, descriptive computations, graphical exploratory analysis, and simulation basics.",
        "outline": "Unit 1: Spreadsheet fundamentals: worksheet layout, formulas, and data formatting in Excel.\nUnit 2: Summary functions, pivot tables, and statistical charting.\nUnit 3: Introduction to R environment: data structures (vectors, data frames, factors).\nUnit 4: Descriptive metrics calculation, frequency generation, and boxplots in R & SPSS.\nUnit 5: Introduction to reproducible reporting and pseudo-random number generation."
    },
    {
        "code": "MTH 102",
        "title": "Elementary Mathematics II",
        "level": 100,
        "semester": 2,
        "credit_units": 2,
        "status": "Compulsory",
        "description": "Trigonometric functions, radian measures, addition and factor formulas, limit of a function, differentiation from first principles, product/quotient/chain rules, integration techniques, and area under curves.",
        "outline": "Unit 1: Circular trigonometric functions, trigonometric identities, and compound angles.\nUnit 2: Function limits, continuity, and concept of derivative from first principles.\nUnit 3: Differentiation techniques: product rule, quotient rule, and function of a function.\nUnit 4: Applications of derivatives: tangents, normals, rates of change, maxima and minima.\nUnit 5: Indefinite and definite integrals, integration by substitution, and basic areas."
    },
    {
        "code": "NAU-PHY 102",
        "title": "Physics II",
        "level": 100,
        "semester": 2,
        "credit_units": 2,
        "status": "Compulsory",
        "description": "Electrostatics, Coulomb's law, electric field and potential, capacitors and dielectrics, electric currents, Ohm's law, DC circuits, magnetic fields, electromagnetic induction, geometrical optics, and wave motion.",
        "outline": "Unit 1: Electric charge, Coulomb's law, electric flux, Gauss's law, and potential.\nUnit 2: Capacitance, combination of capacitors, and dielectric properties.\nUnit 3: Electric current, resistance, electromotive force, and Kirchhoff's circuit rules.\nUnit 4: Magnetic force on moving charges, Biot-Savart law, and Faraday's induction.\nUnit 5: Reflection, refraction, lenses, mirrors, and wave interference."
    },
    {
        "code": "NAU-MAT 112",
        "title": "Intro to actuarial Mathematics I",
        "level": 100,
        "semester": 2,
        "credit_units": 2,
        "status": "Compulsory",
        "description": "Fundamental concepts of financial mathematics, theory of interest, simple and compound interest rates, nominal and effective rates, discount factors, present values, annuities-certain, and amortization schedules.",
        "outline": "Unit 1: Time value of money, accumulation functions, and interest rate definitions.\nUnit 2: Simple vs compound interest, effective vs nominal interest rates.\nUnit 3: Discount rates, force of interest, and present value calculations.\nUnit 4: Annuities-certain: immediate annuities, annuities-due, and perpetuities.\nUnit 5: Loan amortization schedules, sinking funds, and capital redemption."
    },
    {
        "code": "COS 102",
        "title": "Computer Programming II",
        "level": 100,
        "semester": 2,
        "credit_units": 3,
        "status": "Compulsory",
        "description": "Principles of structured and procedural computer programming using modern high-level languages (C / Python). Data types, expressions, control structures, functions, parameter passing, arrays, and file I/O.",
        "outline": "Unit 1: Language syntax, basic data types, variables, and operator precedence.\nUnit 2: Selection structures: if-else branches, switch-case statements.\nUnit 3: Repetition structures: while, do-while, and for loops.\nUnit 4: Functions, variable scope, recursion, and parameter passing mechanisms.\nUnit 5: One-dimensional and multi-dimensional arrays, string processing, and file input/output."
    },
    {
        "code": "NAU-BIO 102",
        "title": "General Biology II",
        "level": 100,
        "semester": 2,
        "credit_units": 2,
        "status": "Compulsory",
        "description": "Comparative study of plant and animal physiology, nutrition, gas exchange, circulatory systems, excretion, nervous coordination, hormones, reproduction, development, and environmental adaptation.",
        "outline": "Unit 1: Plant nutrition: photosynthesis, mineral absorption, and transport systems.\nUnit 2: Animal nutrition: digestive mechanisms and mammalian enzyme actions.\nUnit 3: Respiration, gaseous exchange mechanisms, and mammalian blood circulation.\nUnit 4: Osmoregulation, excretory systems, and homeostasis.\nUnit 5: Nervous and endocrine coordination, sensory organs, and environmental response."
    },
    {
        "code": "ECO 112",
        "title": "Principles of Economics II",
        "level": 100,
        "semester": 2,
        "credit_units": 2,
        "status": "Elective",
        "description": "Fundamental macroeconomic theory, national income accounting (GDP, GNP, NNP), circular flow of income, aggregate demand and supply, inflation, unemployment, fiscal policy, monetary policy, and external trade.",
        "outline": "Unit 1: Scope of macroeconomics and the circular flow of economic activity.\nUnit 2: National income accounting: output, income, and expenditure measurement.\nUnit 3: Aggregate consumption, savings function, investment multiplier, and equilibrium.\nUnit 4: Money, banking institutions, and the role of the Central Bank of Nigeria.\nUnit 5: Inflation types, unemployment causes, fiscal policy, and international balance of payments."
    },
    {
        "code": "BUA 102",
        "title": "Introduction To Business II",
        "level": 100,
        "semester": 2,
        "credit_units": 2,
        "status": "Elective",
        "description": "Organizational structures, operational management, production planning, total quality management, human resource management, labor unions, marketing strategies, and international business perspectives.",
        "outline": "Unit 1: Organizational theory: classical, bureaucratic, and human relations models.\nUnit 2: Production management: plant location, layout, inventory, and supply chain control.\nUnit 3: Marketing mix: product design, pricing strategies, distribution, and promotional channels.\nUnit 4: Personnel administration: recruitment, selection, training, and performance evaluation.\nUnit 5: Labor relations, collective bargaining, and corporate social responsibility in Nigeria."
    },

    # ---------------- 200 LEVEL FIRST SEMESTER (21 CU) ----------------
    {
        "code": "ENT 211",
        "title": "Entrepreneurship and Innovation 2",
        "level": 200,
        "semester": 1,
        "credit_units": 2,
        "status": "Compulsory",
        "description": "Developing innovative entrepreneurial ventures, opportunity identification, feasibility analysis, business model canvas, financing startups, patenting, intellectual property, and venture lifecycle.",
        "outline": "Unit 1: Entrepreneurial mindsets and innovation-driven opportunity evaluation.\nUnit 2: Feasibility studies and the Business Model Canvas (BMC) framework.\nUnit 3: Startup capitalization: angel investors, venture capital, and commercial bank loans.\nUnit 4: Legal registrations, CAC processes, trademarks, and intellectual property protection.\nUnit 5: Enterprise scaling, digital transformation, and risk management strategies."
    },
    {
        "code": "STA 211",
        "title": "Probability II",
        "level": 200,
        "semester": 1,
        "credit_units": 3,
        "status": "Compulsory",
        "description": "Discrete and continuous random variables, probability mass and density functions, cumulative distribution functions, mathematical expectation, variance, moments, moment generating functions, and standard probability models.",
        "outline": "Unit 1: Univariate discrete distributions: Bernoulli, Binomial, Poisson, Geometric, Negative Binomial, Hypergeometric.\nUnit 2: Univariate continuous distributions: Uniform, Normal, Exponential, Gamma, Beta, and Weibull.\nUnit 3: Mathematical expectations, higher-order moments, and skewness/kurtosis measures.\nUnit 4: Moment Generating Functions (MGF) and characteristic functions properties.\nUnit 5: Chebyshev's Inequality, Markov's Inequality, and Law of Large Numbers intro."
    },
    {
        "code": "STA 221",
        "title": "Statistical Inference II",
        "level": 200,
        "semester": 1,
        "credit_units": 3,
        "status": "Compulsory",
        "description": "Sampling distributions (Student's t, Chi-Square, Snedecor's F), point estimation principles, properties of estimators (unbiasedness, consistency, efficiency, sufficiency), Method of Moments, Maximum Likelihood Estimation, and interval estimation.",
        "outline": "Unit 1: Derivations and properties of Chi-Square, t, and F sampling distributions.\nUnit 2: Point estimation: concept of estimator properties (unbiasedness, minimum variance, consistency).\nUnit 3: Sufficiency and the Fisher-Neyman Factorization Theorem.\nUnit 4: Estimation methods: Method of Moments and Maximum Likelihood Estimation (MLE).\nUnit 5: Exact confidence intervals for one and two population means, variances, and proportions."
    },
    {
        "code": "STA 231",
        "title": "Statistical Computing II",
        "level": 200,
        "semester": 1,
        "credit_units": 2,
        "status": "Compulsory",
        "description": "Computational statistical algorithms using R and Python. Implementation of probability distribution calculations, pseudo-random variate generation, Monte Carlo simulations, numerical matrix operations, and regression computation.",
        "outline": "Unit 1: Intermediate programming in R: control structures, loops, vectorization, and apply family.\nUnit 2: Random variate generation methods: inverse transform, acceptance-rejection, Box-Muller.\nUnit 3: Monte Carlo simulation of probabilistic processes and approximation of integrals.\nUnit 4: Matrix algebra computations: inversion, decomposition (LU, Cholesky), and eigensystems in R.\nUnit 5: Implementing custom estimation algorithms (e.g. Newton-Raphson MLE) programmatically."
    },
    {
        "code": "COS 201",
        "title": "Computer Programming I",
        "level": 200,
        "semester": 1,
        "credit_units": 3,
        "status": "Compulsory",
        "description": "Object-oriented programming (OOP) paradigms using modern programming languages. Classes, objects, encapsulation, data abstraction, inheritance, polymorphism, abstract classes, interfaces, and exception handling.",
        "outline": "Unit 1: OOP concepts: comparison between procedural and object-oriented paradigms.\nUnit 2: Classes, object instantiation, constructors, destructors, and member access specifiers.\nUnit 3: Encapsulation, information hiding, getters, and setters.\nUnit 4: Single and multiple inheritance, method overriding, and polymorphism.\nUnit 5: Abstract base classes, interfaces, and structured exception handling mechanisms."
    },
    {
        "code": "MTH 231",
        "title": "Introduction to Mathematical Methods",
        "level": 200,
        "semester": 1,
        "credit_units": 3,
        "status": "Compulsory",
        "description": "Real-valued functions of several variables, partial derivatives, directional derivatives, gradient vectors, total differentials, Taylor's series for multiple variables, extreme values, Lagrange multipliers, and multiple integrals.",
        "outline": "Unit 1: Functions of two or more variables: domains, level curves, and surfaces.\nUnit 2: Partial differentiation, higher order partials, and Clairaut's theorem on mixed partials.\nUnit 3: Directional derivatives, gradient vector, tangent planes, and total differentials.\nUnit 4: Extrema of multi-variable functions, Hessian matrix, and constrained optimization via Lagrange multipliers.\nUnit 5: Double and triple integrals, Fubini's theorem, change of variables, and Jacobians."
    },
    {
        "code": "MTH 201",
        "title": "Linear Algebra I",
        "level": 200,
        "semester": 1,
        "credit_units": 3,
        "status": "Compulsory",
        "description": "Vector spaces over fields, subspaces, linear span, linear independence, basis, dimension, linear mappings, matrix representations of linear mappings, rank-nullity theorem, systems of linear equations, and determinants.",
        "outline": "Unit 1: Vector space axioms over fields, linear combinations, and subspaces.\nUnit 2: Linear dependence, linear independence, spanning sets, bases, and finite dimensionality.\nUnit 3: Linear transformations: kernel, image, Rank-Nullity Theorem, and isomorphisms.\nUnit 4: Matrix representation of linear transformations and change of basis matrices.\nUnit 5: Systems of linear equations: Gaussian elimination, echelon forms, rank, and determinants."
    },
    {
        "code": "ECO 211",
        "title": "Micro Economics I",
        "level": 200,
        "semester": 1,
        "credit_units": 2,
        "status": "Elective",
        "description": "Intermediate microeconomic analysis: axiomatic consumer theory, utility maximization, Marshallian and Hicksian demand functions, Slutsky equation, production functions, cost minimization, and perfect competition.",
        "outline": "Unit 1: Axioms of consumer preference, budget constraints, and utility functions.\nUnit 2: Constrained utility maximization, Marshallian vs Compensated (Hicksian) demand.\nUnit 3: Slutsky decomposition into income and substitution effects.\nUnit 4: Production functions: Isoquants, Marginal Rate of Technical Substitution (MRTS), and Returns to Scale.\nUnit 5: Cost function derivations (short-run vs long-run) and profit maximization in competitive markets."
    },
    {
        "code": "IFT 211",
        "title": "Digital Logic Design",
        "level": 200,
        "semester": 1,
        "credit_units": 2,
        "status": "Elective",
        "description": "Boolean algebra, truth tables, logic gates, minimization of Boolean expressions using Karnaugh maps and Quine-McCluskey, combinational logic circuits (adders, multiplexers, decoders), and sequential circuits.",
        "outline": "Unit 1: Binary logic, Boolean postulates, De Morgan's laws, and standard forms (SOP, POS).\nUnit 2: Logic gate implementations: AND, OR, NOT, NAND, NOR, XOR, XNOR.\nUnit 3: Simplification techniques: Karnaugh maps up to 5 variables and prime implicants.\nUnit 4: Combinational circuits: half/full adders, subtractors, magnitude comparators, multiplexers, decoders.\nUnit 5: Latches, flip-flops (SR, JK, D, T), clocking, counters, and basic register design."
    },
    {
        "code": "AMS 101",
        "title": "Principles of Management",
        "level": 200,
        "semester": 1,
        "credit_units": 2,
        "status": "Elective",
        "description": "Theoretical evolution of administrative thought, classical management, behavioral human relations, systems theory, contingency approach, and managerial functions: planning, organizing, staffing, leading, and controlling.",
        "outline": "Unit 1: Nature, purpose, and universal principles of administrative management.\nUnit 2: Historical schools: Scientific Management (Taylor), Administrative (Fayol), and Bureaucratic (Weber).\nUnit 3: Strategic and operational planning: MBO, SWOT analysis, and decision-making techniques.\nUnit 4: Organizational structure: centralization vs decentralization, span of control, and departmentalization.\nUnit 5: Leadership styles, motivational frameworks (Maslow, Herzberg), and controlling systems."
    },

    # ---------------- 200 LEVEL SECOND SEMESTER (22 CU) ----------------
    {
        "code": "GST 212",
        "title": "Philosophy, Logic, and Human Existence",
        "level": 200,
        "semester": 2,
        "credit_units": 2,
        "status": "Compulsory",
        "description": "Scope and major branches of philosophy (epistemology, metaphysics, ethics, aesthetics), logical reasoning, valid argument deduction, propositional logic, categorical syllogisms, informal fallacies, and existential questions.",
        "outline": "Unit 1: The nature, method, and branches of philosophical inquiry.\nUnit 2: Epistemology: sources and justification of human knowledge (empiricism vs rationalism).\nUnit 3: Propositional logic, connectives, truth tables, and validity testing.\nUnit 4: Categorical syllogisms, Euler diagrams, and formal/informal logical fallacies.\nUnit 5: Philosophical foundations of science, human rights, justice, and existential meaning."
    },
    {
        "code": "STA 202",
        "title": "Statistics for Physical Sciences & Engineering",
        "level": 200,
        "semester": 2,
        "credit_units": 3,
        "status": "Compulsory",
        "description": "Application of statistical methods to engineering and physical science domains: experimental measurement errors, propagation of errors, curve fitting, regression, hypothesis testing, reliability, and quality control.",
        "outline": "Unit 1: Physical measurements, random and systematic errors, and error propagation formulas.\nUnit 2: Probability models for engineering phenomena (Weibull, Lognormal, Extreme Value distributions).\nUnit 3: Method of least squares, linear and polynomial curve fitting for calibration.\nUnit 4: Hypothesis tests for material strength, variance comparisons, and ANOVA in lab trials.\nUnit 5: Statistical process control, Shewhart charts, and system reliability analysis."
    },
    {
        "code": "STA 212",
        "title": "Introduction to Social & Economic Statistics",
        "level": 200,
        "semester": 2,
        "credit_units": 3,
        "status": "Compulsory",
        "description": "Official statistical systems, National Bureau of Statistics (NBS) structure, national accounts, index numbers (Laspeyres, Paasche, Fisher), Consumer Price Index (CPI), inflation metrics, vital statistics, and demographic indicators.",
        "outline": "Unit 1: National official statistical architecture: NBS, statistical coordination, and data governance.\nUnit 2: Index numbers: simple, weighted aggregate, price and quantity relatives, tests of consistency.\nUnit 3: Consumer Price Index (CPI) methodology, inflation computation, and purchasing power parity.\nUnit 4: Vital statistics: crude and age-specific birth/death rates, infant mortality, and fertility indices.\nUnit 5: Population census procedures, socio-economic surveys, and poverty headcount metrics."
    },
    {
        "code": "NAU-STA 214",
        "title": "Probability and Probability Distribution",
        "level": 200,
        "semester": 2,
        "credit_units": 2,
        "status": "Compulsory",
        "description": "Bivariate probability distributions, joint probability mass and density functions, marginal and conditional distributions, stochastic independence, covariance, correlation coefficient, conditional expectation, and bivariate normal distribution.",
        "outline": "Unit 1: Joint probability distributions of discrete and continuous random variables.\nUnit 2: Marginal distributions and conditional probability distributions.\nUnit 3: Stochastic independence of random variables and conditional expectation.\nUnit 4: Covariance, Pearson correlation coefficient, and properties of variance of sums.\nUnit 5: Bivariate transformation techniques and the Bivariate Normal Distribution derivation."
    },
    {
        "code": "COS 202",
        "title": "Computer Programming II",
        "level": 200,
        "semester": 2,
        "credit_units": 3,
        "status": "Compulsory",
        "description": "Fundamental data structures and algorithmic complexity. Memory representation, linked lists (singly, doubly), stacks, queues, binary search trees, sorting algorithms (quicksort, mergesort), and graph traversal.",
        "outline": "Unit 1: Abstract Data Types (ADT) and algorithmic Big-O asymptotic notation.\nUnit 2: Dynamic memory allocation, pointer manipulation, and singly/doubly linked lists.\nUnit 3: Stacks and queues: array/pointer implementations, postfix evaluations, and recursion.\nUnit 4: Non-linear structures: binary trees, binary search trees, and tree traversals (in/pre/post).\nUnit 5: Searching and sorting algorithms: insertion, selection, quicksort, mergesort, and hash tables."
    },
    {
        "code": "NAU-MTH 202",
        "title": "Elementary Differential Equation II",
        "level": 200,
        "semester": 2,
        "credit_units": 3,
        "status": "Compulsory",
        "description": "Second-order linear ordinary differential equations with constant coefficients, undetermined coefficients, variation of parameters, Cauchy-Euler equations, series solutions, Frobenius method, and Laplace transforms.",
        "outline": "Unit 1: Second order homogeneous linear ODEs: auxiliary equation and complementary functions.\nUnit 2: Non-homogeneous linear ODEs: Method of Undetermined Coefficients and Variation of Parameters.\nUnit 3: Cauchy-Euler differential equations and systems of first-order linear ODEs.\nUnit 4: Power series solutions around ordinary and regular singular points (Frobenius method).\nUnit 5: Laplace transformation, inverse transforms, convolution theorem, and initial value problems."
    },
    {
        "code": "STA 299",
        "title": "Industrial Training",
        "level": 200,
        "semester": 2,
        "credit_units": 3,
        "status": "Compulsory",
        "description": "Supervised vacation practical industrial attachment. Exposure to industrial work settings, practical data entry, database logging, statistical summary reporting, and documentation in government, corporate, or research institutions.",
        "outline": "Unit 1: Industrial placement orientation, workplace ethics, and safety protocols.\nUnit 2: Practical data acquisition, logging, and database auditing workflows.\nUnit 3: Applied spreadsheet analysis and weekly statistical logbook maintenance.\nUnit 4: Collaborative departmental data presentation and preliminary statistical reporting.\nUnit 5: Comprehensive industrial training logbook review and oral departmental evaluation."
    },
    {
        "code": "MTH 204",
        "title": "Linear Algebra II",
        "level": 200,
        "semester": 2,
        "credit_units": 3,
        "status": "Elective",
        "description": "Eigenvalues, eigenvectors, characteristic polynomials, minimal polynomials, Cayley-Hamilton theorem, matrix diagonalization, inner product spaces, Gram-Schmidt orthogonalization process, and quadratic forms.",
        "outline": "Unit 1: Characteristic values and characteristic vectors of linear operators.\nUnit 2: Characteristic polynomial, algebraic/geometric multiplicity, and Cayley-Hamilton theorem.\nUnit 3: Diagonalizability criteria and Jordan Canonical Forms introduction.\nUnit 4: Real and complex inner product spaces, Cauchy-Schwarz inequality, and orthogonality.\nUnit 5: Gram-Schmidt orthogonalization procedure, orthogonal projections, and symmetric matrices."
    },
    {
        "code": "MTH 212",
        "title": "Introduction to Actuarial Mathematics",
        "level": 200,
        "semester": 2,
        "credit_units": 3,
        "status": "Elective",
        "description": "Survival models, force of mortality, life tables, life assurance contracts (whole life, term, endowment), life annuities, net premium determination, and introduction to policy benefit reserves.",
        "outline": "Unit 1: Survival distributions, future lifetime random variables, and force of mortality.\nUnit 2: Life table construction: lx, dx, qx, px, and fractional age assumptions.\nUnit 3: Life assurances: whole life, term assurance, endowment, and pure endowment present values.\nUnit 4: Life annuities: continuous, immediate, and due annuity expectations.\nUnit 5: Equivalence principle, net single and level annual premium calculations, and reserves."
    },
    {
        "code": "ECO 212",
        "title": "Micro Economics II",
        "level": 200,
        "semester": 2,
        "credit_units": 3,
        "status": "Elective",
        "description": "Market structures: monopoly pricing, price discrimination, monopolistic competition, oligopoly models (Cournot, Bertrand, Stackelberg), game theory introduction, general equilibrium, and welfare economics.",
        "outline": "Unit 1: Pure monopoly equilibrium, deadweight loss, and first/second/third degree price discrimination.\nUnit 2: Monopolistic competition: short-run and long-run Chamberlinian equilibrium.\nUnit 3: Oligopoly theories: Cournot, Bertrand, and Stackelberg leader-follower duopoly models.\nUnit 4: Strategic game theory: normal form games, dominant strategies, and Nash Equilibrium.\nUnit 5: General equilibrium: Edgeworth box, Pareto optimality, market failures, and externalities."
    },

    # ---------------- 300 LEVEL FIRST SEMESTER (19 CU) ----------------
    {
        "code": "STA 311",
        "title": "Probability III",
        "level": 300,
        "semester": 1,
        "credit_units": 3,
        "status": "Compulsory",
        "description": "Advanced probability spaces, distributions of functions of random variables, Jacobian transformation techniques, order statistics and their distributions, multivariate distributions, characteristic functions, and probability inequalities.",
        "outline": "Unit 1: Probability spaces, sigma-algebras, Borel sets, and probability measures.\nUnit 2: Jacobians of single and multi-variable transformations of random variables.\nUnit 3: Order statistics: joint and marginal distributions of smallest, largest, and median values.\nUnit 4: Characteristic functions, inversion formula, and uniqueness theorems.\nUnit 5: Modes of convergence (in probability, almost surely, in distribution) and Central Limit Theorem."
    },
    {
        "code": "STA 321",
        "title": "Statistical Inference III",
        "level": 300,
        "semester": 1,
        "credit_units": 3,
        "status": "Compulsory",
        "description": "Point estimation theory: Fisher information, Cramer-Rao Lower Bound (CRLB), efficiency, complete and sufficient statistics, Rao-Blackwell Theorem, Lehmann-Scheffe Theorem, UMVUE, and asymptotic properties.",
        "outline": "Unit 1: Likelihood function, score function, and Fisher Information matrix.\nUnit 2: Cramer-Rao Lower Bound regularity conditions and proof for unbiased estimators.\nUnit 3: Exponential family of probability distributions and complete sufficient statistics.\nUnit 4: Rao-Blackwellization and Lehmann-Scheffe theorem for finding UMVUE estimators.\nUnit 5: Asymptotic efficiency and normality of Maximum Likelihood Estimators."
    },
    {
        "code": "STA 331",
        "title": "Statistical Computing III",
        "level": 300,
        "semester": 1,
        "credit_units": 2,
        "status": "Compulsory",
        "description": "Advanced statistical computing and modeling in R and Python. Resampling methods (bootstrap, jackknife), EM algorithm, numerical optimization (Nelder-Mead, BFGS), Bayesian MCMC basics, and interactive markdown reporting.",
        "outline": "Unit 1: Numerical optimization: Newton-Raphson, Fisher scoring, and gradient descent.\nUnit 2: Expectation-Maximization (EM) algorithm for missing data and mixture models.\nUnit 3: Non-parametric bootstrap: standard error, bias estimation, and BCa confidence intervals.\nUnit 4: Jackknife resampling and cross-validation techniques for model selection.\nUnit 5: Markov Chain Monte Carlo (MCMC) intro: Metropolis-Hastings and Gibbs sampling."
    },
    {
        "code": "NAU-STA 341",
        "title": "Regression Analysis I",
        "level": 300,
        "semester": 1,
        "credit_units": 3,
        "status": "Compulsory",
        "description": "Simple and multiple linear regression, Ordinary Least Squares (OLS) estimation in matrix notation, Gauss-Markov theorem, coefficient of determination, hypothesis testing on regression coefficients, and ANOVA in regression.",
        "outline": "Unit 1: Simple linear regression: assumptions, derivation of OLS estimators, and properties.\nUnit 2: Multiple linear regression in matrix notation: Y = Xb + e, normal equations, and (X'X)^-1.\nUnit 3: Gauss-Markov theorem and proof that OLS is BLUE (Best Linear Unbiased Estimator).\nUnit 4: Tests of significance: t-tests for coefficients, overall F-test, and R-squared/adjusted R-squared.\nUnit 5: Confidence intervals and prediction intervals for mean responses and individual forecasts."
    },
    {
        "code": "NAU-STA 351",
        "title": "Analysis of Variance I",
        "level": 300,
        "semester": 1,
        "credit_units": 2,
        "status": "Compulsory",
        "description": "Linear statistical models, fixed and random effects, one-way classification, Completely Randomized Design (CRD), two-way classification with and without interaction, Randomized Complete Block Design (RCBD), and Latin Square Design (LSD).",
        "outline": "Unit 1: Linear models: fixed, random, and mixed effects model definitions.\nUnit 2: One-way ANOVA and Completely Randomized Design (CRD) partition of sums of squares.\nUnit 3: Post-hoc multiple comparison tests: Fisher's LSD, Tukey's HSD, Duncan's Multiple Range, Scheffe's.\nUnit 4: Two-way ANOVA without interaction: RCBD model, relative efficiency, and missing plots.\nUnit 5: Latin Square Design: model specification, layout, ANOVA table, and efficiency relative to CRD."
    },
    {
        "code": "NAU-STA 361",
        "title": "Demography",
        "level": 300,
        "semester": 1,
        "credit_units": 2,
        "status": "Compulsory",
        "description": "Demographic data collection, errors in demographic data, mortality analysis, fertility indices, reproduction rates, complete and abridged life tables, population growth models, population estimation, and demographic transition.",
        "outline": "Unit 1: Nature of demography, sources of data, census procedures, and post-enumeration surveys.\nUnit 2: Evaluation of age and sex data: Whipple's Index, Myers' Blended Index, and UN Age-Sex Index.\nUnit 3: Measures of mortality: crude death rate, age-specific death rates, infant mortality, and standardization.\nUnit 4: Measures of fertility: CBR, GFR, ASFR, Total Fertility Rate (TFR), GRR, and NRR.\nUnit 5: Life tables: construction of complete/abridged life tables, stationary populations, and projections."
    },
    {
        "code": "NAU-STA 371",
        "title": "Operations Research I",
        "level": 300,
        "semester": 1,
        "credit_units": 2,
        "status": "Compulsory",
        "description": "Introduction to operations research, mathematical modeling, Linear Programming (LP) formulation, graphical solution method, the Simplex algorithm, artificial variable techniques (Big M, Two-Phase), and duality theory.",
        "outline": "Unit 1: History, methodology, and mathematical formulation of Linear Programming problems.\nUnit 2: Graphical solution method for two-variable linear optimization models.\nUnit 3: The Simplex algorithm: tableau construction, pivot operations, and optimality criteria.\nUnit 4: Artificial variable methods: Big-M method and Two-Phase Simplex technique.\nUnit 5: Duality in linear programming: primal-dual relationships, economic interpretation, and dual simplex."
    },
    {
        "code": "NAU-STA 381",
        "title": "Biometry",
        "level": 300,
        "semester": 1,
        "credit_units": 2,
        "status": "Compulsory",
        "description": "Statistical methods in biological, agricultural, and medical research: bioassays, direct and indirect assays, parallel-line and slope-ratio assays, quantal response assays, probit and logit analysis, LD50 estimation, and clinical trials.",
        "outline": "Unit 1: Scope of biometry and characteristics of biological variation.\nUnit 2: Principles of biological assay: direct assays and precision estimation.\nUnit 3: Quantitative indirect assays: parallel-line assays and slope-ratio assays.\nUnit 4: Quantal response assays: dose-response curves, Probit transformation, Logit model, and LD50/ED50.\nUnit 5: Clinical trial design: randomization, blinding, ethical considerations, and cross-over designs."
    },

    # ---------------- 300 LEVEL SECOND SEMESTER (19 CU) ----------------
    {
        "code": "GST 312",
        "title": "Peace and Conflict Resolution",
        "level": 300,
        "semester": 2,
        "credit_units": 2,
        "status": "Compulsory",
        "description": "Conflict analysis, root causes of ethnic, religious, and political disputes in Africa, conflict mapping, crisis de-escalation, alternative dispute resolution (ADR), negotiation, mediation, arbitration, and peacebuilding.",
        "outline": "Unit 1: Conceptual definitions of peace, conflict, violence, and security.\nUnit 2: Theories of conflict: structural, biological, economic, and human needs theories.\nUnit 3: Conflict dynamics in Nigeria: resource control, ethnicity, religious clashes, and terrorism.\nUnit 4: Conflict transformation mechanisms: communication, negotiation, mediation, and arbitration.\nUnit 5: Post-conflict peacebuilding, disarmament, demobilization, rehabilitation, and rule of law."
    },
    {
        "code": "ENT 312",
        "title": "Venture Creation",
        "level": 300,
        "semester": 2,
        "credit_units": 2,
        "status": "Compulsory",
        "description": "Practical enterprise creation, commercialization of scientific ideas, business plan preparation, financial forecasting, product prototyping, digital marketing, corporate regulatory compliance, and managing sustainable ventures.",
        "outline": "Unit 1: Ideation, lean startup methodologies, and minimal viable product (MVP) design.\nUnit 2: Market research, customer discovery, competitor benchmarking, and value propositions.\nUnit 3: Financial planning: cash flow statements, break-even analysis, and balance sheet forecasting.\nUnit 4: Operational setup: supply chains, intellectual property filing, and CAC incorporation.\nUnit 5: Pitching to investors, venture governance, scaling strategies, and exit avenues."
    },
    {
        "code": "STA 312",
        "title": "Distribution theory I",
        "level": 300,
        "semester": 2,
        "credit_units": 3,
        "status": "Compulsory",
        "description": "Advanced distribution theory: Pearson system of distributions, compound distributions, truncated distributions, convolutions of random variables, order statistics distributions, and multivariate probability families.",
        "outline": "Unit 1: The Pearson family of frequency curves: differential equation and classification of types.\nUnit 2: Compound and mixture distributions: Poisson-Gamma (Negative Binomial), Binomial-Beta.\nUnit 3: Truncated distributions: left, right, and doubly truncated probability models.\nUnit 4: Sums and convolutions of independent random variables using transforms.\nUnit 5: Sampling distributions derived from normal populations and non-central distributions."
    },
    {
        "code": "STA 324",
        "title": "Survey methods and sampling theory",
        "level": 300,
        "semester": 2,
        "credit_units": 3,
        "status": "Compulsory",
        "description": "Principles and practice of sample surveys: survey planning, questionnaire design, sampling and non-sampling errors, Simple Random Sampling (SRS), Stratified Random Sampling, optimum allocation, Systematic Sampling, and Cluster Sampling.",
        "outline": "Unit 1: Planning and execution of sample surveys, sampling frame, questionnaire design, and pre-testing.\nUnit 2: Simple Random Sampling (SRSWOR & SRSWR): estimation of population mean, total, and variances.\nUnit 3: Stratified Random Sampling: proportional allocation, Neyman allocation, and gain in precision.\nUnit 4: Systematic sampling: circular and linear systematic selection, and comparison with SRS.\nUnit 5: Cluster sampling with equal clusters, two-stage sampling, and non-sampling error reduction."
    },
    {
        "code": "NAU-STA 322",
        "title": "Statistical Quality Control I",
        "level": 300,
        "semester": 2,
        "credit_units": 2,
        "status": "Compulsory",
        "description": "Statistical quality control philosophy, control charts for variables (X-bar, R, and S charts), control charts for attributes (p, np, c, and u charts), operating characteristic curves, process capability analysis, and acceptance sampling.",
        "outline": "Unit 1: Quality concepts, Deming philosophy, chance and assignable causes of process variation.\nUnit 2: Shewhart control charts for variables: X-bar and R charts, trial control limits, and interpretation.\nUnit 3: Control charts for attributes: fraction nonconforming (p and np charts) and defects (c and u charts).\nUnit 4: Process capability indices: Cp, Cpk, and Cpm calculations and interpretations.\nUnit 5: Acceptance sampling for attributes: single sampling plans, OC curves, AQL, and LTPD."
    },
    {
        "code": "NAU-STA 362",
        "title": "Statistical Methods In Epidemiology",
        "level": 300,
        "semester": 2,
        "credit_units": 2,
        "status": "Compulsory",
        "description": "Statistical methods in public health: epidemiological study designs (cohort, case-control, cross-sectional), measures of disease occurrence, measures of association (relative risk, odds ratio), confounding, standardization, and survival curves.",
        "outline": "Unit 1: Fundamental principles of epidemiology, disease causation, and observational study designs.\nUnit 2: Measures of disease frequency: incidence rate, incidence proportion (risk), and prevalence.\nUnit 3: Measures of association: Risk Ratio (RR), Odds Ratio (OR), Attributable Risk, and population AR.\nUnit 4: Confounding and interaction (effect modification): Mantel-Haenszel stratified methods.\nUnit 5: Standardization of rates (direct and indirect) and introduction to Kaplan-Meier survival curves."
    },
    {
        "code": "NAU-STA 342",
        "title": "Statistical Application of Matrix Algebra",
        "level": 300,
        "semester": 2,
        "credit_units": 2,
        "status": "Compulsory",
        "description": "Matrix operations in statistical theory: partitioned matrices, determinants, trace properties, generalized inverses (Moore-Penrose), idempotent matrices, quadratic forms, eigenvalues, spectral decomposition, and distributions of quadratic forms.",
        "outline": "Unit 1: Review of matrix operations: partitioned matrices, Kronecker products, trace, and rank.\nUnit 2: Generalized inverses (g-inverses): definitions, Moore-Penrose inverse, and solving linear systems.\nUnit 3: Idempotent matrices, projection operators, and orthogonal projections in linear models.\nUnit 4: Quadratic forms: positive definiteness, spectral decomposition, and differentiation with respect to vectors.\nUnit 5: Distribution of quadratic forms, Cochran's Theorem, and independence of linear and quadratic forms."
    },
    {
        "code": "STA 399",
        "title": "Industrial Attachment",
        "level": 300,
        "semester": 2,
        "credit_units": 3,
        "status": "Compulsory",
        "description": "Supervised Students Industrial Work Experience Scheme (SIWES). Six months of practical professional attachment in industry, financial banks, research institutes, or statistical agencies applying quantitative skills to live data operations.",
        "outline": "Unit 1: Industrial placement registration, employer orientation, and industrial safety compliance.\nUnit 2: Active operational engagement in statistical data collection, cleaning, and database reporting.\nUnit 3: Weekly logbook documentation of technical statistical tasks, programming scripts, and analyses.\nUnit 4: Institutional supervisory visits and mid-attachment performance appraisals.\nUnit 5: Submission of comprehensive SIWES technical report and oral defense before departmental board."
    },

    # ---------------- 400 LEVEL FIRST SEMESTER (17 CU) ----------------
    {
        "code": "STA 411",
        "title": "Probability IV",
        "level": 400,
        "semester": 1,
        "credit_units": 3,
        "status": "Compulsory",
        "description": "Measure-theoretic probability foundations: sigma-fields, measurable spaces, probability measures, Lebesgue-Stieltjes integrals, Radon-Nikodym theorem, conditional expectation given a sigma-field, martingales, and convergence theorems.",
        "outline": "Unit 1: Measure theory foundations: algebras, sigma-algebras, Borel fields, and outer measures.\nUnit 2: Measurable functions, random variables as measurable mappings, and integration theory.\nUnit 3: Monotone Convergence Theorem, Fatou's Lemma, and Lebesgue Dominated Convergence Theorem.\nUnit 4: Radon-Nikodym derivative and conditional expectation with respect to sub-sigma-fields.\nUnit 5: Martingales: discrete-parameter sub-martingales, super-martingales, and Doob's Optional Stopping Theorem."
    },
    {
        "code": "STA 413",
        "title": "Statistical Inference IV",
        "level": 400,
        "semester": 1,
        "credit_units": 3,
        "status": "Compulsory",
        "description": "Advanced hypothesis testing theory: Neyman-Pearson fundamental lemma, Uniformly Most Powerful (UMP) tests, monotone likelihood ratio (MLR) property, unbiased tests (UMPU), Likelihood Ratio Tests (LRT), and sequential probability ratio tests.",
        "outline": "Unit 1: General formulation of statistical hypothesis testing and randomized test functions.\nUnit 2: Neyman-Pearson Fundamental Lemma: statement, proof, and construction of Most Powerful tests.\nUnit 3: Families with Monotone Likelihood Ratio (MLR) and derivation of one-sided UMP tests.\nUnit 4: Two-sided hypotheses, concept of unbiasedness, and Uniformly Most Powerful Unbiased (UMPU) tests.\nUnit 5: Likelihood Ratio Test (LRT) construction, asymptotic Chi-Square distribution, and Wald's SPRT."
    },
    {
        "code": "NAU-STA 421",
        "title": "Times Analysis",
        "level": 400,
        "semester": 1,
        "credit_units": 2,
        "status": "Compulsory",
        "description": "Time Series Analysis: stationary and non-stationary processes, autocovariance and autocorrelation functions (ACF/PACF), Box-Jenkins AR, MA, ARMA, and ARIMA models, unit root testing, spectral analysis, and forecasting.",
        "outline": "Unit 1: Time series components, stationarity definitions (strict vs weak), autocovariance, and ACF.\nUnit 2: Autoregressive (AR), Moving Average (MA), and mixed ARMA stochastic processes and conditions.\nUnit 3: Non-stationary series: difference-stationarity, ARIMA models, and Box-Jenkins three-stage methodology.\nUnit 4: Unit root tests: Augmented Dickey-Fuller (ADF) and Phillips-Perron tests for stationarity.\nUnit 5: Forecasting techniques, prediction error variance, and introduction to ARCH/GARCH volatility models."
    },
    {
        "code": "NAU-STA 441",
        "title": "Regression Analysis II",
        "level": 400,
        "semester": 1,
        "credit_units": 2,
        "status": "Compulsory",
        "description": "Advanced regression methodology: multicollinearity diagnostics, ridge regression, LASSO, model selection criteria (AIC, BIC, Mallows' Cp), residual diagnostics, non-linear regression, and Generalized Linear Models (GLMs).",
        "outline": "Unit 1: Multicollinearity: detection (VIF, Condition Number) and remedial ridge/lasso shrinkage methods.\nUnit 2: Regression model diagnostics: studentized residuals, leverage values, Cook's distance, and outliers.\nUnit 3: Model selection strategies: stepwise regression, best subsets, AIC, BIC, and cross-validation.\nUnit 4: Polynomial and non-linear regression estimation via Gauss-Newton iterative algorithms.\nUnit 5: Generalized Linear Models (GLMs): link functions, logistic regression, and Poisson regression."
    },
    {
        "code": "NAU-STA 451",
        "title": "Design And Analysis of Experiment",
        "level": 400,
        "semester": 1,
        "credit_units": 2,
        "status": "Compulsory",
        "description": "Advanced experimental design: factorial experiment structures (2^k and 3^k series), complete and partial confounding, fractional factorial replication, split-plot designs, nested designs, and Response Surface Methodology (RSM).",
        "outline": "Unit 1: Factorial designs: main effects, two-factor and three-factor interactions in 2^k factorials.\nUnit 2: Confounding in 2^k factorials: complete confounding, partial confounding, and defining contrasts.\nUnit 3: Fractional factorial designs: 2^(k-p) designs, resolution III, IV, and V, and alias structures.\nUnit 4: Split-plot and split-block experimental layouts, models, and ANOVA partitioning.\nUnit 5: Response Surface Methodology: central composite designs, steepest ascent, and stationary points."
    },
    {
        "code": "NAU-STA 461",
        "title": "Multivariate Analysis I",
        "level": 400,
        "semester": 1,
        "credit_units": 2,
        "status": "Compulsory",
        "description": "Multivariate normal distributions, properties of random vectors and covariance matrices, Hotelling's T-squared distribution, testing multivariate hypotheses on mean vectors, Multivariate Analysis of Variance (MANOVA), and Principal Component Analysis.",
        "outline": "Unit 1: Multivariate random vectors: mean vector, dispersion matrix, and multivariate normal density.\nUnit 2: Sampling distributions of sample mean vector and Wishart distribution of sample covariance matrix.\nUnit 3: Hotelling's T-squared statistic: one-sample and two-sample tests for mean vectors.\nUnit 4: One-way and two-way MANOVA: Wilks' Lambda, Pillai's trace, Hotelling-Lawley trace, and Roy's root.\nUnit 5: Principal Component Analysis (PCA): algebraic derivation, eigenvalue scree plots, and data reduction."
    },
    {
        "code": "NAU-STA 491",
        "title": "Seminar",
        "level": 400,
        "semester": 1,
        "credit_units": 1,
        "status": "Compulsory",
        "description": "Individual undergraduate academic research seminar. Literature synthesis on a cutting-edge statistical theory or application, written seminar report compilation, and oral presentation before the departmental seminar panel.",
        "outline": "Unit 1: Scientific research methodology, topic formulation, and scholarly literature search.\nUnit 2: Critical appraisal of published peer-reviewed statistical literature.\nUnit 3: Scientific paper structuring, LaTeX / Markdown typesetting, and academic citation standards.\nUnit 4: Slide design, scientific storytelling, and visual data representation.\nUnit 5: Oral seminar delivery, defense of methodology, and question-and-answer engagement."
    },
    {
        "code": "NAU-STA 471",
        "title": "Operations Research II",
        "level": 400,
        "semester": 1,
        "credit_units": 2,
        "status": "Elective",
        "description": "Advanced operations research techniques: Integer Programming (Branch and Bound, Cutting Plane), Dynamic Programming, Game Theory (two-person zero-sum, saddle points), Queuing Theory (M/M/1, M/M/c), and Project Network Scheduling (CPM/PERT).",
        "outline": "Unit 1: Integer Linear Programming: Gomory's cutting plane algorithm and Branch-and-Bound methods.\nUnit 2: Dynamic programming: Bellman's principle of optimality, recursive equations, and stage decisions.\nUnit 3: Theory of games: minimax theorem, mixed strategies, linear programming formulation of games.\nUnit 4: Queuing models: Poisson arrivals, exponential service times, M/M/1 and M/M/k queuing equations.\nUnit 5: Project scheduling: network diagrams, critical path method (CPM), and PERT probabilistic analysis."
    },
    {
        "code": "NAU-STA 481",
        "title": "Statistical Quality Control I",
        "level": 400,
        "semester": 1,
        "credit_units": 2,
        "status": "Elective",
        "description": "Advanced quality engineering: Cumulative Sum (CUSUM) control charts, Exponentially Weighted Moving Average (EWMA) charts, multivariate quality control charts (Hotelling's T^2 charts), continuous sampling plans, and Six Sigma DMAIC methodologies.",
        "outline": "Unit 1: Advanced memory-type control charts: tabular and V-mask Cumulative Sum (CUSUM) charts.\nUnit 2: Exponentially Weighted Moving Average (EWMA) control charts for detecting small process shifts.\nUnit 3: Multivariate quality control: Hotelling's T-squared control chart for correlated quality characteristics.\nUnit 4: Continuous sampling inspection plans (CSP-1, CSP-2) and sequential sampling plans.\nUnit 5: Six Sigma quality framework: DMAIC cycle, gauge repeatability & reproducibility (R&R) studies."
    },

    # ---------------- 400 LEVEL SECOND SEMESTER (18 CU) ----------------
    {
        "code": "STA 412",
        "title": "Distribution Theory II",
        "level": 400,
        "semester": 2,
        "credit_units": 3,
        "status": "Compulsory",
        "description": "Multivariate continuous distributions: Multivariate Normal, Wishart distribution, Hotelling's T^2 distribution, distribution of quadratic forms, non-central Chi-square, non-central t and F, and asymptotic distribution theorems.",
        "outline": "Unit 1: Matrix-variate distributions and properties of the Wishart distribution.\nUnit 2: Derivation and properties of Hotelling's T-squared distribution.\nUnit 3: Non-central probability distributions: non-central Chi-Square, non-central t, and non-central F.\nUnit 4: Distributions of linear and quadratic forms under multivariate normality.\nUnit 5: Asymptotic expansion of distributions, delta method, and saddle-point approximations."
    },
    {
        "code": "STA 422",
        "title": "Logical Background of Statistics and Decision Theory",
        "level": 400,
        "semester": 2,
        "credit_units": 3,
        "status": "Compulsory",
        "description": "Philosophical and logical foundations of statistical inference, inductive logic, subjective vs objective probability, Bayesian decision theory, prior and posterior distributions, loss functions, risk functions, minimax and Bayes rules.",
        "outline": "Unit 1: Inductive logic, philosophical debates on probability (classical, frequentist, subjective/Bayesian).\nUnit 2: Statistical decision problem components: states of nature, actions, loss functions, and risk.\nUnit 3: Utility theory axioms, von Neumann-Morgenstern utility, and decision criteria under uncertainty.\nUnit 4: Bayesian decision principles: conjugate priors, posterior risk, and optimal Bayes decision rules.\nUnit 5: Minimax decision criterion, admissible decision rules, and randomized decision procedures."
    },
    {
        "code": "NAU-STA 424",
        "title": "Stochastic Processes",
        "level": 400,
        "semester": 2,
        "credit_units": 2,
        "status": "Compulsory",
        "description": "Markov chains in discrete and continuous time, transition probability matrices, Chapman-Kolmogorov equations, classification of states, stationary distributions, Poisson processes, birth-and-death processes, and queuing applications.",
        "outline": "Unit 1: Definition of stochastic processes, index sets, state spaces, and Markov property.\nUnit 2: Discrete-time Markov Chains: transition probability matrix and Chapman-Kolmogorov equations.\nUnit 3: Classification of states: periodicity, recurrence, transience, absorbing states, and ergodicity.\nUnit 4: Stationary distributions and long-run limiting behavior of irreducible recurrent chains.\nUnit 5: Continuous-time Markov processes: Poisson process, pure birth, and birth-and-death processes."
    },
    {
        "code": "NAU-STA 432",
        "title": "Non–parametric Methods",
        "level": 400,
        "semester": 2,
        "credit_units": 2,
        "status": "Compulsory",
        "description": "Distribution-free statistical methods: order statistics, Sign test, Wilcoxon Signed-Rank test, Mann-Whitney U test, Kruskal-Wallis one-way ANOVA by ranks, Friedman two-way ANOVA, Kendall's tau, Spearman's rank correlation, and Kolmogorov-Smirnov goodness-of-fit.",
        "outline": "Unit 1: Concepts of non-parametric vs parametric inference, empirical distribution function.\nUnit 2: One-sample tests: Sign test, Wilcoxon Signed-Rank test, and Kolmogorov-Smirnov one-sample test.\nUnit 3: Two independent sample tests: Mann-Whitney U test and Kolmogorov-Smirnov two-sample test.\nUnit 4: K-sample tests: Kruskal-Wallis test for independent samples and Friedman test for paired data.\nUnit 5: Measures of association: Spearman's rank correlation (rho) and Kendall's rank correlation (tau)."
    },
    {
        "code": "NAU-STA 442",
        "title": "Multivariate Analysis II",
        "level": 400,
        "semester": 2,
        "credit_units": 2,
        "status": "Compulsory",
        "description": "Advanced multivariate data analysis: Factor Analysis (orthogonal and oblique rotations), Canonical Correlation Analysis, Linear and Quadratic Discriminant Analysis, Cluster Analysis (hierarchical and k-means), and Multidimensional Scaling.",
        "outline": "Unit 1: Exploratory and confirmatory Factor Analysis: principal factor method, varimax rotation, factor scores.\nUnit 2: Canonical Correlation Analysis: canonical variates, canonical correlations, and significance tests.\nUnit 3: Discriminant Analysis: Fisher's linear discriminant function, classification rules, and error rates.\nUnit 4: Cluster Analysis: distance metrics, hierarchical clustering (Ward, complete, average), and K-means.\nUnit 5: Multidimensional Scaling (MDS) and Correspondence Analysis for categorical dimensionality reduction."
    },
    {
        "code": "NAU-STA 452",
        "title": "Analysis of Variance II",
        "level": 400,
        "semester": 2,
        "credit_units": 2,
        "status": "Compulsory",
        "description": "Analysis of Covariance (ANCOVA), nested and hierarchical designs, unbalanced ANOVA, mixed and random effects linear models, variance components estimation (ANOVA method, REML), and repeated measures ANOVA.",
        "outline": "Unit 1: Analysis of Covariance (ANCOVA): single covariate linear model, test of parallel slopes, adjusted means.\nUnit 2: Nested (hierarchical) classification designs: two-stage nested model and ANOVA table.\nUnit 3: Unbalanced two-way ANOVA: exact method of fitting constants and weighted squares of means.\nUnit 4: Random effects and mixed models: expected mean squares (EMS) and variance components estimation via REML.\nUnit 5: Repeated measures ANOVA: sphericity assumption, Mauchly's test, and Greenhouse-Geisser correction."
    },
    {
        "code": "STA 499",
        "title": "Project",
        "level": 400,
        "semester": 2,
        "credit_units": 6,
        "status": "Compulsory",
        "description": "Supervised individual final year research project. Independent empirical data collection, statistical modeling, simulation or theoretical contribution, written dissertation submission, and oral defense before external and internal boards.",
        "outline": "Unit 1: Topic selection, hypothesis formulation, research proposal, and supervisor assignment.\nUnit 2: Comprehensive literature review and conceptual statistical framework definition.\nUnit 3: Methodology formulation, sampling design, data acquisition, and quality validation.\nUnit 4: Advanced statistical computation, modeling, hypothesis testing, and empirical interpretations.\nUnit 5: Final bound dissertation submission and oral viva voce defense before the examination panel."
    }
]

print(f"Total courses to process: {len(courses_data)}")

conn = sqlite3.connect('data/nass_portal.db')
c = conn.cursor()

# 1. Fetch current courses to build a mapping from code -> old_id
c.execute("SELECT id, code FROM courses")
old_courses = c.fetchall()
old_code_to_id = {row[1]: row[0] for row in old_courses}

# 2. Fetch existing course_resources
c.execute("SELECT id, course_id, title, resource_type, file_name, file_path, file_size, academic_year, semester FROM course_resources")
existing_resources = c.fetchall()
print(f"Found {len(existing_resources)} existing course resources")

# Map existing resources to course code
resource_by_code = []
old_id_to_code = {row[0]: row[1] for row in old_courses}
for res in existing_resources:
    cid = res[1]
    code = old_id_to_code.get(cid, "STA 111")
    resource_by_code.append((code, res))

# 3. Clear existing courses (and resources will be cleanly re-inserted)
c.execute("DELETE FROM course_resources")
c.execute("DELETE FROM courses")

# 4. Insert all 73 new courses
insert_stmt = """
    INSERT INTO courses (code, title, level, semester, credit_units, status, description, outline, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, datetime('now'), datetime('now'))
"""

new_code_to_id = {}
for course in courses_data:
    c.execute(insert_stmt, (
        course["code"],
        course["title"],
        course["level"],
        course["semester"],
        course["credit_units"],
        course["status"],
        course["description"],
        course["outline"]
    ))
    new_id = c.lastrowid
    new_code_to_id[course["code"]] = new_id

print(f"Successfully inserted {len(new_code_to_id)} courses into courses table.")

# 5. Re-link existing course resources to the new course IDs
insert_res_stmt = """
    INSERT INTO course_resources (course_id, title, resource_type, file_name, file_path, file_size, academic_year, semester, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, datetime('now'), datetime('now'))
"""

linked_count = 0
for code, res in resource_by_code:
    # Try exact match or base match
    target_id = new_code_to_id.get(code)
    if not target_id:
        # Match e.g. STA 401 -> STA 413, STA 431 -> NAU-STA 424, STA 232 -> STA 324
        fallback_matches = {
            "STA 401": "STA 413",
            "STA 431": "NAU-STA 424",
            "STA 232": "STA 324",
            "STA 132": "STA 122",
        }
        fallback_code = fallback_matches.get(code, "STA 111")
        target_id = new_code_to_id.get(fallback_code, 1)

    c.execute(insert_res_stmt, (
        target_id,
        res[2],
        res[3],
        res[4],
        res[5],
        res[6],
        res[7],
        res[8]
    ))
    linked_count += 1

print(f"Re-linked {linked_count} course resources.")

# 6. Ensure key new courses also have verified course resources/past question compendiums
starter_resources = [
    # 100L
    ("GST 111", "GST 111 Use of English Past Examination Questions (2020 - 2024)", "past_question", "GST_111_Past_Questions_Compendium.pdf", "/resources/documents/GST_111_PQ.pdf", 1120000, "2023/2024", 1),
    ("MTH 101", "MTH 101 Elementary Mathematics I Past Questions & Solutions", "past_question", "MTH_101_Past_Questions_Solutions.pdf", "/resources/documents/MTH_101_PQ.pdf", 1340000, "2023/2024", 1),
    ("COS 101", "COS 101 Introduction to Computer Science Examination Papers", "past_question", "COS_101_Exam_Papers.pdf", "/resources/documents/COS_101_PQ.pdf", 980000, "2023/2024", 1),
    ("STA 112", "STA 112 Probability 1 Solved Past Questions & Review Notes", "past_question", "STA_112_Probability_Past_Questions.pdf", "/resources/documents/STA_112_PQ.pdf", 1450000, "2023/2024", 2),
    ("STA 122", "STA 122 Statistical Computing 1 R & Excel Lab Manual", "outline", "STA_122_Statistical_Computing_Manual.pdf", "/resources/documents/STA_122_Manual.pdf", 1850000, "2023/2024", 2),
    # 200L
    ("STA 211", "STA 211 Probability II Past Questions & Distribution Formulas", "past_question", "STA_211_Past_Questions_Compendium.pdf", "/resources/documents/STA_211_PQ.pdf", 1620000, "2023/2024", 1),
    ("STA 221", "STA 221 Statistical Inference II Exam Papers (2019 - 2024)", "past_question", "STA_221_Statistical_Inference_PQ.pdf", "/resources/documents/STA_221_PQ.pdf", 1280000, "2023/2024", 1),
    ("STA 202", "STA 202 Statistics for Physical Sciences & Engineering Past Papers", "past_question", "STA_202_Past_Questions.pdf", "/resources/documents/STA_202_PQ.pdf", 1150000, "2023/2024", 2),
    ("NAU-STA 214", "NAU-STA 214 Probability & Probability Distribution Past Questions", "past_question", "NAU_STA_214_Past_Questions.pdf", "/resources/documents/NAU_STA_214_PQ.pdf", 1210000, "2023/2024", 2),
    # 300L
    ("STA 311", "STA 311 Probability III Comprehensive Past Questions (2020 - 2024)", "past_question", "STA_311_Past_Questions_Compendium.pdf", "/resources/documents/STA_311_PQ.pdf", 1540000, "2023/2024", 1),
    ("STA 321", "STA 321 Statistical Inference III CRLB & UMVUE Questions", "past_question", "STA_321_Inference_Past_Questions.pdf", "/resources/documents/STA_321_PQ.pdf", 1480000, "2023/2024", 1),
    ("NAU-STA 341", "NAU-STA 341 Regression Analysis I Past Examination Questions", "past_question", "NAU_STA_341_Regression_PQ.pdf", "/resources/documents/NAU_STA_341_PQ.pdf", 1390000, "2023/2024", 1),
    ("NAU-STA 351", "NAU-STA 351 Analysis of Variance I Past Papers & ANOVA Tables", "past_question", "NAU_STA_351_ANOVA_PQ.pdf", "/resources/documents/NAU_STA_351_PQ.pdf", 1270000, "2023/2024", 1),
    ("STA 312", "STA 312 Distribution Theory I Past Questions & Pearson Curves", "past_question", "STA_312_Distribution_Theory_PQ.pdf", "/resources/documents/STA_312_PQ.pdf", 1320000, "2023/2024", 2),
    ("STA 324", "STA 324 Survey Methods & Sampling Theory Examination Questions", "past_question", "STA_324_Sampling_Past_Questions.pdf", "/resources/documents/STA_324_PQ.pdf", 1410000, "2023/2024", 2),
    ("NAU-STA 322", "NAU-STA 322 Statistical Quality Control I Past Examination Questions", "past_question", "NAU_STA_322_SQC_PQ.pdf", "/resources/documents/NAU_STA_322_PQ.pdf", 1190000, "2023/2024", 2),
    # 400L
    ("STA 411", "STA 411 Probability IV Advanced Martingales & Measure Papers", "past_question", "STA_411_Probability_IV_PQ.pdf", "/resources/documents/STA_411_PQ.pdf", 1680000, "2023/2024", 1),
    ("STA 413", "STA 413 Statistical Inference IV Most Powerful Tests Questions", "past_question", "STA_413_Inference_IV_PQ.pdf", "/resources/documents/STA_413_PQ.pdf", 1430000, "2023/2024", 1),
    ("NAU-STA 421", "NAU-STA 421 Time Series Analysis Past Questions & R Code", "past_question", "NAU_STA_421_Times_Analysis_PQ.pdf", "/resources/documents/NAU_STA_421_PQ.pdf", 1750000, "2023/2024", 1),
    ("NAU-STA 461", "NAU-STA 461 Multivariate Analysis I Examination Papers", "past_question", "NAU_STA_461_Multivariate_PQ.pdf", "/resources/documents/NAU_STA_461_PQ.pdf", 1520000, "2023/2024", 1),
    ("STA 412", "STA 412 Distribution Theory II Past Examination Questions", "past_question", "STA_412_Distribution_Theory_II_PQ.pdf", "/resources/documents/STA_412_PQ.pdf", 1370000, "2023/2024", 2),
    ("STA 422", "STA 422 Logical Background of Statistics & Decision Theory PQ", "past_question", "STA_422_Decision_Theory_PQ.pdf", "/resources/documents/STA_422_PQ.pdf", 1460000, "2023/2024", 2),
    ("NAU-STA 424", "NAU-STA 424 Stochastic Processes Past Examination Questions", "past_question", "NAU_STA_424_Stochastic_PQ.pdf", "/resources/documents/NAU_STA_424_PQ.pdf", 1590000, "2023/2024", 2),
    ("NAU-STA 432", "NAU-STA 432 Non-Parametric Methods Past Papers & Rank Tests", "past_question", "NAU_STA_432_Nonparametric_PQ.pdf", "/resources/documents/NAU_STA_432_PQ.pdf", 1310000, "2023/2024", 2),
    ("STA 499", "STA 499 Final Year Project Manual, Formatting & LaTeX Template", "outline", "STA_499_Project_Guidelines_UNIZIK.pdf", "/resources/documents/STA_499_Project_Guidelines.pdf", 2450000, "2025/2026", 2),
]

added_resources = 0
for code, title, r_type, fname, fpath, fsize, year, sem in starter_resources:
    cid = new_code_to_id.get(code)
    if cid:
        c.execute(insert_res_stmt, (cid, title, r_type, fname, fpath, fsize, year, sem))
        added_resources += 1

print(f"Added {added_resources} high-yield course resources and past question packages.")

conn.commit()

# Verify counts by level and semester
for lvl in [100, 200, 300, 400]:
    for sem in [1, 2]:
        c.execute("SELECT COUNT(*), SUM(credit_units) FROM courses WHERE level = ? AND semester = ?", (lvl, sem))
        row = c.fetchone()
        c.execute("SELECT code, credit_units, status FROM courses WHERE level = ? AND semester = ? ORDER BY code ASC", (lvl, sem))
        items = c.fetchall()
        print(f"\nLevel {lvl}L Semester {sem}: {row[0]} courses, Total CU: {row[1]}")
        for code, cu, status in items:
            print(f"  - {code} ({cu} CU, {status})")

conn.close()
