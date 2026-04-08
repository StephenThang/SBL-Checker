import type { ClaimVerdict, TestingReport } from "@/domain/sbl/types";

export function runValidationChecks(
  verdicts: ClaimVerdict[],
  warnings: string[],
): TestingReport {
  const checks = [
    {
      name: "verdict-count",
      passed: verdicts.length > 0,
      detail: verdicts.length > 0 ? "At least one claim was evaluated." : "No claims were available to score.",
    },
    {
      name: "evidence-linked",
      passed: verdicts.some((verdict) => verdict.supportingEvidence.length > 0),
      detail: verdicts.some((verdict) => verdict.supportingEvidence.length > 0)
        ? "At least one claim is tied to source evidence."
        : "No curated evidence was linked to the final report.",
    },
    {
      name: "warnings-bounded",
      passed: warnings.length <= 5,
      detail:
        warnings.length <= 5
          ? "Warning volume stayed within the expected range."
          : "The pipeline surfaced too many warnings for a clean MVP flow.",
    },
  ];

  return {
    passed: checks.every((check) => check.passed),
    checks,
  };
}
