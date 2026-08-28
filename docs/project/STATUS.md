# MissionProof rebuild status

Updated: 2026-08-27  
Branch: `codex/rebuild-no-key`  
Remote publication: not performed

## Outcome

The three-lead, no-key walking skeleton is implemented and running locally at
`http://127.0.0.1:5180/`. It combines guided setup with ranked, progressively
disclosed research leads and a .NET-owned API/core.

The primary mobile delivery is now an installable React/Vite Progressive Web
App. It requires no MAUI, Android Studio, Xcode, React Native, Flutter, or
app-store SDK for normal HTTPS deployment. ASP.NET Core remains the same-origin
API/host.

## Implemented

- Four-group responsive shell: Profile, Translate, Explore, Plan.
- Consent, goal selection, guided primary AFSC, top-three research leads,
  reversible save, and one next action.
- Quiet independent-design-fork and synthetic-data disclosures.
- ASP.NET Core `/api/v1` session, consent, goal, profile, assessment, plan,
  and synthetic deterministic evidence-review endpoints.
- Server-derived Development identity, safe Problem Details, ETags,
  `If-Match`, idempotency, provenance/confidence, explicit review decisions,
  separate apply, and API catch-all protection.
- Shared semantic tokens, centralized UX copy, implementation-ready visual
  specification, and the three specialist lead plans.
- PWA manifest, opaque maskable SVG icon, production service-worker
  registration, static-shell caching, and explicit network-only `/api/**`.

## Verified

- `npm test`: 25/25 tests passed across 7 files.
- `npm run build`: passed; 51 modules; Sites artifacts prepared.
- `npm run test:sites`: 4/4 passed.
- `dotnet build MissionProof.slnx -c Release`: passed with 0 warnings/errors.
- `dotnet test MissionProof.slnx -c Release --no-build`: exited 0 with 0 warnings/errors.
- Backend same-origin contract harness: 48/48 passed after the project-lead
  route-contract correction.
- Local HTTP smoke: `/`, `/api/health`, and `/api/v1/session` returned 200.
- Final route smoke: `/app/translation` returned the SPA and session
  `nextAction.route` returned `/app/consent`.
- Frontend lead's live same-origin client smoke: 3 neutral research leads,
  save 1, undo to 0.
- Independent cross-workstream re-review passed: route-backed Plan actions do
  not PATCH synthetic IDs; Terms/Privacy are reviewable; Translate stays in the
  four-group shell; local ranking is AFSC/goal-sensitive; empty AFSC cannot
  continue.
- `git diff --check`: passed.
- Local PWA HTTP smoke: manifest `200 application/manifest+json`, service worker
  `200 text/javascript`, icon `200 image/svg+xml`, and API `200`; parsed manifest
  uses `start_url=/app`, `display=standalone`, and `purpose=any maskable`.

## Open acceptance boundary

No browser-control instance was available in this environment. The integrated
app was opened in the Codex preview panel, but automated rendered inspection
and screenshots at 390x844 and 1440x900 could not be captured. Therefore pixel,
overflow, and device-reflow acceptance remain unwitnessed even though automated
interaction, API, build, and source-level responsive checks pass.

## Data and release boundary

The local state is process-only and intended for synthetic demonstration. This
milestone is not authorized for official records or production use. No commit,
push, merge, publication, ownership transfer, main/release promotion, or release
was performed.
