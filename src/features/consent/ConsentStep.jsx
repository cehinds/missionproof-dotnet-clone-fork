import { useState } from "react";
import { consentContent } from "../../content/journeyContent.js";
import { StatusRegion } from "../../components/feedback/StatusRegion.jsx";

export function ConsentStep({ busy, error, onContinue, onLeave }) {
  const [checked, setChecked] = useState(false);
  return <main className="journey-main journey-main-narrow" id="main">
    <section className="journey-page-head"><p className="journey-eyebrow">{consentContent.eyebrow}</p><h1 data-page-heading tabIndex="-1">{consentContent.title}</h1><p>{consentContent.summary}</p></section>
    <section className="journey-task-surface consent-surface">
      <label className="journey-consent-row"><input type="checkbox" checked={checked} onChange={event => setChecked(event.target.checked)} /><span>{consentContent.agreement}</span></label>
      <nav className="consent-document-links" aria-label="Consent documents"><a href="#missionproof-terms">{consentContent.termsLabel}</a><a href="#missionproof-privacy">{consentContent.privacyLabel}</a></nav>
      <div className="consent-document-sections">
        <section id="missionproof-terms" tabIndex="-1"><h2>{consentContent.termsLabel}</h2><p>{consentContent.termsSummary}</p></section>
        <section id="missionproof-privacy" tabIndex="-1"><h2>{consentContent.privacyLabel}</h2><p>{consentContent.privacySummary}</p></section>
      </div>
      <p className="journey-safety-detail">{consentContent.safetyDetail}</p>
      <p className="journey-prototype-notice">{consentContent.prototypeNotice}</p>
      <StatusRegion tone="danger" assertive>{error}</StatusRegion>
      <div className="journey-actions"><button className="journey-button journey-button-primary" type="button" disabled={!checked || busy} onClick={onContinue}>{busy ? "Saving…" : consentContent.primaryAction}</button><button className="journey-button journey-button-quiet" type="button" disabled={busy} onClick={onLeave}>{consentContent.secondaryAction}</button></div>
    </section>
  </main>;
}
