import { useCallback, useEffect, useMemo, useState } from "react";
import { emptyProfile } from "./data.js";
import { calculatePlanProgress, togglePlanItem as togglePlanEntry } from "./domain/missionproof.js";

const KEY = "missionproof.session.v1";

/*
 * Prototype state lives in localStorage so a reload does not throw the user back to
 * the access screen. Only the general service facts entered on the profile form are
 * stored; nothing here should ever hold sensitive, medical, or controlled information.
 */
function readSession() {
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === "object" ? parsed : null;
  } catch {
    return null;
  }
}

const defaults = {
  entered: false,
  consented: false,
  goal: "",
  profile: emptyProfile,
  plan: [],
  completedTasks: [],
  profileDraft: emptyProfile,
  /* Persisted so a reload returns you to the screen you were on, not to the start. */
  route: { phase: "profile", section: "setup" },
};

export function useSession() {
  const [state, setState] = useState(() => ({ ...defaults, ...(readSession() || {}) }));

  useEffect(() => {
    try {
      window.localStorage.setItem(KEY, JSON.stringify(state));
    } catch {
      /* Storage can be unavailable in private modes; the prototype still works in memory. */
    }
  }, [state]);

  const patch = useCallback(next => setState(current => ({ ...current, ...next })), []);

  const togglePlanItem = useCallback((item) => {
    setState(current => ({ ...current, plan: togglePlanEntry(current.plan, item) }));
  }, []);

  const toggleTask = useCallback((id) => {
    setState(current => ({
      ...current,
      completedTasks: current.completedTasks.includes(id)
        ? current.completedTasks.filter(task => task !== id)
        : [...current.completedTasks, id],
    }));
  }, []);

  const reset = useCallback(() => {
    setState(defaults);
    try {
      window.localStorage.removeItem(KEY);
    } catch {
      /* nothing to clean up */
    }
  }, []);

  const profileComplete = useMemo(
    () => Object.values(state.profile).filter(value => String(value ?? "").trim()).length,
    [state.profile],
  );

  return {
    ...state,
    patch,
    reset,
    togglePlanItem,
    toggleTask,
    inPlan: useCallback(id => state.plan.some(entry => entry.id === id), [state.plan]),
    profileComplete,
    profilePercent: Math.round((profileComplete / 5) * 100),
    /* Milestone progress across the whole journey, not just the profile form. */
    planProgress: calculatePlanProgress(state.completedTasks.length, state.plan.length, profileComplete),
    /* AFSC, rank, and skill level are the minimum needed to translate anything. */
    profileReady: Boolean(state.profile.afsc && state.profile.rank && state.profile.skill),
  };
}
