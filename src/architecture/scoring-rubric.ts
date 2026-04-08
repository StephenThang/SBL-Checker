import type { AnalysisSummary, ClaimVerdict, EvidenceTopic } from "@/domain/sbl/types";

export function mapScoreToLabel(score: number): AnalysisSummary["label"] {
  if (score >= 7) {
    return "Evidence-Aligned";
  }

  if (score >= 4) {
    return "Mixed Evidence";
  }

  return "Weakly Supported";
}

export function mapScoreToConfidenceBand(
  score: number,
  unsupportedCount: number,
): AnalysisSummary["confidenceBand"] {
  if (unsupportedCount > 2 || score <= 4) {
    return "Low";
  }

  if (score >= 8) {
    return "High";
  }

  return "Moderate";
}

export function scoreVerdicts(verdicts: ClaimVerdict[]): number {
  if (verdicts.length === 0) {
    return 4;
  }

  const total = verdicts.reduce((sum, verdict) => sum + verdict.scoreImpact, 0);
  return Math.max(1, Math.min(10, Math.round(total / verdicts.length)));
}

export function prioritizeTopics(topics: EvidenceTopic[]): EvidenceTopic[] {
  const order: EvidenceTopic[] = [
    "volume",
    "intensity",
    "failure",
    "recovery",
    "sleep",
    "carbohydrate",
    "nutrition",
    "protein",
    "fiber-type",
  ];

  return [...topics].sort((left, right) => order.indexOf(left) - order.indexOf(right));
}
