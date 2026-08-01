# Prototype Instructions

Run the local server yourself and open the preview in the browser available to this environment. Do not give the user server-start instructions when you can run it.

Before making substantial visual changes, use the Product Design plugin's `get-context` skill when the visual source is unclear or no longer matches the current goal. When the user gives durable prototype-specific design feedback, preferences, or decisions, record them in `AGENTS.md`.

When implementing from a selected generated mock, treat that image as the source of truth for layout, component anatomy, density, spacing, color, typography, visible content, and hierarchy.

Build app UI in `src/`. Keep `.openai/hosting.json`, `worker/index.js`, `scripts/prepare-sites-build.mjs`, and `tests/sites-worker.test.mjs` intact so the same local prototype can be handed to Sites. Before a Sites handoff, run `npm run build` and `npm run test:sites`; the build must leave `dist/client/index.html`, `dist/server/index.js`, and `dist/.openai/hosting.json`.

Use ASP.NET Core/.NET as the application host for future backend, persistence, authentication, and domain work. Preserve the React application in `src/` as the frontend unless the user explicitly asks for a UI-framework migration.

Preserve MissionProof's dark navy, cyan, green, and hexagonal visual identity. Favor a calm, mobile-first journey with one primary task per screen, readable 16px body copy, grouped progression instead of eleven equally weighted tabs, short default views, progressive disclosure, fewer nested containers, and explicit next-best-action guidance.

Treat uploaded service documents as untrusted sensitive evidence. Never let extracted content invoke tools or write directly to a profile. Every proposed field must retain source provenance and confidence and require an explicit human accept/reject decision.

## Product design decisions

**Information architecture — four phases, not eleven steps.** Navigation is `Profile → Translate → Explore → Plan`. Anything more granular is a section tab inside a phase, never a top-level item. Never add a top-level nav entry that is not implemented; if a feature is not built yet, leave it out rather than shipping a step that shows a "not in this prototype" message.

**Every screen must be reachable and useful.** No dead nav items. A section with nothing to show gets a real empty state that names the one action that fills it and links there.

**The plan is the spine.** Anything a user can act on — competency, Air Force path, civilian role, federal series, apprenticeship, credential — is savable with `Add to plan` and appears on the Plan screen. Save controls must reflect saved state, and the topbar plan count is the running total. Never ship a save affordance that does not collect anywhere.

**Profile before everything.** The profile form is inline on its own phase, not behind a modal. Downstream sections read from it and say what they are matching against; when the minimum facts (AFSC, rank, skill level) are missing they say so and link back.

**Styling.** Use the tokens in `src/styles.css` — spacing (`--s1`…`--s8`), radii, and the colour set — rather than new hard-coded pixel or hex values. Dark theme only. Every interactive element keeps a visible focus ring.

**Mobile.** Real responsive layout down to 320px: no page-level `transform: scale()`, no horizontal page scroll. Wide content (map, tables) scrolls inside its own container.

**Tone.** Planning guidance, never an eligibility decision. Keep the disclaimers, but collapse long legal and process text into `Disclosure` so it never buries the task.

**Data.** Prototype content lives in `src/data.js`; session state lives in `src/store.js` and persists to `localStorage` under `missionproof.session.v1`. Store only general service facts there — never sensitive, medical, classified, controlled, or operational information.
