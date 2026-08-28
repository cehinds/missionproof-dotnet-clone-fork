# Mobile-first deployment decision

## Decision

MissionProof's primary mobile framework is an installable Progressive Web App
built with the existing React/Vite client. ASP.NET Core remains the same-origin
API and optional static host. Normal deployment is a web deployment; it does
not require .NET MAUI workloads, Android Studio, Xcode, React Native, Flutter,
or an app-store account.

Users can open the HTTPS site in a mobile browser and add it to the Home Screen.
The installed experience uses the same responsive four-journey UI and the same
versioned .NET API as the browser experience.

## Why this fits

- One deployable web client serves iPhone, iPad, Android, desktop, and shared
  links.
- The current React code, tests, Sites packaging, and .NET host remain useful.
- Updates ship through the web instead of separate mobile-store review cycles.
- The app can be installed without native build tools or platform SDKs.
- A native wrapper can be evaluated later only if a measured requirement—such
  as store-only distribution or a missing device capability—justifies it.

## PWA boundary

- The service worker caches the static application shell and same-origin static
  assets only.
- `/api/**` is always network-only and is never stored in Cache Storage.
- Offline API requests receive a safe `503 application/problem+json` response.
- Confirmed profile, evidence, and plan data are not copied into browser cache,
  local storage, IndexedDB, or the manifest.
- The current process-local .NET state remains a development adapter; install
  support does not make it production persistence.

## Deployment paths

### Current GitHub Pages preview

The repository workflow publishes `dist/client` at
`https://cehinds.github.io/missionproof-dotnet-clone-fork/` from the current
working branch, `dev`, or `main`. This public preview intentionally selects the
memory-backed demo client because GitHub Pages cannot run ASP.NET Core. It is a
design and interaction witness, not proof of server persistence or API hosting.

Repository-path-aware routing, manifest URLs, static assets, and service-worker
scope allow the same client to run beneath the Pages project path. The .NET
build explicitly selects API mode and continues to serve the client at `/` with
same-origin `/api/v1` calls.

### Simplest prototype

Deploy the static PWA through the existing Sites-compatible output. This is
suitable for design review and the memory-client demo but does not provide the
.NET API or restart-durable user state.

### Functional pilot

Deploy the ASP.NET Core application to any ordinary HTTPS-capable .NET host.
The .NET build embeds the PWA under `wwwroot` and serves `/api/v1` from the same
origin. No mobile SDK is involved.

### Native stores later

Do not add a wrapper now. If a later requirement demands Apple App Store or
Google Play distribution, evaluate a thin Capacitor wrapper as a separate
delivery adapter. That path requires native toolchains for store builds and
must remain optional.

## Mobile acceptance

- Manifest loads with the correct content type and a standalone start URL.
- Service worker installs under `/` and excludes all API traffic from caches.
- The app remains usable as a normal responsive website when installation or
  service workers are unavailable.
- Installed and browser modes preserve the four-group navigation and one-task
  screen model.
- Fresh screenshots and behavior checks are still required at 390x844 and
  1440x900 when a connected browser is available.
