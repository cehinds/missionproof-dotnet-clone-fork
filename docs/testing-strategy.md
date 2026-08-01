# Testing strategy

## Quality model

The test suite protects four things in order: user control over sensitive evidence, correct domain decisions, a calm and accessible journey, and reliable deployment.

| Layer | Purpose | Examples | Run |
| --- | --- | --- | --- |
| Unit | Deterministic business rules | score gaps, search, readiness, save/remove | Every commit |
| Component/UI | User-visible state and accessibility semantics | consent, search/save/plan, checkboxes, document review | Every PR |
| API/integration | Auth, ownership, persistence, idempotency, queues | cross-user denial, ETag, duplicate decision, worker retry | Every PR |
| Contract | Extraction/provider schemas | missing provenance, extra keys, provider-version changes | Every PR/nightly |
| Security | Abuse and isolation | malicious files, prompt injection, CSRF, upload limits, log leakage | PR + nightly |
| End-to-end | Critical journeys in supported browsers/viewports | first session, upload/review/apply/delete, export | Release candidate |
| Manual | Usability, assistive technology, policy review | cognitive walkthrough, screen readers, content | Release candidate |

## Runnable tests in this repository

- `npm run test:unit` covers extracted pure domain rules.
- `npm run test:ui` covers consent and two critical planning journeys with React Testing Library.
- `npm test` runs the unit and UI suite.
- `npm run test:sites` verifies SPA fallback and Sites packaging.
- `npm run build` verifies the production client/worker bundle.
- `dotnet build MissionProof.slnx -c Release` verifies the .NET host.

The initial UI tests intentionally query roles and accessible names instead of CSS selectors. If a redesign breaks them, the team must decide whether the user journey changed or only the implementation did.

## Required .NET test projects for the backend phase

- `MissionProof.Domain.Tests`: pure facts, candidate decisions, progress, source versioning.
- `MissionProof.Api.Tests`: `WebApplicationFactory`, authentication policies, Problem Details, ETags/idempotency.
- `MissionProof.Infrastructure.Tests`: database/object-store containers, outbox, retention/deletion reconciliation.
- `MissionProof.Extraction.ContractTests`: frozen provider responses, schemas, provenance, timeout/error mapping.

## Critical test cases

### Consent and identity

- Continue is disabled until the current consent is checked.
- Consent version, time, actor, and notice hash are recorded.
- Expired/revoked sessions fail closed.
- User A cannot read or mutate User B's documents, candidates, profile, or plan even with guessed IDs.

### Upload and analysis

- Reject executable, mismatched signature/MIME, encrypted archive, oversize, excessive-page, zip-bomb, and malformed files.
- Randomize storage name and store outside webroot.
- A failed or timed-out scan cannot advance to extraction.
- Replayed completion callbacks and duplicate queue messages are idempotent.
- Documents containing hidden Unicode, links, or instruction text cannot call tools, alter schemas, or bypass review.
- Raw document text is absent from logs, traces, analytics, and exception bodies.

### Review and apply

- Candidate without document/page/confidence/version is rejected.
- Accept, edit, and reject preserve their individual decisions across refresh.
- Apply requires current ownership, ETag, idempotency key, and explicit selected candidates.
- Applying the same request twice creates one fact/version.
- Existing confirmed facts are versioned, not silently overwritten.
- Low-confidence/judgment candidates cannot be bulk accepted.

### UI and accessibility

- 320, 390, 768, 1024, and 1440px layouts have no unintended horizontal scroll.
- Keyboard order follows the visual workflow; focus returns correctly after dialogs.
- Dialogs have names, focus containment, Escape behavior where safe, and focus restoration.
- Status updates use appropriate live regions without repeated announcements.
- Text, controls, focus indicators, and non-color status cues meet WCAG 2.2 AA targets.
- Reduced-motion preference removes nonessential animation.
- The primary action and top results appear before optional detail at common mobile heights.

### Data quality

- Golden documents cover legacy/current templates and scanned/digital variants.
- Each field has precision/recall and confidence calibration reports.
- Dates, rank/AFSC formats, and rating periods have deterministic validation.
- Provider/model upgrades run side-by-side regression before promotion.
- Public pathway data stores source/effective dates and warns when stale.

## CI gates

PR: restore/install lockfiles, build, unit, UI, API/integration, dependency/secret/SAST scan, no critical accessibility violations on core routes.

Release: all PR gates plus browser E2E, malicious-file corpus, extraction regression, SBOM/signature, migration rollback rehearsal, backup restore, deletion reconciliation, performance budget, manual screen-reader pass, security/privacy approval.

Suggested performance budgets: visible interaction feedback <100ms, primary content usable <2.5s on representative mobile network/device, route JS and image budgets tracked, extraction status acknowledged immediately even when processing is asynchronous.

## Test data policy

Automated tests use synthetic records only. Redacted real documents require written approval, a restricted corpus, purpose/retention metadata, no source-control inclusion, and deletion after the evaluation window. Never copy production documents into developer machines or third-party testing tools.
