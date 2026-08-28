export function TranslationStep({ primaryAfsc }) {
  return <main className="journey-main journey-main-narrow" id="main">
    <section className="journey-page-head">
      <p className="journey-eyebrow">Translate</p>
      <h1 data-page-heading tabIndex="-1">Translate your confirmed experience</h1>
      <p>Turn confirmed service facts into clear, reviewable civilian and federal language without changing the underlying record.</p>
    </section>
    <section className="journey-task-surface translation-placeholder">
      <p className="journey-eyebrow">Current milestone</p>
      <h2>Translation workspace</h2>
      <p>Your confirmed AFSC <strong className="mono-value">{primaryAfsc || "has not been added yet"}</strong> will be one input to future draft translations.</p>
      <p>This no-key milestone does not generate or save translation drafts yet. Continue to Explore for illustrative research leads, or return to Profile to review your confirmed fact.</p>
    </section>
  </main>;
}
