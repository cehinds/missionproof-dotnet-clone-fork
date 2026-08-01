import { useMemo, useState } from "react";
import {
  afscPaths, apprenticeshipTracks, civilianFields, civilianResults, credentialCatalog,
  credentialLanes, federalLenses, federalSeries, mapDatasets, mapRegions, mapStateRows,
} from "../data.js";
import { ChipGroup, Disclosure, EmptyState, Mark, NextStep, Note, Pill, SaveButton, SectionHead } from "../ui.jsx";

function ProfileHint({ profile, onGo }) {
  if (profile.afsc) {
    return (
      <p className="muted profile-summary">
        Matching against <strong>{profile.afsc}</strong>
        {profile.education ? ` · ${profile.education}` : ""}
        {profile.years ? ` · ${profile.years} yrs` : ""}
      </p>
    );
  }
  return (
    <Note tone="warn">
      No AFSC recorded yet, so these are generic results.{" "}
      <button type="button" className="button-link" onClick={() => onGo("profile", "setup")}>
        Add your service facts
      </button>{" "}
      to match them to you.
    </Note>
  );
}

export function AfscPathsSection({ session, onGo }) {
  const { togglePlanItem, inPlan, profile } = session;
  const [query, setQuery] = useState("");
  const results = afscPaths.filter(path =>
    `${path.code} ${path.title} ${path.note} ${path.civilian}`.toLowerCase().includes(query.trim().toLowerCase()));

  return (
    <>
      <SectionHead
        eyebrow="Air Force paths"
        title="Retraining paths open to you"
        lede="Specialties commonly reachable from your record, with the MAGE line each one tests against and the civilian role it feeds. Confirm current requirements with your career-field manager."
      />
      <ProfileHint profile={profile} onGo={onGo} />

      <label className="search-field">
        <span>Filter paths</span>
        <input value={query} onChange={event => setQuery(event.target.value)} placeholder="cyber, logistics, finance, 3D0X2" />
      </label>

      {results.length ? (
        <div className="card-grid three">
          {results.map(path => {
            const id = `afsc:${path.code}`;
            return (
              <article className="panel result-card" key={path.code}>
                <div className="card-top">
                  <Pill tone="blue">{path.code}</Pill>
                  <SaveButton active={inPlan(id)} onClick={() => togglePlanItem({ id, kind: "afsc", title: `${path.code} — ${path.title}`, detail: path.mage })} />
                </div>
                <h3>{path.title}</h3>
                <p className="muted">{path.note}</p>
                <dl className="mini-facts">
                  <div><dt>MAGE line</dt><dd>{path.mage}</dd></div>
                  <div><dt>Civilian equivalent</dt><dd>{path.civilian}</dd></div>
                </dl>
              </article>
            );
          })}
        </div>
      ) : (
        <EmptyState title="No paths match that filter">Try a broader term such as cyber, logistics, emergency, or finance.</EmptyState>
      )}

      <NextStep label="Civilian roles →" onClick={() => onGo("explore", "civilian")} />
    </>
  );
}

export function CivilianSection({ session, onGo }) {
  const { profile, togglePlanItem, inPlan } = session;
  const [field, setField] = useState("Best fits");
  const results = civilianResults[field] || civilianResults["Best fits"];

  return (
    <>
      <SectionHead
        eyebrow="Civilian roles"
        title="What civilian jobs fit your experience?"
        lede="Roles matched to your competencies, education, and time in service — including what you would need to build first."
      />
      <ProfileHint profile={profile} onGo={onGo} />

      <ChipGroup
        label="Field of work"
        options={civilianFields.map(([name, sub]) => ({ name, sub }))}
        value={field}
        onChange={setField}
      />

      <div className="results-head">
        <h2>{field}</h2>
        <span>{results.length} roles</span>
      </div>

      <div className="card-grid three" aria-live="polite">
        {results.map(([title, fit, copy]) => {
          const id = `role:${title}`;
          return (
            <article className="panel result-card" key={title}>
              <div className="card-top">
                <Pill tone={fit === "Strong transfer" ? "teal" : fit === "Good fit" ? "blue" : "amber"}>{fit}</Pill>
                <SaveButton active={inPlan(id)} onClick={() => togglePlanItem({ id, kind: "role", title, detail: fit })} />
              </div>
              <h3>{title}</h3>
              <p className="muted">{copy}</p>
              <button type="button" className="button-link card-foot" onClick={() => onGo("explore", "federal")}>
                Compare the federal path →
              </button>
            </article>
          );
        })}
      </div>

      <Note tone="quiet">Planning guidance only — verify against the actual job description before you apply.</Note>
      <NextStep label="Federal match →" onClick={() => onGo("explore", "federal")} secondaryLabel="← Air Force paths" onSecondary={() => onGo("explore", "afsc")} />
    </>
  );
}

export function FederalSection({ session, onGo }) {
  const { profile, togglePlanItem, inPlan } = session;
  const [lens, setLens] = useState("Intelligence analysis");
  const [query, setQuery] = useState("");

  /* A four-digit entry is treated as a series number; anything else filters the lens list. */
  const custom = query.trim();
  const matchedLenses = custom
    ? federalLenses.filter(name => name.toLowerCase().includes(custom.toLowerCase()))
    : federalLenses;
  const series = /^\d{4}$/.test(custom)
    ? [[custom, "Custom series lookup", "Verify grade, education, and specialized experience in the official announcement."]]
    : federalSeries[lens] || [];

  return (
    <>
      <SectionHead
        eyebrow="Federal match"
        title="Where your evidence maps in the federal system"
        lede="Occupational series that commonly align with your record. These are research starting points, never an eligibility decision."
      />
      <ProfileHint profile={profile} onGo={onGo} />

      <Disclosure summary="Planning guidance & disclaimers">
        <p>Series suggestions are research starting points. Always verify grade, education, experience, and hiring-path requirements in the official announcement on USAJOBS. Veteran authorities such as VRA, VEOA, and 30% disabled preference have their own rules and are not evaluated here.</p>
      </Disclosure>

      <label className="search-field">
        <span>Search a series number or pathway</span>
        <input value={query} onChange={event => setQuery(event.target.value)} placeholder="0132, 2210, contracting, budget, safety" />
      </label>

      {matchedLenses.length ? (
        <ChipGroup label="Federal pathway" options={matchedLenses} value={lens} onChange={setLens} />
      ) : (
        <Note tone="warn">No pathway matches “{custom}”. Clear the search or try a broader term.</Note>
      )}

      <div className="results-head">
        <h2>{/^\d{4}$/.test(custom) ? `Series ${custom}` : lens}</h2>
        <span>{series.length} series</span>
      </div>

      {series.length ? (
        <div className="card-grid two" aria-live="polite">
          {series.map(([code, title, note]) => {
            const id = `federal:${code}`;
            return (
              <article className="panel result-card" key={code}>
                <div className="card-top">
                  <Pill tone="blue">Research lead</Pill>
                  <SaveButton active={inPlan(id)} onClick={() => togglePlanItem({ id, kind: "federal", title: `${code} — ${title}`, detail: "Verify on USAJOBS" })} />
                </div>
                <h3>{code} — {title}</h3>
                <p className="muted">{note}</p>
              </article>
            );
          })}
        </div>
      ) : (
        <EmptyState title="No series mapped for this pathway yet">
          Try intelligence, cyber, program analysis, logistics, safety, contracting, or budget — or enter a four-digit series above.
        </EmptyState>
      )}

      <NextStep label="Jobs & bases map →" onClick={() => onGo("explore", "map")} secondaryLabel="← Civilian roles" onSecondary={() => onGo("explore", "civilian")} />
    </>
  );
}

export function MapSection({ onGo }) {
  const [dataset, setDataset] = useState("all");
  const [view, setView] = useState("map");
  const [layers, setLayers] = useState({ bases: false, cities: false, pay: false });
  const [selectedState, setSelectedState] = useState("");
  const selected = mapDatasets.find(item => item.value === dataset) || mapDatasets[0];
  const toggleLayer = key => setLayers(current => ({ ...current, [key]: !current[key] }));

  return (
    <>
      <SectionHead
        eyebrow="Jobs & bases"
        title="Where the jobs are — and where the bases are"
        lede="Collected job records and federal openings by state, alongside 112 military installations. Brighter means more collected records."
      />

      <div className="map-stats">
        {[[selected.count, "Jobs shown"], ["51", "States covered"], [selected.top, "Top job state"], [selected.remote, "Remote / national"]].map(([value, label]) => (
          <div key={label}>
            <strong>{value}</strong>
            <span>{label}</span>
          </div>
        ))}
      </div>

      <div className="map-toolbar">
        <label className="sr-only" htmlFor="map-dataset">Map dataset</label>
        <select id="map-dataset" value={dataset} onChange={event => { setDataset(event.target.value); setSelectedState(""); }}>
          {mapDatasets.map(item => <option value={item.value} key={item.value}>{item.label}</option>)}
        </select>
        <div className="toolbar-group" role="group" aria-label="Map layers">
          {[["bases", "Bases"], ["cities", "Cities"], ["pay", "Pay lens"]].map(([key, label]) => (
            <button type="button" key={key} className={layers[key] ? "is-active" : ""} aria-pressed={layers[key]} onClick={() => toggleLayer(key)}>
              {label}
            </button>
          ))}
        </div>
        <div className="toolbar-group" role="group" aria-label="Map view">
          {[["map", "Map"], ["regions", "Regions"], ["table", "Table"]].map(([key, label]) => (
            <button type="button" key={key} className={view === key ? "is-active" : ""} aria-pressed={view === key} onClick={() => setView(key)}>
              {label}
            </button>
          ))}
        </div>
      </div>

      {view === "regions" && (
        <div className="card-grid three" aria-live="polite">
          {mapRegions.map(([rank, state, score, metrics, role, base]) => (
            <button type="button" className="panel region-card" key={state} onClick={() => { setSelectedState(state); setView("map"); }}>
              <div className="card-top">
                <span className="rank">{rank}</span>
                <em>{score}</em>
              </div>
              <h3>{state}</h3>
              <p className="muted">{metrics}</p>
              <dl className="mini-facts">
                <div><dt>Top role</dt><dd>{role}</dd></div>
                <div><dt>Top base</dt><dd>{base}</dd></div>
              </dl>
            </button>
          ))}
        </div>
      )}

      {view === "table" && (
        <div className="panel table-wrap" aria-live="polite">
          <table>
            <thead><tr><th scope="col">State</th><th scope="col">Collected jobs</th></tr></thead>
            <tbody>
              {mapStateRows.map(([state, jobs]) => (
                <tr key={state}>
                  <td><button type="button" className="button-link" onClick={() => { setSelectedState(state); setView("map"); }}>{state}</button></td>
                  <td>{jobs}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {view === "map" && (
        <div className="map-workspace">
          <div className="panel map-canvas">
            <button type="button" className="map-image" onClick={() => setSelectedState("Texas")} aria-label="Open Texas job and base details">
              <img src="/assets/heatmap-us.png" alt="United States job demand heatmap; Texas is the strongest collected-job market" />
            </button>
            <div className="map-legend">
              <span>fewer jobs</span><i /><span>more</span>
            </div>
            {layers.bases && (
              <div className="service-legend">
                {["AF", "Space Force", "Army", "Navy", "USMC", "Joint"].map(service => (
                  <span key={service}><i />{service}</span>
                ))}
              </div>
            )}
          </div>

          <aside className="panel map-detail" aria-live="polite">
            {selectedState ? (
              <>
                <p className="eyebrow">State drill-in</p>
                <h3>{selectedState}</h3>
                <strong className="big-number">{selectedState === "Texas" ? "1,311" : "—"}</strong>
                <span className="muted">collected opportunities</span>
                <dl className="mini-facts">
                  <div><dt>Top role</dt><dd>{selectedState === "Texas" ? "Oilfield Operations" : "Program Management"}</dd></div>
                  <div><dt>Top city</dt><dd>{selectedState === "Texas" ? "Dallas–Fort Worth" : "Regional market"}</dd></div>
                  <div><dt>Top base</dt><dd>{selectedState === "Texas" ? "Joint Base San Antonio – Lackland" : "View installation mix"}</dd></div>
                </dl>
                <button type="button" className="button-ghost" onClick={() => setSelectedState("")}>Clear selection</button>
              </>
            ) : (
              <>
                <p className="eyebrow">Drill in</p>
                <p className="muted">Select a state on the map, in Regions, or in Table to see its occupation mix, top cities, and installations.</p>
                {layers.pay && <div className="callout"><strong>Pay lens</strong><span>Published ranges only; hourly and estimated pay are excluded.</span></div>}
                {layers.cities && <div className="callout"><strong>Top cities</strong><span>Dallas–Fort Worth · Washington, D.C. · Seattle · Austin</span></div>}
                {layers.bases && <div className="callout"><strong>112 installations</strong><span>Air Force, Space Force, Army, Navy, USMC, and Joint.</span></div>}
              </>
            )}
          </aside>
        </div>
      )}

      <Note tone="quiet">Region score combines job-demand share with military-personnel share. Coverage reflects collected postings, not total labor demand — a planning signal, not a hiring guarantee. July 2026.</Note>
      <NextStep label="Apprenticeships →" onClick={() => onGo("explore", "apprenticeships")} secondaryLabel="← Federal match" onSecondary={() => onGo("explore", "federal")} />
    </>
  );
}

export function ApprenticeshipSection({ session, onGo }) {
  const { profile, togglePlanItem, inPlan } = session;

  return (
    <>
      <SectionHead
        eyebrow="Apprenticeships"
        title="DOL registered apprenticeship pathways"
        lede="USMAP excludes the Air Force, so this maps your AFSC straight to Department of Labor standards — your service time can count toward the on-the-job hours."
      />
      <ProfileHint profile={profile} onGo={onGo} />

      {profile.afsc ? (
        <div className="card-grid three">
          {apprenticeshipTracks.map(track => {
            const id = `apprenticeship:${track.title}`;
            return (
              <article className="panel result-card" key={track.title}>
                <div className="card-top">
                  <Pill tone="blue">{track.hours}</Pill>
                  <SaveButton active={inPlan(id)} onClick={() => togglePlanItem({ id, kind: "apprenticeship", title: track.title, detail: track.hours })} />
                </div>
                <h3>{track.title}</h3>
                <p className="muted">{track.note}</p>
              </article>
            );
          })}
        </div>
      ) : (
        <EmptyState
          title="Set your AFSC to see matched apprenticeships"
          action={<button type="button" className="button-primary" onClick={() => onGo("profile", "setup")}>Open profile</button>}
        >
          Registered apprenticeship standards are matched by career field, so MissionProof needs your AFSC first.
        </EmptyState>
      )}

      <Note tone="quiet">Live registry matching is not part of this prototype. Confirm sponsor availability and credit for prior experience with the program sponsor.</Note>
      <NextStep label="Credentials →" onClick={() => onGo("explore", "credentials")} secondaryLabel="← Jobs & bases" onSecondary={() => onGo("explore", "map")} />
    </>
  );
}

export function CredentialSection({ session, onGo }) {
  const { profile, plan, togglePlanItem, inPlan } = session;
  const [lane, setLane] = useState("");
  const [query, setQuery] = useState("");

  /* Credentials the user's saved competencies point at come first; the rest stay searchable. */
  const savedCompetencies = useMemo(
    () => new Set(plan.filter(item => item.kind === "competency").map(item => item.title)),
    [plan],
  );

  const matched = credentialCatalog.filter(item => savedCompetencies.has(item.competency));
  const needle = query.trim().toLowerCase();
  const searched = credentialCatalog.filter(item =>
    (!lane || item.lane === lane) &&
    (!needle || `${item.name} ${item.provider} ${item.lane}`.toLowerCase().includes(needle)));

  const card = item => {
    const id = `credential:${item.name}`;
    return (
      <article className="panel result-card" key={item.name}>
        <div className="card-top">
          <Pill tone={item.degree ? "amber" : "teal"}>{item.degree ? "Degree expected" : "No degree required"}</Pill>
          <SaveButton active={inPlan(id)} onClick={() => togglePlanItem({ id, kind: "credential", title: item.name, detail: item.provider })} />
        </div>
        <h3>{item.name}</h3>
        <p className="muted small">{item.provider} · {item.lane}</p>
        <p className="muted">{item.note}</p>
      </article>
    );
  };

  return (
    <>
      <SectionHead
        eyebrow="Credentials"
        title="Credentials matched to you"
        lede="Matched against the competencies you saved, not just your AFSC. Every credential is a research lead until you verify current AF COOL eligibility and provider requirements."
      />
      <ProfileHint profile={profile} onGo={onGo} />

      <div className="results-head">
        <h2>Matched to your competencies</h2>
        <span>{matched.length} credentials</span>
      </div>

      {matched.length ? (
        <div className="card-grid three">{matched.map(card)}</div>
      ) : (
        <EmptyState
          title="Save a competency to see matched credentials"
          action={<button type="button" className="button-primary" onClick={() => onGo("translate", "competencies")}>Open competency profile</button>}
        >
          MissionProof matches credentials to what you have actually developed. Add a competency to your plan and the matches appear here.
        </EmptyState>
      )}

      <Disclosure summary="How to actually get a credential funded (AF COOL)">
        <ol>
          <li><strong>Confirm eligibility</strong> — the credential must be listed for your AFSC on AF COOL, and you must complete it while on active duty.</li>
          <li><strong>Request funding through the AF COOL portal (via AFVEC)</strong> — select the credential, build the funding request, and route it for approval.</li>
          <li><strong>Mind the clock</strong> — confirm current funding and separation timelines with your base education office.</li>
          <li><strong>Complete and document</strong> — finish before separation and record the completion as evidence in your transition plan.</li>
        </ol>
        <p>Planning guidance — confirm current rules and the exact request flow with your base education office or A&amp;FRC.</p>
      </Disclosure>

      <div className="results-head">
        <h2>Browse all credentials</h2>
        <span>{searched.length} of {credentialCatalog.length}</span>
      </div>

      <label className="search-field">
        <span>Search by name, provider, or lane</span>
        <input value={query} onChange={event => setQuery(event.target.value)} placeholder="Security+, FAC-C, CDFM, Green Belt" />
      </label>
      <ChipGroup label="Credential lane" options={credentialLanes} value={lane} onChange={setLane} allowClear />

      {searched.length ? (
        <div className="card-grid three" aria-live="polite">{searched.map(card)}</div>
      ) : (
        <EmptyState title="No credentials match that search">Clear the lane filter or try a broader keyword.</EmptyState>
      )}

      <NextStep label="Build my transition plan →" onClick={() => onGo("plan", "itp")} secondaryLabel="← Apprenticeships" onSecondary={() => onGo("explore", "apprenticeships")} />
    </>
  );
}

export function ExploreIcon({ name }) {
  return <Mark name={name} />;
}
