# MissionProof frontend lead plan

Status: MP-002 frontend contract proposal  
Branch reviewed: `codex/rebuild-no-key` at `beb437c`  
Implementation status: specification only; no runtime files changed

## Frontend outcome

Deliver a calm, mobile-first React client that gets a user from informed
consent to one evidence-backed research target and one next action. The core
journey must work against the local ASP.NET Core host without an AI key. Any
future AI-assisted extraction is an optional review-only enhancement, not a
frontend startup dependency.

The recommended direction combines the strengths of both existing concept
branches:

- Option 2 supplies the guided, one-question-at-a-time profile journey and the
  four-group mobile navigation.
- Option 3 supplies the compact ranked-evidence list, top-three default, and
  expandable evidence/verification detail.
- Neither branch should be merged wholesale. Both independently change
  `Topbar`, `App`, `src/styles.css`, and the same UI test file, so integration
  should recompose the patterns behind shared components.

## Current frontend inventory

### Runtime

| Area | Current implementation | Assessment |
|---|---|---|
| Entry | `src/main.jsx` mounts `<App />` in React Strict Mode | Sound and minimal |
| Application | `src/App.jsx`, about 59 KB and 488 lines | One file owns route tables, sample catalogs, state, navigation, all 11 screens, modals, and rendering; it is now the primary delivery risk |
| Styling | `src/styles.css`, about 55 KB | One global stylesheet with multiple feature eras and overlapping media queries; difficult to change safely |
| Routing | `window.history.pushState`, `popstate`, numeric step indexes | Works for the prototype, but route identity and journey identity are coupled to array order |
| State | Component-local `useState` plus `App` state | Refresh loses all profile, goal, saved-path, and task state; no server boundary exists |
| Domain | `src/domain/missionproof.js` | Four pure functions cover path sorting, skill search, plan progress, and saved-item toggling |
| Assets | Fonts, SVG icons, and a heatmap in `public/assets/` | Existing brand assets can be retained; decorative icons need a provenance/accessibility pass |
| Host packaging | Vite output plus existing Sites packaging | Working; `.openai`, Worker, and Sites scripts remain outside this workstream |

### Existing route surface

The app exposes 11 equally weighted steps: Starting Point, Air Force Paths,
Translation, Competencies, Civilian, Federal, Jobs/Bases, Apprenticeships,
Credentials, Skill Search, and Transition Plan. Every route is currently
supported, but most data is illustrative and kept directly in `App.jsx`.

Current critical-journey tests cover:

1. consent is required before onboarding;
2. skill search can save a pathway into the plan;
3. completing a plan action updates readiness;
4. pure domain behavior for search, score alignment, progress, and plan toggles.

### Specific current issues to retire

- Eleven top-level tabs overflow and force users to understand the entire
  product before they have a goal.
- Numeric step indexes are used as route IDs, navigation targets, and active
  state. Inserting or regrouping a page can silently change behavior.
- `selectedGoal` renders as a controlled select with a no-op change handler on
  the current Starting Point screen.
- Browser back/forward is observed, but route transitions, unknown paths, focus
  restoration, and page announcements are not centralized.
- Sensitive profile-like data is held only in memory now; adding browser
  persistence later would be unsafe without an explicit data policy.
- Page data, display copy, and behavior are embedded together, which makes
  source freshness and content review difficult.
- The existing modal implementation needs focus trapping, initial focus,
  Escape behavior, and focus restoration before it can be considered
  accessible.

## Target route and flow

Use four journey groups in navigation while preserving useful deep links.
Legacy prototype URLs can redirect through a small compatibility table.

| Journey | Primary routes | Default user question |
|---|---|---|
| Profile | `/app`, `/app/profile/service`, `/app/profile/evidence`, `/app/profile/review` | What should MissionProof know about me? |
| Translate | `/app/translation`, `/app/competencies` | What does my experience mean outside the service? |
| Explore | `/app/explore`, `/app/explore/air-force`, `/app/explore/civilian`, `/app/explore/federal`, `/app/explore/credentials`, `/app/explore/skills`, `/app/explore/locations` | What is the strongest research lead to inspect next? |
| Plan | `/app/plan`, `/app/plan/actions/:actionId` | What should I do next? |

First-session happy path:

1. access screen;
2. concise informed consent;
3. choose a goal or skip;
4. guided service-profile step, beginning with AFSC;
5. ranked top-three research leads with why, evidence source, confidence, and
   a verification caveat;
6. save one target;
7. receive one dated next action.

Returning-session path:

1. `/app` opens a Mission Brief, not a general dashboard;
2. show exactly one resume action such as “Review 3 profile suggestions” or
   “Complete your next plan action”;
3. keep alternative journeys available through grouped navigation.

Document-assisted setup must be a separate, explicit flow:

`choose type -> safety reminder -> upload -> processing -> review candidates ->
accept/edit/reject -> apply confirmed facts -> retention/deletion choice`.

No extracted candidate becomes a profile fact through navigation or rendering
alone.

## Component and state architecture

Recommended module shape:

```text
src/
  app/
    AppShell.jsx
    RouteView.jsx
    routeRegistry.js
    SessionProvider.jsx
  components/
    actions/BottomActionBar.jsx
    feedback/InlineNotice.jsx
    feedback/StatusRegion.jsx
    navigation/JourneyNav.jsx
    navigation/JourneySheet.jsx
    navigation/LocalStepNav.jsx
    overlays/AccessibleDialog.jsx
  features/
    access/
    consent/
    profile/
    translation/
    explore/
      airForce/
      civilian/
      federal/
      credentials/
      skills/
      locations/
    plan/
    evidenceReview/
  domain/
    missionproof.js
    contracts.js
  lib/api/
    MissionProofClient.js
    http.js
    problemDetails.js
  content/
  styles/
    tokens.css
    base.css
    layout.css
    components.css
  App.jsx
  main.jsx
```

### State boundaries

- **URL state:** active journey, current page, selected result, and filters that
  should survive reload or be linkable.
- **Server state:** consent receipt, confirmed profile facts, analysis job
  status, candidate reviews, saved targets, and plan actions. Access only
  through `MissionProofClient`.
- **Session UI state:** open sheet/dialog, temporary input drafts, expanded
  result row, and toasts. Keep local to the owning feature or a small reducer.
- **Derived state:** path view models, completion labels, and next-best action.
  Calculate from typed records; never store duplicate percentages as truth.

Use a small React context plus reducer for authenticated session and shared
plan/profile summaries. Do not add a global state library until measured need
exists. Do not persist service data in `localStorage`; the only acceptable
browser persistence in the initial build is a non-sensitive display preference
that has been explicitly classified.

Routing should move behind `routeRegistry.js` so page IDs and paths are stable.
React Router is acceptable if the project lead approves the dependency;
otherwise the registry can wrap the existing History API. Components must not
call `window.history` directly.

## Combining Guided Journey and Ranked Evidence

### Shared shell

Rebuild `Topbar` as `AppShell + JourneyNav + JourneySheet`. The four journey
groups are shared by both concepts and become the canonical global navigation.
Local steps belong inside the current page, not across the top bar.

### Guided profile setup

Adapt Option 2's service-profile question into a reusable `GuidedStepLayout`:

- one question and primary action per view;
- visible `Step N of M` plus a text label, not progress by color alone;
- a persistent mobile Continue action that never hides validation feedback;
- Save and exit after the first confirmed fact;
- “Prefill from a document” opens the safety/upload flow and never opens the
  general profile editor as it does in the concept branch.

### Ranked exploration

Adapt Option 3's Air Force path view into `RankedEvidenceList` and
`RankedEvidenceRow`:

- top three results by default;
- rank is paired with a confidence/alignment label and “why this matched”;
- one expanded result at a time on mobile;
- displayed requirements, provenance, data version/effective date, and
  verification action remain available;
- wording is “research lead” or “score aligned,” never “qualified” or “best”;
- “Show all” is secondary and preserves the current query/filter state.

The current `matchAirForcePaths` function sorts by number of unmet score areas
and then AFSC. Before production use, backend/core must own the authoritative
ranking policy. The frontend should display the returned order and explanation,
not reproduce eligibility logic.

## Responsive and navigation strategy

### Mobile, 320–680 px

- 16 px body copy, support copy no smaller than 14 px, and 44 px minimum touch
  targets.
- Compact brand header with one labeled Menu button. Opening it produces a
  modal sheet with focus containment, Escape/close behavior, current-journey
  state, and focus restoration.
- No horizontal global tab strip and no hidden scroll affordance.
- Local progress sits under the page title. A sticky bottom action bar carries
  the single primary action and accounts for safe-area insets.
- Ranked data changes from columns to a concise summary row followed by one
  expandable detail region.
- Tables, maps, and comparisons use task-specific mobile presentations; they
  are not squeezed desktop grids.
- Normal task states target one to one-and-a-half viewports. Optional education,
  methodology, and long result sets remain collapsed.

### Tablet, 681–1023 px

- Four journey groups may fit as labeled buttons; use the sheet if localization
  or zoom causes collision.
- Results use two-column summary/detail composition where space permits.
- Bottom action bar may become an inline action row when both actions remain in
  view.

### Desktop, 1024 px and wider

- Compact global journey header plus local page title/step navigation.
- Main reading width remains about 70 characters; wide space supports evidence
  comparison, not more unrelated cards.
- One elevation level, row dividers, and whitespace replace nested panels.

All breakpoints must be tested at 320, 390, 768, 1024, and 1440 CSS pixels,
plus 200% browser zoom and `prefers-reduced-motion`.

## Frontend-to-backend contract needs

The frontend requires versioned JSON resources, RFC Problem Details errors,
opaque IDs, ISO-8601 timestamps, optimistic concurrency, and idempotency keys
for writes. The client must not submit or trust owner/user IDs.

| Need | Proposed endpoint | Essential response fields |
|---|---|---|
| Bootstrap/resume | `GET /api/v1/session` | actor display name, consent status/version, profile summary, next-best action, feature capabilities; never raw documents |
| Record consent | `POST /api/v1/consents` | consent receipt ID, version, accepted timestamp |
| Read profile | `GET /api/v1/profile` | confirmed facts, fact provenance summary, `ETag` |
| Change profile | `PATCH /api/v1/profile` with `If-Match` and `Idempotency-Key` | new facts, superseded facts, `ETag`; never silently overwrite |
| Rank research leads | `POST /api/v1/pathway-matches` | ordered lead ID/type/title, match label, explanation, gaps, source/version/effective date, caveat |
| Save/remove target | `POST /api/v1/plan/targets`, `DELETE /api/v1/plan/targets/{id}` | plan target, rationale, source versions, `ETag` |
| Read/update actions | `GET /api/v1/plan`, `PATCH /api/v1/plan/actions/{id}` | actions, milestone state, next-best action, `ETag` |
| Start evidence analysis | `POST /api/v1/evidence/upload-intents`, then `POST /api/v1/evidence/{id}/analysis-jobs` | opaque document/job IDs and safe processing state |
| Review candidates | `GET /api/v1/analysis-jobs/{id}/candidates`, `POST /api/v1/candidate-reviews/{id}/decisions` | candidate value, confidence band, provenance/page/region, warnings, review state |

Minimum pathway-match shape:

```json
{
  "matchId": "opaque-id",
  "sourceVersion": "catalog-2026-08-27",
  "results": [
    {
      "pathwayId": "opaque-id",
      "kind": "airForceSpecialty",
      "code": "1N0X1",
      "title": "All Source Intelligence Analyst",
      "label": "scoreAligned",
      "confidence": "researchLead",
      "why": ["Your displayed General score meets the example threshold."],
      "gaps": [],
      "source": {
        "name": "illustrative prototype catalog",
        "effectiveAt": null,
        "verificationRequired": true
      }
    }
  ]
}
```

Errors that influence UX need stable codes such as `consent_required`,
`profile_conflict`, `source_stale`, `upload_rejected`, `analysis_unavailable`,
and `candidate_already_reviewed`. Human-readable server details are displayed
only after frontend-safe mapping.

## Implementation slices and file ownership

No shared runtime file should be edited until the project lead accepts the
contracts. After acceptance, use these exclusive ownership boundaries:

| Owner | Exclusive files/directories |
|---|---|
| Frontend lead | `src/App.jsx`, `src/main.jsx`, `src/app/**`, `src/components/**`, `src/features/**`, `src/domain/**`, `src/lib/api/**`, `src/styles/base.css`, `src/styles/layout.css`, `src/styles/components.css`, `tests/ui/**`, `tests/unit/**` |
| Visual/content lead | `src/content/**`, `src/styles/tokens.css`, `public/assets/brand/**`, `docs/design/**` |
| Backend/core lead | `server/**` and backend test projects; no direct edits under `src/**` |
| Project lead | contract acceptance, integration sequence, package/config changes, and any exception to ownership |

The current `src/styles.css` is a migration surface and must have one writer
(frontend lead). Visual/content supplies token values in `tokens.css`; frontend
owns consuming and retiring legacy selectors.

### FE-01 — shell and stable routing

Files: `src/App.jsx`, `src/app/**`, `src/components/navigation/**`,
`src/components/actions/**`, `src/styles/{base,layout,components}.css`,
`tests/ui/navigation.test.jsx`.

Create the four-group shell, route registry, legacy-route compatibility, mobile
sheet, focus management, local step label, and bottom action region. Keep
existing screens reachable while the migration proceeds.

### FE-02 — guided profile

Files: `src/features/profile/**`, `src/features/consent/**`,
`tests/ui/profile-journey.test.jsx`.

Port Option 2 as reusable guided steps. Start with manual AFSC entry and a
server-backed draft/confirm flow. Keep document prefill as a capability-gated
entry until the backend review contract exists.

### FE-03 — ranked Air Force evidence

Files: `src/features/explore/airForce/**`, `src/domain/contracts.js`,
`tests/ui/ranked-evidence.test.jsx`, `tests/unit/pathway-view-model.test.mjs`.

Port Option 3 as a generic ranked list consuming backend-provided ranking and
explanations. Default to three, expose provenance, and support save-to-plan.

### FE-04 — typed API boundary and failure states

Files: `src/lib/api/**`, `src/app/SessionProvider.jsx`,
`tests/unit/api-client.test.mjs`, `tests/ui/failure-states.test.jsx`.

Implement fetch, cancellation, Problem Details mapping, concurrency conflicts,
idempotency headers, loading/empty/error states, and a deterministic development
adapter. Do not introduce an AI-provider client in the browser.

### FE-05 — translation, exploration, and plan migration

Files: remaining `src/features/**` and flow-specific UI tests.

Move screens out of the monolith route by route, replace embedded catalogs with
API resources, and delete old CSS only when the replacement route and tests are
green.

### FE-06 — evidence review UI

Files: `src/features/evidenceReview/**`,
`tests/ui/evidence-review.test.jsx`.

Implement provenance-aware candidate review only after backend security and
data contracts are accepted. Each candidate has Accept, Edit, Reject, View
source, confidence, warnings, and an explicit apply-summary step.

## Test plan

### Pure unit tests

- route registry and legacy redirect mapping;
- view-model conversion without reproducing authoritative qualification logic;
- Problem Details and conflict mapping;
- progress and next-action derivation;
- candidate-review reducer, including no apply without explicit decisions;
- content/token schema checks where applicable.

### Component and UI tests

- consent cannot continue unchecked; keyboard focus stays inside and returns
  after dismissal;
- grouped navigation exposes current state and all journeys without horizontal
  overflow;
- manual AFSC entry validates, confirms, and resumes after refresh through API
  state;
- top three ranked leads render in returned order; details disclose source and
  verification; Show all preserves state;
- save target is idempotent and appears in Plan;
- profile conflicts produce a recoverable compare/retry flow;
- loading, empty, offline, 401/403, 409, 413, 422, 429, and 5xx states have one
  clear recovery action;
- extraction suggestions never update profile merely by rendering or selecting
  a document.

### End-to-end browser tests

1. new user: access -> consent -> goal -> AFSC -> ranked lead -> save -> next
   action;
2. returning user: resume next action and complete it;
3. mobile navigation at 320/390 px with no horizontal page overflow;
4. keyboard-only consent, profile, ranked results, save, and plan journey;
5. document safety rejection and explicit candidate accept/edit/reject using a
   synthetic file;
6. expired session and optimistic-concurrency recovery;
7. accessibility scan plus manual focus/order/name/role/value checks;
8. screenshot comparison at representative mobile and desktop states, paired
   with behavior assertions rather than used alone.

Required frontend gates for each slice: focused tests, full `npm test`,
`npm run build`, `npm run test:sites`, browser console review, and witnessed
mobile/desktop interaction. The .NET host build remains an integration gate.

## Risks, assumptions, and open decisions

### Risks

- The reconstructed content and sample catalogs are not authoritative. UI must
  visibly label them illustrative until backend sources and dates are approved.
- Wholesale cherry-picking Option 2 and Option 3 will conflict in the shared
  shell and global stylesheet and will preserve the monolith.
- A numeric “readiness” percentage can imply unsupported precision. Prefer
  named milestones unless product accepts and documents the formula.
- Document processing can easily create an unsafe direct-to-profile path if
  frontend convenience bypasses review states.
- A generic card abstraction could recreate the container overload the redesign
  is intended to remove.
- Maps and long catalogs can dominate mobile; they need purpose-built summary
  views and explicit full-screen entry.

### Assumptions

- React remains the frontend and ASP.NET Core remains the application host.
- Core functionality must work with deterministic local services and no AI key.
- Authentication/provider selection, production persistence, and official data
  sources are backend/project decisions.
- Current branch screenshots are design evidence, not proof of runtime behavior
  or source accuracy.

### Open decisions for the project lead

1. Approve React Router or retain a small dependency-free History adapter.
2. Confirm whether the first walking skeleton uses only illustrative catalog
   data or one approved, versioned external source.
3. Decide whether “readiness” becomes named milestones or retains a documented
   score.
4. Approve the exact profile fields allowed before authoritative data
   classification is complete.
5. Decide whether the initial persistence target is a developer-only local
   database or an environment-managed relational service.
6. Approve `src/content/**` and `src/styles/tokens.css` as the visual/content
   lead's exclusive runtime-owned surfaces.

## Recommended first implementation slice

Build one thin, no-key walking path before migrating every screen:

`consent -> guided AFSC confirmation -> ranked top-three path leads -> save one
target -> show one next action`.

Frontend should first land FE-01 and the UI half of FE-02 behind the accepted
API interface, then connect FE-03 when backend/core provides session, profile,
pathway-match, and plan endpoints. Preserve current legacy routes during this
slice. This validates the new navigation, the Option 2/3 combination, mobile
density, server state, error handling, and the product's primary success moment
without prematurely rebuilding all 11 screens.

## Evidence inspected and verification

Committed files inspected:

- `AGENTS.md`
- `README.md`
- `package.json`
- `vite.config.mjs`
- `src/main.jsx`
- `src/App.jsx`
- `src/styles.css`
- `src/domain/missionproof.js`
- `tests/setup.mjs`
- `tests/ui/app.test.jsx`
- `tests/unit/missionproof.test.mjs`
- `tests/sites-worker.test.mjs`
- `docs/product-design.md`
- `docs/design-versions.md`
- `docs/architecture.md`
- `docs/document-ingestion.md`
- `docs/security-plan.md`
- `docs/testing-strategy.md`

Coordination files inspected in the working tree:

- `docs/project/PROJECT-CHARTER.md`
- `docs/project/WORKBOARD.md`

Branch evidence inspected read-only:

- `dev` / current rebuild base at `beb437c`
- `codex/option-2-guided-journey` at `0649221`, including commits
  `027e51a` and `0649221`, its `src/App.jsx`, `src/styles.css`, UI test diff,
  and `design-qa.md`
- `codex/option-3-ranked-evidence-mobile` at `f84bd85`, including its
  `src/App.jsx`, `src/styles.css`, UI test diff, and `design-qa.md`

Current-branch verification:

- `npm test`: passed, 2 test files and 7 tests.
- `npm run build`: passed; Vite built 30 modules and Sites output preparation
  completed.
- The first restricted-sandbox attempt could not read the Vite config because
  parent-directory access was denied; the same commands were rerun with the
  required local access and passed.
- No browser interaction or screenshot claim was made for this specification.

