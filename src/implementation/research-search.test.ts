import { describe, expect, it } from "vitest";

import { dedupeArticles } from "@/implementation/research-search";

describe("dedupeArticles", () => {
  it("removes duplicate titles across sources", () => {
    const deduped = dedupeArticles([
      {
        id: "1",
        title: "Weekly volume and hypertrophy",
        source: "openalex",
        url: "https://example.com/1",
        evidenceLevel: "meta-analysis",
        relevanceScore: 1,
      },
      {
        id: "2",
        title: "Weekly volume and hypertrophy",
        source: "pubmed",
        url: "https://example.com/2",
        evidenceLevel: "review",
        relevanceScore: 0.8,
      },
    ]);

    expect(deduped).toHaveLength(1);
  });
});
