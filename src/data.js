/* Static prototype content. No live services are called from the frontend. */

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
  help: "/assets/icons/a85ccba6ec2fcfe6.svg?v=2",
  bell: "/assets/icons/114ee41050bd9c98.svg?v=2",
  badge: "/assets/icons/27f5d4948d20a870.svg?v=2",
  "user-large": "/assets/icons/33a79e8f64b0fbe5.svg?v=2",
  target: "/assets/icons/23bdc450e0145582.svg?v=2",
  leaf: "/assets/icons/38c27f8adeb6824a.svg?v=2",
  retrain: "/assets/icons/0910033787a51fe8.svg?v=2",
  federal: "/assets/icons/75057a8b1c9bd184.svg?v=2",
  credentials: "/assets/icons/db8b0c71463c881c.svg?v=2",
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
  ["Best fits", "Across all fields"],
  ["Operations", "Mission execution"],
  ["Program management", "Plans and delivery"],
  ["Cyber & IT", "Systems and security"],
  ["Logistics", "Supply and readiness"],
  ["Training", "Instruction and development"],
];

export const civilianResults = {
  "Best fits": [
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

export const federalLenses = [
  "Medical / health", "Intelligence analysis", "Cyber / IT", "Program management",
  "Management and program analysis", "Contracting / acquisition", "Budget / financial management",
  "Logistics / supply", "Training instruction", "Safety / emergency management",
  "Security / investigations", "Aviation / technical", "Human resources", "Weather",
  "Public affairs", "Fire protection", "Aircraft maintenance", "Skilled trades (WG)",
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

/* Retraining paths, the screen that used to be a dead nav item. */
export const afscPaths = [
  { code: "3D0X2", title: "Cyber Systems Operations", mage: "General 64", note: "Systems administration and network operations across base infrastructure.", civilian: "IT Support Specialist" },
  { code: "1C0X2", title: "Aviation Resource Management", mage: "Administrative 55", note: "Flight records, scheduling, and aviation program administration.", civilian: "Operations Coordinator" },
  { code: "3E9X1", title: "Emergency Management", mage: "General 62", note: "Readiness planning, hazard response, and installation exercises.", civilian: "Business Continuity Specialist" },
  { code: "2S0X1", title: "Materiel Management", mage: "Administrative 41", note: "Supply accountability, distribution, and inventory control.", civilian: "Logistics Coordinator" },
  { code: "6F0X1", title: "Financial Management", mage: "Administrative 60", note: "Budget execution, disbursement, and financial services.", civilian: "Program Analyst" },
  { code: "5R0X1", title: "Chaplain Assistant", mage: "Administrative 41", note: "Program coordination, counseling support, and resiliency programs.", civilian: "Training Specialist" },
];

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
