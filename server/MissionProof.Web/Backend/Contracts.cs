namespace MissionProof.Web.Backend;

public sealed record ConsentRequest(bool Accepted, string NoticeVersion, string NoticeSha256);
public sealed record GoalRequest(string GoalCode);
public sealed record ProfileFactRequest(string Value);
public sealed record PathwayAssessmentRequest(string PrimaryAfsc, string? GoalCode);
public sealed record CreatePlanItemRequest(string PathwayId);
public sealed record UpdatePlanItemRequest(string State);
public sealed record EvidenceAnalysisRequest(bool Synthetic, string Text);
public sealed record ReviewDecisionRequest(string Decision, string? EditedValue);

public sealed record SessionResponse(
    string ApiVersion,
    SessionCapabilities Capabilities,
    ConsentSummary Consent,
    GoalSummary Goal,
    ProfileSummary Profile,
    NextActionResponse NextAction);
public sealed record SessionCapabilities(
    bool DeterministicEvidenceAnalysis,
    bool ExternalProviders,
    IReadOnlyList<string> EvidenceFormats);
public sealed record ConsentSummary(bool Accepted, string? NoticeVersion);
public sealed record GoalSummary(string? GoalCode, int Version);
public sealed record ProfileSummary(string? PrimaryAfsc, int Version);
public sealed record NextActionResponse(string Code, string Label, string Route);

public sealed record ConsentResponse(
    string ApiVersion,
    bool Accepted,
    string NoticeVersion,
    string NoticeSha256,
    DateTimeOffset RecordedAt);
public sealed record GoalResponse(string ApiVersion, string GoalCode, int Version);
public sealed record ProfileResponse(
    string ApiVersion,
    string ProfileId,
    int Version,
    IReadOnlyList<ProfileFactResponse> Facts);
public sealed record ProfileFactResponse(
    string FactId,
    string FactType,
    string DisplayValue,
    string NormalizedValue,
    string Origin,
    DateTimeOffset ConfirmedAt,
    CandidateSourceResponse? Source);

public sealed record PathwayAssessmentResponse(
    string ApiVersion,
    string RulesetVersion,
    IReadOnlyList<string> SourceVersions,
    IReadOnlyList<PathwayResultResponse> Results,
    IReadOnlyList<string> Warnings,
    bool OfficialVerificationRequired);
public sealed record PathwayResultResponse(
    string PathwayId,
    string Code,
    string Title,
    string Family,
    string Alignment,
    IReadOnlyList<string> Why,
    IReadOnlyList<PathwayGapResponse> Gaps,
    string SourceVersion,
    bool OfficialVerificationRequired);
public sealed record PathwayGapResponse(string Code, string Label);

public sealed record TransitionPlanResponse(
    string ApiVersion,
    string PlanId,
    int Version,
    IReadOnlyList<PlanItemResponse> Items,
    NextActionResponse NextAction);
public sealed record PlanItemResponse(
    string PlanItemId,
    string PathwayId,
    string Title,
    string State,
    string NextAction,
    DateTimeOffset SavedAt,
    DateTimeOffset? CompletedAt);

public sealed record EvidenceAnalysisResponse(
    string ApiVersion,
    string ReviewId,
    int Version,
    string DocumentSha256,
    string AnalyzerName,
    string AnalyzerVersion,
    IReadOnlyList<CandidateResponse> Candidates,
    IReadOnlyList<string> Warnings,
    string State);
public sealed record CandidateResponse(
    string CandidateId,
    string FactType,
    string ProposedValue,
    string NormalizedValue,
    ConfidenceResponse Confidence,
    CandidateSourceResponse Source,
    AnalyzerResponse Analyzer,
    IReadOnlyList<string> Warnings,
    string ReviewState);
public sealed record ConfidenceResponse(decimal Score, string Band, string ReasonCode);
public sealed record CandidateSourceResponse(
    string DocumentSha256,
    int LineStart,
    int LineEnd,
    string LineSha256);
public sealed record AnalyzerResponse(string Name, string Version, string RuleId, string RuleVersion);
public sealed record ReviewDecisionResponse(
    string ApiVersion,
    string ReviewId,
    int Version,
    string CandidateId,
    string Decision,
    string? NormalizedValue);
public sealed record ApplyReviewResponse(
    string ApiVersion,
    string ReviewId,
    int ReviewVersion,
    int ProfileVersion,
    IReadOnlyList<ProfileFactResponse> AppliedFacts,
    string State);

public sealed record ApiFailure(int Status, string Code, string Title, string Detail);
public sealed record ServiceResult<T>(T? Value, ApiFailure? Failure, bool Replayed = false)
{
    public bool IsSuccess => Failure is null;

    public static ServiceResult<T> Success(T value, bool replayed = false) => new(value, null, replayed);
    public static ServiceResult<T> Fail(int status, string code, string title, string detail) =>
        new(default, new ApiFailure(status, code, title, detail));
}
