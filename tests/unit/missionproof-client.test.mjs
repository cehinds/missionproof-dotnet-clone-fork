import { afterEach, describe, expect, it, vi } from "vitest";
import { createDefaultMissionProofClient, createHttpMissionProofClient, createMemoryMissionProofClient, MissionProofApiError } from "../../src/lib/api/MissionProofClient.js";
import { consentNotice } from "../../src/domain/consentNotice.js";

const originalFetch = globalThis.fetch;
afterEach(() => { globalThis.fetch = originalFetch; });

function response(payload, etag = null) {
  return {
    ok: true,
    status: 200,
    statusText: "OK",
    headers: { get: name => name.toLowerCase() === "etag" ? etag : null },
    text: async () => JSON.stringify(payload),
  };
}

describe("deterministic MissionProof client", () => {
  it("uses the safe memory adapter unless an API build explicitly selects HTTP", async () => {
    expect((await createDefaultMissionProofClient().getSession()).capabilities.externalAi).toBe(false);

    globalThis.fetch = vi.fn(async () => response({ goal: null, profile: null, consent: null, capabilities: {}, nextAction: null }));
    await createDefaultMissionProofClient({ dataMode: "api" }).getSession();
    expect(globalThis.fetch).toHaveBeenCalledWith("/api/v1/session", expect.any(Object));
  });

  it("keeps the no-key path behind the API-shaped client boundary", async () => {
    const client = createMemoryMissionProofClient();
    expect((await client.getSession()).capabilities.externalAi).toBe(false);
    await client.recordConsent("design-fork-v1");
    await client.setGoal("paths");
    await client.confirmAfsc("1N0X1");
    const assessment = await client.assessPathways({ goal: "paths", primaryAfsc: "1N0X1" });
    expect(assessment.results).toHaveLength(3);
    expect(assessment.officialVerificationRequired).toBe(true);
    expect(assessment.results.every(result => result.source.version && result.officialVerificationRequired)).toBe(true);
    expect(assessment.results.every(result => result.label === "researchLead")).toBe(true);

    const differentAfsc = await client.assessPathways({ goal: "paths", primaryAfsc: "2G0X1" });
    const differentGoal = await client.assessPathways({ goal: "credentials", primaryAfsc: "1N0X1" });
    expect(assessment.results[0].code).toBe("1N0X1");
    expect(differentAfsc.results[0].code).toBe("2G0X1");
    expect(differentAfsc.results.map(result => result.pathwayId)).not.toEqual(assessment.results.map(result => result.pathwayId));
    expect(differentGoal.results.map(result => result.pathwayId)).not.toEqual(assessment.results.map(result => result.pathwayId));
    expect(differentAfsc.results[0].why).not.toEqual(assessment.results[0].why);

    await client.saveTarget(assessment.results[0].pathwayId);
    const plan = await client.getPlan();
    expect(plan.items).toHaveLength(1);
    expect(plan.nextAction.title).toContain(assessment.results[0].title);
  });

  it("returns a stable safe error without partial consent mutation", async () => {
    const client = createMemoryMissionProofClient({ failAt: "recordConsent" });
    await expect(client.recordConsent("design-fork-v1")).rejects.toBeInstanceOf(MissionProofApiError);
    expect((await client.getSession()).consent.accepted).toBe(false);
  });

  it("maps the accepted HTTP DTO and weak-ETag contract", async () => {
    const queued = [
      response({ goal: { goalCode: null, version: 0 }, profile: { primaryAfsc: null, version: 0 }, consent: { accepted: false, noticeVersion: null }, capabilities: {}, nextAction: {} }),
      response({ accepted: true, noticeVersion: consentNotice.noticeVersion }),
      response({ goalCode: "paths", version: 1 }),
      response({ version: 0, facts: [] }, 'W/"0"'),
      response({ version: 1, facts: [{ factType: "Service.PrimaryAfsc", normalizedValue: "1N0X1" }] }, 'W/"1"'),
      response({ rulesetVersion: "local-v1", sourceVersions: ["source-v1"], officialVerificationRequired: true, warnings: [], results: [{ pathwayId: "p1", code: "1N0X1", title: "Example path", alignment: "ResearchLead", why: ["Connected to profile"], gaps: [{ code: "OfficialRequirements", label: "Verify official requirements" }], sourceVersion: "source-v1", officialVerificationRequired: true }] }),
      response({ version: 0, items: [], nextAction: { code: "ReviewResearchLeads", label: "Review research leads", route: "/app/explore" } }, 'W/"0"'),
      response({ version: 1, items: [{ planItemId: "item-1", pathwayId: "p1", title: "Example path", state: "NotStarted", nextAction: "Verify Example path" }], nextAction: { code: "Verify", label: "Verify Example path", route: "/app/plan" } }, 'W/"1"'),
      response({ version: 2, items: [], nextAction: { code: "ReviewResearchLeads", label: "Review research leads", route: "/app/explore" } }, 'W/"2"'),
    ];
    globalThis.fetch = vi.fn(async () => queued.shift());
    const client = createHttpMissionProofClient();

    expect((await client.getSession()).goal).toBeNull();
    await client.recordConsent(consentNotice);
    await client.setGoal("paths");
    await client.confirmAfsc("1N0X1");
    const assessment = await client.assessPathways({ primaryAfsc: "1N0X1", goal: "paths" });
    expect(assessment.results[0]).toMatchObject({ label: "researchLead", source: { version: "source-v1" } });
    await client.getPlan();
    const saved = await client.saveTarget("p1");
    expect(saved.items[0]).toMatchObject({ id: "item-1", pathwayId: "p1", status: "notStarted" });
    const removed = await client.updatePlanItem("p1", { status: "removed" });
    expect(removed.nextAction).toMatchObject({ id: "ReviewResearchLeads", route: "/app/explore" });

    expect(JSON.parse(globalThis.fetch.mock.calls[1][1].body)).toEqual({ accepted: true, ...consentNotice });
    expect(globalThis.fetch.mock.calls[2][1].headers["If-Match"]).toBe('W/"0"');
    expect(JSON.parse(globalThis.fetch.mock.calls[5][1].body)).toEqual({ primaryAfsc: "1N0X1", goalCode: "paths" });
    expect(globalThis.fetch.mock.calls[8][0]).toContain("/api/v1/transition-plan/items/item-1");
    expect(JSON.parse(globalThis.fetch.mock.calls[8][1].body)).toEqual({ state: "Removed" });
    expect(globalThis.fetch.mock.calls[8][1].headers["If-Match"]).toBe('W/"1"');
  });
});
