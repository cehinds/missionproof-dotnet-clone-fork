import { useMemo, useState } from "react";
import { planContent, resultsContent, statusContent } from "../../content/journeyContent.js";
import { getResultStatus } from "../../domain/walkingPath.js";
import { StatusRegion } from "../../components/feedback/StatusRegion.jsx";

function sourceLine(result) {
  const source = result.source || {};
  return [source.name, source.version].filter(Boolean).join(" · ") || resultsContent.sourceCaveat;
}

export function ResultsStep({ assessment, savedIds, busyId, error, onSave, onUndo, onViewPlan }) {
  const [showAll, setShowAll] = useState(false);
  const [expandedId, setExpandedId] = useState("");
  const [lastSavedId, setLastSavedId] = useState("");
  const results = assessment?.results || [];
  const visible = useMemo(() => showAll ? results : results.slice(0, 3), [results, showAll]);

  const save = async result => {
    const saved = savedIds.has(result.pathwayId);
    const succeeded = saved ? await onUndo(result.pathwayId) : await onSave(result.pathwayId);
    if (succeeded) setLastSavedId(saved ? "" : result.pathwayId);
  };

  return <main className="journey-main" id="main">
    <section className="journey-page-head"><p className="journey-eyebrow">{resultsContent.eyebrow}</p><h1 data-page-heading tabIndex="-1">{resultsContent.title}</h1><p>{resultsContent.summary}</p></section>
    <section className="results-toolbar" aria-label="Research lead controls"><div><strong>{showAll ? `${visible.length} ${resultsContent.researchLeadLabel.toLowerCase()}s` : resultsContent.visibleCount}</strong><span>{resultsContent.sourceCaveat}</span></div><details><summary>{resultsContent.methodologyLabel}</summary><p>{resultsContent.methodologyBody}</p></details></section>
    <StatusRegion tone="danger" assertive>{error}</StatusRegion>
    {visible.length ? <ol className="ranked-evidence-list">
      {visible.map((result, index) => {
        const expanded = expandedId === result.pathwayId;
        const saved = savedIds.has(result.pathwayId);
        const status = getResultStatus(result, resultsContent);
        return <li className={`ranked-evidence-row ${expanded ? "is-expanded" : ""}`} key={result.pathwayId}>
          <span className="ranked-number" aria-hidden="true">{String(index + 1).padStart(2, "0")}</span>
          <div className="ranked-summary"><p>{resultsContent.researchLeadLabel} · <span className="mono-value">{result.code}</span></p><h2>{result.title}</h2><span className={`result-label result-label-${status.tone}`}>{status.text}</span></div>
          <button className="journey-button journey-button-secondary ranked-review" type="button" aria-expanded={expanded} aria-controls={`result-${result.pathwayId}`} onClick={() => setExpandedId(current => current === result.pathwayId ? "" : result.pathwayId)}>{expanded ? resultsContent.hideAction : resultsContent.reviewAction}</button>
          {expanded && <div className="ranked-detail" id={`result-${result.pathwayId}`}>
            <div><h3>{resultsContent.whyLabel}</h3>{result.why?.map(reason => <p key={reason}>{reason}</p>)}</div>
            <div><h3>{resultsContent.evidenceLabel}</h3><p>{sourceLine(result)}</p></div>
            <div><h3>{resultsContent.verificationLabel}</h3><p>{result.warnings?.[0] || resultsContent.verificationRequired}</p></div>
            <button className={`journey-button ${saved ? "journey-button-confirmed" : "journey-button-primary"}`} type="button" disabled={busyId === result.pathwayId} onClick={() => save(result)}>{busyId === result.pathwayId ? statusContent.saving : saved ? resultsContent.savedAction : resultsContent.saveAction}</button>
          </div>}
        </li>;
      })}
    </ol> : <section className="journey-task-surface"><h2>{resultsContent.emptyTitle}</h2><p>{resultsContent.emptyBody}</p></section>}
    {results.length > 3 ? <button className="journey-button journey-button-quiet show-results-button" type="button" onClick={() => { setShowAll(value => !value); setExpandedId(""); }}>{showAll ? resultsContent.showTopLabel : `${resultsContent.showAllLabel} (${results.length})`}</button> : null}
    {lastSavedId ? <section className="save-confirmation" aria-live="polite"><div><strong>{planContent.savedTitle}</strong><p>{planContent.savedBody}</p></div><div><button className="journey-button journey-button-primary" type="button" onClick={onViewPlan}>{planContent.viewPlanAction}</button><button className="journey-button journey-button-quiet" type="button" onClick={async () => { const succeeded = await onUndo(lastSavedId); if (succeeded) setLastSavedId(""); }}>{planContent.undoAction}</button></div></section> : null}
  </main>;
}

