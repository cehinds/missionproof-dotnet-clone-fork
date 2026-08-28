import { useMemo, useState } from "react";
import { goalContent } from "../../content/journeyContent.js";
import { normalizeGoalOption } from "../../domain/walkingPath.js";
import { StatusRegion } from "../../components/feedback/StatusRegion.jsx";

export function GoalStep({ busy, error, initialGoal = "", onContinue }) {
  const options = useMemo(() => goalContent.options.map(normalizeGoalOption), []);
  const [selected, setSelected] = useState(initialGoal);
  return <main className="journey-main journey-main-narrow" id="main">
    <section className="journey-page-head"><p className="journey-eyebrow">{goalContent.eyebrow}</p><h1 data-page-heading tabIndex="-1">{goalContent.title}</h1><p>{goalContent.summary}</p></section>
    <form className="journey-task-surface" onSubmit={event => { event.preventDefault(); if (selected) onContinue(selected); }}>
      <fieldset className="goal-options"><legend className="sr-only">Choose a starting goal</legend>{options.map(option => <label className={selected === option.id ? "is-selected" : ""} key={option.id}><input type="radio" name="goal" value={option.id} checked={selected === option.id} onChange={() => setSelected(option.id)} /><span><strong>{option.label}</strong>{option.description ? <small>{option.description}</small> : null}</span></label>)}</fieldset>
      <StatusRegion tone="danger" assertive>{error}</StatusRegion>
      <div className="journey-actions journey-actions-sticky"><button className="journey-button journey-button-primary" type="submit" disabled={!selected || busy}>{busy ? "Saving…" : goalContent.primaryAction}</button></div>
    </form>
  </main>;
}

