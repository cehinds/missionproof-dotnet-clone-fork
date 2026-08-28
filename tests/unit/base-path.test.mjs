import { describe, expect, it } from "vitest";
import { assetUrl, fromBrowserPath, toBrowserPath } from "../../src/app/basePath.js";

describe("repository-aware browser paths", () => {
  const pagesBase = "/missionproof-dotnet-clone-fork/";

  it("maps GitHub Pages paths back to application routes", () => {
    expect(fromBrowserPath("/missionproof-dotnet-clone-fork/", pagesBase)).toBe("/");
    expect(fromBrowserPath("/missionproof-dotnet-clone-fork/app/explore", pagesBase)).toBe("/app/explore");
  });

  it("prefixes navigation and public assets without affecting root hosting", () => {
    expect(toBrowserPath("/app/plan", pagesBase)).toBe("/missionproof-dotnet-clone-fork/app/plan");
    expect(assetUrl("assets/icon.svg", pagesBase)).toBe("/missionproof-dotnet-clone-fork/assets/icon.svg");
    expect(toBrowserPath("/app/plan", "/")).toBe("/app/plan");
  });
});
