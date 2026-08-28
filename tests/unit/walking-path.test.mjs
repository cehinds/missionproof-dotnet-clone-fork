import { describe, expect, it } from "vitest";
import { getResultStatus, normalizeAfsc, normalizeGoalOption, validateAfsc } from "../../src/domain/walkingPath.js";

describe("walking-path view rules", () => {
  it("normalizes user-entered AFSC values without accepting incomplete codes", () => {
    expect(normalizeAfsc(" 1n0 x1 ")).toBe("1N0X1");
    expect(validateAfsc("1N0X1")).toBe("");
    expect(validateAfsc("1N0")).toMatch(/five- or six-character/i);
  });

  it("normalizes content-owned goal options", () => {
    expect(normalizeGoalOption({ id: "paths", label: "Explore paths", description: "Compare leads" })).toEqual({ id: "paths", label: "Explore paths", description: "Compare leads" });
    expect(normalizeGoalOption("Explore", 2)).toEqual({ id: "goal-3", label: "Explore", description: "" });
  });

  it("labels neutral research leads without implying score qualification", () => {
    const labels = { alignedLabel: "Connected", gapLabel: "Gap to verify", researchLeadLabel: "Research lead" };
    expect(getResultStatus({ label: "researchLead" }, labels)).toEqual({ tone: "information", text: "Research lead" });
    expect(getResultStatus({ label: "gapToVerify", gaps: [{ display: "One", area: "requirement" }] }, labels).text).toContain("Gap to verify");
  });
});

