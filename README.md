# MissionProof

## Proposal pack

The detailed product redesign, .NET architecture, security, document-ingestion, testing, and six visual directions are indexed in [docs/README.md](docs/README.md).

MissionProof is a .NET-hosted React application for translating Air Force experience into civilian competencies, credentials, career pathways, and transition-planning evidence.

## Architecture

- **ASP.NET Core 10** is the application host and the home for future APIs, persistence, authentication, and domain logic.
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

The starter API endpoint is available at `http://127.0.0.1:5180/api/health`.

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
npm run test:sites
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
server/MissionProof.Web/          ASP.NET Core host and future APIs
worker/                           Sites-compatible Worker
tests/                            Sites packaging tests
.openai/hosting.json              Sites resource declaration
MissionProof.slnx                 .NET solution
```

## Where to extend

- Add API endpoints in `server/MissionProof.Web/Program.cs` or split them into feature folders as the backend grows.
- Keep user-interface components and styles in `src/`.
- Introduce a separate class-library project when domain logic becomes substantial.
- Add persistence and authentication behind ASP.NET Core rather than storing sensitive information in the browser.
