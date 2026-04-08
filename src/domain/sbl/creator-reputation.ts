export type CreatorReputationLabel =
  | "Evidence-Led Educator"
  | "Mixed Evidence Profile"
  | "Needs Review";

export interface CreatorSignal {
  handle: string;
  platform: "instagram" | "youtube" | "tiktok" | "unknown";
  analyzedPosts: number;
  consistencyScore: number;
  claimAlignmentScore: number;
  citationBehaviorScore: number;
}

export interface CreatorReputationSnapshot {
  overallScore: number;
  label: CreatorReputationLabel;
  confidence: "Low" | "Moderate" | "High";
  rationale: string[];
}

// This module is intentionally lightweight in v1. The current MVP analyzes
// single sources only, but these types keep creator-level scoring separate
// from source scoring so future profile evaluation can reuse the evidence
// engine without complicating the shipping UI.
export function deriveCreatorSnapshot(
  signal: CreatorSignal,
): CreatorReputationSnapshot {
  const weightedScore = Math.round(
    signal.consistencyScore * 0.4 +
      signal.claimAlignmentScore * 0.45 +
      signal.citationBehaviorScore * 0.15,
  );

  if (weightedScore >= 8) {
    return {
      overallScore: weightedScore,
      label: "Evidence-Led Educator",
      confidence: signal.analyzedPosts >= 10 ? "High" : "Moderate",
      rationale: [
        "Content is consistently aligned with the evidence engine's source-level scoring.",
        "Citation behavior and claim consistency are strong enough to justify a more trusted creator profile label.",
      ],
    };
  }

  if (weightedScore >= 5) {
    return {
      overallScore: weightedScore,
      label: "Mixed Evidence Profile",
      confidence: "Moderate",
      rationale: [
        "Some posts appear evidence-aware, but overall signal quality is inconsistent.",
        "Profile-level scoring should stay reviewable by humans before being shown as a strong trust badge.",
      ],
    };
  }

  return {
    overallScore: weightedScore,
    label: "Needs Review",
    confidence: "Low",
    rationale: [
      "The content sample shows weak alignment or limited citation behavior.",
      "Profile scoring should remain gated until enough posts are analyzed with stronger evidence coverage.",
    ],
  };
}
