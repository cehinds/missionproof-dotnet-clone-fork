import { useState } from "react";
import { emptyProfile, goals, profileFields } from "../data.js";
import { ChipGroup, EmptyState, Mark, Meter, NextStep, Note, SectionHead } from "../ui.jsx";

function summaryLine(profile) {
  const parts = [profile.afsc, profile.rank, profile.skill, profile.years && `${profile.years} yrs`, profile.education];
  return parts.filter(Boolean).join(" · ");
}

/*
 * The profile form is inline rather than a modal: it is the one thing every other
 * section depends on, so hiding it behind a dialog was the main reason people reached
 * later screens with nothing filled in.
 */
export function ProfileSection({ session, onGo }) {
  const { profile, goal, profilePercent, profileReady, patch } = session;
  const [draft, setDraft] = useState(profile);
  const [savedAt, setSavedAt] = useState(false);
  const dirty = profileFields.some(field => (draft[field.key] || "") !== (profile[field.key] || ""));

  const set = (key, value) => {
    setDraft(current => ({ ...current, [key]: value }));
    setSavedAt(false);
  };

  const save = event => {
    event.preventDefault();
    patch({ profile: draft });
    setSavedAt(true);
  };

  const clear = () => {
    setDraft(emptyProfile);
    patch({ profile: emptyProfile });
    setSavedAt(false);
  };

  const missing = profileFields.filter(field => !String(draft[field.key] ?? "").trim()).map(field => field.label);

  return (
    <>
      <SectionHead
        eyebrow="Starting point"
        title="Your service facts"
        lede="Five general, unclassified facts. Everything MissionProof shows you downstream is built from these — you can change them at any time."
        aside={
          <div className="completion-badge">
            <strong>{profilePercent}%</strong>
            <span>Profile complete</span>
            <Meter value={profilePercent} label="Profile completion" />
          </div>
        }
      />

      <div className="two-column">
        <form className="panel profile-form" onSubmit={save}>
          <div className="form-grid">
            {profileFields.map(field => (
              <label key={field.key} className={field.wide ? "wide" : ""}>
                <span>{field.label}</span>
                {field.type === "select" ? (
                  <select value={draft[field.key]} onChange={event => set(field.key, event.target.value)}>
                    <option value="">Select {field.label.toLowerCase()}</option>
                    {field.options.map(option => (
                      <option key={option}>{option}</option>
                    ))}
                  </select>
                ) : (
                  <input
                    type={field.type}
                    min={field.type === "number" ? 0 : undefined}
                    max={field.type === "number" ? 40 : undefined}
                    value={draft[field.key]}
                    placeholder={field.hint}
                    onChange={event => set(field.key, event.target.value)}
                  />
                )}
              </label>
            ))}
          </div>

          <div className="form-actions">
            <button type="submit" className="button-primary" disabled={!dirty}>
              {dirty ? "Save profile" : savedAt ? "Saved" : "Up to date"}
            </button>
            <button type="button" className="button-link" onClick={clear}>
              Clear
            </button>
            <small aria-live="polite">
              {missing.length ? `Still to add: ${missing.join(", ")}` : "All service facts recorded."}
            </small>
          </div>

          <Note tone="quiet">Use general service facts only. This is a beta prototype — no sensitive, medical, classified, controlled, or operational information.</Note>
        </form>

        <aside className="panel goal-panel">
          <div className="goal-panel-head">
            <span className="hex">
              <Mark name="user-large" />
            </span>
            <div>
              <p className="eyebrow">Your goal</p>
              <strong>{goal || "Not chosen yet"}</strong>
            </div>
          </div>
          <p className="muted">Your goal decides what MissionProof puts first. Change it whenever your plan changes.</p>
          <ChipGroup
            label="Choose your goal"
            options={goals.map(item => ({ name: item.name, sub: item.description }))}
            value={goal}
            onChange={name => patch({ goal: name })}
          />
        </aside>
      </div>

      {profileReady ? (
        <NextStep label="See what your service translates to →" onClick={() => onGo("translate", "meaning")} />
      ) : (
        <EmptyState title="Add your AFSC, rank, and skill level to unlock the rest">
          Those three facts are the minimum MissionProof needs before it can translate anything. The remaining fields sharpen the matches.
        </EmptyState>
      )}

      {profileReady && <p className="muted profile-summary">Using: {summaryLine(profile)}</p>}
    </>
  );
}
