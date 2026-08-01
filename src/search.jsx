import { useEffect, useMemo, useRef, useState } from "react";
import { afscPaths, civilianResults, credentialCatalog, federalLenses, federalSeries } from "./data.js";

/*
 * "Search by skill" used to be its own dead step in the rail. It works far better as
 * one index over everything the app knows, reachable from any screen.
 */
function buildIndex() {
  const entries = [];

  Object.entries(civilianResults).forEach(([field, roles]) => {
    roles.forEach(([title, fit, copy]) => {
      entries.push({ id: `role:${title}`, title, kind: "Civilian role", detail: `${fit} · ${field}`, text: `${title} ${copy} ${field}`, phase: "explore", section: "civilian" });
    });
  });

  credentialCatalog.forEach(item => {
    entries.push({ id: `credential:${item.name}`, title: item.name, kind: "Credential", detail: `${item.provider} · ${item.lane}`, text: `${item.name} ${item.provider} ${item.lane} ${item.note}`, phase: "explore", section: "credentials" });
  });

  Object.entries(federalSeries).forEach(([lens, list]) => {
    list.forEach(([code, title, note]) => {
      entries.push({ id: `federal:${code}`, title: `${code} — ${title}`, kind: "Federal series", detail: lens, text: `${code} ${title} ${note} ${lens}`, phase: "explore", section: "federal" });
    });
  });

  federalLenses.forEach(name => {
    entries.push({ id: `lens:${name}`, title: name, kind: "Federal pathway", detail: "Pathway lens", text: name, phase: "explore", section: "federal" });
  });

  afscPaths.forEach(path => {
    entries.push({ id: `afsc:${path.code}`, title: `${path.code} — ${path.title}`, kind: "Air Force path", detail: path.mage, text: `${path.code} ${path.title} ${path.note} ${path.civilian}`, phase: "explore", section: "afsc" });
  });

  return entries.map(entry => ({ ...entry, text: entry.text.toLowerCase() }));
}

const index = buildIndex();

export function SearchOverlay({ onClose, onGo }) {
  const [query, setQuery] = useState("");
  const inputRef = useRef(null);

  useEffect(() => {
    inputRef.current?.focus();
    const onKey = event => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  const results = useMemo(() => {
    const needle = query.trim().toLowerCase();
    if (!needle) return [];
    return index.filter(entry => entry.text.includes(needle)).slice(0, 12);
  }, [query]);

  return (
    <div className="scrim" role="presentation" onMouseDown={event => event.target === event.currentTarget && onClose()}>
      <div className="search-overlay" role="dialog" aria-modal="true" aria-label="Search by skill">
        <label className="search-field bare">
          <span className="sr-only">Search roles, credentials, series, and paths</span>
          <input
            ref={inputRef}
            value={query}
            onChange={event => setQuery(event.target.value)}
            placeholder="Search a skill, role, credential, or series — planning, security, 2210…"
          />
        </label>

        <div className="search-results" aria-live="polite">
          {!query.trim() && <p className="muted search-hint">Search across civilian roles, federal series, Air Force paths, and credentials.</p>}
          {query.trim() && !results.length && <p className="muted search-hint">Nothing matches “{query.trim()}”. Try a broader skill word such as planning, supply, or security.</p>}
          {results.map(entry => (
            <button
              type="button"
              key={entry.id}
              className="search-result"
              onClick={() => {
                onGo(entry.phase, entry.section);
                onClose();
              }}
            >
              <span className="search-kind">{entry.kind}</span>
              <strong>{entry.title}</strong>
              <span className="muted small">{entry.detail}</span>
            </button>
          ))}
        </div>

        <footer className="search-foot">
          <span className="muted small">Esc to close</span>
        </footer>
      </div>
    </div>
  );
}
