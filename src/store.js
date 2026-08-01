import { useCallback, useEffect, useMemo, useState } from "react";
import { emptyProfile } from "./data.js";

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
    setState(current => {
      const exists = current.plan.some(entry => entry.id === item.id);
      return {
        ...current,
        plan: exists ? current.plan.filter(entry => entry.id !== item.id) : [...current.plan, item],
      };
    });
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
    inPlan: useCallback(id => state.plan.some(entry => entry.id === id), [state.plan]),
    profileComplete,
    profilePercent: Math.round((profileComplete / 5) * 100),
    /* AFSC, rank, and skill level are the minimum needed to translate anything. */
    profileReady: Boolean(state.profile.afsc && state.profile.rank && state.profile.skill),
  };
}
