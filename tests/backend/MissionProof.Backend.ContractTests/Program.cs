using System.Net;
using System.Net.Http.Json;
using System.Text.Json;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Hosting.Server;
using Microsoft.AspNetCore.Hosting.Server.Features;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using MissionProof.Web;

var failures = new List<string>();
var checks = 0;
var webRoot = Directory.CreateTempSubdirectory("missionproof-backend-contract-");
await File.WriteAllTextAsync(
    Path.Combine(webRoot.FullName, "index.html"),
    "<!doctype html><title>MissionProof contract host</title>");

var app = MissionProofApp.Build(
    [],
    webRoot.FullName,
    Environments.Development,
    builder =>
    {
        builder.Configuration.AddInMemoryCollection(new Dictionary<string, string?>
        {
            ["MissionProof:Development:AllowSyntheticIdentity"] = "true",
        });
        builder.WebHost.UseUrls("http://127.0.0.1:0");
    });

try
{
    await app.StartAsync();
    var server = app.Services.GetRequiredService<IServer>();
    var address = server.Features.Get<IServerAddressesFeature>()!.Addresses.Single();
    using var client = new HttpClient { BaseAddress = new Uri(address) };

    var session = await GetJson(client, "/api/v1/session");
    Check(session.Status == HttpStatusCode.OK, "session returns 200");
    Check(session.Json.RootElement.GetProperty("nextAction").GetProperty("code").GetString() == "ReviewConsent",
        "session begins at consent");
    Check(session.Json.RootElement.GetProperty("nextAction").GetProperty("route").GetString() == "/app/consent",
        "session next action uses the frontend route contract");

    var missingKey = await SendJson(client, HttpMethod.Post, "/api/v1/consent-receipts", new
    {
        accepted = true,
        noticeVersion = "missionproof-design-fork-consent-v1",
        noticeSha256 = "sha256:f2d60d948d94190c9ebd225e9e415d9d0effc6ca6f527804e2be6ec4b5f9393f",
    });
    Check(missingKey.Status == HttpStatusCode.BadRequest, "write requires idempotency key");
    Check(missingKey.Json.RootElement.GetProperty("code").GetString() == "idempotency_key_required",
        "missing idempotency key uses stable problem code");

    var consent = await SendJson(client, HttpMethod.Post, "/api/v1/consent-receipts", new
    {
        accepted = true,
        noticeVersion = "missionproof-design-fork-consent-v1",
        noticeSha256 = "sha256:f2d60d948d94190c9ebd225e9e415d9d0effc6ca6f527804e2be6ec4b5f9393f",
    }, idempotencyKey: "contract-consent-0001");
    Check(consent.Status == HttpStatusCode.OK, "consent records successfully");
    Check(consent.Json.RootElement.GetProperty("accepted").GetBoolean(), "consent response is accepted");

    var consentReplay = await SendJson(client, HttpMethod.Post, "/api/v1/consent-receipts", new
    {
        accepted = true,
        noticeVersion = "missionproof-design-fork-consent-v1",
        noticeSha256 = "sha256:f2d60d948d94190c9ebd225e9e415d9d0effc6ca6f527804e2be6ec4b5f9393f",
    }, idempotencyKey: "contract-consent-0001");
    Check(consentReplay.Response.Headers.TryGetValues("Idempotent-Replay", out var replayValues)
          && replayValues.Single() == "true", "consent replay is explicit and idempotent");

    var goalMissingVersion = await SendJson(client, HttpMethod.Put, "/api/v1/goal", new { goalCode = "paths" },
        "contract-goal-no-version");
    Check(goalMissingVersion.Status == (HttpStatusCode)428, "mutable goal requires If-Match");
    Check(goalMissingVersion.Json.RootElement.GetProperty("code").GetString() == "if_match_required",
        "missing If-Match uses stable problem code");

    var goal = await SendJson(client, HttpMethod.Put, "/api/v1/goal", new { goalCode = "paths" },
        "contract-goal-0001", "W/\"0\"");
    Check(goal.Status == HttpStatusCode.OK, "goal saves successfully");
    Check(goal.Response.Headers.ETag?.ToString() == "W/\"1\"", "goal returns version ETag");

    var beforeProfile = await GetJson(client, "/api/v1/profile");
    Check(beforeProfile.Json.RootElement.GetProperty("facts").GetArrayLength() == 0,
        "profile begins without inferred facts");
    Check(beforeProfile.Response.Headers.ETag?.ToString() == "W/\"0\"", "profile starts at version zero");

    const string syntheticText = "Invented MissionProof fixture only\nPrimary AFSC: 1n0x1\nDuty Title: Synthetic Analyst";
    var analysis = await SendJson(client, HttpMethod.Post, "/api/v1/demo/evidence-analyses", new
    {
        synthetic = true,
        text = syntheticText,
    }, idempotencyKey: "contract-analysis-0001");
    Check(analysis.Status == HttpStatusCode.OK, "synthetic evidence analysis succeeds");
    Check(analysis.Json.RootElement.GetProperty("candidates").GetArrayLength() == 1,
        "deterministic analyzer returns one candidate");
    var candidate = analysis.Json.RootElement.GetProperty("candidates")[0];
    Check(candidate.GetProperty("normalizedValue").GetString() == "1N0X1", "candidate AFSC is normalized");
    Check(candidate.GetProperty("source").GetProperty("lineStart").GetInt32() == 2,
        "candidate retains source line provenance");
    Check(candidate.GetProperty("confidence").GetProperty("reasonCode").GetString() == "ExactLabeledField",
        "candidate confidence has an explicit reason");
    Check(candidate.GetProperty("analyzer").GetProperty("ruleVersion").GetString() == "1.0.0",
        "candidate exposes rule version");

    var afterAnalysis = await GetJson(client, "/api/v1/profile");
    Check(afterAnalysis.Json.RootElement.GetProperty("facts").GetArrayLength() == 0,
        "analysis alone cannot write the profile");

    var reviewId = analysis.Json.RootElement.GetProperty("reviewId").GetString()!;
    var candidateId = candidate.GetProperty("candidateId").GetString()!;
    var decision = await SendJson(
        client,
        HttpMethod.Put,
        $"/api/v1/demo/reviews/{reviewId}/decisions/{candidateId}",
        new { decision = "Accept", editedValue = (string?)null },
        "contract-decision-0001",
        analysis.Response.Headers.ETag!.ToString());
    Check(decision.Status == HttpStatusCode.OK, "candidate accept decision succeeds");

    var afterDecision = await GetJson(client, "/api/v1/profile");
    Check(afterDecision.Json.RootElement.GetProperty("facts").GetArrayLength() == 0,
        "decision alone cannot write the profile");

    var apply = await SendJson(
        client,
        HttpMethod.Post,
        $"/api/v1/demo/reviews/{reviewId}/apply",
        new { },
        "contract-apply-0001",
        decision.Response.Headers.ETag!.ToString());
    Check(apply.Status == HttpStatusCode.OK, "separate apply succeeds");
    Check(apply.Json.RootElement.GetProperty("appliedFacts")[0].GetProperty("origin").GetString() == "ReviewedCandidate",
        "applied fact records reviewed-candidate origin");

    var profile = await GetJson(client, "/api/v1/profile");
    Check(profile.Json.RootElement.GetProperty("facts")[0].GetProperty("normalizedValue").GetString() == "1N0X1",
        "accepted candidate becomes a confirmed profile fact");
    Check(profile.Json.RootElement.GetProperty("facts")[0].GetProperty("source").GetProperty("documentSha256").GetString() is { Length: > 20 },
        "confirmed fact retains source hash provenance");

    var manualProfile = await SendJson(
        client,
        HttpMethod.Put,
        "/api/v1/profile/facts/Service.PrimaryAfsc",
        new { value = "2g0-x1" },
        "contract-profile-manual-0001",
        profile.Response.Headers.ETag!.ToString());
    Check(manualProfile.Status == HttpStatusCode.OK, "manual primary AFSC endpoint succeeds");
    Check(manualProfile.Json.RootElement.GetProperty("facts")[0].GetProperty("normalizedValue").GetString() == "2G0X1",
        "manual primary AFSC is normalized");
    Check(manualProfile.Json.RootElement.GetProperty("facts")[0].GetProperty("origin").GetString() == "Manual",
        "manual primary AFSC records its origin");

    var applyReplay = await SendJson(
        client,
        HttpMethod.Post,
        $"/api/v1/demo/reviews/{reviewId}/apply",
        new { },
        "contract-apply-0001",
        decision.Response.Headers.ETag!.ToString());
    Check(applyReplay.Status == HttpStatusCode.OK, "apply replay returns the original result");
    Check(applyReplay.Response.Headers.Contains("Idempotent-Replay"), "apply replay is marked");

    var assessment = await SendJson(client, HttpMethod.Post, "/api/v1/pathway-assessments", new
    {
        primaryAfsc = "2G0X1",
        goalCode = "paths",
    });
    Check(assessment.Status == HttpStatusCode.OK, "pathway assessment succeeds without a provider key");
    Check(assessment.Json.RootElement.GetProperty("results").GetArrayLength() == 3,
        "pathway assessment defaults to three results");
    Check(assessment.Json.RootElement.GetProperty("results")[0].GetProperty("alignment").GetString() == "ResearchLead",
        "pathway assessment does not claim score alignment");
    Check(assessment.Json.RootElement.GetProperty("officialVerificationRequired").GetBoolean(),
        "pathway assessment requires official verification");
    Check(assessment.Json.RootElement.GetProperty("rulesetVersion").GetString() is { Length: > 0 },
        "pathway response is ruleset-versioned");

    var pathwayId = assessment.Json.RootElement.GetProperty("results")[0].GetProperty("pathwayId").GetString()!;
    var plan = await GetJson(client, "/api/v1/transition-plan");
    var saved = await SendJson(client, HttpMethod.Post, "/api/v1/transition-plan/items",
        new { pathwayId }, "contract-plan-save-0001", plan.Response.Headers.ETag!.ToString());
    Check(saved.Status == HttpStatusCode.OK, "research target saves to transition plan");
    Check(saved.Json.RootElement.GetProperty("items").GetArrayLength() == 1, "plan contains one saved target");

    var planItemId = saved.Json.RootElement.GetProperty("items")[0].GetProperty("planItemId").GetString()!;
    var removed = await SendJson(client, HttpMethod.Patch, $"/api/v1/transition-plan/items/{planItemId}",
        new { state = "Removed" }, "contract-plan-remove-0001", saved.Response.Headers.ETag!.ToString());
    Check(removed.Status == HttpStatusCode.OK, "saved target can be removed reversibly");
    Check(removed.Json.RootElement.GetProperty("items").GetArrayLength() == 0,
        "removed plan item is omitted from active items");
    Check(removed.Json.RootElement.GetProperty("nextAction").GetProperty("code").GetString() == "ReviewResearchLeads",
        "removing the only target recalculates next action");

    var oversized = await SendJson(client, HttpMethod.Post, "/api/v1/demo/evidence-analyses", new
    {
        synthetic = true,
        text = new string('X', 12_001),
    }, idempotencyKey: "contract-analysis-oversized");
    Check(oversized.Status == HttpStatusCode.RequestEntityTooLarge, "oversized synthetic evidence is rejected");
    Check(oversized.Json.RootElement.GetProperty("code").GetString() == "synthetic_text_too_large",
        "oversized error uses safe stable code");
    Check(!oversized.Raw.Contains(new string('X', 80), StringComparison.Ordinal),
        "problem response does not echo rejected document content");

    var unknownApi = await GetJson(client, "/api/v1/not-a-route");
    Check(unknownApi.Status == HttpStatusCode.NotFound, "unknown API route returns 404");
    Check(unknownApi.Response.Content.Headers.ContentType?.MediaType == "application/problem+json",
        "unknown API route cannot fall through to the SPA");

    var spa = await client.GetAsync("/app/future-route");
    Check(spa.StatusCode == HttpStatusCode.OK, "non-API route retains SPA fallback");
}
catch (Exception exception)
{
    failures.Add($"Unhandled contract harness error: {exception}");
}
finally
{
    await app.StopAsync();
    await app.DisposeAsync();
    webRoot.Delete(recursive: true);
}

if (failures.Count > 0)
{
    Console.Error.WriteLine($"MissionProof backend contract checks FAILED ({failures.Count}/{checks}).");
    foreach (var failure in failures)
    {
        Console.Error.WriteLine($"- {failure}");
    }

    return 1;
}

Console.WriteLine($"MissionProof backend contract checks PASS ({checks}/{checks}).");
return 0;

void Check(bool condition, string description)
{
    checks++;
    if (!condition) failures.Add(description);
}

static async Task<ResponseSnapshot> GetJson(HttpClient client, string path)
{
    var response = await client.GetAsync(path);
    return await Snapshot(response);
}

static async Task<ResponseSnapshot> SendJson(
    HttpClient client,
    HttpMethod method,
    string path,
    object body,
    string? idempotencyKey = null,
    string? ifMatch = null)
{
    using var request = new HttpRequestMessage(method, path) { Content = JsonContent.Create(body) };
    if (idempotencyKey is not null) request.Headers.TryAddWithoutValidation("Idempotency-Key", idempotencyKey);
    if (ifMatch is not null) request.Headers.TryAddWithoutValidation("If-Match", ifMatch);
    var response = await client.SendAsync(request);
    return await Snapshot(response);
}

static async Task<ResponseSnapshot> Snapshot(HttpResponseMessage response)
{
    var raw = await response.Content.ReadAsStringAsync();
    return new ResponseSnapshot(response, response.StatusCode, raw, JsonDocument.Parse(raw));
}

sealed record ResponseSnapshot(
    HttpResponseMessage Response,
    HttpStatusCode Status,
    string Raw,
    JsonDocument Json);
