import type { AnalysisSummary, ClaimVerdict } from "@/domain/sbl/types";
import {
  mapScoreToConfidenceBand,
  mapScoreToLabel,
  scoreVerdicts,
} from "@/architecture/scoring-rubric";

export function buildSummary(
  verdicts: ClaimVerdict[],
  warnings: string[],
): AnalysisSummary {
  const score = scoreVerdicts(verdicts);
  const unsupportedCount = verdicts.filter(
    (verdict) => verdict.verdict === "contradicted" || verdict.verdict === "unverifiable",
  ).length;

  const whatWasRight = verdicts
    .filter((verdict) => verdict.verdict === "supported")
    .map((verdict) => verdict.claim)
    .slice(0, 3);

  const whatWasOverstated = verdicts
    .filter((verdict) => verdict.verdict === "contradicted" || verdict.verdict === "mixed")
    .map((verdict) => verdict.claim)
    .slice(0, 3);

  const whatWasMissing =
    warnings.length > 0
      ? warnings
      : ["The source would benefit from clearer transcript evidence or narrower, testable claims."];

  const label = mapScoreToLabel(score);
  const confidenceBand = mapScoreToConfidenceBand(score, unsupportedCount);

  return {
    overallScore: score,
    label,
    confidenceBand,
    overview:
      label === "Evidence-Aligned"
        ? "The analyzed content is broadly aligned with the direction of the curated hypertrophy evidence, though details still require nuance."
        : label === "Mixed Evidence"
          ? "The source includes some evidence-aware ideas but overstates conclusions or leaves important context unresolved."
          : "The source conflicts with the current curated evidence set or relies on claims that cannot be responsibly verified from the supplied material.",
    whatWasRight,
    whatWasOverstated,
    whatWasMissing,
    warnings,
    estimatedTimeline:
      score >= 7
        ? "Use this as a same-day screening tool; deeper study review should still happen before treating any creator as authoritative."
        : "Treat this report as an initial caution signal and revisit the source once a fuller transcript or stronger evidence coverage is available.",
  };
}
