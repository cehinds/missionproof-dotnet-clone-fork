import { useState } from "react";
import { planStageLabels, transitionTasks } from "../data.js";
import { EmptyState, Meter, NextStep, Note, SectionHead } from "../ui.jsx";

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
  const { profile, plan, completedTasks, togglePlanItem, toggleTask, profileReady, profileComplete, planProgress } = session;
  const [copied, setCopied] = useState("idle");
  const summary = buildSummary(profile, plan);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(summary);
      setCopied("done");
      window.setTimeout(() => setCopied("idle"), 2400);
    } catch {
      /* Clipboard access is refused on some origins — say so instead of failing silently. */
      setCopied("failed");
    }
  };

  const groups = groupOrder
    .map(kind => [kind, plan.filter(item => item.kind === kind)])
    .filter(([, items]) => items.length);

  return (
    <>
      <SectionHead
        eyebrow="Individual Transition Plan"
        title="Turn your evidence into a transition plan"
        lede="Your saved pathways, honest gaps, and next actions in one working plan. MissionProof organises the work; you own the decisions and the official verification."
        aside={
          <div className="completion-badge">
            <strong>{planProgress}%</strong>
            <span>Ready to brief</span>
            <Meter value={planProgress} label="Plan readiness" />
          </div>
        }
      />

      <div className="map-stats">
        {[[plan.length, "Saved pathways"], [`${completedTasks.length}/${transitionTasks.length}`, "Actions complete"], [`${profileComplete}/5`, "Profile facts"]].map(([value, label]) => (
          <div key={label}>
            <strong>{value}</strong>
            <span>{label}</span>
          </div>
        ))}
      </div>

      {!plan.length ? (
        <EmptyState
          title="No pathways saved yet"
          action={
            <button type="button" className="button-primary" onClick={() => onGo(profileReady ? "translate" : "profile", profileReady ? "competencies" : "setup")}>
              {profileReady ? "Start with your competencies" : "Set up your profile"}
            </button>
          }
        >
          Use <strong>Add to plan</strong> anywhere in Translate or Explore and it collects here — competencies, roles, federal series, apprenticeships, and credentials. Press <kbd>/</kbd> to search every pathway at once.
        </EmptyState>
      ) : (
        groups.map(([kind, items]) => (
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
        ))
      )}

      <section className="plan-group">
        <div className="results-head">
          <h2>Your next four moves</h2>
          <span>{completedTasks.length} complete</span>
        </div>
        <ul className="task-timeline">
          {transitionTasks.map((task, index) => {
            const done = completedTasks.includes(task.id);
            return (
              <li key={task.id} className={`panel task-row ${done ? "is-done" : ""}`}>
                <label>
                  <input type="checkbox" checked={done} onChange={() => toggleTask(task.id)} />
                  <i>{String(index + 1).padStart(2, "0")}</i>
                  <span>
                    <b>{task.phase}</b>
                    <strong>{task.title}</strong>
                    <small className="muted">{task.detail}</small>
                  </span>
                </label>
              </li>
            );
          })}
        </ul>
      </section>

      <section className="plan-group">
        <div className="results-head">
          <h2>Your summary</h2>
          <button type="button" className="button-ghost" onClick={copy}>
            {copied === "done" ? "Copied" : "Copy summary"}
          </button>
        </div>
        <pre className="panel summary-block">{summary || "Add your service facts to generate a summary."}</pre>
        {copied === "failed" && <Note tone="warn">Couldn’t reach the clipboard on this origin — select the text above and copy it manually.</Note>}
        <Note tone="quiet">Written for a résumé profile or LinkedIn About section. Review it against the actual posting before you send it anywhere.</Note>
      </section>

      <NextStep
        label="Find another pathway →"
        onClick={() => onGo("explore", "civilian")}
        secondaryLabel="← Review my profile"
        onSecondary={() => onGo("profile", "setup")}
      />
    </>
  );
}
