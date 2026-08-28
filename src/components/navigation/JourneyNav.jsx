import { useEffect, useRef, useState } from "react";
import { journeyGroups } from "../../app/routeRegistry.js";

export function JourneyNav({ currentGroup, onNavigate }) {
  const [open, setOpen] = useState(false);
  const triggerRef = useRef(null);
  const sheetRef = useRef(null);

  const close = ({ restoreFocus = true } = {}) => {
    setOpen(false);
    if (restoreFocus) queueMicrotask(() => triggerRef.current?.focus());
  };

  useEffect(() => {
    if (!open) return undefined;
    const sheet = sheetRef.current;
    const focusable = [...sheet.querySelectorAll("button:not([disabled])")];
    focusable[0]?.focus();
    const onKeyDown = event => {
      if (event.key === "Escape") {
        event.preventDefault();
        close();
        return;
      }
      if (event.key !== "Tab" || !focusable.length) return;
      const first = focusable[0];
      const last = focusable.at(-1);
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };
    sheet.addEventListener("keydown", onKeyDown);
    return () => sheet.removeEventListener("keydown", onKeyDown);
  }, [open]);

  const choose = group => {
    close({ restoreFocus: false });
    onNavigate(group.path);
  };

  return <>
    <button ref={triggerRef} className="journey-menu-trigger" type="button" aria-expanded={open} aria-controls="journey-sheet" onClick={() => setOpen(value => !value)}>Menu</button>
    <nav className="journey-nav-desktop" aria-label="MissionProof journeys">
      {journeyGroups.map(group => <button type="button" aria-current={currentGroup === group.label ? "page" : undefined} className={currentGroup === group.label ? "is-current" : ""} onClick={() => choose(group)} key={group.id}>{group.label}</button>)}
    </nav>
    {open && <div className="journey-sheet-scrim" onMouseDown={event => { if (event.target === event.currentTarget) close(); }}>
      <nav ref={sheetRef} className="journey-sheet" id="journey-sheet" aria-label="Choose a journey">
        <div className="journey-sheet-head"><strong>MissionProof journeys</strong><button type="button" onClick={() => close()}>Close</button></div>
        {journeyGroups.map(group => <button type="button" aria-current={currentGroup === group.label ? "page" : undefined} onClick={() => choose(group)} key={group.id}><span>{group.label}{currentGroup === group.label ? <small>Current journey</small> : null}</span><small>{group.description}</small></button>)}
      </nav>
    </div>}
  </>;
}

