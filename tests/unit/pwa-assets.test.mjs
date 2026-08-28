import { readFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import { canRegisterMissionProofPwa } from "../../src/lib/pwa/registerPwa.js";

const repositoryRoot = resolve(dirname(fileURLToPath(import.meta.url)), "../..");
const read = relativePath => readFile(resolve(repositoryRoot, relativePath), "utf8");

describe("mobile-first PWA delivery", () => {
  it("publishes a standalone manifest with a maskable app icon", async () => {
    const manifest = JSON.parse(await read("public/manifest.webmanifest"));
    expect(manifest.start_url).toBe("./");
    expect(manifest.scope).toBe("./");
    expect(manifest.display).toBe("standalone");
    expect(manifest.theme_color).toBe("#0a1224");
    expect(manifest.icons).toEqual(expect.arrayContaining([
      expect.objectContaining({ sizes: "any", type: "image/svg+xml", purpose: expect.stringContaining("maskable") }),
    ]));

    const html = await read("index.html");
    expect(html).toContain('rel="manifest" href="%BASE_URL%manifest.webmanifest"');
    expect(html).toContain('name="theme-color" content="#0a1224"');
  });

  it("keeps API responses out of static caches and returns an offline problem", async () => {
    const serviceWorker = await read("public/sw.js");
    expect(serviceWorker).toContain('url.pathname.startsWith("/api/")');
    expect(serviceWorker).toContain('scopedPath("./api/")');
    expect(serviceWorker).toContain("fetch(request).catch(offlineProblem)");
    expect(serviceWorker).toContain('"Cache-Control": "no-store"');
    expect(serviceWorker).not.toMatch(/caches\.put\([^\n]*api/i);
  });

  it("does not register the service worker outside a production browser", () => {
    expect(canRegisterMissionProofPwa({ navigatorObject: {} })).toBe(false);
  });
});
