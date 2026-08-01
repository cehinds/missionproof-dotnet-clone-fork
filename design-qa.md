# Design QA — Four-Phase Journey

- Source visual truth: `docs/design-versions.md` shared visual rules, in particular *"Top navigation
  becomes four journey groups; local substeps auto-fit or move into a scroll-free sheet."*
  This branch implements that rule rather than one of the six named mocks, so there is no single
  concept PNG to compare against pixel-for-pixel.
- Implementation screenshot: `implementation-option-4-mobile.png`
- Viewport/CSS size: 390 × 844 px; device scale factor 1
- Implementation pixels: 390 × 844; no density scaling
- State: Explore → Air Force paths, default composites applied, no profile saved

## Full-view comparison evidence

The four journey groups (Profile → Translate → Explore → Plan) replace the eleven equally weighted
tabs. Local substeps become a section tab strip beneath the rail, which scrolls horizontally on
mobile and keeps the active phase centred. The final viewport has no horizontal overflow at 320,
390, or 768 px across Profile, Competency profile, Jobs & bases, Credentials, and Plan.

## Fidelity surfaces

- **Typography:** existing Mission Barlow family retained. Body copy raised to the specified 16px
  baseline and supporting type to 14px; `dev` and this branch both previously shipped 15px/13px.
- **Spacing/layout:** all gaps come from the `--s1`…`--s8` scale in `src/styles.css` rather than
  one-off pixel values. One elevation level; dividers and whitespace carry the structure.
- **Colors/tokens:** navy surfaces, cobalt interaction accent, teal confirmation, and the hexagonal
  brand motif are preserved per the visual identity rule in `AGENTS.md`.
- **Image quality/assets:** existing product wordmark, icon set, and heatmap raster; nothing
  redrawn or replaced.
- **Copy/content:** "Best fits" was renamed to "Research leads" to satisfy the Ranked Evidence
  guardrail (*use "research lead," not "best"*). The Air Force paths heading was changed from
  "Retraining paths open to you" to "See where your MAGE scores can take you" so the screen stops
  reading as an eligibility statement.

## Comparison history

1. Initial capture (branch cut from `main`): the three unimplemented steps were rebuilt from
   scratch, unaware that `dev` already implemented them with real domain logic.
2. Fix: rebased onto `dev` and replaced the static path/search/plan data with
   `src/domain/missionproof.js`, so Air Force paths compute genuine score gaps and the skill search
   runs over the shared catalog.
3. Design review (`marina` agent) against the pre-rebase head returned twelve findings; two were
   already resolved by the rebase and the remaining ten were fixed and verified by driving.
4. Post-fix evidence: `implementation-option-4-mobile.png`; no actionable P0/P1/P2 differences
   remain.

## Primary interactions and console

- Composite entry recomputes gaps: lowering G from 74 to 40 moves score-aligned paths from 5 to 2
  and surfaces "Closest gap: G needs …" on the affected cards.
- Search (`/`) returns one query read three ways and lands on the item — searching "logistics" and
  choosing Logistics Coordinator opens Civilian roles with the Logistics filter already applied.
- Every `Add to plan` collects on the Plan screen, survives reload, and can be removed.
- Goal changes navigate to the section that answers them.
- An unsaved profile edit survives leaving and returning to the phase; the current screen survives
  a reload.
- Automated suite: `npm test` 12/12 (8 UI journeys, 4 domain unit), `npm run test:sites` 4/4,
  `npm run build` produces the three required Sites artifacts.
- Browser console errors/warnings checked: none.

## Follow-up polish

- P3: only Texas carries state drill-in data. The other states now say so explicitly instead of
  rendering a dash and generic strings as if they were values.
- P3: seven federal pathway chips with no series behind them were removed rather than left to
  return an empty state on click.
- P3: the bases layer no longer draws a six-colour service legend, because the heatmap is a static
  raster with no base markers for the legend to key.
- P3: MAGE composites are deliberately not persisted — they are the most identifying input on the
  screen and are only needed to compute gaps.

## Not verified

- `dotnet build MissionProof.slnx` — no .NET SDK in the environment this was prepared in. No .NET
  files were changed.
- Full keyboard-only traversal and screen-reader behaviour of the `aria-live` result regions were
  spot-checked, not exhaustively audited.
