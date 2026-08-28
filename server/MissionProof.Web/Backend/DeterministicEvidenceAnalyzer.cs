using System.Security.Cryptography;
using System.Text;
using System.Text.RegularExpressions;

namespace MissionProof.Web.Backend;

public sealed partial class DeterministicEvidenceAnalyzer
{
    public const int MaximumTextCharacters = 12_000;
    public const string AnalyzerName = "missionproof-deterministic-evidence";
    public const string AnalyzerVersion = "1.0.0";

    public ServiceResult<AnalyzedEvidence> Analyze(string text)
    {
        if (string.IsNullOrWhiteSpace(text))
        {
            return ServiceResult<AnalyzedEvidence>.Fail(
                StatusCodes.Status400BadRequest,
                "synthetic_text_required",
                "Synthetic evidence text is required.",
                "Provide a non-empty synthetic plain-text fixture.");
        }

        if (text.Length > MaximumTextCharacters)
        {
            return ServiceResult<AnalyzedEvidence>.Fail(
                StatusCodes.Status413PayloadTooLarge,
                "synthetic_text_too_large",
                "Synthetic evidence text is too large.",
                $"The local analyzer accepts at most {MaximumTextCharacters} characters.");
        }

        if (text.IndexOf('\0') >= 0)
        {
            return ServiceResult<AnalyzedEvidence>.Fail(
                StatusCodes.Status400BadRequest,
                "synthetic_text_invalid",
                "Synthetic evidence text is invalid.",
                "Null characters are not allowed.");
        }

        var normalizedText = text.Replace("\r\n", "\n", StringComparison.Ordinal).Replace('\r', '\n');
        var documentHash = Sha256(normalizedText);
        var lines = normalizedText.Split('\n');
        var candidates = new List<CandidateRecord>();
        var warnings = new List<string>();

        for (var index = 0; index < lines.Length; index++)
        {
            var line = lines[index];
            var match = PrimaryAfscLine().Match(line);
            if (!match.Success)
            {
                continue;
            }

            var afsc = MissionProofService.NormalizeAfsc(match.Groups[1].Value);
            if (!MissionProofService.IsValidAfsc(afsc))
            {
                warnings.Add("InvalidPrimaryAfscValue");
                continue;
            }

            candidates.Add(new CandidateRecord
            {
                CandidateId = NewOpaqueId("cand"),
                FactType = "Service.PrimaryAfsc",
                ProposedValue = match.Groups[1].Value.Trim(),
                NormalizedValue = afsc,
                Confidence = new ConfidenceResponse(0.98m, "High", "ExactLabeledField"),
                Source = new CandidateSourceResponse(documentHash, index + 1, index + 1, Sha256(line)),
                Analyzer = new AnalyzerResponse(AnalyzerName, AnalyzerVersion, "afsc-labeled-v1", "1.0.0"),
                Warnings = [],
            });
        }

        if (candidates.Count == 0)
        {
            warnings.Add("NoSupportedFactsFound");
        }
        else if (candidates.Count > 1)
        {
            warnings.Add("MultiplePrimaryAfscCandidates");
        }

        return ServiceResult<AnalyzedEvidence>.Success(new AnalyzedEvidence(documentHash, candidates, warnings));
    }

    public static string Sha256(string value)
    {
        var bytes = SHA256.HashData(Encoding.UTF8.GetBytes(value));
        return $"sha256:{Convert.ToHexStringLower(bytes)}";
    }

    public static string NewOpaqueId(string prefix) => $"{prefix}_{Guid.NewGuid():N}";

    [GeneratedRegex(@"^\s*Primary\s+AFSC\s*:\s*([0-9][A-Za-z][0-9][A-Za-z][0-9][A-Za-z0-9]?)\s*$", RegexOptions.IgnoreCase | RegexOptions.CultureInvariant)]
    private static partial Regex PrimaryAfscLine();
}

public sealed record AnalyzedEvidence(
    string DocumentSha256,
    IReadOnlyList<CandidateRecord> Candidates,
    IReadOnlyList<string> Warnings);
