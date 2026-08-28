# MissionProof design-fork rebuild charter

## Outcome

Build a useful, mobile-first MissionProof design fork from the captured pages,
existing prototype, and documented observations. The rebuild must run without
an unavailable third-party AI key. Optional AI integrations may be added later
behind provider interfaces, but the core experience must remain functional
without them.

The primary client delivery is an installable Progressive Web App. Normal
mobile deployment must work through an HTTPS web host and browser installation
without native mobile SDKs or app-store tooling.

This repository is an independent design study for suggestions and feedback to
the original designer. It is not the original MissionProof product and must not
be presented as an official replacement.

## Leadership and ownership

| Workstream | Lead | Owns | Must coordinate before changing |
|---|---|---|---|
| Project and coordination | Aurora | Scope, sequence, interfaces, decisions, integration plan, status | Specialist acceptance and release |
| Frontend | Frontend lead | React application structure, interaction flows, responsive behavior, frontend tests | Shared contracts, copy system, visual tokens |
| Backend and core | Backend/core lead | ASP.NET Core host, domain model, persistence, document-ingestion pipeline, backend tests | Frontend API contract and security decisions |
| Visual UI and writing | Visual/content lead | Design system, screen hierarchy, accessibility direction, UX copy, art direction | Runtime behavior and data contracts |

No lead approves their own material implementation. Cross-workstream interface
changes are proposed to the project lead before implementation.

## Product principles

- One clear primary task per screen.
- Mobile-first navigation with grouped progression rather than a dense row of
  equally weighted tabs.
- Readable 16px minimum body copy, concise default views, and progressive
  disclosure for supporting detail.
- Preserve the dark navy, cyan, green, and hexagonal MissionProof identity while
  reducing nested containers and visual noise.
- Treat uploaded service documents as untrusted sensitive evidence. Extraction
  produces reviewable suggestions with provenance and confidence; it never
  invokes tools or writes directly to a profile.
- Deterministic local behavior is the baseline. External AI providers are
  optional adapters, never a startup requirement.

## Initial delivery sequence

1. Establish independently owned workstream plans and shared contracts.
2. Produce a walking skeleton: usable frontend journey, local ASP.NET Core API,
   persistence boundary, and deterministic document-analysis stub.
3. Integrate the selected guided-journey and ranked-evidence concepts into a
   single responsive information architecture.
4. Add same-door UI, API, security, and accessibility tests.
5. Run the app, inspect desktop and mobile behavior, and capture witnessed
   evidence before any merge or publication decision.

## Release boundary

Local implementation, tests, and integration are authorized by this rebuild
direction. Push, merge, publication, transfer of ownership, and release remain
separate actions and are not authorized by this charter.
