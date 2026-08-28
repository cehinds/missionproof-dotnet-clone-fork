import { ForkDisclosure } from "../components/feedback/ForkDisclosure.jsx";
import { JourneyNav } from "../components/navigation/JourneyNav.jsx";
import { forkDisclosure } from "../content/journeyContent.js";

export function AppShell({ currentGroup, onNavigate, children, mode = "demo" }) {
  return <div className="journey-app">
    <a className="journey-skip-link" href="#main">Skip to main content</a>
    <header className="journey-header">
      <JourneyNav currentGroup={currentGroup} onNavigate={onNavigate} />
      <button className="journey-wordmark" type="button" onClick={() => onNavigate("/app")} aria-label="MissionProof home"><span>MISSION</span><strong>PROOF</strong></button>
      <span className="journey-mode">{mode === "demo" ? "Local demo" : "Connected"}</span>
    </header>
    {children}
    <footer className="journey-footer"><ForkDisclosure content={forkDisclosure} /></footer>
  </div>;
}

