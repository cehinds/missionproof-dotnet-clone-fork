export function StatusRegion({ children, tone = "info", assertive = false }) {
  if (!children) return null;
  return <div className={`journey-status journey-status-${tone}`} role={assertive ? "alert" : "status"} aria-live={assertive ? "assertive" : "polite"}>{children}</div>;
}

export function LoadingView({ message }) {
  return <main className="journey-system-state" id="main"><div className="journey-loader" aria-hidden="true" /><p role="status">{message}</p></main>;
}

export function ErrorView({ message, onRetry, retryLabel = "Try again" }) {
  return <main className="journey-system-state" id="main"><p className="journey-eyebrow">Unable to continue</p><h1 data-page-heading tabIndex="-1">{message}</h1><button className="journey-button journey-button-primary" type="button" onClick={onRetry}>{retryLabel}</button></main>;
}

