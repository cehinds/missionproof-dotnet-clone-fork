namespace MissionProof.Web.Backend;

public interface IMissionProofStore
{
    T Read<T>(Func<MissionProofState, T> action);
    T Write<T>(Func<MissionProofState, T> action);
}

public sealed class InMemoryMissionProofStore : IMissionProofStore
{
    private readonly object _gate = new();
    private readonly MissionProofState _state = new();

    public T Read<T>(Func<MissionProofState, T> action)
    {
        lock (_gate)
        {
            return action(_state);
        }
    }

    public T Write<T>(Func<MissionProofState, T> action)
    {
        lock (_gate)
        {
            return action(_state);
        }
    }
}

public sealed class MissionProofState
{
    public Dictionary<string, UserRecord> Users { get; } = new(StringComparer.Ordinal);
    public Dictionary<string, ReviewRecord> Reviews { get; } = new(StringComparer.Ordinal);
    public Dictionary<string, IdempotencyRecord> Idempotency { get; } = new(StringComparer.Ordinal);

    public UserRecord GetOrCreateUser(string userId)
    {
        if (!Users.TryGetValue(userId, out var user))
        {
            user = new UserRecord(userId);
            Users.Add(userId, user);
        }

        return user;
    }
}

public sealed class UserRecord(string userId)
{
    public string UserId { get; } = userId;
    public ConsentResponse? Consent { get; set; }
    public string? GoalCode { get; set; }
    public int GoalVersion { get; set; }
    public int ProfileVersion { get; set; }
    public ProfileFactRecord? PrimaryAfsc { get; set; }
    public int PlanVersion { get; set; }
    public List<PlanItemRecord> PlanItems { get; } = [];
}

public sealed record ProfileFactRecord(
    string FactId,
    string FactType,
    string DisplayValue,
    string NormalizedValue,
    string Origin,
    DateTimeOffset ConfirmedAt,
    CandidateSourceResponse? Source);

public sealed class PlanItemRecord
{
    public required string PlanItemId { get; init; }
    public required string PathwayId { get; init; }
    public required string Title { get; init; }
    public required string NextAction { get; init; }
    public required DateTimeOffset SavedAt { get; init; }
    public string State { get; set; } = "NotStarted";
    public DateTimeOffset? CompletedAt { get; set; }
}

public sealed class ReviewRecord
{
    public required string ReviewId { get; init; }
    public required string OwnerUserId { get; init; }
    public required string DocumentSha256 { get; init; }
    public int Version { get; set; } = 1;
    public string State { get; set; } = "AwaitingReview";
    public List<CandidateRecord> Candidates { get; } = [];
}

public sealed class CandidateRecord
{
    public required string CandidateId { get; init; }
    public required string FactType { get; init; }
    public required string ProposedValue { get; init; }
    public required string NormalizedValue { get; init; }
    public required ConfidenceResponse Confidence { get; init; }
    public required CandidateSourceResponse Source { get; init; }
    public required AnalyzerResponse Analyzer { get; init; }
    public required IReadOnlyList<string> Warnings { get; init; }
    public string ReviewState { get; set; } = "Pending";
    public string? DecidedValue { get; set; }
    public bool Applied { get; set; }
}

public sealed record IdempotencyRecord(string Fingerprint, object Response);
public sealed record CurrentUser(string UserId);

public interface ICurrentUserAccessor
{
    CurrentUser? GetCurrentUser();
}

public sealed class DevelopmentCurrentUserAccessor : ICurrentUserAccessor
{
    private static readonly CurrentUser LocalUser = new("usr_local_development");
    public CurrentUser GetCurrentUser() => LocalUser;
}

public sealed class UnavailableCurrentUserAccessor : ICurrentUserAccessor
{
    public CurrentUser? GetCurrentUser() => null;
}
