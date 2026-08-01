import { competencies, translationCards } from "../data.js";
import { EmptyState, Meter, NextStep, Note, Pill, SectionHead } from "../ui.jsx";

function ProfileGate({ onGo }) {
  return (
    <EmptyState
      title="Set your profile first"
      action={
        <button type="button" className="button-primary" onClick={() => onGo("profile", "setup")}>
          Open profile
        </button>
      }
    >
      Add your AFSC, rank, and skill level, then come back — this section is built entirely from those facts.
    </EmptyState>
  );
}

export function TranslationSection({ session, onGo }) {
  if (!session.profileReady) {
    return (
      <>
        <SectionHead eyebrow="My translation" title="What your Air Force experience means" />
        <ProfileGate onGo={onGo} />
      </>
    );
  }

  return (
    <>
      <SectionHead
        eyebrow="My translation"
        title="What your Air Force experience means"
        lede="Your service in civilian, federal, and project-management language — what transfers, and the gaps worth naming honestly."
      />
      <div className="card-grid three">
        {translationCards.map(card => (
          <article className="panel info-card" key={card.title}>
            <p className="eyebrow">{card.label}</p>
            <h3>{card.title}</h3>
            <p className="muted">{card.copy}</p>
          </article>
        ))}
      </div>
      <Note tone="quiet">Planning guidance only. Hiring requirements vary by employer and posting.</Note>
      <NextStep label="See your competency profile →" onClick={() => onGo("translate", "competencies")} />
    </>
  );
}

export function CompetencySection({ session, onGo }) {
  const { togglePlanItem, inPlan } = session;

  if (!session.profileReady) {
    return (
      <>
        <SectionHead eyebrow="Competency profile" title="Your strengths, in civilian language" />
        <ProfileGate onGo={onGo} />
      </>
    );
  }

  return (
    <>
      <SectionHead
        eyebrow="Competency profile"
        title="Your strengths, in civilian language"
        lede="Ranked by how strongly your service builds each competency. Add the ones you want to pursue to your plan — they carry through to roles, credentials, and your ITP."
      />

      <ul className="competency-list">
        {competencies.map((item, index) => {
          const id = `competency:${item.name}`;
          const saved = inPlan(id);
          return (
            <li key={item.name} className="panel competency-row">
              <div className="competency-rank">{String(index + 1).padStart(2, "0")}</div>
              <div className="competency-main">
                <div className="competency-title">
                  <h3>{item.name}</h3>
                  <Pill tone={item.evidence >= 80 ? "teal" : "blue"}>{item.evidence}% evidence</Pill>
                </div>
                <Meter value={item.evidence} label={`${item.name} evidence`} />
                <p className="muted">{item.note}</p>
                <ul className="tag-row">
                  {item.skills.map(skill => (
                    <li key={skill}>{skill}</li>
                  ))}
                </ul>
              </div>
              <button
                type="button"
                className={`save-button ${saved ? "is-saved" : ""}`}
                aria-pressed={saved}
                onClick={() => togglePlanItem({ id, kind: "competency", title: item.name, detail: `${item.evidence}% evidence` })}
              >
                {saved ? "In plan" : "Add to plan"}
              </button>
            </li>
          );
        })}
      </ul>

      <NextStep
        label="Explore where these lead →"
        onClick={() => onGo("explore", "civilian")}
        secondaryLabel="← My translation"
        onSecondary={() => onGo("translate", "meaning")}
      />
    </>
  );
}
