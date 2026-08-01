import { useState } from "react";
import { planStageLabels } from "../data.js";
import { EmptyState, Note, SectionHead } from "../ui.jsx";

const groupOrder = ["competency", "afsc", "role", "federal", "credential", "apprenticeship"];
const groupLabels = {
  competency: "Competencies you are claiming",
  apprenticeship: "Apprenticeship tracks",
  ...planStageLabels,
  role: "Civilian roles",
  federal: "Federal targets",
  credential: "Credentials to earn",
  afsc: "Air Force paths",
};

function buildSummary(profile, plan) {
  const facts = [profile.afsc && `AFSC ${profile.afsc}`, profile.rank, profile.skill, profile.years && `${profile.years} years of service`, profile.education]
    .filter(Boolean)
    .join(" · ");
  const competencies = plan.filter(item => item.kind === "competency").map(item => item.title);
  const targets = plan.filter(item => item.kind === "role" || item.kind === "federal").map(item => item.title);
  const credentials = plan.filter(item => item.kind === "credential").map(item => item.title);

  return [
    facts && `Service record: ${facts}.`,
    competencies.length && `Core competencies: ${competencies.join(", ")}.`,
    targets.length && `Target roles: ${targets.join(", ")}.`,
    credentials.length && `Credentials in progress or planned: ${credentials.join(", ")}.`,
  ]
    .filter(Boolean)
    .join("\n");
}

export function PlanSection({ session, onGo }) {
  const { profile, plan, togglePlanItem, profileReady } = session;
  const [copied, setCopied] = useState(false);
  const summary = buildSummary(profile, plan);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(summary);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2400);
    } catch {
      setCopied(false);
    }
  };

  const groups = groupOrder
    .map(kind => [kind, plan.filter(item => item.kind === kind)])
    .filter(([, items]) => items.length);

  return (
    <>
      <SectionHead
        eyebrow="Transition plan"
        title="Everything you have saved, in one place"
        lede="Your plan builds itself as you explore. Remove anything that no longer fits, then take the summary into your ITP, résumé, or LinkedIn profile."
        aside={
          <div className="completion-badge">
            <strong>{plan.length}</strong>
            <span>Items saved</span>
          </div>
        }
      />

      {!plan.length ? (
        <EmptyState
          title="Nothing saved yet"
          action={
            <button type="button" className="button-primary" onClick={() => onGo(profileReady ? "translate" : "profile", profileReady ? "competencies" : "setup")}>
              {profileReady ? "Start with your competencies" : "Set up your profile"}
            </button>
          }
        >
          Use <strong>Add to plan</strong> anywhere in Translate or Explore and it collects here — competencies, roles, federal series, apprenticeships, and credentials.
        </EmptyState>
      ) : (
        <>
          {groups.map(([kind, items]) => (
            <section className="plan-group" key={kind}>
              <div className="results-head">
                <h2>{groupLabels[kind]}</h2>
                <span>{items.length}</span>
              </div>
              <ul className="plan-list">
                {items.map(item => (
                  <li className="panel plan-row" key={item.id}>
                    <div>
                      <strong>{item.title}</strong>
                      {item.detail && <span className="muted small">{item.detail}</span>}
                    </div>
                    <button type="button" className="button-link" onClick={() => togglePlanItem(item)}>
                      Remove
                    </button>
                  </li>
                ))}
              </ul>
            </section>
          ))}

          <section className="plan-group">
            <div className="results-head">
              <h2>Your summary</h2>
              <button type="button" className="button-ghost" onClick={copy}>
                {copied ? "Copied" : "Copy summary"}
              </button>
            </div>
            <pre className="panel summary-block">{summary || "Add your service facts to generate a summary."}</pre>
            <Note tone="quiet">Written for a résumé profile or LinkedIn About section. Review it against the actual posting before you send it anywhere.</Note>
          </section>
        </>
      )}
    </>
  );
}
