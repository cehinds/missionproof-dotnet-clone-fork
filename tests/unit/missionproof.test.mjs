import { describe, expect, it } from "vitest";
import { calculatePlanProgress, matchAirForcePaths, searchSkillCatalog, togglePlanItem } from "../../src/domain/missionproof.js";

describe("MissionProof domain rules", () => {
  it("ranks score-aligned Air Force paths before paths with gaps", () => {
    const paths = [
      { afsc: "B", family: "Cyber", scores: { G: 70 } },
      { afsc: "A", family: "Cyber", scores: { G: 50 } },
    ];
    const results = matchAirForcePaths(paths, { G: 60 });
    expect(results.map(item => item.afsc)).toEqual(["A", "B"]);
    expect(results[1].gaps).toEqual([{ area: "G", required: 70, actual: 60 }]);
  });

  it("filters skill matches by query and pathway type", () => {
    const catalog = [
      { title: "Program Analyst", detail: "Planning work", tags: ["leadership"], type: "Civilian role" },
      { title: "PMP", detail: "Project credential", tags: ["planning"], type: "Credential" },
    ];
    expect(searchSkillCatalog(catalog, "planning", "Credential").map(item => item.title)).toEqual(["PMP"]);
  });

  it("caps pathway credit and calculates the readiness score", () => {
    expect(calculatePlanProgress(4, 99, 5)).toBe(100);
    expect(calculatePlanProgress(1, 1, 2)).toBe(29);
  });

  it("adds and removes a saved plan item without mutating the input", () => {
    const original = [];
    const item = { id: "pmp", title: "PMP" };
    const added = togglePlanItem(original, item);
    expect(added).toEqual([item]);
    expect(original).toEqual([]);
    expect(togglePlanItem(added, item)).toEqual([]);
  });
});
