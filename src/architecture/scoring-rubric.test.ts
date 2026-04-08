import { describe, expect, it } from "vitest";

import { scoreVerdicts } from "@/architecture/scoring-rubric";

describe("scoreVerdicts", () => {
  it("produces a bounded score", () => {
    const score = scoreVerdicts([
      {
        claimId: "1",
        claim: "A",
        verdict: "supported",
        scoreImpact: 9,
        rationale: "A",
        topics: ["intensity"],
        supportingEvidence: [],
      },
      {
        claimId: "2",
        claim: "B",
        verdict: "contradicted",
        scoreImpact: 2,
        rationale: "B",
        topics: ["volume"],
        supportingEvidence: [],
      },
    ]);

    expect(score).toBeGreaterThanOrEqual(1);
    expect(score).toBeLessThanOrEqual(10);
  });
});
