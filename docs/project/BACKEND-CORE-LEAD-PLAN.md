# Backend and core functionality lead plan

**Work item:** MP-003  
**Status:** Contract-first proposal  
**Branch:** `codex/rebuild-no-key`  
**Runtime baseline:** ASP.NET Core 10 modular monolith with React as a separate client  
**Key constraint:** The complete pilot must start and remain useful without an AI, OCR, or cloud-provider key.

## Outcome and boundary

The backend should turn the current in-memory frontend prototype into a small,
testable product core without prematurely creating a distributed system. The
first useful end-to-end capability is not a generic chatbot. It is a controlled
evidence loop:

1. a signed-in user records consent;
2. the user supplies a synthetic or explicitly approved local evidence file;
3. a deterministic analyzer proposes a small set of typed facts;
4. every proposal shows provenance, confidence, and warnings;
5. the user accepts, edits, or rejects each proposal; and
6. only a separate authenticated apply command versions accepted facts into the
   user's profile.

The current repository remains a design fork and is not authorized to process
official, classified, medical, controlled, or operationally sensitive records.
The pilot uses synthetic data by default. Production document ingestion remains
blocked until data classification, retention, identity, storage, malware/CDR,
and authorization-boundary decisions are approved.

## Current-state assessment

The repository currently contains one .NET web project. `Program.cs` locates
the built Vite client, serves static files, exposes `/api/health`, and falls back
to `index.html`. It has no authentication, persistence, domain layer, document
pipeline, API tests, or server-side representation of consent, profile, saved
pathways, plan actions, or evidence.

The React application currently owns all prototype data and state:

- profile: AFSC, rank, skill level, years of service, and education;
- consent checkbox state and selected onboarding goal;
- MAGE scores and ranked Air Force path results;
- embedded civilian, federal, credential, map, and skill-search catalogs;
- saved plan items and completion state; and
- progress calculation, matching, filtering, and plan-item toggle rules.

Browser refresh currently loses the user state. The UI uses path-based routes,
but it does not call an API. Existing tests cover consent interaction, skill
search/save-to-plan, readiness progress, deterministic matching/search helpers,
and Sites packaging. These behaviors establish the first frontend contract the
backend must preserve.

## Architecture decision

Use a modular monolith with dependency direction toward the domain:

```text
React client
    |
    v
MissionProof.Web             HTTP, auth policies, Problem Details, DTO mapping
    |
    v
MissionProof.Application     use cases, ports, authorization-aware orchestration
    |
    v
MissionProof.Domain          aggregates, value objects, invariants, domain errors
    ^
    |
MissionProof.Infrastructure  SQLite/relational storage, file storage, analyzers
```

The web host composes the modules but contains no business rules. Application
services depend on interfaces, not infrastructure implementations. The domain
has no ASP.NET Core, EF Core, file-system, OCR, or provider dependencies.

Initial deployables:

- `MissionProof.Web`: one ASP.NET Core host for `/api/v1` and the React build;
- in-process deterministic analysis for the local synthetic pilot;
- SQLite and a private local evidence directory in Development;
- later, an isolated worker plus relational/object/queue adapters for a
  controlled beta.

An isolated worker becomes mandatory before production document ingestion. It
receives a sanitized document capability and returns candidate facts; it never
receives a profile repository, user token, browser, shell, or general network
access.

### Required dependency rules

- Domain never references Application, Infrastructure, Web, or provider SDKs.
- Application may reference Domain only.
- Infrastructure may implement Application ports and reference Domain.
- Web may reference Application and Infrastructure only for composition.
- A module cannot query another module's persistence tables directly.
- Extractors cannot access profile or plan write ports.
- Only `ApplyReviewDecisions` may create or supersede confirmed profile facts.

## No-key operating modes

| Mode | Analyzer | Storage | Identity | Allowed data |
|---|---|---|---|---|
| Development demo | Deterministic plain-text rules | SQLite + private local directory | Loopback-only development identity | Synthetic fixtures only |
| Test | Deterministic fake/fixture analyzers | In-memory/test SQLite + temp directory | Explicit test identities | Synthetic fixtures only |
| Controlled beta | Deterministic parser; approved OCR adapter optional | Approved relational + private object storage | Configured OIDC provider | Data allowed by the approved boundary |
| Optional enhanced | Approved provider adapter after deterministic extraction | Same controlled boundary | Same OIDC boundary | Only approved, minimized content |

Production must fail startup if the configured identity, private storage,
retention policy, malware/CDR gate, and audit sink are missing. It must not fall
back to the Development identity or local evidence directory.

## Domain model

Identifiers are opaque UUID/ULID-style values and never contain user data.
Every mutable aggregate carries a monotonic `Version` used for optimistic
concurrency.

### Identity and consent

- `UserSubject`: immutable provider/subject pair represented internally by an
  opaque `UserId`; provider claims are mapped at the boundary.
- `ConsentReceipt`: `UserId`, notice version, notice SHA-256, decision,
  accepted-at UTC, actor, and client correlation ID. Consent history is
  append-only.
- `UserGoal`: selected goal code, status, created/changed timestamps.

### Profile

- `Profile`: aggregate root owned by one `UserId`; exposes current confirmed
  facts and history.
- `ProfileFact`: fact ID, closed `FactType`, normalized typed value, display
  value, status (`Confirmed` or `Superseded`), origin (`Manual` or
  `ReviewedCandidate`), source reference when applicable, confirmed by/at, and
  superseded by/at.
- Initial fact types: `Service.PrimaryAfsc`, `Service.RankBand`,
  `Service.SkillLevel`, `Service.Years`, `Education.HighestLevel`,
  `Service.DutyTitle`, and `Service.RatingPeriod`.

Free-form source prose is not a profile fact. New fact types require a domain
change and contract test; clients cannot invent arbitrary field paths.

### Pathways and plan

- `PathwayRecord`: stable pathway ID, type (`AirForceSpecialty`, `CivilianRole`,
  `FederalSeries`, `Credential`, or `Apprenticeship`), title, description,
  tags, source version, effective/retrieved dates, and guidance disclaimer.
- `PathwayRequirement`: typed score/education/credential requirement with its
  authoritative source and effective date.
- `PathwayAssessment`: deterministic result containing alignment labels,
  evidence references, gaps, warnings, ruleset version, and evaluated-at UTC.
- `TransitionPlan`: user-owned aggregate of `PlanItem` records.
- `PlanItem`: stable item ID, pathway reference or user-defined action,
  rationale, state, target date, source version, and completion timestamp.

The backend must use labels such as `ScoreAligned`, `ResearchLead`, and
`GapToVerify`; it must not assert eligibility or qualification from incomplete
inputs.

### Evidence, analysis, and review

- `EvidenceDocument`: owner, original safe display name, server-randomized
  storage key, SHA-256, detected media type, byte/page limits, document kind,
  state, classification flags, retention decision/deadline, and timestamps.
- `AnalysisRun`: document ID, pipeline version, analyzer set/version, state,
  safe failure code, timestamps, and correlation ID.
- `CandidateFact`: closed fact type, proposed and normalized values,
  confidence score and band, confidence rationale code, source reference,
  analyzer/rule versions, warnings, and review state.
- `SourceReference`: document ID and content hash plus page/line/region,
  sanitized snippet hash, and optional short-lived source-preview capability.
- `Review`: owner, document/run IDs, status, version, and candidate set.
- `ReviewDecision`: candidate ID, `Accept`, `Edit`, or `Reject`, optional edited
  typed value, actor, timestamp, and idempotency key.
- `AuditEvent`: actor, action, resource IDs, outcome, policy version,
  correlation ID, and safe metadata only. It never contains raw document text,
  source snippets, profile values, or access tokens.

### State machines

Document:

```text
Created -> Uploading -> Quarantined -> Validated -> ReadyForAnalysis
        -> RetentionPending -> Deleted
        -> Rejected | Failed
```

Analysis:

```text
Queued -> Extracting -> Analyzing -> Validating -> AwaitingReview
      -> Completed | Failed | Cancelled
```

Review:

```text
Pending -> PartiallyDecided -> ReadyToApply -> Applied
       -> Rejected | Superseded
```

No transition skips quarantine/validation. Analysis completion never implies
profile mutation. Reprocessing creates a new run and review rather than
rewriting historical candidates.

## API contract

### Conventions

- Route prefix: `/api/v1`.
- DTO namespace/folder: `Contracts.V1`; v1 DTOs are additive-only.
- All timestamps are UTC ISO 8601; all IDs are opaque strings.
- Errors use RFC Problem Details with stable `code`, `traceId`, and safe field
  errors. No raw uploaded content appears in responses.
- User-owned resources are resolved from authenticated context, never from a
  client-supplied owner ID.
- Mutable reads return `ETag`; replacements/decisions require `If-Match`.
- Retriable writes require `Idempotency-Key`; replays return the original
  result. Keys are scoped to user, route, and operation.
- API responses include `apiVersion: "1"` where a stored/exported payload may
  outlive the request.
- List endpoints use opaque continuation tokens, bounded page size, and stable
  ordering.
- JSON enums use stable string values. Unknown client enum values fail with a
  field-specific validation error.

### Session, consent, profile, and goals

| Method and route | Purpose | Request | Success |
|---|---|---|---|
| `GET /api/v1/session` | Return identity capabilities and current notice state | none | `SessionV1` |
| `POST /api/v1/consent-receipts` | Record the current notice decision | `CreateConsentReceiptV1` + idempotency | `201 ConsentReceiptV1` |
| `GET /api/v1/profile` | Get current confirmed facts and completeness | none | `ProfileV1` + ETag |
| `PUT /api/v1/profile/facts/{factType}` | Add or supersede one manual fact | `PutProfileFactV1` + If-Match/idempotency | `ProfileFactV1` + new ETag |
| `DELETE /api/v1/profile/facts/{factType}` | Supersede/remove a current manual fact | If-Match/idempotency | `204` + new ETag |
| `PUT /api/v1/goal` | Set or replace the current user goal | `PutGoalV1` + If-Match | `UserGoalV1` + ETag |

Representative profile payload:

```json
{
  "apiVersion": "1",
  "profileId": "prf_opaque",
  "version": 4,
  "facts": [
    {
      "factId": "fact_opaque",
      "factType": "Service.PrimaryAfsc",
      "displayValue": "1N0X1",
      "normalizedValue": "1N0X1",
      "origin": "Manual",
      "confirmedAt": "2026-08-27T18:00:00Z",
      "source": null
    }
  ],
  "completion": {
    "confirmedCoreFacts": 1,
    "requiredCoreFacts": 5,
    "percent": 20,
    "missingFactTypes": ["Service.RankBand", "Service.SkillLevel"]
  }
}
```

### Pathways, matching, and transition plan

| Method and route | Purpose | Request | Success |
|---|---|---|---|
| `GET /api/v1/pathways` | Search/filter versioned catalog | query, type, tags, cursor | `PathwayPageV1` |
| `POST /api/v1/pathway-assessments` | Evaluate supplied/confirmed facts against rules | `CreatePathwayAssessmentV1` | `PathwayAssessmentV1` |
| `GET /api/v1/transition-plan` | Read user plan and progress | none | `TransitionPlanV1` + ETag |
| `POST /api/v1/transition-plan/items` | Save pathway/action | `CreatePlanItemV1` + If-Match/idempotency | `201 PlanItemV1` + ETag |
| `PATCH /api/v1/transition-plan/items/{id}` | Update status/date/title | `PatchPlanItemV1` + If-Match/idempotency | `PlanItemV1` + ETag |
| `DELETE /api/v1/transition-plan/items/{id}` | Remove a saved item | If-Match/idempotency | `204` + ETag |

`PathwayAssessmentV1` always includes `rulesetVersion`, `sourceVersions`,
`alignment`, `gaps`, `warnings`, and `officialVerificationRequired: true`.
Ranking tie-breakers are deterministic and contract-tested.

### Evidence upload and deterministic analysis

| Method and route | Purpose | Request | Success |
|---|---|---|---|
| `POST /api/v1/evidence-documents/upload-intents` | Validate metadata and create bounded upload capability | `CreateUploadIntentV1` + idempotency | `201 UploadIntentV1` |
| `PUT /api/v1/evidence-documents/{id}/content` | Upload bytes through a single-use local or signed capability | bounded bytes + upload token | `204` |
| `POST /api/v1/evidence-documents/{id}/complete` | Verify length, signature, hash, quarantine state | idempotency | `EvidenceDocumentV1` |
| `POST /api/v1/evidence-documents/{id}/analysis-runs` | Queue deterministic analysis | `CreateAnalysisRunV1` + idempotency | `202 AnalysisRunV1` |
| `GET /api/v1/analysis-runs/{id}` | Poll safe pipeline state | none | `AnalysisRunV1` |
| `GET /api/v1/reviews/{id}` | Read candidate groups and decisions | none | `ReviewV1` + ETag |
| `PUT /api/v1/reviews/{id}/decisions/{candidateId}` | Accept/edit/reject one proposal | `PutReviewDecisionV1` + If-Match/idempotency | `ReviewDecisionV1` + ETag |
| `POST /api/v1/reviews/{id}/apply` | Version accepted/edited candidates into profile | `ApplyReviewV1` + If-Match/idempotency | `ApplyReviewResultV1` |
| `DELETE /api/v1/evidence-documents/{id}` | Request deletion and report retention state | If-Match/idempotency | `202 DeletionReceiptV1` |

Representative candidate payload:

```json
{
  "candidateId": "cand_opaque",
  "factType": "Service.PrimaryAfsc",
  "proposedValue": "1N0X1",
  "normalizedValue": "1N0X1",
  "confidence": { "score": 0.94, "band": "High", "reasonCode": "ExactLabeledField" },
  "source": {
    "documentId": "doc_opaque",
    "documentSha256": "sha256:opaque",
    "page": 1,
    "lineStart": 8,
    "lineEnd": 8,
    "region": null,
    "snippetSha256": "sha256:opaque"
  },
  "analyzer": {
    "name": "missionproof-deterministic-evidence",
    "version": "1.0.0",
    "ruleId": "afsc-labeled-v1"
  },
  "warnings": [],
  "reviewState": "Pending"
}
```

The client may request a short-lived source preview only after an owner check.
The preview response is `Cache-Control: no-store`, content-disposition inline,
and never available from the static-file middleware.

## Persistence and authentication boundaries

### Persistence

- Use repository interfaces at the Application boundary:
  `IConsentReceiptStore`, `IProfileStore`, `IPathwayCatalog`,
  `ITransitionPlanStore`, `IEvidenceMetadataStore`, `IReviewStore`,
  `IIdempotencyStore`, and `IAuditSink`.
- Use EF Core with SQLite for the local pilot. Keep migrations in
  Infrastructure and use explicit concurrency tokens and foreign keys.
- Use a production relational adapter only after the database decision is
  recorded. PostgreSQL and Azure SQL remain candidates; no domain code depends
  on that choice.
- Store document bytes behind `IEvidenceBlobStore`; never as database blobs and
  never under `wwwroot`, `public`, `dist`, source control, or a user-controlled
  path.
- Development storage uses an application-specific directory outside the
  repository and is enabled only with the synthetic-data flag. File names are
  random storage keys; the original name is metadata only.
- Every write and its audit/outbox record share a transaction. External worker
  delivery later uses a transactional outbox with idempotent consumers.
- Deletion is a stateful command with an auditable receipt. Metadata, blob,
  derivatives, queue messages, and backups have separately tracked expiry.

### Authentication and authorization

- `ICurrentUser` is the only application-facing identity port. It exposes an
  opaque `UserId` and capabilities, never raw bearer tokens.
- Development may use a loopback-only `DevelopmentLocalUser` authentication
  handler guarded by both `IsDevelopment()` and an explicit
  `MissionProof:Development:AllowSyntheticIdentity=true` flag.
- Non-Development startup rejects the synthetic handler and requires an OIDC
  configuration. Do not build password storage.
- Integration tests use a dedicated test authentication scheme with explicit
  User A/User B identities.
- Resource authorization is enforced in application services and, where useful,
  ASP.NET policies. Repository queries always include the current `UserId`.
- Return `404` for inaccessible user-owned resource IDs when existence would
  leak data; return `403` only for known capability/role denial.
- Consent version requirements gate document upload and analysis, not read-only
  access to deletion or account controls.
- Antiforgery protection is required for cookie-authenticated state changes;
  bearer-only APIs require strict origin/CORS policy and token validation.

## Deterministic local extraction and analysis

### Pipeline

```text
metadata validation
  -> bounded upload
  -> signature/media validation + SHA-256
  -> quarantine
  -> malware/CDR gate (test stub for synthetic demo; real gate before beta)
  -> text extraction
  -> line/page normalization
  -> closed rule set
  -> candidate schema validation
  -> review creation
  -> human decision
  -> separate apply command
```

### Local pilot adapters

1. `PlainTextEvidenceExtractor`: UTF-8/UTF-16 text with strict byte/line limits;
   used for synthetic fixtures and the first walking skeleton.
2. `OpenXmlEvidenceExtractor`: deterministic text/table extraction from DOCX;
   add only after archive expansion, relationship, macro, and size protections
   are tested.
3. `PdfTextEvidenceExtractor`: position-aware text from digital PDFs; add after
   selecting and threat-reviewing the library.
4. `TesseractOcrAdapter`: optional offline OCR for sanitized image/PDF pages;
   disabled when the local executable/language pack is not configured.
5. `OptionalAiCandidateNormalizer`: optional provider adapter that accepts only
   approved, minimized structured fields after deterministic validation. It is
   never used to satisfy startup health and never has profile-write access.

`IDocumentTextExtractor` returns bounded pages/lines plus extractor identity,
version, timing, safe warnings, and a source-location map. `ICandidateAnalyzer`
accepts this typed result and emits candidates only from a closed registry of
rules.

Initial deterministic rules:

- labeled AFSC values with closed-format normalization;
- rank/grade values from an allowlisted vocabulary;
- skill level from explicit labeled values only;
- rating period only when both dates parse and order correctly;
- duty title only from a labeled line with conservative length/character rules;
- education/credential name/date from labeled synthetic fixtures.

Every rule has a stable ID and version. Confidence is computed from explicit
signals such as exact label, format validity, ambiguity count, OCR warning, and
cross-field consistency. It is not a decorative number. High confidence still
requires review. Human-judgment fields—competencies, outcomes, leadership scope,
résumé bullets—remain `DraftInterpretation` and cannot be bulk accepted.

### Analyzer safety invariants

- Document text is data, never instructions.
- Extractors have no tool, shell, browser, email, retrieval, or profile-write
  capability.
- Unknown fields and extra provider keys are rejected by a closed schema.
- Hidden Unicode, links, embedded objects, instruction-like text, and parsing
  anomalies become warnings; they cannot change policy or routing.
- Raw text and snippets are not logged, traced, placed in analytics, or included
  in exception messages.
- Candidate creation fails if document hash, source location, analyzer/rule
  version, or confidence is missing.
- A failed stage creates no partial profile fact.

## Security, privacy, and threat controls

| Threat | Required baseline control | Release evidence |
|---|---|---|
| Broken object authorization | Owner-scoped application services and repository queries; opaque IDs | Cross-user API tests for every resource family |
| Malicious file | Allowlisted types, signature/MIME agreement, byte/page/archive limits, randomized names, quarantine, scan/CDR before extraction | Malformed corpus and isolated EICAR-path test |
| Path traversal/static exposure | Server-generated storage keys, canonical-path checks, blob store outside webroot, no user path joins | Traversal tests and static-route denial |
| Prompt/instruction injection | No tools/network/profile ports in extractor; closed schema; warning scan; human review | Adversarial synthetic fixture suite |
| Log/telemetry disclosure | Payload logging off, central redaction, safe error codes, PII canaries | Log-capture assertions and DLP scan |
| Replay/double apply | Idempotency records plus review/profile concurrency | Duplicate upload/decision/apply tests |
| Tampered/stale sources | SHA-256, immutable analyzer/ruleset/source versions, effective dates | Provenance contract tests |
| Excess retention | Explicit retention selection, deletion state machine, reconciliation | Blob/metadata/backup expiry report |
| Development bypass in production | Environment and explicit synthetic flag; production startup validation | Configuration tests |
| Availability abuse | Request/body limits, bounded parsing, cancellation/timeouts, queue backpressure, rate limiting | Limit/timeout/zip-bomb tests |

Additional launch controls: secure headers, HSTS outside Development, strict CSP,
same-origin defaults, secure cookies where used, secret scanning, dependency/SAST
checks, encryption in transit/at rest, managed workload identity, immutable audit,
and a kill switch for uploads/external analysis that leaves profile deletion and
account access available.

## Implementation slices and file ownership

No runtime slice begins until the project lead publishes the shared contract and
assigns shared-file edits. Proposed ownership is below.

### B0 — Solution boundaries and contract harness

Deliver:

- domain and application class-library projects;
- API/integration test project and test authentication scheme;
- `/api/v1/session` and existing `/api/health` regression coverage;
- Problem Details, correlation ID, and versioned contract conventions.

Backend-owned files:

- `server/MissionProof.Domain/**`
- `server/MissionProof.Application/**`
- `tests/MissionProof.Domain.Tests/**`
- `tests/MissionProof.Api.Tests/**`

Shared files requiring project-lead assignment:

- `MissionProof.slnx`
- `server/MissionProof.Web/Program.cs`
- `server/MissionProof.Web/MissionProof.Web.csproj`

### B1 — Local identity, consent, profile, and plan persistence

Deliver:

- loopback/synthetic Development identity and production startup guard;
- SQLite repositories and migrations;
- consent, profile, goal, pathway search/assessment, and transition-plan APIs;
- seed catalog moved behind `IPathwayCatalog` with source/version metadata.

Backend-owned files:

- `server/MissionProof.Infrastructure/Persistence/**`
- `server/MissionProof.Infrastructure/Identity/**`
- `server/MissionProof.Web/Features/Session/**`
- `server/MissionProof.Web/Features/Consent/**`
- `server/MissionProof.Web/Features/Profile/**`
- `server/MissionProof.Web/Features/Pathways/**`
- `server/MissionProof.Web/Features/TransitionPlan/**`
- matching backend test folders.

Frontend-owned contract consumer:

- `src/api/**` and client state integration. Backend supplies OpenAPI/JSON
  examples but does not edit React files.

### B2 — Deterministic evidence walking skeleton

Deliver:

- private local evidence store and strict synthetic text upload;
- document/analysis/review state machines;
- one deterministic AFSC rule and one duty-title rule;
- review decision and apply APIs;
- safe audit and idempotency records;
- synthetic golden fixtures only.

Backend-owned files:

- `server/MissionProof.Application/Evidence/**`
- `server/MissionProof.Domain/Evidence/**`
- `server/MissionProof.Infrastructure/Evidence/**`
- `server/MissionProof.Infrastructure/Analysis/Deterministic/**`
- `server/MissionProof.Web/Features/Evidence/**`
- `tests/MissionProof.Extraction.ContractTests/**`
- `tests/Fixtures/SyntheticEvidence/**`

### B3 — Hardened formats and asynchronous boundary

Deliver:

- approved DOCX/PDF parsers behind existing ports;
- isolated worker project and transactional outbox;
- real malware/CDR integration in the approved environment;
- retention/deletion reconciliation.

Backend-owned files:

- `server/MissionProof.Analysis.Worker/**`
- provider-specific folders under `server/MissionProof.Infrastructure/Analysis/**`
- `tests/MissionProof.Infrastructure.Tests/**`
- adversarial and malformed synthetic fixture manifests.

### B4 — Controlled-beta infrastructure and optional providers

Deliver:

- approved OIDC, relational database, object store, queue, vault/workload
  identity, and observability adapters;
- provider conformance suite;
- optional OCR/language adapter controlled by configuration and kill switch;
- migration, rollback, restore, deletion, and incident evidence.

Provider-specific code must remain outside Domain/Application. `Program.cs`,
solution/project files, appsettings schemas, CI, and deployment configuration are
shared integration surfaces and require project-lead sequencing.

### Files explicitly outside backend ownership

- `src/**`, `public/**`, and frontend UI tests;
- visual tokens, CSS, UX copy, screenshots, and design images;
- `.openai/hosting.json`, `worker/index.js`,
  `scripts/prepare-sites-build.mjs`, and `tests/sites-worker.test.mjs`;
- README/release/publication text unless assigned by the project lead.

## Test plan

### Domain unit tests

- profile fact type/value validation, versioning, and supersession;
- MAGE input boundaries, requirement matching, deterministic sorting, and tie
  breaks;
- plan item add/update/complete/remove and progress calculation parity with the
  existing frontend behavior;
- document, analysis, and review legal/illegal state transitions;
- candidate provenance/confidence requirements;
- accept/edit/reject behavior and prohibition on undecided/bulk low-confidence
  apply;
- retention/deletion state transitions and idempotency semantics.

Both edges are mandatory: empty/minimum values and maximum/overflow/ambiguous
values. Existing JavaScript rules remain the parity oracle until the shared
contract decides which layer owns each rule.

### API integration tests

- session/consent/profile/goal/plan happy paths and Problem Details failures;
- User A cannot read, mutate, preview, analyze, review, apply, or delete User B's
  resources even with exact IDs;
- consent version gate, expired session, missing capability, CSRF/origin policy;
- ETag mismatch returns `412`; duplicate idempotent requests create one result;
- unsupported content type, length, signature mismatch, invalid state, and safe
  timeout errors;
- SPA fallback never turns unknown `/api/*` routes into `index.html`;
- production configuration refuses synthetic identity/local unsafe storage.

### Extraction contract tests

- frozen synthetic documents across line endings, encodings, case, repeated
  labels, malformed values, missing sections, excessive length, and conflicting
  candidates;
- every candidate includes document/hash/location/analyzer/rule/confidence;
- expected normalized values and confidence reason codes are stable;
- hidden Unicode, URLs, prompt-like instructions, and embedded-object metadata
  only create warnings and cannot alter routing/schema/profile;
- provider adapter returns extra keys, missing provenance, timeout, malformed
  JSON, or version drift and is rejected safely;
- raw document content is absent from captured logs, traces, metrics, Problem
  Details, and audit events.

### Persistence and infrastructure tests

- restart persistence, transaction rollback, concurrency conflict, and migration
  forward/rollback rehearsal;
- storage keys cannot traverse, overwrite, collide, or become static routes;
- deletion reconciles metadata/blob/derivatives/outbox and records exceptions;
- duplicate queue delivery and worker retry are idempotent;
- bounded parser and cancellation behavior under oversize/decompression abuse.

### Same-door walking-skeleton test

An authenticated synthetic User A accepts the current consent, uploads the
checked-in synthetic text fixture through the public HTTP upload flow, requests
analysis, reads a review containing AFSC and duty-title candidates with source
and confidence, rejects one candidate, accepts the other, applies the review,
and reads the resulting versioned profile. Replaying the apply returns the same
result. User B receives no evidence of the document or review. Captured logs
contain IDs and safe codes but none of the fixture text.

## Recommended first walking-skeleton slice

Implement B0 plus the narrowest vertical portion of B1/B2:

> **Synthetic evidence to one confirmed profile fact, locally and without a
> key.**

Scope:

1. Add Domain, Application, Infrastructure, Domain.Tests, Api.Tests, and
   Extraction.ContractTests projects.
2. Add loopback-only synthetic Development identity and test identities.
3. Persist consent, evidence metadata, analysis/review, idempotency, and profile
   facts in SQLite.
4. Accept only a bounded `.txt` synthetic fixture into a private local store.
5. Parse one exact labeled `Primary AFSC:` field using a versioned deterministic
   rule.
6. Return one review candidate with hash, line provenance, confidence reason,
   analyzer/rule versions, and warnings.
7. Require an explicit accept/reject decision and a separate apply command.
8. Show the applied fact through `GET /api/v1/profile`.
9. Prove cross-user denial, idempotent replay, no-profile-write-before-apply,
   static-file isolation, and no raw text in logs.

Out of scope for this slice: real EPR/EPB files, OCR, PDF/DOCX, external AI,
official pathway claims, production OIDC, cloud storage, résumé generation,
bulk accept, and deployment. This small path validates the most important
architecture and trust boundaries before the system expands.

## Risks and mitigations

| Risk | Consequence | Mitigation |
|---|---|---|
| Reconstructed UI may encode guessed product rules | Backend cements behavior that was never authoritative | Treat embedded catalogs/formulas as prototype fixtures; version sources and require product decisions before claims |
| Service records may contain CUI/PII or operational detail | Legal/security harm | Synthetic-only default; production ingestion gate; classification and retention approval |
| A confidence score appears more scientific than it is | Users over-trust candidates | Explicit reason codes, source view, bands, warnings, review requirement, no auto-apply |
| Development identity/local storage escapes into production | Unauthorized access or disclosure | Environment/startup guards and configuration tests; fail closed |
| Local parser expands into unsafe file support | Parser compromise or denial of service | One format at a time, bounded corpus, quarantine, isolated worker before beta |
| Frontend and backend independently redefine matching/progress | Contract drift | Publish v1 examples; parity tests; assign one rule owner per decision |
| External provider becomes a hidden runtime dependency | App cannot start or core flow fails without a key | Provider interface, disabled-by-default adapter, health separation, deterministic baseline |
| Static SPA fallback masks API failures | HTML returned where JSON is expected | Route API group before fallback and integration-test unknown API routes |
| Provider/library upgrade changes extraction | Silent candidate drift | Versioned adapters, frozen contract corpus, side-by-side regression and explicit promotion |
| Raw content leaks through diagnostics | Sensitive evidence persists outside policy | Payload logging off, redaction, safe errors, canary/log assertions |

## Assumptions

- .NET 10 and React remain the selected host/client stack.
- The fork is for design feedback and iterative local development, not current
  production use.
- The current frontend routes and tests describe prototype behavior, not
  authoritative military eligibility rules.
- No external AI or OCR key is available; internet access cannot be assumed at
  runtime.
- The first corpus is synthetic and may be checked into the repository only
  after confirming it contains no copied real-person content.
- A future identity provider can issue stable subject claims through OIDC.

## Open decisions for the project lead and user

1. Which single user journey is the first product milestone: profile setup,
   pathway planning, or document-assisted prefill? This plan recommends the
   prefill-to-profile skeleton because it exercises the critical trust boundary.
2. Which profile fact vocabulary and validation rules are approved for v1?
3. Which current frontend datasets/formulas are illustrative only, and which
   should move server-side as versioned product data?
4. May the local prototype retain synthetic documents across restarts, or should
   it delete bytes immediately after review?
5. What is the intended production identity provider and tenancy model?
6. Which relational database and object store fit the deployment environment?
7. What authoritative classification determines whether any real evaluation
   document can enter a future pilot?
8. What retention/deletion defaults and backup expiry are acceptable?
9. Which document types and years/templates should be supported first after the
   plain-text skeleton?
10. Which official sources and refresh cadence govern pathways, AFSC thresholds,
    federal series, credentials, and apprenticeship data?
11. Who independently reviews the security boundary and the first integrated
    walking-skeleton head?

## Definition of done for MP-003

- The no-key baseline, module boundaries, domain records, v1 API, persistence,
  identity, deterministic analysis, security invariants, file ownership, slices,
  tests, risks, assumptions, decisions, and first walking skeleton are explicit.
- Frontend can implement against the listed DTO semantics without knowing the
  storage/provider implementation.
- Visual/content can design the review interaction around typed candidate,
  source, confidence, warning, and decision states.
- No runtime file, branch, remote, or user data was changed by this planning
  work.

## Inspection and verification record

Workspace governance consulted before entering the nested project (not copied
into the product design):

- `../AURORA.md`
- `../commons/CHARTER.md`
- `../commons/FOUNDING.md`
- `../commons/decisions/directions.md`
- `../commons/decisions/asks-ledger.md`
- `../commons/projects/registry.json`
- `../commons/status-packets/index.json`
- `../commons/status-packets/2026-08-26-ashenspire-daily-brief-1702.json`
- `../commons/conversations/all/thread.md`

Files inspected for this plan:

- `AGENTS.md`
- `MissionProof.slnx`
- `global.json`
- `package.json`
- `vite.config.mjs`
- `worker/index.js`
- `server/MissionProof.Web/MissionProof.Web.csproj`
- `server/MissionProof.Web/Program.cs`
- `server/MissionProof.Web/appsettings.json`
- `src/App.jsx`
- `src/domain/missionproof.js`
- `tests/unit/missionproof.test.mjs`
- `tests/ui/app.test.jsx`
- `tests/sites-worker.test.mjs`
- `README.md`
- `docs/README.md`
- `docs/architecture.md`
- `docs/security-plan.md`
- `docs/document-ingestion.md`
- `docs/testing-strategy.md`
- `docs/product-design.md`
- `docs/design-versions.md`
- `docs/project/PROJECT-CHARTER.md`
- `docs/project/WORKBOARD.md`

Verification for this documentation-only change is recorded after writing with
`git diff --check -- docs/project/BACKEND-CORE-LEAD-PLAN.md`. Runtime tests are
not evidence for this plan because no runtime source was changed.
