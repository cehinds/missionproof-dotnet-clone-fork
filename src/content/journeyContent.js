const goalOptions = [
  {
    id: "translate",
    label: "Translate my experience",
    description: "Turn confirmed service facts into clear civilian and federal language.",
  },
  {
    id: "paths",
    label: "Explore career paths",
    description: "Review research leads and the evidence or gaps behind them.",
  },
  {
    id: "credentials",
    label: "Find credentials",
    description: "Compare certifications and licenses connected to your experience.",
  },
  {
    id: "plan",
    label: "Build my transition plan",
    description: "Choose a target and leave with one practical next action.",
  },
  {
    id: "unsure",
    label: "I am not sure yet",
    description: "Start with your service profile and explore general examples.",
  },
];

export const consentContent = Object.freeze({
  eyebrow: "Independent design fork",
  title: "Before you add service information",
  summary:
    "MissionProof is a career-planning prototype. It offers research leads and draft translations, not official eligibility decisions.",
  agreement:
    "I agree to the Terms and Privacy Notice and will enter only general, non-sensitive service information.",
  termsLabel: "Terms",
  termsSummary:
    "This independent design fork provides planning guidance and illustrative research leads only. It does not determine official eligibility, qualification, employment, or transition outcomes. You control what you enter, confirm, save, and choose to act on.",
  privacyLabel: "Privacy Notice",
  privacySummary:
    "This local milestone uses process-local development state, does not call an external AI provider, and uses synthetic or illustrative data only. Do not enter or upload sensitive information or official records. Its storage, retention, and deletion behavior are not production guarantees.",
  safetyTitle: "Use general information only",
  safetyDetail:
    "Do not enter or upload classified, medical, controlled, operational, or identity information. This local milestone uses illustrative data and synthetic evidence only.",
  prototypeNotice:
    "The no-key prototype does not send service information to an external AI provider.",
  primaryAction: "Agree and continue",
  secondaryAction: "Leave MissionProof",
  requiredMessage: "Confirm the agreement to continue.",
});

export const goalContent = Object.freeze({
  eyebrow: "Choose a starting point",
  title: "What would make this visit useful?",
  summary: "Choose one goal. You can change it later.",
  options: goalOptions,
  primaryAction: "Continue",
  requiredMessage: "Choose a goal to continue.",
});

export const profileContent = Object.freeze({
  journey: "Profile",
  eyebrow: "Service profile",
  progress: "Step 2 of 4",
  title: "What is your primary Air Force Specialty Code (AFSC)?",
  summary: "We use this confirmed fact to tailor translations and research leads.",
  fieldLabel: "Primary AFSC",
  placeholder: "For example, 1B4X1",
  example: "Use the code shown in your current general service records.",
  optionalAction: "Review suggestions from synthetic evidence",
  optionalActionDetail:
    "The local demo can suggest facts from bounded synthetic text. You review every suggestion before anything changes.",
  assurance: "Nothing changes until you review and confirm it.",
  localDataNote:
    "For this milestone, enter general, non-sensitive information only.",
  primaryAction: "Continue",
  secondaryAction: "Save and exit",
  invalidMessage:
    "Enter a complete AFSC using letters and numbers, such as 1B4X1.",
  confirmedLabel: "Confirmed fact",
});

export const resultsContent = Object.freeze({
  journey: "Explore",
  eyebrow: "Air Force paths",
  title: "Research leads based on your confirmed AFSC and goal",
  summary:
    "Each result explains how it connects to your confirmed AFSC and selected goal, the illustrative evidence behind it, and what gaps to verify.",
  visibleCount: "Top 3 research leads",
  researchLeadLabel: "Research lead",
  alignedLabel: "Connected to profile",
  gapLabel: "Gap to verify",
  whyLabel: "Why this appeared",
  evidenceLabel: "Evidence used",
  verificationLabel: "What to verify",
  methodologyLabel: "How ranking works",
  methodologyBody:
    "This illustrative local mapping compares your confirmed AFSC and selected goal with versioned example pathways. It does not evaluate every current qualification rule, so official verification is still required.",
  sourceCaveat:
    "Example pathway data is synthetic or illustrative until an approved, versioned source is connected.",
  verificationRequired:
    "Current rules may also include medical, clearance, citizenship, strength, rank, and retraining-window requirements. Confirm them with an authorized advisor.",
  reviewAction: "Review this path",
  hideAction: "Hide details",
  saveAction: "Save to plan",
  savedAction: "Saved to plan",
  showAllLabel: "Show all paths",
  showTopLabel: "Show top 3",
  updateRankingAction: "Update ranking",
  emptyTitle: "No close research leads appeared",
  emptyBody:
    "Check your confirmed AFSC and selected goal, or explore general paths without a profile.",
  emptyAction: "Explore general paths",
});

export const planContent = Object.freeze({
  journey: "Plan",
  eyebrow: "Your transition plan",
  title: "Collect one mission-impact story",
  summary:
    "Describe a moment when your work made a measurable difference. This will strengthen future translations and comparisons.",
  progressLabel: "Milestone 1 of 3",
  currentMilestoneLabel: "Current milestone",
  nextMilestoneLabel: "Up next",
  nextMilestoneTitle: "Verify your saved research lead",
  nextMilestoneDetail:
    "Compare the illustrative result with current official guidance and your complete circumstances.",
  primaryAction: "Start this action",
  secondaryAction: "Choose a different task",
  savedTitle: "Saved to your plan",
  savedBody:
    "This is a reversible research target, not an application or eligibility result.",
  viewPlanAction: "View plan",
  undoAction: "Undo",
  completedLabel: "Complete",
});

export const statusContent = Object.freeze({
  loading: "Loading your local session",
  saving: "Saving your change",
  saved: "Your change was saved",
  undone: "Your last change was undone",
  offline:
    "The local service is unavailable. Your confirmed information was not changed.",
  genericError:
    "We could not complete that action. Try again; your confirmed information was not changed.",
  invalidAfsc: "Check the AFSC format and try again.",
  noProvider:
    "External analysis is not enabled. You can continue manually or use the synthetic local demo.",
  analysisStages: Object.freeze([
    "Checking the synthetic evidence",
    "Reading the text structure",
    "Preparing suggestions for your review",
  ]),
  analysisFailure:
    "We could not prepare suggestions from this synthetic evidence. Your profile was not changed.",
  reviewTitle: "Review what MissionProof suggested",
  reviewAssurance: "Nothing changes until you confirm it.",
  confidenceHigh: "High confidence in the extracted text",
  confidenceMedium: "Review the extracted text",
  confidenceLow: "Low confidence — check the source carefully",
  candidatePending: "Needs review",
  candidateAccepted: "Accepted",
  candidateEdited: "Edited and accepted",
  candidateRejected: "Rejected",
  acceptAction: "Accept",
  editAction: "Edit",
  rejectAction: "Reject",
  applyAction: "Apply accepted suggestions",
  applied:
    "Accepted suggestions were applied as confirmed facts. Rejected suggestions were not applied.",
});

export const forkDisclosure = Object.freeze({
  label: "Independent design fork",
  short:
    "This prototype is an independent design study for feedback and is not the official MissionProof application.",
  detail:
    "The original source was not available. Screens, behavior, data, and product rules have been recreated or interpreted from limited visible references and may differ substantially from the original product.",
  dataCaveat:
    "Pathway results and evidence in this milestone are synthetic or illustrative. They are research leads, not official eligibility, qualification, employment, or transition decisions.",
});
