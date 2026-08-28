# MissionProof rebuild workboard

Local coordination record for AUR-D027 / AUR-A022. This board is the assignment
checkpoint for the current three-lead rebuild; no GitHub board mutation has
been authorized.

| ID | Priority | Status | Owner | Deliverable | Dependencies |
|---|---:|---|---|---|---|
| MP-001 | P0 | In progress | Aurora | Project charter, interface decisions, sequencing, integration and truthful status | None |
| MP-002 | P0 | Completed | Frontend lead | Frontend assessment, target architecture, route/flow plan, implementation slices and test plan | Existing React prototype and option branches |
| MP-003 | P0 | Completed | Backend/core lead | No-key .NET architecture, domain/API contracts, persistence and document-analysis walking skeleton plan | Existing ASP.NET Core host and security plan |
| MP-004 | P0 | Completed | Visual/content lead | Unified visual system, mobile information architecture, copy framework, art direction and acceptance criteria | Existing screenshots, design versions, Option 2/3 evidence |
| MP-005 | P0 | Completed | Aurora + leads | Shared contract and milestone backlog synthesized from MP-002 through MP-004 | MP-002, MP-003, MP-004 |
| MP-006 | P0 | Completed | Frontend + backend/core + visual/content leads | Walking-skeleton implementation with non-overlapping file ownership | MP-005 |
| MP-007 | P1 | Completed | Cross-workstream non-author reviewers + Aurora | Integrated UI/API/security/accessibility verification | MP-006 |
| MP-008 | P1 | Waiting | Connected browser witness | Rendered desktop/mobile inspection and screenshots at 390x844 and 1440x900 | Browser-control surface unavailable |
| MP-009 | P0 | Completed | Aurora | Mobile-first PWA shell, installability, offline-safe static caching, deployment docs and checks | AUR-D028 |
| MP-010 | P0 | In progress | Aurora | Repository-path-aware static demo, GitHub Pages workflow, deployment and live URL verification | AUR-D029 |

## Working agreement

- All three leads work in the same checkout and must stay inside their assigned
  file boundaries.
- Initial work is discovery and specification in separate documents; no shared
  runtime files are edited until Aurora publishes the interface decision.
- Leads report assumptions, risks, decisions needed, and exact verification.
- A screenshot proves rendered pixels only; behavior claims require runnable
  interaction and test evidence.
