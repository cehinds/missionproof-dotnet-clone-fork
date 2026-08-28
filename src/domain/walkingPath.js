export const journeyPaths = Object.freeze({
  consent: "/app/consent",
  goal: "/app/goal",
  profile: "/app/profile",
  translation: "/app/translation",
  results: "/app/explore",
  plan: "/app/plan",
});

export function normalizeGoalOption(option, index = 0) {
  if (typeof option === "string") {
    return { id: `goal-${index + 1}`, label: option, description: "" };
  }

  return {
    id: option.id || option.value || `goal-${index + 1}`,
    label: option.label || option.title || option.value || `Goal ${index + 1}`,
    description: option.description || option.detail || "",
  };
}

export function normalizeAfsc(value) {
  return String(value || "").trim().replace(/\s+/g, "").toUpperCase();
}

export function validateAfsc(value) {
  const normalized = normalizeAfsc(value);
  if (!normalized) return "Enter your primary AFSC to continue.";
  if (!/^\d[A-Z]\d[A-Z]\d[A-Z]?$/.test(normalized)) {
    return "Use a five- or six-character AFSC such as 1N0X1.";
  }
  return "";
}

export function getResultStatus(result, labels) {
  if (result.label === "scoreAligned" || result.status === "scoreAligned") {
    return { tone: "positive", text: labels.alignedLabel };
  }

  if (result.label === "researchLead" || result.status === "researchLead") {
    return { tone: "information", text: labels.researchLeadLabel };
  }

  const gap = result.gaps?.[0];
  const gapText = gap?.display || (gap ? `${gap.amount || gap.difference || ""}${gap.area ? ` ${gap.area}` : ""}`.trim() : "");
  return {
    tone: "caution",
    text: gapText ? `${gapText} ${labels.gapLabel}` : labels.gapLabel,
  };
}

export function getPlanNextAction(plan) {
  return plan?.nextAction || plan?.items?.find(item => item.nextAction)?.nextAction || null;
}
