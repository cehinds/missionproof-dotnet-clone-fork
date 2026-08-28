using System.Security.Cryptography;
using System.Text;
using System.Text.RegularExpressions;

namespace MissionProof.Web.Backend;

public sealed partial class MissionProofService(
    IMissionProofStore store,
    DeterministicEvidenceAnalyzer analyzer)
{
    public const string ApiVersion = "1";
    public const string ConsentNoticeVersion = "missionproof-design-fork-consent-v1";
    public const string ConsentNoticeSha256 = "sha256:f2d60d948d94190c9ebd225e9e415d9d0effc6ca6f527804e2be6ec4b5f9393f";
    public const string RulesetVersion = "illustrative-afsc-goal-mapping-v1";
    public const string PathwaySourceVersion = "illustrative-pathways-2026-08-27";

    private static readonly HashSet<string> GoalCodes =
        new(["translate", "paths", "credentials", "plan", "unsure"], StringComparer.Ordinal);

    private static readonly PathwayDefinition[] Pathways =
    [
        new("afsc-1d7x1", "1D7X1", "Cyber Defense Operations", "Cyber & Intelligence",
            ["1D", "1N"], ["retraining", "federal", "civilian", "credential"],
            "This illustrative lead stays close to cyber, systems, and risk-control work."),
        new("afsc-1n0x1", "1N0X1", "All Source Intelligence Analyst", "Cyber & Intelligence",
            ["1N", "1D", "1C"], ["retraining", "federal", "civilian"],
            "This illustrative lead emphasizes synthesis, briefing, and decision support."),
        new("afsc-1c5x1", "1C5X1", "Command and Control Battle Management", "Operations",
            ["1C", "1N", "2G"], ["retraining", "federal", "civilian"],
            "This illustrative lead emphasizes coordination and a shared operational picture."),
        new("afsc-2g0x1", "2G0X1", "Logistics Plans", "Logistics",
            ["2G", "2T", "1C"], ["retraining", "federal", "civilian", "credential"],
            "This illustrative lead emphasizes readiness, movement, and logistics planning."),
        new("afsc-2t2x1", "2T2X1", "Air Transportation", "Logistics",
            ["2T", "2G"], ["retraining", "civilian", "credential"],
            "This illustrative lead emphasizes passenger, cargo, and terminal operations."),
        new("afsc-3e5x1", "3E5X1", "Engineering", "Technical & Engineering",
            ["3E", "2G"], ["retraining", "civilian", "credential"],
            "This illustrative lead emphasizes technical planning, inspection, and projects."),
    ];

    public SessionResponse GetSession(string userId) => store.Read(state =>
    {
        var user = state.GetOrCreateUser(userId);
        return new SessionResponse(
            ApiVersion,
            new SessionCapabilities(true, false, ["SyntheticPlainText"]),
            new ConsentSummary(user.Consent?.Accepted == true, user.Consent?.NoticeVersion),
            new GoalSummary(user.GoalCode, user.GoalVersion),
            new ProfileSummary(user.PrimaryAfsc?.NormalizedValue, user.ProfileVersion),
            NextAction(user));
    });

    public ServiceResult<ConsentResponse> RecordConsent(
        string userId,
        ConsentRequest request,
        string idempotencyKey)
    {
        if (!request.Accepted)
        {
            return ServiceResult<ConsentResponse>.Fail(400, "consent_required", "Consent is required.",
                "The first milestone continues only after the current notice is explicitly accepted.");
        }

        if (!string.Equals(request.NoticeVersion, ConsentNoticeVersion, StringComparison.Ordinal)
            || !string.Equals(request.NoticeSha256, ConsentNoticeSha256, StringComparison.Ordinal))
        {
            return ServiceResult<ConsentResponse>.Fail(400, "consent_notice_invalid", "Consent notice is invalid.",
                "Provide the current displayed notice version and its SHA-256 identifier.");
        }

        var fingerprint = Fingerprint(request.Accepted, request.NoticeVersion, request.NoticeSha256);
        return store.Write(state => WithIdempotency<ConsentResponse>(state, userId, "consent", idempotencyKey, fingerprint, () =>
        {
            var user = state.GetOrCreateUser(userId);
            user.Consent = new ConsentResponse(
                ApiVersion,
                true,
                request.NoticeVersion.Trim(),
                request.NoticeSha256!.ToLowerInvariant(),
                DateTimeOffset.UtcNow);
            return user.Consent;
        }));
    }

    public ServiceResult<GoalResponse> SetGoal(
        string userId,
        GoalRequest request,
        int expectedVersion,
        string idempotencyKey)
    {
        var goalCode = request.GoalCode?.Trim();
        if (string.IsNullOrWhiteSpace(goalCode) || !GoalCodes.Contains(goalCode))
        {
            return ServiceResult<GoalResponse>.Fail(400, "goal_invalid", "Goal is invalid.",
                "Choose one of the goal codes returned by the current user experience.");
        }

        var fingerprint = Fingerprint(goalCode, expectedVersion);
        return store.Write(state => WithIdempotency<GoalResponse>(state, userId, "goal", idempotencyKey, fingerprint, () =>
        {
            var user = state.GetOrCreateUser(userId);
            if (user.Consent?.Accepted != true)
            {
                return Failure<GoalResponse>(409, "consent_not_recorded", "Consent has not been recorded.",
                    "Record the current consent notice before setting a goal.");
            }

            if (user.GoalVersion != expectedVersion)
            {
                return Failure<GoalResponse>(412, "version_mismatch", "The goal has changed.",
                    "Refresh the session and retry with the current ETag.");
            }

            user.GoalCode = goalCode;
            user.GoalVersion++;
            return new GoalResponse(ApiVersion, goalCode, user.GoalVersion);
        }));
    }

    public ProfileResponse GetProfile(string userId) => store.Read(state =>
        ToProfile(state.GetOrCreateUser(userId)));

    public ServiceResult<ProfileResponse> SetPrimaryAfsc(
        string userId,
        string value,
        int expectedVersion,
        string idempotencyKey,
        string origin = "Manual",
        CandidateSourceResponse? source = null)
    {
        var normalized = NormalizeAfsc(value);
        if (!IsValidAfsc(normalized))
        {
            return ServiceResult<ProfileResponse>.Fail(400, "primary_afsc_invalid", "Primary AFSC is invalid.",
                "Use a five- or six-character AFSC such as 1N0X1.");
        }

        var fingerprint = Fingerprint(normalized, expectedVersion, origin, source?.DocumentSha256);
        return store.Write(state => WithIdempotency<ProfileResponse>(state, userId, "profile-primary-afsc", idempotencyKey, fingerprint, () =>
        {
            var user = state.GetOrCreateUser(userId);
            if (user.Consent?.Accepted != true)
            {
                return Failure<ProfileResponse>(409, "consent_not_recorded", "Consent has not been recorded.",
                    "Record the current consent notice before confirming profile facts.");
            }

            if (user.ProfileVersion != expectedVersion)
            {
                return Failure<ProfileResponse>(412, "version_mismatch", "The profile has changed.",
                    "Refresh the profile and retry with the current ETag.");
            }

            user.ProfileVersion++;
            user.PrimaryAfsc = new ProfileFactRecord(
                DeterministicEvidenceAnalyzer.NewOpaqueId("fact"),
                "Service.PrimaryAfsc",
                normalized,
                normalized,
                origin,
                DateTimeOffset.UtcNow,
                source);
            return ToProfile(user);
        }));
    }

    public ServiceResult<PathwayAssessmentResponse> AssessPathways(string userId, PathwayAssessmentRequest request)
    {
        var afsc = NormalizeAfsc(request.PrimaryAfsc ?? string.Empty);
        if (!IsValidAfsc(afsc))
        {
            return ServiceResult<PathwayAssessmentResponse>.Fail(400, "primary_afsc_invalid",
                "Primary AFSC is invalid.", "Confirm a five- or six-character AFSC before requesting research leads.");
        }

        var goal = (request.GoalCode ?? string.Empty).Trim().ToLowerInvariant();
        if (!GoalCodes.Contains(goal))
        {
            return ServiceResult<PathwayAssessmentResponse>.Fail(400, "goal_invalid",
                "Goal is invalid.", "Choose one of the goal codes returned by the current user experience.");
        }

        var contextFailure = store.Read(state =>
        {
            var user = state.GetOrCreateUser(userId);
            if (user.Consent?.Accepted != true)
            {
                return new ApiFailure(409, "consent_not_recorded", "Consent has not been recorded.",
                    "Record the current consent notice before requesting research leads.");
            }

            if (user.PrimaryAfsc?.NormalizedValue != afsc || user.GoalCode != goal)
            {
                return new ApiFailure(409, "profile_context_mismatch", "Profile context has changed.",
                    "Refresh the session and use the confirmed AFSC and selected goal.");
            }

            return null;
        });
        if (contextFailure is not null)
        {
            return ServiceResult<PathwayAssessmentResponse>.Fail(
                contextFailure.Status, contextFailure.Code, contextFailure.Title, contextFailure.Detail);
        }

        var afscPrefix = afsc[..Math.Min(2, afsc.Length)];
        var results = Pathways
            .Select(pathway => new
            {
                Pathway = pathway,
                Affinity = pathway.AfscPrefixes.Contains(afscPrefix, StringComparer.Ordinal) ? 0 : 2,
                Goal = pathway.GoalTerms.Any(goal.Contains) ? 0 : 1,
            })
            .OrderBy(item => item.Affinity + item.Goal)
            .ThenBy(item => item.Pathway.Code, StringComparer.Ordinal)
            .Take(3)
            .Select(item => new PathwayResultResponse(
                item.Pathway.Id,
                item.Pathway.Code,
                item.Pathway.Title,
                item.Pathway.Family,
                "ResearchLead",
                BuildWhy(item.Pathway, afsc, request.GoalCode),
                [
                    new PathwayGapResponse("OfficialRequirements",
                        "Verify current official requirements and factors not represented by this prototype."),
                    new PathwayGapResponse("EvidenceComparison",
                        "Compare your confirmed evidence with a current authoritative source."),
                ],
                PathwaySourceVersion,
                true))
            .ToArray();

        return ServiceResult<PathwayAssessmentResponse>.Success(new PathwayAssessmentResponse(
            ApiVersion,
            RulesetVersion,
            [PathwaySourceVersion],
            results,
            ["IllustrativeResearchData", "NoQualificationOrScoreDetermination"],
            true));
    }

    public TransitionPlanResponse GetTransitionPlan(string userId) => store.Read(state =>
        ToPlan(state.GetOrCreateUser(userId)));

    public ServiceResult<TransitionPlanResponse> SavePlanItem(
        string userId,
        CreatePlanItemRequest request,
        int expectedVersion,
        string idempotencyKey)
    {
        var pathway = Pathways.SingleOrDefault(item => item.Id.Equals(request.PathwayId, StringComparison.Ordinal));
        if (pathway is null)
        {
            return ServiceResult<TransitionPlanResponse>.Fail(404, "pathway_not_found", "Pathway was not found.",
                "Choose a pathway from the current assessment response.");
        }

        var fingerprint = Fingerprint(request.PathwayId, expectedVersion);
        return store.Write(state => WithIdempotency<TransitionPlanResponse>(state, userId, "plan-save", idempotencyKey, fingerprint, () =>
        {
            var user = state.GetOrCreateUser(userId);
            if (user.Consent?.Accepted != true || user.PrimaryAfsc is null)
            {
                return Failure<TransitionPlanResponse>(409, "profile_context_incomplete",
                    "Profile context is incomplete.",
                    "Record consent and confirm a primary AFSC before saving a research target.");
            }

            if (user.PlanVersion != expectedVersion)
            {
                return Failure<TransitionPlanResponse>(412, "version_mismatch", "The transition plan has changed.",
                    "Refresh the plan and retry with the current ETag.");
            }

            if (user.PlanItems.All(item => item.PathwayId != pathway.Id || item.State == "Removed"))
            {
                user.PlanItems.Add(new PlanItemRecord
                {
                    PlanItemId = DeterministicEvidenceAnalyzer.NewOpaqueId("planitem"),
                    PathwayId = pathway.Id,
                    Title = pathway.Title,
                    NextAction = $"Verify the current official requirements for {pathway.Code} with an authorized career advisor.",
                    SavedAt = DateTimeOffset.UtcNow,
                });
                user.PlanVersion++;
            }

            return ToPlan(user);
        }));
    }

    public ServiceResult<TransitionPlanResponse> UpdatePlanItem(
        string userId,
        string itemId,
        UpdatePlanItemRequest request,
        int expectedVersion,
        string idempotencyKey)
    {
        var stateValue = request.State?.Trim();
        if (stateValue is not ("NotStarted" or "InProgress" or "Completed" or "Removed"))
        {
            return ServiceResult<TransitionPlanResponse>.Fail(400, "plan_item_state_invalid",
                "Plan item state is invalid.", "State must be NotStarted, InProgress, Completed, or Removed.");
        }

        var fingerprint = Fingerprint(itemId, stateValue, expectedVersion);
        return store.Write(state => WithIdempotency<TransitionPlanResponse>(state, userId, $"plan-update:{itemId}", idempotencyKey, fingerprint, () =>
        {
            var user = state.GetOrCreateUser(userId);
            if (user.PlanVersion != expectedVersion)
            {
                return Failure<TransitionPlanResponse>(412, "version_mismatch", "The transition plan has changed.",
                    "Refresh the plan and retry with the current ETag.");
            }

            var item = user.PlanItems.SingleOrDefault(candidate => candidate.PlanItemId == itemId);
            if (item is null)
            {
                return Failure<TransitionPlanResponse>(404, "plan_item_not_found", "Plan item was not found.",
                    "Refresh the plan and choose a current item.");
            }

            item.State = stateValue;
            item.CompletedAt = stateValue is "Completed" or "Removed" ? DateTimeOffset.UtcNow : null;
            user.PlanVersion++;
            return ToPlan(user);
        }));
    }

    public ServiceResult<EvidenceAnalysisResponse> AnalyzeEvidence(
        string userId,
        EvidenceAnalysisRequest request,
        string idempotencyKey)
    {
        if (!request.Synthetic)
        {
            return ServiceResult<EvidenceAnalysisResponse>.Fail(400, "synthetic_confirmation_required",
                "Only synthetic evidence is accepted.",
                "Set synthetic to true only for invented test data. Official records are not accepted in this milestone.");
        }

        var analysis = analyzer.Analyze(request.Text ?? string.Empty);
        if (!analysis.IsSuccess)
        {
            return ServiceResult<EvidenceAnalysisResponse>.Fail(
                analysis.Failure!.Status,
                analysis.Failure.Code,
                analysis.Failure.Title,
                analysis.Failure.Detail);
        }

        var fingerprint = Fingerprint(request.Synthetic, analysis.Value!.DocumentSha256);
        return store.Write(state => WithIdempotency<EvidenceAnalysisResponse>(state, userId, "evidence-analysis", idempotencyKey, fingerprint, () =>
        {
            var user = state.GetOrCreateUser(userId);
            if (user.Consent?.Accepted != true)
            {
                return Failure<EvidenceAnalysisResponse>(409, "consent_not_recorded", "Consent has not been recorded.",
                    "Record the current consent notice before analyzing synthetic evidence.");
            }

            var review = new ReviewRecord
            {
                ReviewId = DeterministicEvidenceAnalyzer.NewOpaqueId("review"),
                OwnerUserId = userId,
                DocumentSha256 = analysis.Value.DocumentSha256,
            };
            review.Candidates.AddRange(analysis.Value.Candidates);
            state.Reviews.Add(review.ReviewId, review);
            return ToEvidenceAnalysis(review, analysis.Value.Warnings);
        }));
    }

    public ServiceResult<ReviewDecisionResponse> DecideCandidate(
        string userId,
        string reviewId,
        string candidateId,
        ReviewDecisionRequest request,
        int expectedVersion,
        string idempotencyKey)
    {
        var decision = NormalizeDecision(request.Decision);
        if (decision is null)
        {
            return ServiceResult<ReviewDecisionResponse>.Fail(400, "review_decision_invalid",
                "Review decision is invalid.", "Decision must be Accept, Edit, or Reject.");
        }

        string? editedValue = null;
        if (decision == "Edited")
        {
            editedValue = NormalizeAfsc(request.EditedValue ?? string.Empty);
            if (!IsValidAfsc(editedValue))
            {
                return ServiceResult<ReviewDecisionResponse>.Fail(400, "edited_value_invalid",
                    "Edited AFSC is invalid.", "Use a five- or six-character AFSC such as 1N0X1.");
            }
        }

        var fingerprint = Fingerprint(reviewId, candidateId, decision, editedValue, expectedVersion);
        return store.Write(state => WithIdempotency<ReviewDecisionResponse>(state, userId, $"review-decision:{reviewId}:{candidateId}", idempotencyKey, fingerprint, () =>
        {
            if (!state.Reviews.TryGetValue(reviewId, out var review) || review.OwnerUserId != userId)
            {
                return Failure<ReviewDecisionResponse>(404, "review_not_found", "Review was not found.",
                    "Refresh the review and retry.");
            }

            if (review.Version != expectedVersion)
            {
                return Failure<ReviewDecisionResponse>(412, "version_mismatch", "The review has changed.",
                    "Refresh the review and retry with the current ETag.");
            }

            var candidate = review.Candidates.SingleOrDefault(item => item.CandidateId == candidateId);
            if (candidate is null)
            {
                return Failure<ReviewDecisionResponse>(404, "candidate_not_found", "Candidate was not found.",
                    "Refresh the review and choose a current candidate.");
            }

            if (review.State == "Applied")
            {
                return Failure<ReviewDecisionResponse>(409, "review_already_applied", "The review was already applied.",
                    "Applied review decisions are immutable.");
            }

            candidate.ReviewState = decision;
            candidate.DecidedValue = decision switch
            {
                "Accepted" => candidate.NormalizedValue,
                "Edited" => editedValue,
                _ => null,
            };
            review.Version++;
            review.State = review.Candidates.All(item => item.ReviewState != "Pending")
                ? "ReadyToApply"
                : "PartiallyDecided";
            return new ReviewDecisionResponse(
                ApiVersion,
                review.ReviewId,
                review.Version,
                candidate.CandidateId,
                decision,
                candidate.DecidedValue);
        }));
    }

    public ServiceResult<ApplyReviewResponse> ApplyReview(
        string userId,
        string reviewId,
        int expectedVersion,
        string idempotencyKey)
    {
        var fingerprint = Fingerprint(reviewId, expectedVersion);
        return store.Write(state => WithIdempotency<ApplyReviewResponse>(state, userId, $"review-apply:{reviewId}", idempotencyKey, fingerprint, () =>
        {
            if (!state.Reviews.TryGetValue(reviewId, out var review) || review.OwnerUserId != userId)
            {
                return Failure<ApplyReviewResponse>(404, "review_not_found", "Review was not found.",
                    "Refresh the review and retry.");
            }

            if (review.Version != expectedVersion)
            {
                return Failure<ApplyReviewResponse>(412, "version_mismatch", "The review has changed.",
                    "Refresh the review and retry with the current ETag.");
            }

            if (review.State == "Applied")
            {
                return Failure<ApplyReviewResponse>(409, "review_already_applied", "The review was already applied.",
                    "Use the original idempotency key to replay the apply result.");
            }

            var chosen = review.Candidates
                .Where(candidate => candidate.ReviewState is "Accepted" or "Edited" && !candidate.Applied)
                .ToArray();
            if (chosen.Length == 0)
            {
                return Failure<ApplyReviewResponse>(409, "no_candidates_selected", "No candidates are selected.",
                    "Accept or edit at least one candidate before applying the review.");
            }

            if (chosen.GroupBy(candidate => candidate.FactType, StringComparer.Ordinal).Any(group => group.Count() > 1))
            {
                return Failure<ApplyReviewResponse>(409, "conflicting_candidates_selected",
                    "Conflicting candidates are selected.",
                    "Accept or edit only one candidate for each profile fact type.");
            }

            var user = state.GetOrCreateUser(userId);
            var appliedFacts = new List<ProfileFactResponse>();
            foreach (var candidate in chosen)
            {
                if (candidate.FactType != "Service.PrimaryAfsc" || candidate.DecidedValue is null)
                {
                    continue;
                }

                user.ProfileVersion++;
                user.PrimaryAfsc = new ProfileFactRecord(
                    DeterministicEvidenceAnalyzer.NewOpaqueId("fact"),
                    candidate.FactType,
                    candidate.DecidedValue,
                    candidate.DecidedValue,
                    "ReviewedCandidate",
                    DateTimeOffset.UtcNow,
                    candidate.Source);
                candidate.Applied = true;
                appliedFacts.Add(ToProfileFact(user.PrimaryAfsc));
            }

            review.Version++;
            review.State = "Applied";
            return new ApplyReviewResponse(
                ApiVersion,
                review.ReviewId,
                review.Version,
                user.ProfileVersion,
                appliedFacts,
                review.State);
        }));
    }

    public static string NormalizeAfsc(string? value) =>
        new string((value ?? string.Empty).Where(character => !char.IsWhiteSpace(character) && character != '-').ToArray()).ToUpperInvariant();

    public static bool IsValidAfsc(string value) => AfscValue().IsMatch(value);

    private static string? NormalizeDecision(string value) => value?.Trim().ToLowerInvariant() switch
    {
        "accept" or "accepted" => "Accepted",
        "edit" or "edited" => "Edited",
        "reject" or "rejected" => "Rejected",
        _ => null,
    };

    private static IReadOnlyList<string> BuildWhy(PathwayDefinition pathway, string afsc, string? goalCode)
    {
        var why = new List<string>
        {
            pathway.Why,
            $"Mapped deterministically from confirmed AFSC {afsc}; no qualification or score decision was made.",
        };
        if (!string.IsNullOrWhiteSpace(goalCode))
        {
            why.Add($"Ordered with the selected goal “{goalCode.Trim()}” as an illustrative planning signal.");
        }

        return why;
    }

    private static NextActionResponse NextAction(UserRecord user)
    {
        if (user.Consent?.Accepted != true)
            return new NextActionResponse("ReviewConsent", "Review the design-fork notice", "/app/consent");
        if (string.IsNullOrWhiteSpace(user.GoalCode))
            return new NextActionResponse("ChooseGoal", "Choose one transition goal", "/app/goal");
        if (user.PrimaryAfsc is null)
            return new NextActionResponse("ConfirmPrimaryAfsc", "Confirm your primary AFSC", "/app/profile");
        var activeItems = user.PlanItems.Where(item => item.State != "Removed").ToArray();
        if (activeItems.Length == 0)
            return new NextActionResponse("ReviewResearchLeads", "Review three research leads", "/app/explore");

        var open = activeItems.FirstOrDefault(item => item.State != "Completed");
        return open is null
            ? new NextActionResponse("ChooseNextTarget", "Choose another research target", "/app/explore")
            : new NextActionResponse("CompleteNextAction", open.NextAction, "/app/plan");
    }

    private static ProfileResponse ToProfile(UserRecord user)
    {
        IReadOnlyList<ProfileFactResponse> facts = user.PrimaryAfsc is null
            ? []
            : [ToProfileFact(user.PrimaryAfsc)];
        return new ProfileResponse(ApiVersion, $"profile_{user.UserId}", user.ProfileVersion, facts);
    }

    private static ProfileFactResponse ToProfileFact(ProfileFactRecord fact) => new(
        fact.FactId,
        fact.FactType,
        fact.DisplayValue,
        fact.NormalizedValue,
        fact.Origin,
        fact.ConfirmedAt,
        fact.Source);

    private static TransitionPlanResponse ToPlan(UserRecord user) => new(
        ApiVersion,
        $"plan_{user.UserId}",
        user.PlanVersion,
        user.PlanItems.Where(item => item.State != "Removed").Select(item => new PlanItemResponse(
            item.PlanItemId,
            item.PathwayId,
            item.Title,
            item.State,
            item.NextAction,
            item.SavedAt,
            item.CompletedAt)).ToArray(),
        NextAction(user));

    private static EvidenceAnalysisResponse ToEvidenceAnalysis(
        ReviewRecord review,
        IReadOnlyList<string> warnings) => new(
        ApiVersion,
        review.ReviewId,
        review.Version,
        review.DocumentSha256,
        DeterministicEvidenceAnalyzer.AnalyzerName,
        DeterministicEvidenceAnalyzer.AnalyzerVersion,
        review.Candidates.Select(candidate => new CandidateResponse(
            candidate.CandidateId,
            candidate.FactType,
            candidate.ProposedValue,
            candidate.NormalizedValue,
            candidate.Confidence,
            candidate.Source,
            candidate.Analyzer,
            candidate.Warnings,
            candidate.ReviewState)).ToArray(),
        warnings,
        review.State);

    private static ServiceResult<T> WithIdempotency<T>(
        MissionProofState state,
        string userId,
        string operation,
        string key,
        string fingerprint,
        Func<object> execute)
    {
        var storeKey = $"{userId}:{operation}:{key}";
        if (state.Idempotency.TryGetValue(storeKey, out var prior))
        {
            if (!CryptographicOperations.FixedTimeEquals(
                    Encoding.UTF8.GetBytes(prior.Fingerprint),
                    Encoding.UTF8.GetBytes(fingerprint)))
            {
                return ServiceResult<T>.Fail(409, "idempotency_conflict", "Idempotency key was reused.",
                    "Use a new idempotency key when the request payload changes.");
            }

            return prior.Response switch
            {
                T value => ServiceResult<T>.Success(value, true),
                ServiceResult<T> priorResult => priorResult with { Replayed = true },
                _ => ServiceResult<T>.Fail(500, "idempotency_record_invalid", "Stored request result is invalid.",
                    "Retry with a new idempotency key."),
            };
        }

        var outcome = execute();
        var result = outcome switch
        {
            T value => ServiceResult<T>.Success(value),
            ServiceResult<T> failure => failure,
            _ => ServiceResult<T>.Fail(500, "operation_result_invalid", "Operation result is invalid.",
                "The request could not be completed."),
        };
        state.Idempotency[storeKey] = new IdempotencyRecord(fingerprint, result.IsSuccess ? result.Value! : result);
        return result;
    }

    private static ServiceResult<T> Failure<T>(int status, string code, string title, string detail) =>
        ServiceResult<T>.Fail(status, code, title, detail);

    private static string Fingerprint(params object?[] values) =>
        DeterministicEvidenceAnalyzer.Sha256(string.Join('\u001f', values.Select(value => value?.ToString() ?? "<null>")));

    [GeneratedRegex(@"^[0-9][A-Z][0-9][A-Z][0-9][A-Z0-9]?$", RegexOptions.CultureInvariant)]
    private static partial Regex AfscValue();

    private sealed record PathwayDefinition(
        string Id,
        string Code,
        string Title,
        string Family,
        IReadOnlyList<string> AfscPrefixes,
        IReadOnlyList<string> GoalTerms,
        string Why);
}
