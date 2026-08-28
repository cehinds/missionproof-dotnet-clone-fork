import { useState } from "react";
import { profileContent } from "../../content/journeyContent.js";
import { normalizeAfsc, validateAfsc } from "../../domain/walkingPath.js";
import { StatusRegion } from "../../components/feedback/StatusRegion.jsx";

export function ProfileStep({ busy, error, initialAfsc = "", onContinue }) {
  const [afsc, setAfsc] = useState(initialAfsc);
  const [validation, setValidation] = useState("");
  const submit = event => {
    event.preventDefault();
    const nextError = validateAfsc(afsc);
    setValidation(nextError);
    if (!nextError) onContinue(normalizeAfsc(afsc));
  };

  return <main className="journey-main journey-main-narrow" id="main">
    <section className="journey-page-head"><p className="journey-eyebrow">{profileContent.eyebrow}</p><p className="journey-progress-label">{profileContent.progress}</p><h1 data-page-heading tabIndex="-1">{profileContent.title}</h1><p>{profileContent.summary}</p></section>
    <form className="journey-task-surface guided-profile" onSubmit={submit} noValidate>
      <label htmlFor="primary-afsc">{profileContent.fieldLabel}</label>
      <input id="primary-afsc" value={afsc} onChange={event => { setAfsc(event.target.value); if (validation) setValidation(""); }} placeholder={profileContent.placeholder} aria-invalid={Boolean(validation)} aria-describedby="primary-afsc-help primary-afsc-error" autoCapitalize="characters" autoComplete="off" />
      <p id="primary-afsc-help" className="journey-field-help">{profileContent.example}</p>
      {validation ? <p id="primary-afsc-error" className="journey-field-error" role="alert">{profileContent.invalidMessage || validation}</p> : <span id="primary-afsc-error" />}
      <div className="journey-assurance"><strong>{profileContent.confirmedLabel}</strong><span>{profileContent.assurance} {profileContent.localDataNote}</span></div>
      <StatusRegion tone="danger" assertive>{error}</StatusRegion>
      <div className="journey-actions journey-actions-sticky"><button className="journey-button journey-button-primary" type="submit" disabled={busy || !normalizeAfsc(afsc)}>{busy ? "Confirming…" : profileContent.primaryAction}</button></div>
    </form>
  </main>;
}
