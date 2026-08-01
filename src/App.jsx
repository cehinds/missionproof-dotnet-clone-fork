import { useCallback, useEffect, useRef, useState } from "react";
import { goalDestinations, goals, phases } from "./data.js";
import { SearchOverlay } from "./search.jsx";
import { useSession } from "./store.js";
import { Mark } from "./ui.jsx";
import { ProfileSection } from "./screens/Profile.jsx";
import { CompetencySection, TranslationSection } from "./screens/Translate.jsx";
import { AfscPathsSection, ApprenticeshipSection, CivilianSection, CredentialSection, FederalSection, MapSection } from "./screens/Explore.jsx";
import { PlanSection } from "./screens/Plan.jsx";

const sections = {
  "profile/setup": ProfileSection,
  "translate/meaning": TranslationSection,
  "translate/competencies": CompetencySection,
  "explore/afsc": AfscPathsSection,
  "explore/civilian": CivilianSection,
  "explore/federal": FederalSection,
  "explore/map": MapSection,
  "explore/apprenticeships": ApprenticeshipSection,
  "explore/credentials": CredentialSection,
  "plan/itp": PlanSection,
};

function Wordmark() {
  return (
    <span className="wordmark">
      <span>MISSION</span>
      <span className="proof">PROOF</span>
    </span>
  );
}

function Topbar({ route, onGo, planCount, onSearch }) {
  const activePhase = phases.find(phase => phase.id === route.phase) || phases[0];
  const railRef = useRef(null);

  /* The rail scrolls horizontally on narrow screens; keep the current phase visible. */
  useEffect(() => {
    railRef.current?.querySelector(".phase.is-active")?.scrollIntoView({ inline: "center", block: "nearest" });
  }, [route.phase]);

  return (
    <header className="topbar">
      <a className="skip-link" href="#main">Skip to main content</a>

      <div className="topbar-main">
        <button className="brand" type="button" onClick={() => onGo("profile", "setup")} aria-label="MissionProof home">
          <Wordmark />
        </button>

        <nav className="phase-rail" aria-label="MissionProof phases" ref={railRef}>
          {phases.map((phase, index) => (
            <button
              type="button"
              key={phase.id}
              className={`phase ${route.phase === phase.id ? "is-active" : ""}`}
              aria-current={route.phase === phase.id ? "page" : undefined}
              onClick={() => onGo(phase.id, phase.sections[0].id)}
            >
              <span className="phase-num">{index + 1}</span>
              <span className="phase-copy">
                <strong>{phase.label}</strong>
                <small>{phase.blurb}</small>
              </span>
            </button>
          ))}
        </nav>

        <div className="topbar-right">
          <button type="button" className="icon-button" onClick={onSearch} aria-label="Search by skill">
            <span className="search-affordance">Search<kbd>/</kbd></span>
          </button>
          <button type="button" className="plan-chip" onClick={() => onGo("plan", "itp")}>
            Plan<span>{planCount}</span>
          </button>
          <span className="af-badge"><Mark name="badge" /></span>
        </div>
      </div>

      {activePhase.sections.length > 1 && (
        <nav className="section-tabs" aria-label={`${activePhase.label} sections`}>
          {activePhase.sections.map(section => (
            <button
              type="button"
              key={section.id}
              className={route.section === section.id ? "is-active" : ""}
              aria-current={route.section === section.id ? "page" : undefined}
              onClick={() => onGo(activePhase.id, section.id)}
            >
              {section.label}
            </button>
          ))}
        </nav>
      )}
    </header>
  );
}

function Welcome({ onEnter }) {
  return (
    <main className="welcome" id="main">
      <div className="welcome-card panel">
        <Wordmark />
        <p className="tagline">Turn mission experience into career evidence</p>
        <h1>This device is enrolled for the MissionProof beta.</h1>
        <p className="muted">
          Your access pass is active. MissionProof translates Air Force experience into civilian competencies,
          credentials, career pathways, and transition-planning evidence.
        </p>
        <button type="button" className="button-primary" onClick={onEnter}>Enter MissionProof</button>
        <p className="muted small">
          Access links are time-limited passes — not user accounts, proof of eligibility, or downloadable products.
        </p>
      </div>
    </main>
  );
}

function ConsentDialog({ onAgree }) {
  const [checked, setChecked] = useState(false);
  return (
    <div className="scrim" role="presentation">
      <div className="dialog" role="dialog" aria-modal="true" aria-labelledby="consent-title">
        <h2 id="consent-title">Before you start</h2>
        <p className="muted">MissionProof is a career-planning tool in beta. Please confirm you understand how to use it.</p>
        <label className="consent-check">
          <input type="checkbox" checked={checked} onChange={event => setChecked(event.target.checked)} />
          <span>
            I have read and agree to the <a href="#legal">Terms of Use</a>, <a href="#legal">Privacy Policy</a>, and{" "}
            <a href="#legal">Cookies &amp; local storage</a> notice, and I understand this is a <strong>beta</strong> — I will not enter
            sensitive, medical, classified, controlled, or operational information.
          </span>
        </label>
        <button type="button" className="button-primary wide" disabled={!checked} onClick={onAgree}>
          Agree &amp; continue
        </button>
      </div>
    </div>
  );
}

function GoalDialog({ onChoose }) {
  return (
    <div className="scrim" role="presentation">
      <div className="dialog wide-dialog" role="dialog" aria-modal="true" aria-labelledby="goal-title">
        <h2 id="goal-title">What brings you to MissionProof?</h2>
        <p className="muted">We will put the section that answers it first. You can change this any time from your profile.</p>
        <div className="goal-grid">
          {goals.map(goal => (
            <button type="button" className="goal-card" key={goal.name} onClick={() => onChoose(goal.name)}>
              <Mark name={goal.icon} />
              <strong>{goal.name}</strong>
              <span className="muted small">{goal.description}</span>
            </button>
          ))}
        </div>
        <button type="button" className="button-ghost centered" onClick={() => onChoose("")}>
          Just looking around →
        </button>
      </div>
    </div>
  );
}

export function App() {
  const session = useSession();
  const [route, setRoute] = useState({ phase: "profile", section: "setup" });
  const [searchOpen, setSearchOpen] = useState(false);

  const go = useCallback((phase, section) => {
    const target = phases.find(item => item.id === phase) || phases[0];
    const nextSection = target.sections.some(item => item.id === section) ? section : target.sections[0].id;
    setRoute({ phase: target.id, section: nextSection });
    window.scrollTo?.({ top: 0, behavior: "smooth" });
  }, []);

  /* "/" opens search from anywhere, as long as the user is not typing into a field. */
  useEffect(() => {
    const onKey = event => {
      const tag = event.target?.tagName;
      if (event.key === "/" && tag !== "INPUT" && tag !== "SELECT" && tag !== "TEXTAREA") {
        event.preventDefault();
        setSearchOpen(true);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  if (!session.entered) {
    return <Welcome onEnter={() => session.patch({ entered: true })} />;
  }

  if (!session.consented) {
    return (
      <>
        <Welcome onEnter={() => {}} />
        <ConsentDialog onAgree={() => session.patch({ consented: true })} />
      </>
    );
  }

  const needsGoal = !session.goal && session.goal !== null;
  const Section = sections[`${route.phase}/${route.section}`] || ProfileSection;

  return (
    <div className="app">
      <Topbar route={route} onGo={go} planCount={session.plan.length} onSearch={() => setSearchOpen(true)} />
      <main className="content" id="main">
        <Section session={session} onGo={go} />
        <footer className="app-footer">
          <span className="muted small">MissionProof beta · planning guidance only, not an eligibility decision.</span>
          <button type="button" className="button-link" onClick={session.reset}>Reset device data</button>
        </footer>
      </main>

      {needsGoal && (
        <GoalDialog
          onChoose={goal => {
            session.patch({ goal: goal || null });
            const destination = goalDestinations[goal];
            if (destination) go(destination[0], destination[1]);
          }}
        />
      )}

      {searchOpen && <SearchOverlay onClose={() => setSearchOpen(false)} onGo={go} />}
    </div>
  );
}
