import { useEffect, useMemo, useRef, useState } from "react";
import { afscLookupHint, catalogDestinations, catalogKinds, skillPrompts, skillSearchCatalog } from "./data.js";
import { searchSkillCatalog } from "./domain/missionproof.js";

const types = ["All pathways", "Civilian role", "Federal series", "Credential"];

/*
 * "Search by skill" was its own step in the eleven-step rail. It works better as one
 * index reachable from every screen, so the same query can be read as a civilian role,
 * a federal series, and a credential at once.
 */
export function SearchOverlay({ onClose, onGo, session }) {
  const [query, setQuery] = useState("");
  const [type, setType] = useState("All pathways");
  const inputRef = useRef(null);
  const { togglePlanItem, inPlan } = session;

  useEffect(() => {
    inputRef.current?.focus();
    const onKey = event => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  const results = useMemo(
    () => (query.trim() ? searchSkillCatalog(skillSearchCatalog, query, type) : []),
    [query, type],
  );

  return (
    <div className="scrim" role="presentation" onMouseDown={event => event.target === event.currentTarget && onClose()}>
      <div className="search-overlay" role="dialog" aria-modal="true" aria-label="Search by skill">
        <label className="search-field bare">
          <span className="sr-only">Search a skill, capability, or work you enjoy</span>
          <input
            ref={inputRef}
            value={query}
            onChange={event => setQuery(event.target.value)}
            placeholder="Search a skill — planning, cyber, training, logistics, leadership…"
          />
        </label>

        <div className="search-filters">
          <div className="chip-row">
            {skillPrompts.map(skill => (
              <button
                type="button"
                key={skill}
                className={`chip-mini ${query === skill ? "is-selected" : ""}`}
                onClick={() => setQuery(skill)}
              >
                {skill}
              </button>
            ))}
          </div>
          <label className="type-select">
            <span className="sr-only">Filter by pathway type</span>
            <select value={type} onChange={event => setType(event.target.value)}>
              {types.map(item => <option key={item}>{item}</option>)}
            </select>
          </label>
        </div>

        <div className="search-results" aria-live="polite">
          {!query.trim() && (
            <p className="muted search-hint">
              One query, read three ways — as a civilian role, a federal series, and a credential.
            </p>
          )}
          {query.trim() && !results.length && (
            <p className="muted search-hint">
              No pathway matches “{query.trim()}” yet. Try a broader skill such as planning, leadership, cyber, training, or logistics.
            </p>
          )}
          {results.map(item => {
            const saved = inPlan(item.id);
            return (
              <div className="search-result" key={item.id}>
                <button
                  type="button"
                  className="search-result-main"
                  onClick={() => {
                    const [phase, section, focus] = catalogDestinations[item.id] || ["explore", "civilian", null];
                    onGo(phase, section, focus);
                    onClose();
                  }}
                >
                  <span className="search-kind">{item.type}</span>
                  <strong>{item.title}</strong>
                  <span className="muted small">{item.detail}</span>
                </button>
                <button
                  type="button"
                  className={`save-button ${saved ? "is-saved" : ""}`}
                  aria-pressed={saved}
                  onClick={() => togglePlanItem({ ...item, kind: catalogKinds[item.type] || "role", detail: item.tags.slice(0, 2).join(" · ") })}
                >
                  {saved ? "In plan" : "Add to plan"}
                </button>
              </div>
            );
          })}
        </div>

        <footer className="search-foot">
          <span className="muted small">{afscLookupHint}</span>
          <span className="muted small">Esc to close</span>
        </footer>
      </div>
    </div>
  );
}
