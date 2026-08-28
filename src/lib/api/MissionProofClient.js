const illustrativePaths = Object.freeze([
  {
    pathwayId: "path-1n0x1",
    code: "1N0X1",
    title: "All Source Intelligence Analyst",
    label: "researchLead",
    why: ["Your confirmed AFSC provides a useful comparison point for analytical and briefing work."],
    gaps: [],
    warnings: ["Current eligibility can include requirements not represented in this prototype."],
    source: { name: "Illustrative pathway catalog", version: "demo-2026-08", effectiveAt: null },
    officialVerificationRequired: true,
  },
  {
    pathwayId: "path-2g0x1",
    code: "2G0X1",
    title: "Logistics Plans",
    label: "researchLead",
    why: ["Planning, coordination, and readiness evidence create a credible research connection."],
    gaps: [],
    warnings: ["Compare current requirements with an authorized advisor."],
    source: { name: "Illustrative pathway catalog", version: "demo-2026-08", effectiveAt: null },
    officialVerificationRequired: true,
  },
  {
    pathwayId: "path-1d7x1",
    code: "1D7X1",
    title: "Cyber Defense Operations",
    label: "gapToVerify",
    why: ["Technical troubleshooting and risk-control evidence may transfer to this research area."],
    gaps: [{ area: "technical evidence", display: "One" }],
    warnings: ["Verify current score, clearance, and retraining requirements."],
    source: { name: "Illustrative pathway catalog", version: "demo-2026-08", effectiveAt: null },
    officialVerificationRequired: true,
  },
  {
    pathwayId: "path-1c5x1",
    code: "1C5X1",
    title: "Command and Control Battle Management",
    label: "gapToVerify",
    why: ["Coordinating complex work can provide a useful evidence bridge."],
    gaps: [{ area: "current requirements", display: "Several" }],
    warnings: ["This is an illustrative lead, not an eligibility result."],
    source: { name: "Illustrative pathway catalog", version: "demo-2026-08", effectiveAt: null },
    officialVerificationRequired: true,
  },
  {
    pathwayId: "path-2t2x1",
    code: "2T2X1",
    title: "Air Transportation",
    label: "gapToVerify",
    why: ["Mission support and accountability experience may be relevant."],
    gaps: [{ area: "specialty evidence", display: "One" }],
    warnings: ["Verify current requirements with an authorized source."],
    source: { name: "Illustrative pathway catalog", version: "demo-2026-08", effectiveAt: null },
    officialVerificationRequired: true,
  },
  {
    pathwayId: "path-3e5x1",
    code: "3E5X1",
    title: "Engineering",
    label: "gapToVerify",
    why: ["Project planning evidence can support initial research into this path."],
    gaps: [{ area: "technical prerequisites", display: "Two" }],
    warnings: ["Confirm current requirements and complete eligibility separately."],
    source: { name: "Illustrative pathway catalog", version: "demo-2026-08", effectiveAt: null },
    officialVerificationRequired: true,
  },
]);

export class MissionProofApiError extends Error {
  constructor(problem) {
    super(problem.detail || problem.title || "MissionProof could not complete that request.");
    this.name = "MissionProofApiError";
    this.problem = problem;
    this.code = problem.code || "request_failed";
    this.status = problem.status || 500;
  }
}

function makeIdempotencyKey() {
  return globalThis.crypto?.randomUUID?.() || `mp-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

async function parseResponse(response) {
  const text = await response.text();
  let payload = null;
  if (text) {
    try { payload = JSON.parse(text); }
    catch {
      throw new MissionProofApiError({ status: response.status || 502, code: "invalid_api_response", detail: "The local service returned an unreadable response." });
    }
  }
  if (!response.ok) {
    throw new MissionProofApiError({
      status: response.status,
      title: response.statusText,
      ...(payload || {}),
    });
  }
  return payload;
}

function weakEtag(version = 0) {
  return `W/"${Number(version) || 0}"`;
}

function normalizeSession(payload) {
  const goal = payload.goal && typeof payload.goal === "object" && "goalCode" in payload.goal
    ? payload.goal.goalCode
    : payload.goal;
  return {
    ...payload,
    mode: "api",
    goal: goal || null,
    profile: { ...payload.profile, primaryAfsc: payload.profile?.primaryAfsc || null },
  };
}

function normalizeAssessment(payload) {
  return {
    ...payload,
    results: (payload.results || []).map(result => ({
      ...result,
      label: String(result.alignment || result.label || "ResearchLead").toLowerCase() === "researchlead" ? "researchLead" : result.label,
      gaps: (result.gaps || []).map(gap => ({ ...gap, area: gap.code, display: gap.label })),
      warnings: result.warnings || payload.warnings || [],
      source: result.source || { name: "Versioned illustrative pathway source", version: result.sourceVersion },
    })),
  };
}

function normalizePlanState(value) {
  return ({ NotStarted: "notStarted", InProgress: "inProgress", Completed: "complete", Removed: "removed" })[value] || value;
}

function toApiPlanState(value) {
  return ({ notStarted: "NotStarted", inProgress: "InProgress", complete: "Completed", completed: "Completed", removed: "Removed" })[value] || value;
}

function normalizePlan(payload) {
  const items = (payload?.items || []).map(item => ({
    ...item,
    id: item.planItemId || item.id,
    status: normalizePlanState(item.state || item.status),
  }));
  const active = items.find(item => item.status !== "complete" && item.status !== "removed");
  return {
    ...payload,
    items,
    nextAction: active ? {
      id: active.id,
      title: active.nextAction,
      detail: active.nextAction,
      status: active.status,
    } : payload?.nextAction ? {
      id: payload.nextAction.code,
      title: payload.nextAction.label,
      detail: payload.nextAction.label,
      status: "notStarted",
      route: payload.nextAction.route,
    } : null,
  };
}

export function createHttpMissionProofClient({ baseUrl = "" } = {}) {
  const state = { goalVersion: 0, profileEtag: weakEtag(0), planEtag: weakEtag(0), plan: null };
  const requestWithMeta = async (path, options = {}) => {
    const response = await fetch(`${baseUrl}${path}`, {
      credentials: "same-origin",
      ...options,
      headers: {
        Accept: "application/json",
        ...(options.body ? { "Content-Type": "application/json" } : {}),
        ...options.headers,
      },
    });
    return { payload: await parseResponse(response), etag: response.headers.get("ETag") };
  };
  const request = async (path, options = {}) => (await requestWithMeta(path, options)).payload;

  const getPlan = async () => {
    const { payload, etag } = await requestWithMeta("/api/v1/transition-plan");
    state.planEtag = etag || weakEtag(payload.version);
    state.plan = normalizePlan(payload);
    return state.plan;
  };

  return {
    mode: "api",
    async getSession() {
      const payload = await request("/api/v1/session");
      state.goalVersion = payload.goal?.version || 0;
      state.profileEtag = weakEtag(payload.profile?.version || 0);
      return normalizeSession(payload);
    },
    recordConsent: ({ noticeVersion, noticeSha256 }) => request("/api/v1/consent-receipts", { method: "POST", headers: { "Idempotency-Key": makeIdempotencyKey() }, body: JSON.stringify({ accepted: true, noticeVersion, noticeSha256 }) }),
    async setGoal(goal) {
      const payload = await request("/api/v1/goal", { method: "PUT", headers: { "Idempotency-Key": makeIdempotencyKey(), "If-Match": weakEtag(state.goalVersion) }, body: JSON.stringify({ goalCode: goal }) });
      state.goalVersion = payload.version;
      return payload;
    },
    async confirmAfsc(primaryAfsc) {
      const current = await requestWithMeta("/api/v1/profile");
      state.profileEtag = current.etag || weakEtag(current.payload.version);
      const { payload, etag } = await requestWithMeta("/api/v1/profile/facts/Service.PrimaryAfsc", { method: "PUT", headers: { "Idempotency-Key": makeIdempotencyKey(), "If-Match": state.profileEtag }, body: JSON.stringify({ value: primaryAfsc }) });
      state.profileEtag = etag || weakEtag(payload.version);
      return payload;
    },
    async assessPathways(input) {
      const payload = await request("/api/v1/pathway-assessments", { method: "POST", body: JSON.stringify({ primaryAfsc: input.primaryAfsc, goalCode: input.goal }) });
      return normalizeAssessment(payload);
    },
    getPlan,
    async saveTarget(pathwayId) {
      if (!state.plan) await getPlan();
      const { payload, etag } = await requestWithMeta("/api/v1/transition-plan/items", { method: "POST", headers: { "Idempotency-Key": makeIdempotencyKey(), "If-Match": state.planEtag }, body: JSON.stringify({ pathwayId }) });
      state.planEtag = etag || weakEtag(payload.version);
      state.plan = normalizePlan(payload);
      return state.plan;
    },
    async updatePlanItem(id, changes) {
      if (!state.plan) await getPlan();
      const item = state.plan.items.find(candidate => candidate.id === id || candidate.pathwayId === id);
      const itemId = item?.id || id;
      const { payload, etag } = await requestWithMeta(`/api/v1/transition-plan/items/${encodeURIComponent(itemId)}`, { method: "PATCH", headers: { "Idempotency-Key": makeIdempotencyKey(), "If-Match": state.planEtag }, body: JSON.stringify({ state: toApiPlanState(changes.status) }) });
      state.planEtag = etag || weakEtag(payload.version);
      state.plan = normalizePlan(payload);
      return state.plan;
    },
  };
}

export function createMemoryMissionProofClient({ latency = 0, failAt = "" } = {}) {
  const state = {
    consentAccepted: false,
    goal: "",
    primaryAfsc: "",
    planItems: [],
  };

  const goalOrders = Object.freeze({
    translate: ["path-1n0x1", "path-1c5x1", "path-2g0x1", "path-1d7x1", "path-2t2x1", "path-3e5x1"],
    paths: ["path-1n0x1", "path-2g0x1", "path-1d7x1", "path-1c5x1", "path-2t2x1", "path-3e5x1"],
    credentials: ["path-1d7x1", "path-3e5x1", "path-1n0x1", "path-2g0x1", "path-1c5x1", "path-2t2x1"],
    plan: ["path-2g0x1", "path-1c5x1", "path-2t2x1", "path-1n0x1", "path-1d7x1", "path-3e5x1"],
    unsure: ["path-1c5x1", "path-1n0x1", "path-2g0x1", "path-1d7x1", "path-2t2x1", "path-3e5x1"],
  });
  const goalLabels = Object.freeze({
    translate: "experience-translation",
    paths: "career-path exploration",
    credentials: "credential research",
    plan: "transition-planning",
    unsure: "general exploration",
  });

  const before = action => new Promise((resolve, reject) => {
    globalThis.setTimeout(() => {
      if (failAt === action) {
        reject(new MissionProofApiError({ status: 503, code: "demo_unavailable", detail: "The local demo service is unavailable." }));
      } else {
        resolve();
      }
    }, latency);
  });

  const planSnapshot = () => {
    const items = state.planItems.map(item => ({ ...item }));
    const active = items.find(item => !["complete", "removed"].includes(item.status));
    const nextAction = active
      ? { id: active.id, title: active.nextAction, detail: active.nextAction, status: active.status }
      : items.length
        ? { id: "ChooseNextTarget", title: "Choose another research target", detail: "Choose another research target", status: "notStarted", route: "/app/explore" }
        : { id: "ReviewResearchLeads", title: "Review three research leads", detail: "Review three research leads", status: "notStarted", route: "/app/explore" };
    return { items, nextAction };
  };

  const sessionNextAction = () => {
    if (!state.consentAccepted) return { code: "ReviewConsent", label: "Review the design-fork notice", route: "/app/consent" };
    if (!state.goal) return { code: "ChooseGoal", label: "Choose a starting goal", route: "/app/goal" };
    if (!state.primaryAfsc) return { code: "ConfirmPrimaryAfsc", label: "Confirm your primary AFSC", route: "/app/profile" };
    const next = planSnapshot().nextAction;
    return { code: next.id, label: next.title, route: next.route || "/app/plan" };
  };

  const rankPaths = input => {
    const primaryAfsc = String(input.primaryAfsc || state.primaryAfsc || "").trim().toUpperCase();
    const goal = input.goal || state.goal || "unsure";
    const order = goalOrders[goal] || goalOrders.unsure;
    const orderById = new Map(order.map((pathwayId, index) => [pathwayId, index]));
    return illustrativePaths
      .map((path, catalogIndex) => ({ path, catalogIndex, rank: path.code === primaryAfsc ? -1 : orderById.get(path.pathwayId) ?? order.length }))
      .sort((left, right) => left.rank - right.rank || left.catalogIndex - right.catalogIndex)
      .slice(0, 3)
      .map(({ path }) => ({
        ...path,
        label: "researchLead",
        why: [path.code === primaryAfsc
          ? `Your confirmed ${primaryAfsc} AFSC and ${goalLabels[goal] || goalLabels.unsure} goal make this a useful first research lead.`
          : `This illustrative lead is ordered for your ${goalLabels[goal] || goalLabels.unsure} goal using ${primaryAfsc || "your confirmed AFSC"} as a comparison point.`],
      }));
  };

  const session = () => ({
    mode: "demo",
    capabilities: { pathwayAssessment: true, syntheticEvidence: true, externalAi: false },
    consent: { accepted: state.consentAccepted, version: "design-fork-v1" },
    goal: state.goal || null,
    profile: { primaryAfsc: state.primaryAfsc || null },
    nextAction: sessionNextAction(),
  });

  return {
    mode: "demo",
    async getSession() { await before("getSession"); return session(); },
    async recordConsent(notice) { await before("recordConsent"); state.consentAccepted = true; return { receiptId: "demo-consent", noticeVersion: notice.noticeVersion || notice, noticeSha256: notice.noticeSha256, acceptedAt: "2026-08-27T00:00:00Z" }; },
    async setGoal(goal) { await before("setGoal"); state.goal = goal; return { goal }; },
    async confirmAfsc(primaryAfsc) { await before("confirmAfsc"); state.primaryAfsc = primaryAfsc; return { fact: { type: "Service.PrimaryAfsc", value: primaryAfsc, status: "confirmed" }, etag: 'W/"demo-profile-1"' }; },
    async assessPathways(input) {
      await before("assessPathways");
      const results = rankPaths(input);
      return {
        assessmentId: "demo-assessment",
        rulesetVersion: "illustrative-rules-v1",
        sourceVersions: ["demo-2026-08"],
        input: { goal: input.goal || state.goal, primaryAfsc: input.primaryAfsc || state.primaryAfsc },
        officialVerificationRequired: true,
        results,
      };
    },
    async getPlan() { await before("getPlan"); return planSnapshot(); },
    async saveTarget(pathwayId) {
      await before("saveTarget");
      const pathway = illustrativePaths.find(item => item.pathwayId === pathwayId);
      if (!pathway) throw new MissionProofApiError({ status: 404, code: "pathway_not_found", detail: "That research lead is no longer available." });
      if (!state.planItems.some(item => item.pathwayId === pathwayId)) {
        state.planItems.push({ id: `planitem-${pathwayId}`, pathwayId, code: pathway.code, title: pathway.title, status: "notStarted", nextAction: `Verify the current requirements for ${pathway.title}` });
      }
      return planSnapshot();
    },
    async updatePlanItem(id, changes) {
      await before("updatePlanItem");
      const item = state.planItems.find(candidate => candidate.id === id || candidate.pathwayId === id);
      if (!item) throw new MissionProofApiError({ status: 404, code: "plan_item_not_found", detail: "Refresh the plan and choose a current item." });
      item.status = changes.status;
      if (changes.status === "removed") state.planItems = state.planItems.filter(candidate => candidate.id !== item.id);
      return planSnapshot();
    },
  };
}

export function createDefaultMissionProofClient({ dataMode = import.meta.env.VITE_MISSIONPROOF_DATA_MODE || import.meta.env.MODE } = {}) {
  return dataMode === "api" ? createHttpMissionProofClient() : createMemoryMissionProofClient();
}
