import { planContent, statusContent } from "../../content/journeyContent.js";
import { getPlanNextAction } from "../../domain/walkingPath.js";
import { StatusRegion } from "../../components/feedback/StatusRegion.jsx";

export function PlanStep({ plan, busy, error, onNextAction, onExplore }) {
  const nextAction = getPlanNextAction(plan);
  const completed = nextAction?.status === "complete";
  return <main className="journey-main journey-main-narrow" id="main">
    <section className="journey-page-head"><p className="journey-eyebrow">{planContent.eyebrow}</p><p className="journey-progress-label">{planContent.progressLabel}</p><h1 data-page-heading tabIndex="-1">{nextAction?.title || planContent.title}</h1><p>{nextAction?.detail || planContent.summary}</p></section>
    <section className="journey-task-surface plan-next-action">
      <p className="journey-eyebrow">{planContent.currentMilestoneLabel}</p>
      <p>{nextAction?.detail || planContent.nextMilestoneDetail}</p>
      {plan?.items?.length ? <ul className="saved-targets" aria-label="Saved research targets">{plan.items.map(item => <li key={item.id}>{item.code ? <span className="mono-value">{item.code}</span> : null}<strong>{item.title}</strong></li>)}</ul> : null}
      <StatusRegion tone={completed ? "success" : "danger"} assertive={Boolean(error)}>{error || (completed ? statusContent.saved : "")}</StatusRegion>
      <div className="journey-actions"><button className="journey-button journey-button-primary" type="button" disabled={!nextAction || busy || completed} onClick={() => onNextAction(nextAction)}>{busy ? statusContent.saving : completed ? planContent.completedLabel : planContent.primaryAction}</button><button className="journey-button journey-button-quiet" type="button" disabled={busy} onClick={onExplore}>{planContent.secondaryAction}</button></div>
    </section>
  </main>;
}
