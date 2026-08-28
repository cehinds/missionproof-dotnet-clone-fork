# MissionProof shared implementation contract

Status: accepted for the first local walking-skeleton milestone  
Direction: AUR-D027 / AUR-A022  
Integration branch: `codex/rebuild-no-key`

This decision synthesizes the frontend, backend/core, and visual/content lead
plans. It authorizes local implementation inside the file boundaries below. It
does not authorize push, merge, publication, production data, or release.

## Product decision

The first milestone is a first-time-user, no-key path:

`consent -> goal -> guided AFSC -> top-three research leads -> save one target -> one next action`

The same milestone also exposes a synthetic, deterministic evidence-review API
slice so the document workflow can be tested without a provider key. Production
uploads and official records remain out of scope.

Option 2 supplies the guided-input anatomy. Option 3 supplies ranked evidence
and progressive disclosure. They are recomposed rather than cherry-picked.

## Project-lead decisions

- The installable React/Vite PWA is the primary mobile framework. ASP.NET Core
  remains the same-origin API/host; native wrappers are optional future adapters.
- Keep the existing dependency-free History API behind a route registry for
  this milestone; do not add React Router yet.
- Use illustrative, versioned pathway fixtures clearly labelled as research
  leads, not official eligibility or qualification decisions.
- Replace readiness percentages with named milestones and `Step N of M`.
- Limit confirmed profile data in the first slice to goal and primary AFSC.
- Use process-local development persistence behind interfaces for the first
  walking skeleton; SQLite is the next persistence adapter, not a prerequisite
  for this slice.
- Keep the first slice dark. Use existing brand assets only; no new raster art
  or icon dependency is required.
- Add a quiet in-app disclosure that this is an independent design fork.
- Treat synthetic plain text as the only evidence format in the initial local
  analyzer. External AI/OCR providers remain optional disabled capabilities.

## Minimal API v1 contract

All errors use RFC Problem Details with stable `code` and `traceId`. IDs are
opaque. Writes accept `Idempotency-Key`; mutable resource reads return `ETag`
and updates accept `If-Match` where applicable. The server derives the current
development user and never accepts an owner ID from the client.

| Method | Route | Purpose |
|---|---|---|
| `GET` | `/api/v1/session` | Capabilities, consent state, goal/profile summary, next action |
| `POST` | `/api/v1/consent-receipts` | Record the current consent notice decision |
| `PUT` | `/api/v1/goal` | Set the user's current goal |
| `GET` | `/api/v1/profile` | Read confirmed profile facts and version |
| `PUT` | `/api/v1/profile/facts/Service.PrimaryAfsc` | Normalize and confirm the manual AFSC fact |
| `POST` | `/api/v1/pathway-assessments` | Return ordered top-three-first research leads with why/gaps/source |
| `GET` | `/api/v1/transition-plan` | Read saved targets and next action |
| `POST` | `/api/v1/transition-plan/items` | Save a research target idempotently |
| `PATCH` | `/api/v1/transition-plan/items/{id}` | Update the next action state |
| `POST` | `/api/v1/demo/evidence-analyses` | Analyze bounded synthetic text and return reviewable candidates |
| `PUT` | `/api/v1/demo/reviews/{reviewId}/decisions/{candidateId}` | Accept, edit, or reject one candidate |
| `POST` | `/api/v1/demo/reviews/{reviewId}/apply` | Apply only explicitly accepted/edited candidates |

The pathway response must include `rulesetVersion`, `sourceVersions`, ordered
results, why, gaps, warnings, and `officialVerificationRequired: true`.
Candidates must include fact type, value, confidence, rule/analyzer version,
source line/hash provenance, warnings, and review state. Analysis alone never
changes the profile.

## Frontend and content contract

Global journeys are Profile, Translate, Explore, and Plan. The first milestone
implements the happy path while preserving existing legacy routes until later
migration.

Use `src/content/journeyContent.js` as the content authority. It exports named
objects `consentContent`, `goalContent`, `profileContent`, `resultsContent`,
`planContent`, `statusContent`, and `forkDisclosure`. Runtime components import
copy rather than duplicate it.

Use `src/styles/tokens.css` as the semantic token authority. At minimum it owns
navy/cobalt/cyan/green/amber/status colors, body/display/mono fonts, readable
type sizes, spacing, radii, shadows, focus ring, motion duration, and content
width. New component CSS consumes these variables.

Interaction rules:

- 16px minimum body copy and 44px minimum touch targets.
- Four-group navigation; no eleven-tab mobile strip.
- One primary task and no more than three default results per screen.
- Consent checkbox uses an intrinsic control column and flexible message.
- One ranked row expands at a time on mobile.
- Route transitions focus and announce the page heading.
- Save is reversible and produces one explicit next action.
- Copy says research lead, score aligned, gap to verify, and confirmed fact;
  never best, qualified, eligible, or AI recommendation.

## Exclusive implementation ownership

| Lead | Exclusive write surface for this slice |
|---|---|
| Frontend | `src/App.jsx`, `src/main.jsx`, `src/app/**`, `src/components/**`, `src/features/**`, `src/domain/**`, `src/lib/api/**`, `src/styles/base.css`, `src/styles/layout.css`, `src/styles/components.css`, `tests/ui/**`, `tests/unit/**` |
| Backend/core | `server/**`, backend test projects, and solution entries needed for those projects |
| Visual/content | `src/content/journeyContent.js`, `src/styles/tokens.css`, `docs/design/**` |
| Project lead | `package.json`, lockfile, Vite/configuration surfaces, coordination docs, cross-team integration fixes |

No lead switches branches, commits, pushes, merges, or edits outside its surface.
Any contract mismatch is reported to the project lead before broadening scope.

## Milestone acceptance

- The PWA manifest, service worker, app icon, and production registration ship
  without new native SDK or runtime dependencies; `/api/**` remains network-only.
- Core consent/profile/match/save/plan path works with no key.
- Synthetic analysis returns candidates but cannot mutate profile until explicit
  decisions and apply.
- Frontend unit/UI tests, Sites packaging test, production build, and .NET build
  pass.
- Backend unit/integration/contract tests added by the backend lead pass.
- The .NET host serves the production frontend and `/api/v1` behavior through
  the same origin.
- Desktop and mobile browser inspection covers 390x844 and 1440x900, keyboard
  navigation, visible focus, no page-level horizontal overflow, and console
  errors. Screenshots support pixel claims; interaction tests support behavior.
- The design-fork disclosure and synthetic/illustrative data caveats are visible.
