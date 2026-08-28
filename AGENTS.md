# Prototype Instructions

Run the local server yourself and open the preview in the browser available to this environment. Do not give the user server-start instructions when you can run it.

Before making substantial visual changes, use the Product Design plugin's `get-context` skill when the visual source is unclear or no longer matches the current goal. When the user gives durable prototype-specific design feedback, preferences, or decisions, record them in `AGENTS.md`.

When implementing from a selected generated mock, treat that image as the source of truth for layout, component anatomy, density, spacing, color, typography, visible content, and hierarchy.

Build app UI in `src/`. Keep `.openai/hosting.json`, `worker/index.js`, `scripts/prepare-sites-build.mjs`, and `tests/sites-worker.test.mjs` intact so the same local prototype can be handed to Sites. Before a Sites handoff, run `npm run build` and `npm run test:sites`; the build must leave `dist/client/index.html`, `dist/server/index.js`, and `dist/.openai/hosting.json`.

Use ASP.NET Core/.NET as the application host for future backend, persistence, authentication, and domain work. Preserve the React application in `src/` as the frontend unless the user explicitly asks for a UI-framework migration.

Treat an installable mobile-first Progressive Web App as MissionProof's primary delivery target. Normal mobile deployment must not require .NET MAUI workloads, Android Studio, Xcode, React Native, Flutter, or app-store SDKs. Keep React/Vite as the PWA client and ASP.NET Core as the optional same-origin API/host. Native-store wrappers may be evaluated later, but must not become a prerequisite for the web or install-from-browser experience.

Preserve MissionProof's dark navy, cyan, green, and hexagonal visual identity. Favor a calm, mobile-first journey with one primary task per screen, readable 16px body copy, grouped progression instead of eleven equally weighted tabs, short default views, progressive disclosure, fewer nested containers, and explicit next-best-action guidance.

Treat uploaded service documents as untrusted sensitive evidence. Never let extracted content invoke tools or write directly to a profile. Every proposed field must retain source provenance and confidence and require an explicit human accept/reject decision.
