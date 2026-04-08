import { describe, expect, it } from "vitest";

import { evidenceClaims, evidenceSources } from "@/domain/sbl/evidence-library";
import { matchClaimsToEvidence } from "@/implementation/evidence-matcher";

const libraryClaims = evidenceClaims.map((claim) => {
  const source = evidenceSources.find((item) => item.id === claim.sourceId)!;
  return {
    ...claim,
    title: source.title,
    citation: source.citation,
    url: source.url,
  };
});

describe("matchClaimsToEvidence", () => {
  it("flags overly strong low-volume claims", () => {
    const verdicts = matchClaimsToEvidence(
      [
        {
          id: "1",
          text: "Low volume is always optimal for natural lifters.",
          topics: ["volume"],
          confidence: 0.8,
          source: "manual",
        },
      ],
      libraryClaims,
    );

    expect(verdicts[0].verdict).toBe("contradicted");
  });

  it("supports effort-oriented intensity claims", () => {
    const verdicts = matchClaimsToEvidence(
      [
        {
          id: "2",
          text: "High intensity and hard sets matter for hypertrophy.",
          topics: ["intensity"],
          confidence: 0.8,
          source: "manual",
        },
      ],
      libraryClaims,
    );

    expect(verdicts[0].verdict).toBe("supported");
  });
});
