import { createHash } from "node:crypto";
import { describe, expect, it } from "vitest";
import { consentContent } from "../../src/content/journeyContent.js";
import { consentNotice } from "../../src/domain/consentNotice.js";

describe("consent receipt identity", () => {
  it("matches the exact displayed agreement, safety, and no-provider notice", () => {
    const displayedNotice = [consentContent.agreement, consentContent.safetyDetail, consentContent.prototypeNotice].join("\n");
    const digest = `sha256:${createHash("sha256").update(displayedNotice, "utf8").digest("hex")}`;
    expect(consentNotice).toEqual({
      noticeVersion: "missionproof-design-fork-consent-v1",
      noticeSha256: digest,
    });
  });
});
