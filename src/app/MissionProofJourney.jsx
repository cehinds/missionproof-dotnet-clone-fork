import { useCallback, useEffect, useState } from "react";
import { AppShell } from "./AppShell.jsx";
import { groupForPath } from "./routeRegistry.js";
import { LoadingView, ErrorView } from "../components/feedback/StatusRegion.jsx";
import { ConsentStep } from "../features/consent/ConsentStep.jsx";
import { GoalStep } from "../features/goal/GoalStep.jsx";
import { ProfileStep } from "../features/profile/ProfileStep.jsx";
import { ResultsStep } from "../features/results/ResultsStep.jsx";
import { PlanStep } from "../features/plan/PlanStep.jsx";
import { TranslationStep } from "../features/translation/TranslationStep.jsx";
import { statusContent } from "../content/journeyContent.js";
import { journeyPaths } from "../domain/walkingPath.js";
import { consentNotice } from "../domain/consentNotice.js";

function friendlyError(error) {
  if (error?.status === 503 || error?.name === "TypeError") return statusContent.offline;
  return statusContent.genericError;
}

function nextRequiredPath(session, requestedPath) {
  if (!session?.consent?.accepted) return journeyPaths.consent;
  if (!session.goal) return journeyPaths.goal;
  if (!session.profile?.primaryAfsc && [journeyPaths.results, journeyPaths.plan].includes(requestedPath)) return journeyPaths.profile;
  if (requestedPath === "/app") {
    if (!session.profile?.primaryAfsc) return journeyPaths.profile;
    return journeyPaths.results;
  }
  return requestedPath;
}

export function MissionProofJourney({ client, path, onNavigate }) {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [actionError, setActionError] = useState("");
  const [busy, setBusy] = useState("");
  const [assessment, setAssessment] = useState(null);
  const [plan, setPlan] = useState({ items: [], nextAction: null });
  const [announcement, setAnnouncement] = useState("");

  const loadSession = useCallback(async () => {
    setLoading(true);
    setLoadError("");
    try {
      const nextSession = await client.getSession();
      setSession(nextSession);
    } catch (error) {
      setLoadError(friendlyError(error));
    } finally {
      setLoading(false);
    }
  }, [client]);

  useEffect(() => { loadSession(); }, [loadSession]);

  useEffect(() => {
    if (!session) return;
    const required = nextRequiredPath(session, path);
    if (required !== path) onNavigate(required, { replace: true });
  }, [onNavigate, path, session]);

  useEffect(() => {
    if (loading) return;
    queueMicrotask(() => {
      const heading = document.querySelector("[data-page-heading]");
      heading?.focus();
      setAnnouncement(heading?.textContent || "MissionProof page changed");
    });
  }, [loading, path]);

  const refreshPlan = useCallback(async () => {
    const nextPlan = await client.getPlan();
    setPlan(nextPlan || { items: [], nextAction: null });
    return nextPlan;
  }, [client]);

  useEffect(() => {
    if (!session || path !== journeyPaths.results || assessment || !session.profile?.primaryAfsc) return;
    let cancelled = false;
    setBusy("assessment");
    client.assessPathways({ goal: session.goal, primaryAfsc: session.profile.primaryAfsc })
      .then(result => { if (!cancelled) setAssessment(result); })
      .catch(error => { if (!cancelled) setActionError(friendlyError(error)); })
      .finally(() => { if (!cancelled) setBusy(""); });
    return () => { cancelled = true; };
  }, [assessment, client, path, session]);

  useEffect(() => {
    if (!session || path !== journeyPaths.plan) return;
    let cancelled = false;
    setBusy("plan");
    refreshPlan().catch(error => { if (!cancelled) setActionError(friendlyError(error)); }).finally(() => { if (!cancelled) setBusy(""); });
    return () => { cancelled = true; };
  }, [path, refreshPlan, session]);

  if (loading) return <LoadingView message={statusContent.loading} />;
  if (loadError) return <ErrorView message={loadError} onRetry={loadSession} />;
  if (!session) return null;

  const perform = async (name, action) => {
    setBusy(name);
    setActionError("");
    try {
      return await action();
    } catch (error) {
      setActionError(friendlyError(error));
      return null;
    } finally {
      setBusy("");
    }
  };

  const acceptConsent = () => perform("consent", async () => {
    await client.recordConsent(consentNotice);
    setSession(current => ({ ...current, consent: { accepted: true, version: consentNotice.noticeVersion } }));
    onNavigate(journeyPaths.goal);
  });

  const chooseGoal = goal => perform("goal", async () => {
    await client.setGoal(goal);
    setSession(current => ({ ...current, goal }));
    onNavigate(journeyPaths.profile);
  });

  const confirmAfsc = primaryAfsc => perform("profile", async () => {
    await client.confirmAfsc(primaryAfsc);
    const nextSession = { ...session, profile: { ...session.profile, primaryAfsc } };
    setSession(nextSession);
    const nextAssessment = await client.assessPathways({ goal: nextSession.goal, primaryAfsc });
    setAssessment(nextAssessment);
    onNavigate(journeyPaths.results);
  });

  const saveTarget = pathwayId => perform(pathwayId, async () => {
    await client.saveTarget(pathwayId);
    await refreshPlan();
    return true;
  });

  const undoTarget = pathwayId => perform(pathwayId, async () => {
    await client.updatePlanItem(pathwayId, { status: "removed" });
    await refreshPlan();
    return true;
  });

  const takeNextAction = action => {
    if (action?.route) {
      onNavigate(action.route);
      return Promise.resolve(true);
    }

    const activeItem = plan.items?.find(item => item.id === action?.id && !["complete", "removed"].includes(item.status));
    if (!activeItem) {
      setActionError(statusContent.genericError);
      return Promise.resolve(false);
    }

    return perform("complete", async () => {
      const nextPlan = await client.updatePlanItem(activeItem.id, { status: "complete" });
      setPlan(nextPlan);
      return true;
    });
  };

  const savedIds = new Set(plan.items?.map(item => item.pathwayId || item.id) || []);
  const common = { busy: Boolean(busy), error: actionError };
  let page;
  if (path === journeyPaths.consent) page = <ConsentStep {...common} onContinue={acceptConsent} onLeave={() => onNavigate("/")} />;
  else if (path === journeyPaths.goal) page = <GoalStep {...common} initialGoal={session.goal || ""} onContinue={chooseGoal} />;
  else if (path === journeyPaths.profile || path === "/app") page = <ProfileStep {...common} initialAfsc={session.profile?.primaryAfsc || ""} onContinue={confirmAfsc} />;
  else if (path === journeyPaths.translation) page = <TranslationStep primaryAfsc={session.profile?.primaryAfsc} />;
  else if (path === journeyPaths.plan) page = <PlanStep plan={plan} busy={busy === "plan" || busy === "complete"} error={actionError} onNextAction={takeNextAction} onExplore={() => onNavigate(journeyPaths.results)} />;
  else page = busy === "assessment" && !assessment ? <LoadingView message={statusContent.loading} /> : <ResultsStep assessment={assessment} savedIds={savedIds} busyId={busy} error={actionError} onSave={saveTarget} onUndo={undoTarget} onViewPlan={() => onNavigate(journeyPaths.plan)} />;

  return <AppShell currentGroup={groupForPath(path)} mode={session.mode || client.mode} onNavigate={onNavigate}><span className="sr-only" role="status" aria-live="polite">{announcement}</span>{page}</AppShell>;
}
