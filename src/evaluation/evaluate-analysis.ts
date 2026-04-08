import type { EvaluationReport, FullAnalysis } from "@/domain/sbl/types";

export function evaluateAnalysis(fullAnalysis: FullAnalysis): EvaluationReport {
  const unsupportedCount = fullAnalysis.verdicts.filter(
    (verdict) => verdict.verdict === "contradicted" || verdict.verdict === "unverifiable",
  ).length;

  return {
    maintainability: [
      "The scoring rubric is isolated from the UI and route handlers, so future evidence rules can be updated without rebuilding the page layer.",
      "Structured logs and JSON payloads make failed analyses easier to inspect or replay.",
    ],
    scalabilityRisks: [
      "The curated evidence library is local to the app, so larger deployments should move evidence retrieval into a versioned search service.",
      unsupportedCount > 2
        ? "Several claims lacked direct support, which highlights the need for broader evidence coverage before creator-level scoring."
        : "Current verdict coverage is acceptable for a curated MVP but still too small for broad creator reputation scoring.",
    ],
    securityConcerns: [
      "User-submitted transcripts should remain escaped and stored as plain text only; richer ingestion would need sanitization and moderation layers.",
      "External URL fetching is intentionally excluded in v1 to avoid unreliable scraping and unbounded third-party content risk.",
    ],
    refactoringOpportunities: [
      "Move the orchestrator to queue-backed workers when transcript ingestion and creator-profile scoring are added.",
      "Replace heuristic topic detection with a human-reviewed claim ontology once the evidence library expands.",
    ],
    nextIterationRoadmap: [
      "Add creator-profile scoring by aggregating repeated source analyses into a creator reputation model.",
      "Introduce transcript ingestion adapters for supported platforms, while keeping manual-claim fallback for unavailable sources.",
      "Expand the evidence library with versioned study updates, source quality ranking, and topic-level search.",
    ],
  };
}
