using System.Diagnostics;

namespace MissionProof.Web.Backend;

public static class ApiEndpoints
{
    public static IEndpointRouteBuilder MapMissionProofApi(this IEndpointRouteBuilder endpoints)
    {
        var api = endpoints.MapGroup("/api/v1");

        api.MapGet("/session", (HttpContext context, MissionProofService service, ICurrentUserAccessor users) =>
        {
            if (!TryGetUser(context, users, out var user, out var problem)) return problem!;
            return Results.Ok(service.GetSession(user!.UserId));
        });

        api.MapPost("/consent-receipts", (HttpContext context, ConsentRequest request, MissionProofService service, ICurrentUserAccessor users) =>
        {
            if (!TryGetUser(context, users, out var user, out var problem)) return problem!;
            if (!TryIdempotencyKey(context, out var key, out problem)) return problem!;
            return ToResult(context, service.RecordConsent(user!.UserId, request, key!));
        });

        api.MapPut("/goal", (HttpContext context, GoalRequest request, MissionProofService service, ICurrentUserAccessor users) =>
        {
            if (!TryGetUser(context, users, out var user, out var problem)) return problem!;
            if (!TryIdempotencyKey(context, out var key, out problem)) return problem!;
            if (!TryIfMatch(context, out var version, out problem)) return problem!;
            var result = service.SetGoal(user!.UserId, request, version, key!);
            return ToResult(context, result, result.Value?.Version);
        });

        api.MapGet("/profile", (HttpContext context, MissionProofService service, ICurrentUserAccessor users) =>
        {
            if (!TryGetUser(context, users, out var user, out var problem)) return problem!;
            var profile = service.GetProfile(user!.UserId);
            SetEtag(context, profile.Version);
            return Results.Ok(profile);
        });

        api.MapPut("/profile/facts/Service.PrimaryAfsc", (HttpContext context, ProfileFactRequest request, MissionProofService service, ICurrentUserAccessor users) =>
        {
            if (!TryGetUser(context, users, out var user, out var problem)) return problem!;
            if (!TryIdempotencyKey(context, out var key, out problem)) return problem!;
            if (!TryIfMatch(context, out var version, out problem)) return problem!;
            var result = service.SetPrimaryAfsc(user!.UserId, request.Value, version, key!);
            return ToResult(context, result, result.Value?.Version);
        });

        api.MapPost("/pathway-assessments", (HttpContext context, PathwayAssessmentRequest request, MissionProofService service, ICurrentUserAccessor users) =>
        {
            if (!TryGetUser(context, users, out var user, out var problem)) return problem!;
            return ToResult(context, service.AssessPathways(user!.UserId, request));
        });

        api.MapGet("/transition-plan", (HttpContext context, MissionProofService service, ICurrentUserAccessor users) =>
        {
            if (!TryGetUser(context, users, out var user, out var problem)) return problem!;
            var plan = service.GetTransitionPlan(user!.UserId);
            SetEtag(context, plan.Version);
            return Results.Ok(plan);
        });

        api.MapPost("/transition-plan/items", (HttpContext context, CreatePlanItemRequest request, MissionProofService service, ICurrentUserAccessor users) =>
        {
            if (!TryGetUser(context, users, out var user, out var problem)) return problem!;
            if (!TryIdempotencyKey(context, out var key, out problem)) return problem!;
            if (!TryIfMatch(context, out var version, out problem)) return problem!;
            var result = service.SavePlanItem(user!.UserId, request, version, key!);
            return ToResult(context, result, result.Value?.Version);
        });

        api.MapPatch("/transition-plan/items/{id}", (HttpContext context, string id, UpdatePlanItemRequest request, MissionProofService service, ICurrentUserAccessor users) =>
        {
            if (!TryGetUser(context, users, out var user, out var problem)) return problem!;
            if (!TryIdempotencyKey(context, out var key, out problem)) return problem!;
            if (!TryIfMatch(context, out var version, out problem)) return problem!;
            var result = service.UpdatePlanItem(user!.UserId, id, request, version, key!);
            return ToResult(context, result, result.Value?.Version);
        });

        api.MapPost("/demo/evidence-analyses", (HttpContext context, EvidenceAnalysisRequest request, MissionProofService service, ICurrentUserAccessor users) =>
        {
            if (!TryGetUser(context, users, out var user, out var problem)) return problem!;
            if (!TryIdempotencyKey(context, out var key, out problem)) return problem!;
            var result = service.AnalyzeEvidence(user!.UserId, request, key!);
            return ToResult(context, result, result.Value?.Version);
        });

        api.MapPut("/demo/reviews/{reviewId}/decisions/{candidateId}", (HttpContext context, string reviewId, string candidateId, ReviewDecisionRequest request, MissionProofService service, ICurrentUserAccessor users) =>
        {
            if (!TryGetUser(context, users, out var user, out var problem)) return problem!;
            if (!TryIdempotencyKey(context, out var key, out problem)) return problem!;
            if (!TryIfMatch(context, out var version, out problem)) return problem!;
            var result = service.DecideCandidate(user!.UserId, reviewId, candidateId, request, version, key!);
            return ToResult(context, result, result.Value?.Version);
        });

        api.MapPost("/demo/reviews/{reviewId}/apply", (HttpContext context, string reviewId, MissionProofService service, ICurrentUserAccessor users) =>
        {
            if (!TryGetUser(context, users, out var user, out var problem)) return problem!;
            if (!TryIdempotencyKey(context, out var key, out problem)) return problem!;
            if (!TryIfMatch(context, out var version, out problem)) return problem!;
            var result = service.ApplyReview(user!.UserId, reviewId, version, key!);
            return ToResult(context, result, result.Value?.ReviewVersion);
        });

        return endpoints;
    }

    public static IResult ApiNotFound(HttpContext context) => Problem(context, new ApiFailure(
        StatusCodes.Status404NotFound,
        "api_route_not_found",
        "API route was not found.",
        "Check the API version, method, and resource path."));

    private static IResult ToResult<T>(HttpContext context, ServiceResult<T> result, int? etagVersion = null)
    {
        if (!result.IsSuccess)
        {
            return Problem(context, result.Failure!);
        }

        if (etagVersion.HasValue)
        {
            SetEtag(context, etagVersion.Value);
        }

        if (result.Replayed)
        {
            context.Response.Headers["Idempotent-Replay"] = "true";
        }

        return Results.Ok(result.Value);
    }

    private static bool TryGetUser(
        HttpContext context,
        ICurrentUserAccessor accessor,
        out CurrentUser? user,
        out IResult? problem)
    {
        user = accessor.GetCurrentUser();
        if (user is not null)
        {
            problem = null;
            return true;
        }

        problem = Problem(context, new ApiFailure(
            StatusCodes.Status503ServiceUnavailable,
            "identity_unavailable",
            "Identity is not configured.",
            "The synthetic development identity is available only in an explicitly enabled Development environment."));
        return false;
    }

    private static bool TryIdempotencyKey(HttpContext context, out string? key, out IResult? problem)
    {
        key = context.Request.Headers["Idempotency-Key"].ToString().Trim();
        if (key.Length is >= 8 and <= 128 && key.All(character => character is >= '!' and <= '~'))
        {
            problem = null;
            return true;
        }

        problem = Problem(context, new ApiFailure(
            StatusCodes.Status400BadRequest,
            "idempotency_key_required",
            "A valid Idempotency-Key is required.",
            "Send 8 to 128 visible ASCII characters in the Idempotency-Key header."));
        return false;
    }

    private static bool TryIfMatch(HttpContext context, out int version, out IResult? problem)
    {
        var value = context.Request.Headers.IfMatch.ToString().Trim();
        var raw = value.StartsWith("W/\"", StringComparison.Ordinal) && value.EndsWith('"')
            ? value[3..^1]
            : value.StartsWith('"') && value.EndsWith('"')
                ? value[1..^1]
                : value;
        if (int.TryParse(raw, out version) && version >= 0)
        {
            problem = null;
            return true;
        }

        problem = Problem(context, new ApiFailure(
            StatusCodes.Status428PreconditionRequired,
            "if_match_required",
            "A current If-Match value is required.",
            "Read the mutable resource and send its ETag in the If-Match header."));
        return false;
    }

    private static void SetEtag(HttpContext context, int version) =>
        context.Response.Headers.ETag = $"W/\"{version}\"";

    private static IResult Problem(HttpContext context, ApiFailure failure) => Results.Problem(
        statusCode: failure.Status,
        title: failure.Title,
        detail: failure.Detail,
        type: $"https://httpstatuses.com/{failure.Status}",
        extensions: new Dictionary<string, object?>
        {
            ["code"] = failure.Code,
            ["traceId"] = Activity.Current?.Id ?? context.TraceIdentifier,
        });
}
