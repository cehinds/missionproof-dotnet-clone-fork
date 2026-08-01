import { iconSources } from "./data.js";

export function Mark({ name, className = "" }) {
  return <img alt="" aria-hidden="true" className={`asset-icon ${className}`} src={iconSources[name]} />;
}

export function Eyebrow({ children }) {
  return <p className="eyebrow">{children}</p>;
}

export function SectionHead({ eyebrow, title, lede, aside }) {
  return (
    <header className="section-head">
      <div>
        {eyebrow && <Eyebrow>{eyebrow}</Eyebrow>}
        <h1>{title}</h1>
        {lede && <p className="lede">{lede}</p>}
      </div>
      {aside && <div className="section-head-aside">{aside}</div>}
    </header>
  );
}

export function Note({ tone = "neutral", children }) {
  return <p className={`note note-${tone}`}>{children}</p>;
}

/* Long-form legal and process text stays collapsed so it never buries the task. */
export function Disclosure({ summary, children, className = "" }) {
  return (
    <details className={`disclosure ${className}`}>
      <summary>{summary}</summary>
      <div className="disclosure-body">{children}</div>
    </details>
  );
}

export function EmptyState({ title, children, action }) {
  return (
    <div className="empty-state">
      <strong>{title}</strong>
      {children && <p>{children}</p>}
      {action}
    </div>
  );
}

export function SaveButton({ active, onClick, label = "Add to plan", activeLabel = "In plan" }) {
  return (
    <button type="button" className={`save-button ${active ? "is-saved" : ""}`} aria-pressed={active} onClick={onClick}>
      {active ? activeLabel : label}
    </button>
  );
}

export function Pill({ tone = "teal", children }) {
  return <span className={`pill pill-${tone}`}>{children}</span>;
}

export function Meter({ value, label }) {
  return (
    <div className="meter" role="img" aria-label={`${label}: ${value}%`}>
      <i style={{ width: `${Math.max(3, value)}%` }} />
    </div>
  );
}

/* One consistent control for every filter row in the app. */
export function ChipGroup({ options, value, onChange, label, allowClear = false }) {
  return (
    <div className="chip-group" role="group" aria-label={label}>
      {options.map(option => {
        const name = typeof option === "string" ? option : option.name;
        const sub = typeof option === "string" ? null : option.sub;
        const selected = value === name;
        return (
          <button
            type="button"
            key={name}
            className={`chip ${selected ? "is-selected" : ""}`}
            aria-pressed={selected}
            onClick={() => onChange(allowClear && selected ? "" : name)}
          >
            <strong>{name}</strong>
            {sub && <small>{sub}</small>}
          </button>
        );
      })}
    </div>
  );
}

export function NextStep({ label, onClick, secondaryLabel, onSecondary }) {
  return (
    <div className="next-step">
      {secondaryLabel && (
        <button type="button" className="button-ghost" onClick={onSecondary}>
          {secondaryLabel}
        </button>
      )}
      <button type="button" className="button-primary" onClick={onClick}>
        {label}
      </button>
    </div>
  );
}
