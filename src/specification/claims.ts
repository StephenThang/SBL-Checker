import type { EvidenceTopic, ExtractedClaim, NormalizedInput } from "@/domain/sbl/types";

const topicKeywords: Array<{ topic: EvidenceTopic; terms: string[] }> = [
  { topic: "volume", terms: ["volume", "sets", "set count", "low volume", "high volume"] },
  { topic: "intensity", terms: ["intensity", "heavy", "effort", "hard set"] },
  { topic: "failure", terms: ["failure", "to failure", "all out", "rir"] },
  { topic: "carbohydrate", terms: ["carb", "carbohydrate", "glycogen"] },
  { topic: "nutrition", terms: ["diet", "calories", "nutrition", "meal timing"] },
  { topic: "protein", terms: ["protein", "whey", "supplement"] },
  { topic: "sleep", terms: ["sleep", "recovery", "rest"] },
  { topic: "recovery", terms: ["recovery", "fatigue"] },
  { topic: "fiber-type", terms: ["fiber", "type ii", "type 1", "muscle fiber"] },
];

function detectTopics(text: string): EvidenceTopic[] {
  const lower = text.toLowerCase();
  const topics = topicKeywords
    .filter(({ terms }) => terms.some((term) => lower.includes(term)))
    .map(({ topic }) => topic);

  return topics.length > 0 ? [...new Set(topics)] : ["volume", "intensity"];
}

function splitIntoCandidateClaims(input: string): string[] {
  return input
    .split(/\n|(?<=[.!?])\s+/)
    .map((claim) => claim.trim())
    .filter((claim) => claim.length > 20)
    .slice(0, 8);
}

export function extractClaims(input: NormalizedInput): {
  claims: ExtractedClaim[];
  warnings: string[];
} {
  const warnings: string[] = [];
  const claimInput = input.transcript ?? input.manualClaims;

  if (!claimInput) {
    warnings.push(
      "Transcript extraction is not available in this MVP. Add a transcript or pasted claims for a higher-confidence review.",
    );

    return {
      warnings,
      claims: [
        {
          id: "fallback-claim",
          text: "No direct transcript was supplied, so the system cannot verify the creator's precise hypertrophy claims from the URL alone.",
          topics: ["volume", "intensity"],
          confidence: 0.2,
          source: "fallback",
        },
      ],
    };
  }

  const rawClaims = splitIntoCandidateClaims(claimInput);
  if (rawClaims.length === 0) {
    warnings.push(
      "The submitted text was too short to isolate strong claims. The report will be treated as low-confidence.",
    );
  }

  const source: ExtractedClaim["source"] = input.transcript ? "transcript" : "manual";
  const claims: ExtractedClaim[] = (rawClaims.length > 0 ? rawClaims : [claimInput]).map(
    (claim, index) => ({
      id: `claim-${index + 1}`,
      text: claim,
      topics: detectTopics(claim),
      confidence: input.transcript ? 0.78 : 0.68,
      source,
    }),
  );

  return { claims, warnings };
}
