/* Static prototype content. No live services are called from the frontend. */

/*
 * Files in public/ are referenced here as runtime strings, so Vite cannot rewrite them
 * the way it rewrites imports. Prefixing BASE_URL keeps them resolvable when the app is
 * served from a subpath, such as a GitHub Pages project site.
 */
export const asset = path => `${import.meta.env.BASE_URL}${path.replace(/^\//, "")}`;

export const phases = [
  {
    id: "profile",
    label: "Profile",
    blurb: "Your service facts",
    sections: [{ id: "setup", label: "Guided setup" }],
  },
  {
    id: "translate",
    label: "Translate",
    blurb: "What your service means",
    sections: [
      { id: "meaning", label: "My translation" },
      { id: "competencies", label: "Competency profile" },
    ],
  },
  {
    id: "explore",
    label: "Explore",
    blurb: "Where it can take you",
    sections: [
      { id: "afsc", label: "Air Force paths" },
      { id: "civilian", label: "Civilian roles" },
      { id: "federal", label: "Federal match" },
      { id: "map", label: "Jobs & bases" },
      { id: "apprenticeships", label: "Apprenticeships" },
      { id: "credentials", label: "Credentials" },
    ],
  },
  {
    id: "plan",
    label: "Plan",
    blurb: "Your transition plan",
    sections: [{ id: "itp", label: "Transition plan" }],
  },
];

export const goals = [
  { name: "Separating / TAPs", description: "Map your gaps, bridge them with credentials and education, and build your Transition Plan.", icon: "target" },
  { name: "First-term Airman", description: "Lock in the competencies you have earned and plan what to build next.", icon: "leaf" },
  { name: "Retraining", description: "See which AFSCs you qualify for based on your MAGE scores.", icon: "retrain" },
  { name: "Federal & civilian jobs", description: "Translate your Air Force experience into hiring language.", icon: "federal" },
  { name: "Credentials & licensing", description: "Find certifications matched to your real competencies.", icon: "credentials" },
];

/* Each goal points at the section that answers it first. */
export const goalDestinations = {
  "Separating / TAPs": ["plan", "itp"],
  "First-term Airman": ["translate", "competencies"],
  Retraining: ["explore", "afsc"],
  "Federal & civilian jobs": ["explore", "civilian"],
  "Credentials & licensing": ["explore", "credentials"],
};

export const iconSources = {
  help: asset("/assets/icons/a85ccba6ec2fcfe6.svg?v=2"),
  bell: asset("/assets/icons/114ee41050bd9c98.svg?v=2"),
  badge: asset("/assets/icons/27f5d4948d20a870.svg?v=2"),
  "user-large": asset("/assets/icons/33a79e8f64b0fbe5.svg?v=2"),
  target: asset("/assets/icons/23bdc450e0145582.svg?v=2"),
  leaf: asset("/assets/icons/38c27f8adeb6824a.svg?v=2"),
  retrain: asset("/assets/icons/0910033787a51fe8.svg?v=2"),
  federal: asset("/assets/icons/75057a8b1c9bd184.svg?v=2"),
  credentials: asset("/assets/icons/db8b0c71463c881c.svg?v=2"),
};

export const profileFields = [
  { key: "afsc", label: "Primary AFSC", hint: "e.g. 1N0X1", type: "text" },
  { key: "rank", label: "Rank", type: "select", options: ["Airman", "Staff Sergeant", "Technical Sergeant", "Master Sergeant", "Officer"] },
  { key: "skill", label: "Skill level", type: "select", options: ["3-level", "5-level", "7-level", "9-level"] },
  { key: "years", label: "Years of service", type: "number" },
  { key: "education", label: "Education", type: "select", wide: true, options: ["High school / GED", "Some college", "Associate degree", "Bachelor's degree", "Graduate degree"] },
];

export const emptyProfile = { afsc: "", rank: "", skill: "", years: "", education: "" };

export const competencies = [
  { name: "Operational planning", evidence: 92, note: "Strong, repeated evidence across mission planning and team execution.", skills: ["Mission planning", "Scheduling", "Contingency planning"] },
  { name: "Team leadership", evidence: 85, note: "Sustained supervision, delegation, and performance feedback.", skills: ["Supervision", "Coaching", "Performance feedback"] },
  { name: "Risk management", evidence: 78, note: "Relevant evidence found. Add a specific achievement to strengthen this competency.", skills: ["Hazard analysis", "Mitigation", "Compliance"] },
  { name: "Training & development", evidence: 71, note: "Relevant evidence found. Add a specific achievement to strengthen this competency.", skills: ["Instruction", "Qualification", "Curriculum"] },
  { name: "Process improvement", evidence: 64, note: "Relevant evidence found. Add a specific achievement to strengthen this competency.", skills: ["Root cause analysis", "Standardization", "Metrics"] },
  { name: "Technical communication", evidence: 58, note: "Relevant evidence found. Add a specific achievement to strengthen this competency.", skills: ["Briefing", "Technical writing", "Documentation"] },
];

export const translationCards = [
  { label: "Service evidence", title: "Operational planning", copy: "Plans, coordinates, and executes time-sensitive work under defined standards." },
  { label: "Civilian language", title: "Cross-functional delivery", copy: "Turns priorities into schedules, aligns stakeholders, and tracks work to completion." },
  { label: "Honest gap", title: "Commercial context", copy: "Add examples that show budgets, customers, and business outcomes." },
];

export const civilianFields = [
  ["Research leads", "Across all fields"],
  ["Operations", "Mission execution"],
  ["Program management", "Plans and delivery"],
  ["Cyber & IT", "Systems and security"],
  ["Logistics", "Supply and readiness"],
  ["Training", "Instruction and development"],
];

export const civilianResults = {
  "Research leads": [
    ["Operations Coordinator", "Strong transfer", "Planning, cross-team coordination, and mission execution map directly."],
    ["Project Coordinator", "Good fit", "Your service evidence supports schedules, stakeholders, and risk tracking."],
    ["Training Specialist", "Build one gap", "Instructional experience transfers; add a civilian training credential."],
  ],
  Operations: [
    ["Operations Manager", "Good fit", "Mission planning, readiness, and team leadership are the strongest evidence edges."],
    ["Business Continuity Specialist", "Explore", "Contingency thinking and disciplined execution create a credible bridge."],
  ],
  "Program management": [
    ["Project Manager", "Good fit", "Translate plans, milestones, risks, and after-action improvements into delivery language."],
    ["Program Analyst", "Explore", "Add portfolio reporting and budget evidence to strengthen this match."],
  ],
  "Cyber & IT": [
    ["IT Support Specialist", "Explore", "Systems troubleshooting transfers; validate technical certifications for the posting."],
    ["Cybersecurity Analyst", "Build first", "A baseline security credential may be required."],
  ],
  Logistics: [
    ["Logistics Coordinator", "Strong transfer", "Inventory accountability and readiness translate well."],
    ["Supply Chain Analyst", "Explore", "Pair operational evidence with data-analysis examples."],
  ],
  Training: [
    ["Learning & Development Specialist", "Good fit", "Briefing, qualification, and coaching experience map directly."],
    ["Technical Trainer", "Strong transfer", "Your subject-matter expertise can become instructor evidence."],
  ],
};

/* Only pathways with series behind them — a chip that returns nothing is a dead control. */
export const federalLenses = [
  "Intelligence analysis", "Cyber / IT", "Program management",
  "Management and program analysis", "Contracting / acquisition", "Budget / financial management",
  "Logistics / supply", "Training instruction", "Safety / emergency management",
  "Security / investigations", "Aircraft maintenance",
];

/* Series shown for a lens; every entry is a research starting point, not an eligibility decision. */
export const federalSeries = {
  "Intelligence analysis": [["0132", "Intelligence", "Analysis, reporting, and briefing of collected information."]],
  "Cyber / IT": [["2210", "Information Technology Management", "Systems administration, security, and network operations."]],
  "Program management": [["0340", "Program Management", "Directing programs, resources, and delivery outcomes."]],
  "Management and program analysis": [["0343", "Management and Program Analysis", "Studies, metrics, and process improvement for programs."]],
  "Contracting / acquisition": [["1102", "Contracting", "Solicitation, award, and administration of federal contracts."]],
  "Budget / financial management": [["0560", "Budget Analysis", "Formulation, justification, and execution of budgets."]],
  "Logistics / supply": [["2003", "Supply Program Management", "Supply operations, accountability, and distribution."]],
  "Training instruction": [["1712", "Training Instruction", "Course delivery, evaluation, and curriculum support."]],
  "Safety / emergency management": [["0018", "Safety and Occupational Health", "Hazard control, inspections, and safety programs."]],
  "Security / investigations": [["0080", "Security Administration", "Physical, personnel, and information security programs."]],
  "Aircraft maintenance": [["8852", "Aircraft Mechanic (WG)", "Inspection, repair, and servicing of aircraft systems."]],
};

export const credentialLanes = [
  "Project / Program", "Acquisition / Contracting", "Budget / Finance", "Cyber / IT",
  "Process / Quality", "Training / Instruction", "Safety / Emergency", "Logistics / Supply",
];

export const credentialCatalog = [
  { name: "Project Management Professional (PMP)", provider: "PMI", lane: "Project / Program", note: "Project leadership, schedules, risks, and stakeholder coordination.", competency: "Operational planning", degree: true },
  { name: "FAC-C (Professional)", provider: "Federal Acquisition Institute", lane: "Acquisition / Contracting", note: "Federal acquisition and contracting research lead.", competency: "Process improvement", degree: true },
  { name: "Certified Defense Financial Manager", provider: "ASMC", lane: "Budget / Finance", note: "Defense financial management, budget, and resource accountability.", competency: "Process improvement", degree: false },
  { name: "CompTIA Security+", provider: "CompTIA", lane: "Cyber / IT", note: "Baseline cybersecurity concepts, operations, and risk controls.", competency: "Risk management", degree: false },
  { name: "Lean Six Sigma Green Belt", provider: "IASSC-aligned", lane: "Process / Quality", note: "Process analysis, measurable improvement, and quality control.", competency: "Process improvement", degree: false },
  { name: "Certified Professional in Talent Development", provider: "ATD", lane: "Training / Instruction", note: "Instructional delivery, learning programs, and workforce development.", competency: "Training & development", degree: true },
  { name: "Certified Safety Professional", provider: "BCSP", lane: "Safety / Emergency", note: "Safety programs, hazard controls, and risk reduction.", competency: "Risk management", degree: true },
  { name: "Certified in Logistics, Transportation and Distribution", provider: "ASCM", lane: "Logistics / Supply", note: "Logistics planning, distribution, and supply-chain operations.", competency: "Operational planning", degree: false },
];

export const apprenticeshipTracks = [
  { title: "Industrial Maintenance Mechanic", hours: "8,000 on-the-job hours", note: "Maintenance and troubleshooting experience can shorten the on-the-job requirement." },
  { title: "Electronics Technician", hours: "6,000 on-the-job hours", note: "Systems diagnostics and calibration duties map to registered standards." },
  { title: "Logistics Support Specialist", hours: "4,000 on-the-job hours", note: "Inventory accountability and distribution duties transfer directly." },
];

/*
 * Air Force paths carry the score thresholds each specialty tests against, so
 * matchAirForcePaths() in src/domain/missionproof.js can compute real gaps against the
 * composites a user enters rather than restating a fixed label.
 */
export const airForcePaths = [
  { afsc: "1D7X1", title: "Cyber Defense Operations", family: "Cyber & Intelligence", scores: { M: 45, A: 41, G: 64, E: 70 }, note: "Protect networks, operate enterprise systems, and respond to cyber incidents." },
  { afsc: "1N0X1", title: "All Source Intelligence Analyst", family: "Cyber & Intelligence", scores: { M: 0, A: 0, G: 62, E: 0 }, note: "Synthesize intelligence, brief leaders, and support operational decisions." },
  { afsc: "1C5X1", title: "Command and Control Battle Management", family: "Operations", scores: { M: 0, A: 0, G: 55, E: 0 }, note: "Coordinate command-and-control systems and build a shared operational picture." },
  { afsc: "2G0X1", title: "Logistics Plans", family: "Logistics", scores: { M: 0, A: 56, G: 0, E: 0 }, note: "Plan force movement, readiness, deployment, and logistics support." },
  { afsc: "2T2X1", title: "Air Transportation", family: "Logistics", scores: { M: 47, A: 0, G: 0, E: 0 }, note: "Move passengers and cargo safely through military air terminals." },
  { afsc: "3E5X1", title: "Engineering", family: "Technical & Engineering", scores: { M: 0, A: 0, G: 49, E: 0 }, note: "Survey, draft, inspect, and support installation engineering projects." },
];

export const pathFamilies = ["All paths", "Operations", "Cyber & Intelligence", "Logistics", "Technical & Engineering"];

export const compositeNames = { M: "Mechanical", A: "Administrative", G: "General", E: "Electrical" };

/* One catalog searched across all three interpretations of a skill. */
export const skillSearchCatalog = [
  { id: "civilian-program-analyst", type: "Civilian role", title: "Program Analyst", detail: "Turn plans, milestones, risks, and performance evidence into program decisions.", tags: ["planning", "analysis", "leadership", "program management"] },
  { id: "federal-0343", type: "Federal series", title: "0343 — Management & Program Analysis", detail: "A research lead for program evaluation, process improvement, and advisory work.", tags: ["planning", "analysis", "process improvement", "leadership"] },
  { id: "credential-pmp", type: "Credential", title: "Project Management Professional (PMP)", detail: "Validates project leadership, schedules, risks, and stakeholder coordination.", tags: ["planning", "leadership", "project management"] },
  { id: "civilian-cyber", type: "Civilian role", title: "Cybersecurity Analyst", detail: "Apply systems knowledge, incident response, and risk-control evidence.", tags: ["cyber", "security", "risk management", "technical"] },
  { id: "federal-2210", type: "Federal series", title: "2210 — Information Technology Management", detail: "Federal pathway spanning customer support, systems, policy, and cybersecurity.", tags: ["cyber", "security", "technical", "systems"] },
  { id: "credential-security", type: "Credential", title: "CompTIA Security+", detail: "Baseline cybersecurity operations, threats, architecture, and risk controls.", tags: ["cyber", "security", "technical"] },
  { id: "civilian-training", type: "Civilian role", title: "Training & Development Specialist", detail: "Translate qualification, briefing, coaching, and curriculum experience.", tags: ["training", "instruction", "leadership", "communication"] },
  { id: "federal-1712", type: "Federal series", title: "1712 — Training Instruction", detail: "Research lead for formal instruction, curriculum, and workforce development.", tags: ["training", "instruction", "communication"] },
  { id: "civilian-logistics", type: "Civilian role", title: "Logistics Coordinator", detail: "Connect readiness, inventory accountability, movement, and mission support.", tags: ["logistics", "operations", "planning", "supply"] },
  { id: "credential-cltd", type: "Credential", title: "Certified in Logistics, Transportation and Distribution", detail: "Validates logistics planning, distribution, and supply-chain operations.", tags: ["logistics", "supply", "operations"] },
];

export const skillPrompts = ["planning", "leadership", "cyber", "training", "logistics", "risk management"];

/* Maps a skill-catalog type onto the plan grouping used by the Plan screen. */
export const catalogKinds = { "Civilian role": "role", "Federal series": "federal", Credential: "credential" };

/* Where each catalog entry actually lives, so a search result lands on the item, not near it. */
export const catalogDestinations = {
  "civilian-program-analyst": ["explore", "civilian", { field: "Program management" }],
  "federal-0343": ["explore", "federal", { lens: "Management and program analysis" }],
  "credential-pmp": ["explore", "credentials", { query: "Project Management Professional" }],
  "civilian-cyber": ["explore", "civilian", { field: "Cyber & IT" }],
  "federal-2210": ["explore", "federal", { lens: "Cyber / IT" }],
  "credential-security": ["explore", "credentials", { query: "Security+" }],
  "civilian-training": ["explore", "civilian", { field: "Training" }],
  "federal-1712": ["explore", "federal", { lens: "Training instruction" }],
  "civilian-logistics": ["explore", "civilian", { field: "Logistics" }],
  "credential-cltd": ["explore", "credentials", { query: "Logistics, Transportation" }],
};

export const mapDatasets = [
  { label: "All collected (14,208)", value: "all", count: "14,208", top: "Texas (1311)", remote: "696" },
  { label: "All private-sector postings (9,403)", value: "private", count: "9,403", top: "Texas (842)", remote: "411" },
  { label: "Federal (USAJOBS) (4,024)", value: "federal", count: "4,024", top: "Virginia (492)", remote: "257" },
  { label: "Data Center Tech (473)", value: "data-center", count: "473", top: "Virginia (68)", remote: "19" },
  { label: "Software Engineering (177)", value: "software", count: "177", top: "Washington (35)", remote: "28" },
  { label: "Wind Turbine Tech (107)", value: "wind", count: "107", top: "Texas (21)", remote: "4" },
];

export const mapRegions = [
  ["#1", "Texas", "94", "1,311 jobs · 192,587 personnel", "Oilfield Operations", "Joint Base San Antonio – Lackland"],
  ["#2", "California", "76", "765 jobs · 216,603 personnel", "HVAC Mechanic", "MCB Camp Pendleton"],
  ["#3", "Virginia", "62", "740 jobs · 148,388 personnel", "Miscellaneous Administration And Program", "Naval Station Norfolk"],
  ["#4", "Florida", "49", "591 jobs · 117,273 personnel", "HVAC Mechanic", "Eglin AFB"],
  ["#5", "North Carolina", "43", "420 jobs · 123,510 personnel", "Operating Engineer", "Fort Bragg"],
  ["#6", "Washington", "42", "669 jobs · 75,719 personnel", "Software Engineering", "Joint Base Lewis-McChord"],
];

export const populatedState = "Texas";

export const mapStateRows = [
  ["Texas", "1,311"], ["California", "765"], ["Virginia", "740"], ["Washington", "669"], ["Florida", "591"],
  ["Ohio", "492"], ["New York", "468"], ["Georgia", "460"], ["Illinois", "427"], ["North Carolina", "420"],
  ["Arizona", "389"], ["D.C.", "384"], ["Maryland", "384"], ["Colorado", "380"], ["Pennsylvania", "314"],
];

export const planStageLabels = {
  role: "Civilian role",
  federal: "Federal target",
  credential: "Credential",
  afsc: "Air Force path",
};

export const afscLookupHint = "Saved leads collect on your Transition Plan.";

/* The four dated moves the plan is built around. */
export const transitionTasks = [
  { id: "task-evidence", phase: "Now · 0–30 days", title: "Collect three mission-impact stories", detail: "Write the situation, your action, and a measurable outcome — without sensitive details." },
  { id: "task-target", phase: "Next · 30–90 days", title: "Validate one target pathway", detail: "Compare your evidence with live role requirements and record the gaps." },
  { id: "task-credential", phase: "Before separation", title: "Confirm funding and credential timing", detail: "Verify current AF COOL rules with your education office before committing funds." },
  { id: "task-network", phase: "Launch", title: "Run a warm-introduction sprint", detail: "Schedule five conversations with people doing the work you want next." },
];
