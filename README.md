# MissionProof

## Current working preview

The current mobile-first design fork is published at
[cehinds.github.io/missionproof-dotnet-clone-fork](https://cehinds.github.io/missionproof-dotnet-clone-fork/).
GitHub Pages runs the safe in-browser demo adapter, so the complete walking path
can be reviewed without an API key or server. The .NET-hosted build remains the
functional API version.

## Design fork notice

This repository is an independent **design fork** created to make UI suggestions and feedback easier to review with concrete examples. It is not the official MissionProof application, a replacement for it, or a source-accurate reproduction.

The original source repository was not available when this fork was created. The prototype was reconstructed from the portions of the interface that were visible in the browser, including publicly rendered HTML and CSS, with help from AI and browser inspection tools. Missing layouts, behavior, and product rules were interpreted or approximated, so this implementation may differ substantially from the original application. It uses React with an ASP.NET Core/.NET host because .NET is the framework the contributor is most familiar with.

### Note to the original designer

The original application already has a strong visual identity and a polished overall experience. This fork is meant to respect and build on that work by illustrating possible alternatives—particularly a more mobile-friendly structure, less information presented at once, clearer navigation, larger default text, and a calmer document-review flow. These are exploratory suggestions for discussion, not criticisms or claims that the proposed versions are inherently better. The original designer should feel free to reuse, revise, reject, or build on any idea that is helpful.

## Proposal pack

The detailed product redesign, .NET architecture, security, document-ingestion, testing, and six visual directions are indexed in [docs/README.md](docs/README.md).

MissionProof is a .NET-hosted React application for translating Air Force experience into civilian competencies, credentials, career pathways, and transition-planning evidence.

## No-key walking skeleton

The local rebuild now includes a complete first-time-user path that does not
require an AI or OCR provider key:

`consent → goal → primary AFSC → three research leads → save target → next action`

The rebuilt journey uses four navigation groups, readable mobile-first layouts,
progressive evidence disclosure, reversible save-to-plan behavior, and a quiet
in-app design-fork disclosure. ASP.NET Core owns the versioned `/api/v1` state
and deterministic research-lead rules. A bounded synthetic-text review API also
demonstrates provenance, confidence, accept/edit/reject, and separate apply;
analysis alone cannot modify a profile.

All pathway data and evidence in this milestone are synthetic or illustrative.
Do not enter or upload official, classified, medical, controlled, operational,
or identity information.

## Mobile-first deployment

MissionProof is now an installable Progressive Web App. React/Vite remains the
mobile interface and ASP.NET Core remains the same-origin API/host, so ordinary
mobile deployment does not require MAUI, Android Studio, Xcode, React Native,
Flutter, or an app-store build. Users can install the HTTPS site from their
mobile browser or continue using it as a normal website.

See [docs/mobile-deployment.md](docs/mobile-deployment.md) for the deployment
decision, offline/cache boundary, and optional native-wrapper policy.

## Architecture

- **ASP.NET Core 10** is the application host and owns the initial versioned API, process-local development state, deterministic analysis, and security boundaries.
- **React 19 + Vite** provides the existing responsive user interface in `src/`.
- **Sites packaging** remains available through the existing Worker and `.openai/hosting.json` files.

The .NET build runs the frontend production build automatically. ASP.NET Core serves the generated SPA and falls back to `index.html` for client-side routes.

## Prerequisites

- .NET SDK 10.0.302 or a compatible newer .NET 10 feature band
- Node.js and npm

## Run with .NET

```powershell
dotnet run --project server/MissionProof.Web
```

Open `http://127.0.0.1:5180/`. The first run builds the React frontend before starting ASP.NET Core.

The health endpoint is available at `http://127.0.0.1:5180/api/health`; the
walking-skeleton API is under `http://127.0.0.1:5180/api/v1`.

## Frontend development

For Vite hot reload while working on the interface:

```powershell
npm install
npm run dev
```

The existing frontend preview remains at `http://127.0.0.1:4173/` when started on that port.

## Build and verify

```powershell
dotnet build MissionProof.slnx
npm test
npm run test:sites
dotnet run --project tests/backend/MissionProof.Backend.ContractTests -c Release
```

To publish a self-contained application folder:

```powershell
dotnet publish server/MissionProof.Web -c Release -o artifacts/publish
```

The publish output includes the compiled frontend under `wwwroot`.

## Repository layout

```text
src/                              React application
public/                           Fonts, icons, and map assets
server/MissionProof.Web/          ASP.NET Core host, API, domain services, deterministic analyzer
worker/                           Sites-compatible Worker
tests/                            Frontend, Sites, and backend contract checks
.openai/hosting.json              Sites resource declaration
MissionProof.slnx                 .NET solution
```

## Where to extend

- Extend API features under `server/MissionProof.Web/Backend/`; keep `Program.cs` focused on composition.
- Keep user-interface components and styles in `src/`.
- Replace process-local development state with a reviewed persistence adapter before relying on restart durability.
- Add production identity, private storage, quarantine/malware controls, and approved retention before processing real records.

The three-lead plans, accepted shared contract, workboard, and current evidence
are in [docs/project](docs/project/).
