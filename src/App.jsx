import { useEffect, useMemo, useState } from "react";
import { calculatePlanProgress, matchAirForcePaths, searchSkillCatalog, togglePlanItem } from "./domain/missionproof.js";

const stepLabels = [
  "Starting Point",
  "Explore Air Force Paths",
  "My Translation",
  "Competency Profile",
  "Civilian Roles",
  "Federal Match",
  "Jobs & Bases Map",
  "Apprenticeships",
  "Credential Recon",
  "Search by Skill",
  "Transition Plan",
];

const supportedSteps = new Set(stepLabels.map((_, index) => index));

const stepPaths = [
  "/app",
  "/app/retrain",
  "/app/translation",
  "/app/competencies",
  "/app/civilian",
  "/app/federal",
  "/app/jobs-bases",
  "/app/apprenticeships",
  "/app/credentials",
  "/app/competency-search",
  "/app/itp",
];

const goals = [
  { name: "Separating / TAPs", description: "Map your gaps, bridge them with credentials & education, and build your Transition Plan (ITP).", icon: "target" },
  { name: "First-term Airman", description: "Lock in the competencies you’ve earned and plan what to build next.", icon: "leaf" },
  { name: "Retraining", description: "See which AFSCs you qualify for based on your MAGE scores.", icon: "retrain" },
  { name: "Federal & civilian jobs", description: "Translate your Air Force experience into hiring language.", icon: "federal" },
  { name: "Credentials & licensing", description: "Find certifications matched to your real competencies.", icon: "credentials" },
];

const iconSources = {
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

const civilianFields = [
  ["Best fits", "Across all fields"], ["Operations", "Mission execution"], ["Program management", "Plans and delivery"],
  ["Cyber & IT", "Systems and security"], ["Logistics", "Supply and readiness"], ["Training", "Instruction and development"],
];

const federalLenses = [
  "Medical / health", "Intelligence analysis", "Cyber / IT", "Program management", "Management and program analysis",
  "Contracting / acquisition", "Budget / financial management", "Logistics / supply", "Training instruction",
  "Safety / emergency management", "Security / investigations", "Aviation / technical", "Human resources",
  "Weather", "Public affairs", "Fire protection", "Aircraft maintenance", "Skilled trades (WG)",
];

const credentialLanes = [
  "Project / Program", "Acquisition / Contracting", "Budget / Finance", "Cyber / IT",
  "Process / Quality", "Training / Instruction", "Safety / Emergency", "Logistics / Supply",
];

const credentialCatalog = [
  { name: "Project Management Professional (PMP)", provider: "PMI", lane: "Project / Program", note: "Project leadership, schedules, risks, and stakeholder coordination." },
  { name: "FAC-C (Professional)", provider: "Federal Acquisition Institute", lane: "Acquisition / Contracting", note: "Federal acquisition and contracting research lead." },
  { name: "Certified Defense Financial Manager", provider: "ASMC", lane: "Budget / Finance", note: "Defense financial management, budget, and resource accountability." },
  { name: "CompTIA Security+", provider: "CompTIA", lane: "Cyber / IT", note: "Baseline cybersecurity concepts, operations, and risk controls." },
  { name: "Lean Six Sigma Green Belt", provider: "IASSC-aligned", lane: "Process / Quality", note: "Process analysis, measurable improvement, and quality control." },
  { name: "Certified Professional in Talent Development", provider: "ATD", lane: "Training / Instruction", note: "Instructional delivery, learning programs, and workforce development." },
  { name: "Certified Safety Professional", provider: "BCSP", lane: "Safety / Emergency", note: "Safety programs, hazard controls, and risk reduction." },
  { name: "Certified in Logistics, Transportation and Distribution", provider: "ASCM", lane: "Logistics / Supply", note: "Logistics planning, distribution, and supply-chain operations." },
];

const airForcePaths = [
  { afsc: "1D7X1", title: "Cyber Defense Operations", family: "Cyber & Intelligence", scores: { M: 45, A: 41, G: 64, E: 70 }, note: "Protect networks, operate enterprise systems, and respond to cyber incidents." },
  { afsc: "1N0X1", title: "All Source Intelligence Analyst", family: "Cyber & Intelligence", scores: { M: 0, A: 0, G: 62, E: 0 }, note: "Synthesize intelligence, brief leaders, and support operational decisions." },
  { afsc: "1C5X1", title: "Command and Control Battle Management", family: "Operations", scores: { M: 0, A: 0, G: 55, E: 0 }, note: "Coordinate command-and-control systems and build a shared operational picture." },
  { afsc: "2G0X1", title: "Logistics Plans", family: "Logistics", scores: { M: 0, A: 56, G: 0, E: 0 }, note: "Plan force movement, readiness, deployment, and logistics support." },
  { afsc: "2T2X1", title: "Air Transportation", family: "Logistics", scores: { M: 47, A: 0, G: 0, E: 0 }, note: "Move passengers and cargo safely through military air terminals." },
  { afsc: "3E5X1", title: "Engineering", family: "Technical & Engineering", scores: { M: 0, A: 0, G: 49, E: 0 }, note: "Survey, draft, inspect, and support installation engineering projects." },
];

const skillSearchCatalog = [
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

const mapDatasets = [
  { label: "All collected (14,208)", value: "all", count: "14,208", top: "Texas (1311)", remote: "696" },
  { label: "All private-sector postings (9,403)", value: "private", count: "9,403", top: "Texas (842)", remote: "411" },
  { label: "Federal (USAJOBS) (4,024)", value: "federal", count: "4,024", top: "Virginia (492)", remote: "257" },
  { label: "Data Center Tech (473)", value: "data-center", count: "473", top: "Virginia (68)", remote: "19" },
  { label: "Software Engineering (177)", value: "software", count: "177", top: "Washington (35)", remote: "28" },
  { label: "Wind Turbine Tech (107)", value: "wind", count: "107", top: "Texas (21)", remote: "4" },
];

const mapRegions = [
  ["#1", "Texas", "94", "1,311 jobs · 192,587 personnel", "Oilfield Operations", "Joint Base San Antonio – Lackland"],
  ["#2", "California", "76", "765 jobs · 216,603 personnel", "HVAC Mechanic", "MCB Camp Pendleton"],
  ["#3", "Virginia", "62", "740 jobs · 148,388 personnel", "Miscellaneous Administration And Program", "Naval Station Norfolk"],
  ["#4", "Florida", "49", "591 jobs · 117,273 personnel", "HVAC Mechanic", "Eglin AFB"],
  ["#5", "North Carolina", "43", "420 jobs · 123,510 personnel", "Operating Engineer", "Fort Bragg"],
  ["#6", "Washington", "42", "669 jobs · 75,719 personnel", "Software Engineering", "Joint Base Lewis-McChord"],
];

const mapStateRows = [
  ["Texas", "1,311"], ["California", "765"], ["Virginia", "740"], ["Washington", "669"], ["Florida", "591"],
  ["Ohio", "492"], ["New York", "468"], ["Georgia", "460"], ["Illinois", "427"], ["North Carolina", "420"],
  ["Arizona", "389"], ["D.C.", "384"], ["Maryland", "384"], ["Colorado", "380"], ["Pennsylvania", "314"],
];

const civilianResults = {
  "Best fits": [
    ["Operations Coordinator", "Strong transfer", "Planning, cross-team coordination, and mission execution map directly."],
    ["Project Coordinator", "Good fit", "Your service evidence supports schedules, stakeholders, and risk tracking."],
    ["Training Specialist", "Build one gap", "Instructional experience transfers; add a civilian training credential."],
  ],
  Operations: [["Operations Manager", "Good fit", "Mission planning, readiness, and team leadership are the strongest evidence edges."], ["Business Continuity Specialist", "Explore", "Contingency thinking and disciplined execution create a credible bridge."]],
  "Program management": [["Project Manager", "Good fit", "Translate plans, milestones, risks, and after-action improvements into delivery language."], ["Program Analyst", "Explore", "Add portfolio reporting and budget evidence to strengthen this match."]],
  "Cyber & IT": [["IT Support Specialist", "Explore", "Systems troubleshooting transfers; validate technical certifications for the posting."], ["Cybersecurity Analyst", "Build first", "A baseline security credential may be required."]],
  Logistics: [["Logistics Coordinator", "Strong transfer", "Inventory accountability and readiness translate well."], ["Supply Chain Analyst", "Explore", "Pair operational evidence with data-analysis examples."]],
  Training: [["Learning & Development Specialist", "Good fit", "Briefing, qualification, and coaching experience map directly."], ["Technical Trainer", "Strong transfer", "Your subject-matter expertise can become instructor evidence."]],
};

function Mark({ name, className = "" }) {
  return <img alt="" aria-hidden="true" className={`asset-icon icon-${name} ${className}`} src={iconSources[name]} />;
}

function Wordmark() {
  return <div className="brand-block" aria-label="MissionProof home"><div className="wordmark"><span>MISSION</span><span className="proof">PROOF</span></div><div className="tagline">Turn Mission Experience into Career Evidence</div></div>;
}

function Topbar({ activeStep = 0, onNavigate }) {
  return (
    <header className={`topbar ${onNavigate ? "dashboard-topbar" : ""}`}>
      <a className="skip-link" href="#main">Skip to main content</a>
      <button className="brand-button" type="button" onClick={() => onNavigate?.(0)}><Wordmark /></button>
      {onNavigate && <nav className="steps" aria-label="MissionProof progression">{stepLabels.map((step, index) => <button aria-current={activeStep === index ? "page" : undefined} className={`step ${activeStep === index ? "active" : ""} ${!supportedSteps.has(index) ? "future" : ""}`} key={step} type="button" onClick={() => onNavigate(index)}><span className="num">{index + 1}</span><span className="step-label">{step}</span></button>)}</nav>}
      <div className="topbar-right"><Mark name="help" /><Mark name="bell" /><div className="user-copy"><strong>MissionProof Beta</strong><span>This device</span></div><span className="af-badge"><Mark name="badge" /></span></div>
    </header>
  );
}

function JoinScreen({ onEnter }) {
  return <main className="mp-dashboard" id="main"><div className="shell join-shell"><Topbar /><section className="page-head"><div><p className="eyebrow">MissionProof Access</p><h1>Device access</h1><p className="lede">Open your MissionProof access link or QR once on this device to enroll for beta access.</p></div></section><div className="page-body legacy-form"><section className="access-card"><h2>Access accepted</h2><p>This browser/device is now enrolled. You should not need the QR again until this access pass expires or is revoked.</p><p>This browser is already enrolled for MissionProof beta access.</p><p><strong>Status:</strong> active-session</p><p><strong>Access valid until:</strong> 8/1/2026, 7:22:03 AM</p><button className="enter-button" type="button" onClick={onEnter}>Enter MissionProof</button></section><p className="warning">QR access links are time-limited access passes; they are not user accounts, proof of eligibility, or downloadable products.</p><p className="warning">MissionProof permits only allow-listed internal landing paths to prevent open redirects.</p></div></div></main>;
}

function AppPage({ activeStep, eyebrow, title, lede, onNavigate, children }) {
  return <main className="mp-dashboard dashboard" id="main"><div className="shell"><Topbar activeStep={activeStep} onNavigate={onNavigate} /><div className="content-wrap">{title && <section className="feature-head"><p className="eyebrow">{eyebrow}</p><h1>{title}</h1><p>{lede}</p></section>}{children}</div></div></main>;
}

function StartingPoint({ selectedGoal, profile, onProfile, onReset, onNavigate }) {
  const complete = Object.values(profile).filter(Boolean).length;
  const percent = Math.round((complete / 5) * 100);
  return <AppPage activeStep={0} eyebrow="Starting Point" title="" lede="" onNavigate={onNavigate}><section className="guided-panel"><div className="profile-hex"><Mark name="user-large" /></div><div className="guided-copy"><p className="eyebrow">Starting Point</p><h1>Guided Setup — You&apos;re in Control</h1><p>Confirm a few service facts so MissionProof can build your profile and surface the right opportunities.</p></div><div className="field"><span>Current AFSC</span><strong>{profile.afsc || "Not set"}</strong><small>{profile.afsc ? "Primary specialty" : "Open Update Profile to set"}</small></div><div className="field"><span>Skill Level</span><strong>{profile.skill || "Not set"}</strong><small>{profile.skill ? "Recorded" : "—"}</small></div><div className="field"><span>Career Stage</span><strong>{profile.rank || "Not set"}</strong><small>{profile.rank ? `${profile.years || 0} yrs` : "—"}</small></div><label className="field goal-select"><span>Goal</span><select value={selectedGoal} onChange={() => {}}><option value="">Choose a goal</option>{goals.map(goal => <option key={goal.name}>{goal.name}</option>)}</select><small>What do you want to do?</small></label><div className="target-block"><span>Your target</span><button type="button" onClick={() => onNavigate(4)}>Pick a target →</button><small>Explore credentials, a federal/civilian role, or run a gap analysis.</small></div><div className="completion"><div><span>Profile Completion</span><strong>{percent}%</strong></div><div className="progress"><i style={{ width: `${Math.max(3, percent)}%` }} /></div><p>{percent === 100 ? "Your core service facts are ready." : <>To finish, add: <strong>Primary AFSC, Rank, Skill level, Education…</strong></>}</p><button type="button" className="compact-primary" onClick={onProfile}>Input MissionProof</button><div className="dev-controls"><button type="button" onClick={onProfile}>Update profile</button><span>·</span><button type="button" onClick={onReset}>Reset device data</button></div></div></section><section className="dashboard-grid"><article className="dash-card"><span className="eyebrow">Best for LinkedIn</span><strong>{percent ? "Your profile is ready to grow" : "Build your profile first"}</strong><p>Your strongest evidence-backed skills become a copy-paste LinkedIn block here.</p></article><article className="dash-card"><span className="eyebrow">Mission readiness</span><strong>{percent ? "Keep translating your evidence" : "Start with your service facts"}</strong><p>MissionProof uses the facts you add to tailor every recommendation.</p><button className="text-link" type="button" onClick={() => onNavigate(2)}>View my translation →</button></article></section></AppPage>;
}

function Translation({ profileReady, onNavigate }) {
  return <AppPage activeStep={2} eyebrow="My Competency Translation" title="What your Air Force experience means" lede="Your service translated into civilian, federal, and project-management competency language — what transfers, and your honest gaps. Planning guidance only." onNavigate={onNavigate}>{profileReady ? <div className="translation-grid"><InfoCard label="Service evidence" title="Operational planning" copy="Plans, coordinates, and executes time-sensitive work under defined standards." /><InfoCard label="Civilian language" title="Cross-functional delivery" copy="Turns priorities into schedules, aligns stakeholders, and tracks work to completion." /><InfoCard label="Honest gap" title="Commercial context" copy="Add examples that show budgets, customers, and business outcomes." /></div> : <ProfileWarning onNavigate={onNavigate} />}<PageActions leftLabel="Profile" leftStep={0} rightLabel="Next: Competency Profile →" rightStep={3} onNavigate={onNavigate} /></AppPage>;
}

function ExploreAirForcePaths({ profile, onProfile, onNavigate }) {
  const [scores, setScores] = useState({ M: 65, A: 72, G: 74, E: 68 });
  const [appliedScores, setAppliedScores] = useState(scores);
  const [family, setFamily] = useState("All paths");
  const families = ["All paths", "Operations", "Cyber & Intelligence", "Logistics", "Technical & Engineering"];
  const results = matchAirForcePaths(airForcePaths, appliedScores, family);

  return <AppPage activeStep={1} eyebrow="Explore Air Force Paths" title="See where your MAGE scores can take you" lede="Compare your recorded ASVAB composites with example Air Force specialty thresholds, then explore paths that fit now and the closest options to research. Planning guidance only." onNavigate={onNavigate}>
    <div className="guidance-note path-guidance">Qualification rules change and can include medical, clearance, strength, citizenship, rank, and retraining-window requirements. Confirm every path with your career assistance advisor.</div>
    <section className="path-workspace">
      <div className="score-panel">
        <div className="section-title-row"><div><p className="eyebrow">Your qualification snapshot</p><h2>Enter MAGE scores</h2></div><span>{profile.afsc || "AFSC not set"}</span></div>
        <p>Use your latest official scores. MissionProof keeps these values in this prototype only while the page is open.</p>
        <div className="score-grid">{Object.entries(scores).map(([area, value]) => <label key={area}><span><b>{area}</b>{({ M: "Mechanical", A: "Administrative", G: "General", E: "Electrical" })[area]}</span><input aria-label={`${area} composite score`} type="number" min="1" max="99" value={value} onChange={event => setScores(current => ({ ...current, [area]: Math.max(1, Math.min(99, Number(event.target.value))) }))} /></label>)}</div>
        <div className="score-actions"><button type="button" onClick={() => setAppliedScores(scores)}>Run path match</button><button type="button" onClick={onProfile}>{profile.afsc ? "Update service profile" : "Add current AFSC"}</button></div>
      </div>
      <aside className="path-summary"><p className="eyebrow">Current view</p><strong>{results.filter(item => item.gaps.length === 0).length}</strong><span>score-aligned paths</span><dl><div><dt>Strongest composite</dt><dd>{Object.entries(appliedScores).sort((a, b) => b[1] - a[1])[0].join(" · ")}</dd></div><div><dt>Career family</dt><dd>{family}</dd></div></dl></aside>
    </section>
    <section className="path-results" aria-live="polite">
      <div className="path-filter-row"><div><p className="eyebrow">Path explorer</p><h2>Your score alignment</h2></div><label>Career family<select value={family} onChange={event => setFamily(event.target.value)}>{families.map(item => <option key={item}>{item}</option>)}</select></label></div>
      <div className="path-card-grid">{results.map(path => <article className={`path-card ${path.gaps.length ? "near" : "eligible"}`} key={path.afsc}><div><span className="fit-pill">{path.gaps.length ? `${path.gaps.length} score gap` : "Score aligned"}</span><b>{path.family}</b></div><p className="path-code">{path.afsc}</p><h3>{path.title}</h3><p>{path.note}</p><div className="requirements">{Object.entries(path.scores).filter(([, value]) => value > 0).map(([area, value]) => <span className={Number(appliedScores[area]) >= value ? "met" : "gap"} key={area}>{area} {value}</span>)}</div>{path.gaps.length ? <small>Closest gap: {path.gaps[0].area} needs {path.gaps[0].required}; current {path.gaps[0].actual}.</small> : <small>Your entered composites meet the displayed score threshold.</small>}</article>)}</div>
    </section>
    <PageActions leftLabel="← Starting Point" leftStep={0} rightLabel="Next: My Translation →" rightStep={2} onNavigate={onNavigate} />
  </AppPage>;
}

function CompetencyMap({ profileReady, onNavigate }) {
  const strengths = ["Operational planning", "Team leadership", "Risk management", "Training & development", "Process improvement", "Technical communication"];
  return <AppPage activeStep={3} eyebrow="Competency Profile" title="Your competency strengths, in civilian language" lede="Your Air Force service, translated into civilian competency areas and ranked by how strongly your experience builds each — strengths up top, development areas at the bottom." onNavigate={onNavigate}><div className="instruction-card"><strong>Next step — collect your strengths.</strong> Open any strength below and tap <b>→ pathways</b> to add it to your basket. Pathways from my strengths walks you through your civilian roles, series, and credentials — ending at your ITP.</div>{profileReady ? <div className="strength-list">{strengths.map((strength, index) => <details className="strength-card" key={strength} open={index === 0}><summary><span><b>{String(index + 1).padStart(2, "0")}</b>{strength}</span><em>{Math.max(58, 92 - index * 7)}% evidence</em></summary><p>{index < 2 ? "Strong, repeated evidence across mission planning and team execution." : "Relevant evidence found. Add a specific achievement to strengthen this competency."}</p><button type="button" onClick={() => onNavigate(4)}>Add → pathways</button></details>)}</div> : <ProfileWarning onNavigate={onNavigate} />}<PageActions leftLabel="← Profile" leftStep={0} rightLabel="Continue to Civilian Roles →" rightStep={4} onNavigate={onNavigate} /></AppPage>;
}

function CivilianMatch({ profile, onNavigate }) {
  const [field, setField] = useState("Best fits");
  const results = civilianResults[field] || civilianResults["Best fits"];
  return <AppPage activeStep={4} eyebrow="Civilian Role Match" title="What civilian jobs fit your experience?" lede="MissionProof matches your competencies, education, and experience to private-sector roles — and shows where you already qualify versus what to build. Planning guidance only." onNavigate={onNavigate}><div className="guidance-note">Planning guidance only — real hiring requirements vary by employer and posting. Verify against the actual job description.</div><section className="section-block"><h2>What kind of work interests you?</h2><p>Tap a field to see the civilian roles in it — where you already qualify, and what to build. Using: <strong>{profile.afsc || "AFSC not set"} / {profile.education || "education not set"} / {profile.years || 0} yrs</strong></p><div className="choice-grid civilian-choices">{civilianFields.map(([name, sub]) => <button className={field === name ? "selected" : ""} type="button" key={name} onClick={() => setField(name)}><span className="choice-mark"><Mark name={name === "Best fits" ? "target" : "federal"} /></span><span><strong>{name}</strong><small>{sub}</small></span></button>)}</div></section><section className="results-section" aria-live="polite"><div className="results-head"><div><p className="eyebrow">Matched pathways</p><h2>{field}</h2></div><span>{results.length} roles</span></div><div className="result-grid">{results.map(([title, fit, copy]) => <article className="result-card" key={title}><div><span className="fit-pill">{fit}</span><button type="button" aria-label={`Save ${title}`}>Save</button></div><h3>{title}</h3><p>{copy}</p><button type="button" onClick={() => onNavigate(5)}>Compare federal path →</button></article>)}</div></section><PageActions leftLabel="← Back" leftStep={3} rightLabel="Next: Federal Match →" rightStep={5} onNavigate={onNavigate} /></AppPage>;
}

function FederalMatch({ profile, onNavigate }) {
  const [lens, setLens] = useState("Intelligence analysis");
  const [query, setQuery] = useState("Intelligence analysis");
  const [ran, setRan] = useState(false);
  const run = () => { setLens(query.trim() || lens); setRan(true); };
  return <AppPage activeStep={5} eyebrow="Federal Match" title="Where does your evidence map?" lede="Federal Match uses official series deep-dive data, AFSC/CFETP federal edges, credential gates, and veteran authority prompts. It is planning only, not an eligibility decision." onNavigate={onNavigate}><details className="disclaimer"><summary>Planning guidance &amp; disclaimers — tap to read</summary><p>Series suggestions are research starting points. Always verify grade, education, experience, and hiring-path requirements in the official announcement.</p></details><section className="section-block"><h2>Choose a federal pathway lens</h2><p>Using profile: <strong>{profile.afsc || "AFSC not set"} / {profile.rank || "rank not set"} / {profile.skill || "skill level not set"}</strong></p><div className="federal-layout"><div className="choice-grid federal-choices">{federalLenses.map(name => <button className={lens === name ? "selected" : ""} type="button" key={name} onClick={() => { setLens(name); setQuery(name); setRan(false); }}><span className="agency-mark"><Mark name="federal" /></span><span><strong>{name}</strong><small>Run series + evidence match</small></span></button>)}</div><aside className="search-panel"><p className="eyebrow">Custom federal search</p><label>Series, field, or target<input value={query} onChange={event => { setQuery(event.target.value); setRan(false); }} placeholder="0132, 2210, contracting, budget, safety, training" /></label><button type="button" onClick={run}>Run + Save Federal Match</button><small>0 targeted for ITP</small>{ran && <div className="federal-result"><span className="fit-pill">Research lead</span><h3>{/^\d{4}$/.test(query) ? `${query} occupational series` : query}</h3><p>Evidence mapping saved. Review a live USAJOBS announcement to confirm requirements, grade, and specialized experience.</p></div>}</aside></div></section>{!ran && <div className="empty-note">No federal role cards returned. Try a broader target path like intelligence, cyber, program analysis, logistics, safety, emergency management, contracting, or budget.</div>}<PageActions leftLabel="← Back" leftStep={4} rightLabel="Next: Credential Recon →" rightStep={8} onNavigate={onNavigate} /></AppPage>;
}

function HeatmapExplorer() {
  const [dataset, setDataset] = useState("all");
  const [view, setView] = useState("map");
  const [showBases, setShowBases] = useState(false);
  const [showCities, setShowCities] = useState(false);
  const [payLens, setPayLens] = useState(false);
  const [selectedState, setSelectedState] = useState("");
  const selectedDataset = mapDatasets.find(item => item.value === dataset) || mapDatasets[0];

  return (
    <section className="market-map" aria-label="Jobs, federal openings, and military bases map">
      <div className="map-intro">
        <p className="eyebrow">MissionProof · Market Collection × Federal × Military Supply</p>
        <h2>Jobs, Federal Openings &amp; Military Bases by Region</h2>
        <p>Brighter = more collected job records per state (demand). Use the selector to isolate a job type or federal openings. Toggle <strong>Bases</strong> for military installations — AF, Space Force, Army, Navy, USMC — sized by personnel (supply); <strong>Regions</strong> ranks states by supply × demand. Click any state to drill in.</p>
      </div>

      <div className="map-summary-row">
        <div className="map-stats">
          <div><strong>{selectedDataset.count}</strong><span>Jobs shown</span></div>
          <div><strong>51</strong><span>States covered</span></div>
          <div><strong>{selectedDataset.top}</strong><span>Top job state</span></div>
          <div><strong>{selectedDataset.remote}</strong><span>Remote / national</span></div>
        </div>
        <div className="map-controls">
          <label className="sr-only" htmlFor="map-dataset">Map dataset</label>
          <select id="map-dataset" value={dataset} onChange={event => { setDataset(event.target.value); setSelectedState(""); }}>
            {mapDatasets.map(item => <option value={item.value} key={item.value}>{item.label}</option>)}
          </select>
          <button type="button" className={payLens ? "active" : ""} onClick={() => setPayLens(value => !value)}>Pay lens</button>
          <button type="button" className={showBases ? "active" : ""} onClick={() => setShowBases(value => !value)}>Bases</button>
          <button type="button" className={showCities ? "active" : ""} onClick={() => setShowCities(value => !value)}>Cities</button>
          <button type="button" className={view === "regions" ? "active" : ""} onClick={() => setView(view === "regions" ? "map" : "regions")}>Regions</button>
          <button type="button" className={view === "table" ? "active" : ""} onClick={() => setView(view === "table" ? "map" : "table")}>Table</button>
        </div>
      </div>

      {view === "regions" ? (
        <div className="region-view" aria-live="polite">
          <p>Top regions by opportunity — supply (military personnel) × demand (collected jobs). Select a card to drill in.</p>
          <div className="region-cards">
            {mapRegions.map(([rank, state, score, metrics, role, base]) => (
              <button type="button" key={state} onClick={() => { setSelectedState(state); setView("map"); }}>
                <span>{rank}</span><strong>{state}</strong><em>{score}</em><small>Region score</small><p>{metrics}</p><p>Top role: {role}</p><p>Top base: {base}</p>
              </button>
            ))}
          </div>
        </div>
      ) : view === "table" ? (
        <div className="map-table-wrap" aria-live="polite">
          <table><thead><tr><th>State</th><th>Collected jobs</th></tr></thead><tbody>{mapStateRows.map(([state, jobs]) => <tr key={state}><td><button type="button" onClick={() => { setSelectedState(state); setView("map"); }}>{state}</button></td><td>{jobs}</td></tr>)}</tbody></table>
        </div>
      ) : (
        <div className="map-workspace">
          <div className="map-canvas">
            <button type="button" className="map-image-button" onClick={() => setSelectedState("Texas")} aria-label="Open Texas job and base details">
              <img src="/assets/heatmap-us.png" alt="United States job demand heatmap with Texas as the strongest collected-job market" />
            </button>
            <div className="jobs-legend"><span>fewer jobs</span><i /><span>more</span></div>
            <div className="service-legend"><span>Filter bases by service:</span>{["AF", "Space Force", "Army", "Navy", "USMC", "Joint"].map(service => <button className={showBases ? "on" : ""} type="button" key={service} onClick={() => setShowBases(true)}><i />{service}</button>)}</div>
          </div>
          <aside className="map-detail-panel" aria-live="polite">
            {selectedState ? <><p className="eyebrow">State drill-in</p><h3>{selectedState}</h3><strong>{selectedState === "Texas" ? "1,311" : "Collected jobs"}</strong><span>collected opportunities</span><dl><div><dt>Top role</dt><dd>{selectedState === "Texas" ? "Oilfield Operations" : "Program Management"}</dd></div><div><dt>Top city</dt><dd>{selectedState === "Texas" ? "Dallas–Fort Worth" : "Regional market"}</dd></div><div><dt>Top base</dt><dd>{selectedState === "Texas" ? "Joint Base San Antonio – Lackland" : "View installation mix"}</dd></div></dl><button type="button" onClick={() => setSelectedState("")}>Back to map</button></> : <><p>Click a state to drill in →</p><span>Occupation mix, top cities, top employers, listings — plus the military bases in that state.</span>{payLens && <div className="map-callout"><strong>Pay lens</strong><span>Published ranges only; hourly and estimated pay are excluded.</span></div>}{showCities && <div className="map-callout"><strong>Top cities</strong><span>Dallas–Fort Worth · Washington, D.C. · Seattle · Austin</span></div>}{showBases && <div className="map-callout"><strong>112 installations</strong><span>Air Force, Space Force, Army, Navy, USMC, and Joint.</span></div>}</>}
          </aside>
        </div>
      )}
      <p className="map-method">Reading it: brighter = more collected job records in that state; military installations are grouped by service and relative personnel. Region score combines job-demand share with military-personnel share. Coverage reflects collected postings, not total labor demand — a planning signal, not a hiring guarantee. July 2026.</p>
    </section>
  );
}

function JobsBasesMap({ onNavigate }) {
  const [expanded, setExpanded] = useState(false);
  return <AppPage activeStep={6} eyebrow="Jobs & Military Bases" title="Where the jobs are — and where the bases are" lede="Collected job records and federal (USAJOBS) openings by state, alongside 112 military installations across all services. Toggle Bases, drill into any state, or rank regions by supply × demand." onNavigate={onNavigate}><div className="map-open-row"><span>Best viewed with room to explore.</span><button type="button" onClick={() => setExpanded(true)}>Open full-screen map</button></div><div className={expanded ? "map-expanded" : ""}>{expanded && <button className="map-exit" type="button" onClick={() => setExpanded(false)}>Return to progression</button>}<HeatmapExplorer /></div><PageActions leftLabel="← Federal Match" leftStep={5} rightLabel="Next: Apprenticeships →" rightStep={7} onNavigate={onNavigate} /></AppPage>;
}

function Apprenticeships({ profile, onProfile, onNavigate }) {
  return <AppPage activeStep={7} eyebrow="Registered Apprenticeships" title="DOL apprenticeship pathways for your AFSC" lede="USMAP excludes the Air Force — this maps your AFSC directly to DOL Registered Apprenticeship standards, so your military experience can count toward a civilian apprenticeship." onNavigate={onNavigate}><section className="apprenticeship-panel">{profile.afsc ? <div className="apprenticeship-ready"><p className="eyebrow">AFSC recorded</p><h2>{profile.afsc}</h2><p>Your AFSC is ready for a Department of Labor standards lookup. Live registry matching is not included in this frontend prototype.</p><button type="button" onClick={onProfile}>Update AFSC</button></div> : <div className="apprenticeship-empty"><strong>Set your AFSC in your profile first.</strong><button type="button" onClick={onProfile}>Open profile</button></div>}</section><PageActions leftLabel="← Jobs & Bases Map" leftStep={6} rightLabel="Next: Credential Recon →" rightStep={8} onNavigate={onNavigate} /></AppPage>;
}

function CredentialRecon({ profile, planItems, onTogglePlan, onProfile, onNavigate }) {
  const [lane, setLane] = useState("");
  const [query, setQuery] = useState("");
  const [searched, setSearched] = useState(false);
  const filtered = credentialCatalog.filter(item => {
    const needle = query.trim().toLowerCase();
    return (!lane || item.lane === lane) && (!needle || `${item.name} ${item.provider} ${item.lane}`.toLowerCase().includes(needle));
  });
  const chooseLane = nextLane => { setLane(nextLane === lane ? "" : nextLane); setSearched(true); };
  const credentialPlanItem = item => ({ id: `credential-${item.name}`, type: "Credential", title: item.name, detail: item.note });
  const isSaved = item => planItems.some(savedItem => savedItem.id === `credential-${item.name}`);

  return <AppPage activeStep={8} eyebrow="Credential Recon" title="Credentials matched to you" lede={<>MissionProof matches credentials to your <strong>actual competencies</strong> (CFETP + PME + duties) and lists what AF COOL identifies for your AFSC. Credentials are research leads until you verify status and applied proof.</>} onNavigate={onNavigate}>
    <section className="credential-overview">
      <div className="plan-count"><strong>{planItems.length}</strong><span>in your plan</span></div>
      <p>Credential-provider and AF COOL records are discovery signals. They do not prove competency, determine official eligibility, or close protected gaps by themselves.</p>
      <div className="credential-profile-note">{profile.afsc ? <>Using AFSC <strong>{profile.afsc}</strong>. Credential matches remain research leads until you verify current AF COOL eligibility and provider requirements.</> : <>Set your AFSC and competencies in your profile first — then MissionProof matches credentials to what you&apos;ve actually developed. <button type="button" onClick={onProfile}>Open profile</button></>}</div>
    </section>

    <details className="credential-details funding-guide">
      <summary><strong>How to actually get a credential funded (AF COOL)</strong> — the part the cards don&apos;t show</summary>
      <ol>
        <li><strong>Confirm eligibility</strong> — the credential must be listed for your AFSC on AF COOL, and you must complete it while on active duty.</li>
        <li><strong>Request funding through the AF COOL portal (via AFVEC)</strong> — select the credential, build the funding request, and route it for approval. Your base education office can walk you through it.</li>
        <li><strong>Mind the clock</strong> — confirm the current funding and separation timelines with your base education office.</li>
        <li><strong>Complete and document</strong> — finish before separation and record the completion as evidence in your Transition Plan.</li>
      </ol>
      <p>Planning guidance — confirm current rules and the exact request flow with your base education office or A&amp;FRC.</p>
    </details>

    <section className="credential-section">
      <p className="eyebrow">Matched to your competencies</p>
      <h2>{profile.afsc ? "2 credentials match your experience" : "0 credentials match your experience"}</h2>
      <p>Ranked by strength of match against your competencies and PME — strongest first. Green means you meet the degree requirement; “Needs degree” marks one you haven&apos;t recorded.</p>
      {profile.afsc ? <div className="credential-cards">{credentialCatalog.slice(0,2).map(item => <CredentialCard item={item} saved={isSaved(item)} onToggle={() => onTogglePlan(credentialPlanItem(item))} key={item.name} />)}</div> : <p className="credential-empty">Add competencies to your profile to see matched credentials.</p>}
    </section>

    <section className="credential-section">
      <p className="eyebrow">Credentials for your AFSC</p>
      <h2>{profile.afsc ? "2 AF COOL research leads for your AFSC" : "0 AF COOL credentials for your AFSC"}</h2>
      <p>Every credential AF COOL identifies for your career field. In-demand listed first.</p>
      <p className="credential-info">AF COOL publishes these at the <strong>career-field level</strong>, so Airmen across the shreds of your AFSC see the same set. Your <strong>competency matches above</strong> are what&apos;s specific to you.</p>
      {!profile.afsc && <p className="credential-empty">AF COOL doesn&apos;t publish a credential list for this AFSC. Use the competency matches above — they&apos;re grounded in what you actually do.</p>}
    </section>

    <details className="credential-details credential-search">
      <summary>Search all credentials (by keyword or lane)</summary>
      <div className="lane-grid">{credentialLanes.map(item => <button type="button" className={lane === item ? "selected" : ""} onClick={() => chooseLane(item)} key={item}><strong>{item}</strong></button>)}</div>
      <form className="credential-search-form" onSubmit={event => { event.preventDefault(); setSearched(true); }}>
        <label htmlFor="recon-cred-search">Search credentials<input id="recon-cred-search" value={query} onChange={event => { setQuery(event.target.value); setSearched(false); }} placeholder="Security+, FAC-C, CDFM, Green Belt" /></label>
        <button type="submit">Search</button>
      </form>
      {searched && <div className="credential-search-results" aria-live="polite"><div className="credential-search-head"><strong>{filtered.length} credential{filtered.length === 1 ? "" : "s"} found</strong>{(lane || query) && <button type="button" onClick={() => { setLane(""); setQuery(""); setSearched(false); }}>Clear search</button>}</div>{filtered.length ? <div className="credential-cards">{filtered.map(item => <CredentialCard item={item} saved={isSaved(item)} onToggle={() => onTogglePlan(credentialPlanItem(item))} key={item.name} />)}</div> : <p className="credential-empty">No credentials match that search. Try a lane or a broader keyword.</p>}</div>}
    </details>
    <div className="page-actions credential-page-actions"><button type="button" className="primary-action" onClick={() => onNavigate(9)}>Next: Search by Skill →</button><button type="button" className="secondary-action" onClick={() => onNavigate(5)}>Federal Match</button></div>
  </AppPage>;
}

function CredentialCard({ item, saved, onToggle }) {
  return <article className="credential-card"><div><span>{item.lane}</span><button type="button" className={saved ? "saved" : ""} onClick={onToggle}>{saved ? "In plan" : "Add to plan"}</button></div><h3>{item.name}</h3><p>{item.provider}</p><p>{item.note}</p></article>;
}

function SearchBySkill({ planItems, onTogglePlan, onNavigate }) {
  const [query, setQuery] = useState("planning");
  const [activeQuery, setActiveQuery] = useState("planning");
  const [type, setType] = useState("All pathways");
  const skillPrompts = ["planning", "leadership", "cyber", "training", "logistics", "risk management"];
  const results = searchSkillCatalog(skillSearchCatalog, activeQuery, type);
  const submit = event => { event?.preventDefault(); setActiveQuery(query.trim()); };

  return <AppPage activeStep={9} eyebrow="Search by Skill" title="Start with what you can do" lede="Search a competency once, then compare how it appears across civilian roles, federal series, and credentials. Save the strongest leads directly to your Transition Plan." onNavigate={onNavigate}>
    <section className="skill-search-hero">
      <form onSubmit={submit}><label htmlFor="skill-search">Skill, capability, or work you enjoy</label><div><input id="skill-search" value={query} onChange={event => setQuery(event.target.value)} placeholder="Try planning, cyber, training, logistics, leadership…" /><button type="submit">Search pathways</button></div></form>
      <div className="skill-prompt-row"><span>Popular starting points</span>{skillPrompts.map(skill => <button type="button" className={activeQuery === skill ? "active" : ""} onClick={() => { setQuery(skill); setActiveQuery(skill); }} key={skill}>{skill}</button>)}</div>
    </section>
    <section className="skill-results" aria-live="polite">
      <div className="skill-results-head"><div><p className="eyebrow">Evidence pathways</p><h2>{results.length} matches for “{activeQuery || "all skills"}”</h2></div><label>Show<select value={type} onChange={event => setType(event.target.value)}>{["All pathways", "Civilian role", "Federal series", "Credential"].map(item => <option key={item}>{item}</option>)}</select></label></div>
      {results.length ? <div className="skill-result-list">{results.map(item => { const saved = planItems.some(savedItem => savedItem.id === item.id); return <article className="skill-result-card" key={item.id}><div className="skill-result-type"><span>{item.type}</span><i>{item.tags.slice(0, 2).join(" · ")}</i></div><div><h3>{item.title}</h3><p>{item.detail}</p></div><button type="button" className={saved ? "saved" : ""} onClick={() => onTogglePlan(item)}>{saved ? "Added to plan" : "+ Add to plan"}</button></article>; })}</div> : <div className="empty-note">No exact pathway match yet. Try a broader skill such as planning, leadership, cyber, training, or logistics.</div>}
    </section>
    <div className="plan-rail"><div><span>{planItems.length}</span><p><strong>pathway{planItems.length === 1 ? "" : "s"} in your plan</strong><small>Keep collecting leads, then turn them into dated actions.</small></p></div><button type="button" onClick={() => onNavigate(10)}>Open Transition Plan →</button></div>
    <PageActions leftLabel="← Credential Recon" leftStep={8} rightLabel="Next: Transition Plan →" rightStep={10} onNavigate={onNavigate} />
  </AppPage>;
}

function TransitionPlan({ profile, planItems, onTogglePlan, onProfile, onNavigate }) {
  const defaultTasks = [
    { id: "task-evidence", phase: "Now · 0–30 days", title: "Collect three mission-impact stories", detail: "Write the situation, your action, and a measurable outcome without sensitive details." },
    { id: "task-target", phase: "Next · 30–90 days", title: "Validate one target pathway", detail: "Compare your evidence with live role requirements and record the gaps." },
    { id: "task-credential", phase: "Before separation", title: "Confirm funding and credential timing", detail: "Verify current AF COOL rules with your education office before committing funds." },
    { id: "task-network", phase: "Launch", title: "Run a warm-introduction sprint", detail: "Schedule five conversations with people doing the work you want next." },
  ];
  const [completed, setCompleted] = useState(new Set());
  const [copied, setCopied] = useState(false);
  const profileFields = Object.values(profile).filter(Boolean).length;
  const progress = calculatePlanProgress(completed.size, planItems.length, profileFields);
  const toggleTask = id => setCompleted(current => { const next = new Set(current); next.has(id) ? next.delete(id) : next.add(id); return next; });
  const copyPlan = async () => {
    const content = ["MISSIONPROOF TRANSITION PLAN", ...planItems.map(item => `PATHWAY: ${item.title} — ${item.detail}`), ...defaultTasks.map(task => `${completed.has(task.id) ? "[x]" : "[ ]"} ${task.phase}: ${task.title}`)].join("\n");
    try { await navigator.clipboard.writeText(content); setCopied(true); window.setTimeout(() => setCopied(false), 1800); } catch { setCopied(false); }
  };

  return <AppPage activeStep={10} eyebrow="Individual Transition Plan" title="Turn your evidence into a transition plan" lede="Bring your saved pathways, honest gaps, and next actions into one working plan. MissionProof helps you organize the work; you own the decisions and official verification." onNavigate={onNavigate}>
    <section className="itp-overview">
      <div><p className="eyebrow">Plan readiness</p><h2>{progress}% ready to brief</h2><p>{planItems.length ? "Your evidence leads are connected to an action plan." : "Choose at least one target pathway so each action has a destination."}</p><div className="progress"><i style={{ width: `${Math.max(progress, 4)}%` }} /></div></div>
      <div className="itp-metrics"><div><strong>{planItems.length}</strong><span>Saved pathways</span></div><div><strong>{completed.size}/4</strong><span>Actions complete</span></div><div><strong>{profileFields}/5</strong><span>Profile facts</span></div></div>
      <div className="itp-actions"><button type="button" className="primary-action" onClick={copyPlan}>{copied ? "Copied" : "Copy plan"}</button><button type="button" className="secondary-action" onClick={() => window.print()}>Print / save PDF</button></div>
    </section>
    <section className="itp-section"><div className="section-title-row"><div><p className="eyebrow">Target pathways</p><h2>What you are building toward</h2></div><button type="button" onClick={() => onNavigate(9)}>+ Search by skill</button></div>{planItems.length ? <div className="itp-target-grid">{planItems.map(item => <article key={item.id}><span>{item.type}</span><h3>{item.title}</h3><p>{item.detail}</p><button type="button" onClick={() => onTogglePlan(item)}>Remove</button></article>)}</div> : <div className="itp-empty"><strong>No pathways saved yet.</strong><p>Search by skill or add a credential, then bring the strongest research lead here.</p><button type="button" onClick={() => onNavigate(9)}>Find a target pathway</button></div>}</section>
    <section className="itp-section"><div className="section-title-row"><div><p className="eyebrow">Action timeline</p><h2>Your next four moves</h2></div><span>{completed.size} complete</span></div><div className="itp-timeline">{defaultTasks.map((task, index) => <label className={completed.has(task.id) ? "complete" : ""} key={task.id}><input type="checkbox" checked={completed.has(task.id)} onChange={() => toggleTask(task.id)} /><i>{String(index + 1).padStart(2, "0")}</i><span><b>{task.phase}</b><strong>{task.title}</strong><small>{task.detail}</small></span></label>)}</div></section>
    <section className="itp-profile-check"><div><p className="eyebrow">Evidence foundation</p><h2>{profileFields >= 3 ? "Core service facts recorded" : "Your profile still needs evidence anchors"}</h2><p>Current profile: <strong>{profile.afsc || "AFSC missing"}</strong> · {profile.rank || "rank missing"} · {profile.skill || "skill level missing"} · {profile.education || "education missing"}</p></div><button type="button" onClick={onProfile}>Update profile</button></section>
    <PageActions leftLabel="← Search by Skill" leftStep={9} rightLabel="Back to Starting Point" rightStep={0} onNavigate={onNavigate} />
  </AppPage>;
}

function InfoCard({ label, title, copy }) { return <article className="info-card"><p className="eyebrow">{label}</p><h3>{title}</h3><p>{copy}</p></article>; }

function ProfileWarning({ onNavigate }) { return <div className="profile-warning"><strong>Set your profile first.</strong> Add your AFSC, rank, and PME on the <button type="button" onClick={() => onNavigate(0)}>profile page</button>, then come back to see your translation.</div>; }

function PageActions({ leftLabel, leftStep, rightLabel, rightStep, onNavigate }) { return <div className="page-actions"><button type="button" className="secondary-action" onClick={() => onNavigate(leftStep)}>{leftLabel}</button><button type="button" className="primary-action" onClick={() => onNavigate(rightStep)}>{rightLabel}</button></div>; }

function ConsentModal({ checked, onChecked, onContinue }) {
  return <div className="consent-scrim" role="dialog" aria-modal="true" aria-label="Before you start"><div className="consent-card"><h2>Before you start</h2><p>MissionProof is a career-planning tool in <strong>beta</strong>. Please review the fine print and confirm you agree before continuing.</p><label><input type="checkbox" checked={checked} onChange={event => onChecked(event.target.checked)} /><span>I&apos;ve read and agree to the <a href="#legal">Terms of Use</a>, <a href="#legal">Privacy Policy</a>, and <a href="#legal">Cookies &amp; local storage</a> notice, and I understand MissionProof is a <strong>beta</strong> — I won&apos;t enter sensitive, medical, classified, controlled, or operational information.</span></label><button type="button" disabled={!checked} onClick={onContinue}>Agree &amp; continue</button><p className="heads-up">Heads up: this is a frontend prototype — do not enter sensitive information.</p></div></div>;
}

function GoalsModal({ onChoose }) {
  return <div className="goal-scrim" role="presentation"><div className="goals-modal" role="dialog" aria-modal="true" aria-label="What brings you to MissionProof"><div className="onboard-hex"><Mark name="user-large" /></div><h2>What brings you to MissionProof?</h2><p>Pick your goal — we&apos;ll tailor your dashboard to it. You can change it anytime.</p><div className="goal-cards">{goals.map(goal => <button type="button" className="goal-card" key={goal.name} onClick={() => onChoose(goal.name)}><Mark name={goal.icon} /><strong>{goal.name}</strong><span>{goal.description}</span></button>)}</div><button type="button" className="explore-button" onClick={() => onChoose("Not sure yet")}>Just looking around →</button></div></div>;
}

function ProfileModal({ profile, onSave, onClose }) {
  const [draft, setDraft] = useState(profile);
  const set = (key, value) => setDraft(current => ({ ...current, [key]: value }));
  return <div className="goal-scrim" role="presentation"><form className="profile-modal" onSubmit={event => { event.preventDefault(); onSave(draft); }}><button className="modal-close" type="button" onClick={onClose}>Close</button><p className="eyebrow">MissionProof input</p><h2>Update your service profile</h2><p>Use general, unclassified service facts only.</p><div className="profile-form"><label>Primary AFSC<input value={draft.afsc} onChange={e => set("afsc", e.target.value)} placeholder="e.g. 1N0X1" /></label><label>Rank<select value={draft.rank} onChange={e => set("rank", e.target.value)}><option value="">Select rank</option><option>Airman</option><option>Staff Sergeant</option><option>Technical Sergeant</option><option>Master Sergeant</option><option>Officer</option></select></label><label>Skill level<select value={draft.skill} onChange={e => set("skill", e.target.value)}><option value="">Select level</option><option>3-level</option><option>5-level</option><option>7-level</option><option>9-level</option></select></label><label>Years of service<input type="number" min="0" max="40" value={draft.years} onChange={e => set("years", e.target.value)} /></label><label className="wide">Education<select value={draft.education} onChange={e => set("education", e.target.value)}><option value="">Select education</option><option>High school / GED</option><option>Some college</option><option>Associate degree</option><option>Bachelor&apos;s degree</option><option>Graduate degree</option></select></label></div><button className="primary-action wide-button" type="submit">Save profile</button></form></div>;
}

function UnsupportedToast({ label, onClose }) { return <div className="toast" role="status"><span><strong>{label}</strong> is outside the current prototype.</span><button type="button" onClick={onClose}>Close</button></div>; }

export function App() {
  const initialStep = Math.max(0, stepPaths.indexOf(window.location.pathname));
  const [screen, setScreen] = useState(() => window.location.pathname.startsWith("/app") ? "app" : "join");
  const [activeStep, setActiveStep] = useState(initialStep);
  const [consentChecked, setConsentChecked] = useState(false);
  const [modal, setModal] = useState(null);
  const [selectedGoal, setSelectedGoal] = useState("");
  const [profile, setProfile] = useState({ afsc: "", rank: "", skill: "", years: "", education: "" });
  const [planItems, setPlanItems] = useState([]);
  const [toast, setToast] = useState("");
  const profileReady = useMemo(() => Boolean(profile.afsc && profile.rank && profile.skill), [profile]);

  useEffect(() => {
    const syncRoute = () => {
      const nextStep = stepPaths.indexOf(window.location.pathname);
      setScreen(window.location.pathname.startsWith("/app") ? "app" : "join");
      if (nextStep >= 0) setActiveStep(nextStep);
    };
    window.addEventListener("popstate", syncRoute);
    return () => window.removeEventListener("popstate", syncRoute);
  }, []);

  const enter = () => { window.history.pushState({}, "", stepPaths[0]); setScreen("app"); setActiveStep(0); setModal("consent"); };
  const navigate = step => {
    if (!supportedSteps.has(step)) { setToast(stepLabels[step]); return; }
    window.history.pushState({}, "", stepPaths[step]);
    setScreen("app");
    setActiveStep(step);
    setToast("");
    window.scrollTo?.({ top: 0, behavior: "smooth" });
  };
  const toggleSavedPlanItem = item => setPlanItems(current => togglePlanItem(current, item));
  const reset = () => { window.history.pushState({}, "", "/"); setScreen("join"); setActiveStep(0); setModal(null); setConsentChecked(false); setSelectedGoal(""); setProfile({ afsc: "", rank: "", skill: "", years: "", education: "" }); setPlanItems([]); };

  let page = null;
  if (activeStep === 0) page = <StartingPoint selectedGoal={selectedGoal} profile={profile} onProfile={() => setModal("profile")} onReset={reset} onNavigate={navigate} />;
  if (activeStep === 1) page = <ExploreAirForcePaths profile={profile} onProfile={() => setModal("profile")} onNavigate={navigate} />;
  if (activeStep === 2) page = <Translation profileReady={profileReady} onNavigate={navigate} />;
  if (activeStep === 3) page = <CompetencyMap profileReady={profileReady} onNavigate={navigate} />;
  if (activeStep === 4) page = <CivilianMatch profile={profile} onNavigate={navigate} />;
  if (activeStep === 5) page = <FederalMatch profile={profile} onNavigate={navigate} />;
  if (activeStep === 6) page = <JobsBasesMap onNavigate={navigate} />;
  if (activeStep === 7) page = <Apprenticeships profile={profile} onProfile={() => setModal("profile")} onNavigate={navigate} />;
  if (activeStep === 8) page = <CredentialRecon profile={profile} planItems={planItems} onTogglePlan={toggleSavedPlanItem} onProfile={() => setModal("profile")} onNavigate={navigate} />;
  if (activeStep === 9) page = <SearchBySkill planItems={planItems} onTogglePlan={toggleSavedPlanItem} onNavigate={navigate} />;
  if (activeStep === 10) page = <TransitionPlan profile={profile} planItems={planItems} onTogglePlan={toggleSavedPlanItem} onProfile={() => setModal("profile")} onNavigate={navigate} />;

  return <>{screen === "join" ? <JoinScreen onEnter={enter} /> : page}{modal === "consent" && <ConsentModal checked={consentChecked} onChecked={setConsentChecked} onContinue={() => setModal("goals")} />}{modal === "goals" && <GoalsModal onChoose={goal => { setSelectedGoal(goal); setModal(null); }} />}{modal === "profile" && <ProfileModal profile={profile} onClose={() => setModal(null)} onSave={next => { setProfile(next); setModal(null); }} />}{toast && <UnsupportedToast label={toast} onClose={() => setToast("")} />}</>;
}
