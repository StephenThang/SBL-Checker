import Link from "next/link";

import type { FullAnalysis } from "@/domain/sbl/types";
import { FeedbackForm } from "@/ui/results/feedback-form";
import { LabelPill } from "@/ui/shared/label-pill";

export function AnalysisView({
  jobId,
  analysis,
}: {
  jobId: string;
  analysis: FullAnalysis;
}) {
  return (
    <main className="shell flex-1 py-10 sm:py-14">
      <div className="grid gap-8 lg:grid-cols-[0.9fr_1.1fr]">
        <section className="glass rounded-[2rem] p-6 sm:p-8">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="space-y-2">
              <p className="font-mono text-xs uppercase tracking-[0.24em] text-[var(--blue-strong)]">
                Analysis summary
              </p>
              <h1 className="text-4xl font-semibold tracking-[-0.05em] text-[var(--blue-deep)]">
                {analysis.summary.label}
              </h1>
              <p className="max-w-xl text-base leading-7 text-slate-600">
                {analysis.summary.overview}
              </p>
            </div>
            <div className="rounded-[1.6rem] bg-[var(--blue-deep)] px-6 py-5 text-white">
              <p className="font-mono text-xs uppercase tracking-[0.24em] text-blue-100">
                Overall score
              </p>
              <p className="mt-2 text-5xl font-semibold">{analysis.summary.overallScore}</p>
              <p className="mt-2 text-sm text-blue-100">
                Confidence: {analysis.summary.confidenceBand}
              </p>
            </div>
          </div>

          <div className="mt-8 grid gap-4 sm:grid-cols-3">
            <div className="rounded-[1.5rem] border border-[var(--line)] bg-white/80 p-4">
              <p className="font-mono text-xs uppercase tracking-[0.22em] text-slate-500">
                Verdict label
              </p>
              <div className="mt-3">
                <LabelPill label={analysis.summary.label} />
              </div>
            </div>
            <div className="rounded-[1.5rem] border border-[var(--line)] bg-white/80 p-4">
              <p className="font-mono text-xs uppercase tracking-[0.22em] text-slate-500">
                Timeline
              </p>
              <p className="mt-3 text-sm leading-6 text-slate-700">
                {analysis.summary.estimatedTimeline}
              </p>
            </div>
            <div className="rounded-[1.5rem] border border-[var(--line)] bg-white/80 p-4">
              <p className="font-mono text-xs uppercase tracking-[0.22em] text-slate-500">
                Export
              </p>
              <Link
                href={`/api/analyze/${jobId}`}
                className="mt-3 inline-flex text-sm font-semibold text-[var(--blue-strong)]"
              >
                Download JSON
              </Link>
            </div>
          </div>

          <div className="mt-8 grid gap-5 lg:grid-cols-3">
            <div className="rounded-[1.6rem] border border-[var(--line)] bg-white/70 p-5">
              <h2 className="text-lg font-semibold text-[var(--blue-deep)]">What aligned</h2>
              <ul className="mt-3 space-y-3 text-sm leading-6 text-slate-700">
                {analysis.summary.whatWasRight.length > 0 ? (
                  analysis.summary.whatWasRight.map((item) => <li key={item}>{item}</li>)
                ) : (
                  <li>No strongly aligned claims were detected.</li>
                )}
              </ul>
            </div>
            <div className="rounded-[1.6rem] border border-[var(--line)] bg-white/70 p-5">
              <h2 className="text-lg font-semibold text-[var(--blue-deep)]">What was overstated</h2>
              <ul className="mt-3 space-y-3 text-sm leading-6 text-slate-700">
                {analysis.summary.whatWasOverstated.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>
            <div className="rounded-[1.6rem] border border-[var(--line)] bg-white/70 p-5">
              <h2 className="text-lg font-semibold text-[var(--blue-deep)]">Missing context</h2>
              <ul className="mt-3 space-y-3 text-sm leading-6 text-slate-700">
                {analysis.summary.whatWasMissing.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        <section className="space-y-6">
          <div className="glass rounded-[2rem] p-6 sm:p-8">
            <p className="font-mono text-xs uppercase tracking-[0.22em] text-[var(--blue-strong)]">
              Claim verdicts
            </p>
            <h2 className="mt-2 text-2xl font-semibold text-[var(--blue-deep)]">
              Evidence table
            </h2>

            <div className="mt-6 space-y-4">
              {analysis.verdicts.map((verdict) => (
                <article
                  key={verdict.claimId}
                  className="rounded-[1.4rem] border border-[var(--line)] bg-white/80 p-5"
                >
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <p className="max-w-2xl text-base font-medium leading-7 text-slate-800">
                      {verdict.claim}
                    </p>
                    <LabelPill
                      label={
                        verdict.verdict === "supported"
                          ? "Evidence-Aligned"
                          : verdict.verdict === "mixed"
                            ? "Mixed Evidence"
                            : "Weakly Supported"
                      }
                    />
                  </div>
                  <p className="mt-3 text-sm leading-6 text-slate-600">{verdict.rationale}</p>
                  <div className="mt-4 space-y-2">
                    {verdict.supportingEvidence.map((item) => (
                      <div
                        key={item.evidenceId}
                        className="rounded-xl border border-[var(--line)] bg-[var(--sky)] px-4 py-3"
                      >
                        <div className="flex flex-wrap items-center justify-between gap-3">
                          <div>
                            <p className="font-medium text-slate-800">{item.title}</p>
                            <p className="text-sm text-slate-500">{item.citation}</p>
                          </div>
                          <Link
                            href={item.url}
                            target="_blank"
                            rel="noreferrer"
                            className="text-sm font-semibold text-[var(--blue-strong)]"
                          >
                            Source
                          </Link>
                        </div>
                      </div>
                    ))}
                  </div>
                </article>
              ))}
            </div>
          </div>

          <div className="grid gap-6 lg:grid-cols-[1fr_1fr]">
            <div className="glass rounded-[2rem] p-6">
              <p className="font-mono text-xs uppercase tracking-[0.22em] text-[var(--blue-strong)]">
                Reliability
              </p>
              <h2 className="mt-2 text-xl font-semibold text-[var(--blue-deep)]">
                Validation checks
              </h2>
              <ul className="mt-4 space-y-3 text-sm leading-6 text-slate-700">
                {analysis.testing.checks.map((check) => (
                  <li key={check.name}>
                    <span className="font-semibold">{check.passed ? "Pass:" : "Watch:"}</span>{" "}
                    {check.detail}
                  </li>
                ))}
              </ul>
            </div>
            <div className="glass rounded-[2rem] p-6">
              <p className="font-mono text-xs uppercase tracking-[0.22em] text-[var(--blue-strong)]">
                Telemetry
              </p>
              <h2 className="mt-2 text-xl font-semibold text-[var(--blue-deep)]">
                Build summary
              </h2>
              <ul className="mt-4 space-y-3 text-sm leading-6 text-slate-700">
                <li>Total duration: {analysis.telemetry.totalDurationMs} ms</li>
                <li>Retries: {analysis.telemetry.retries}</li>
                <li>Terminal status: {analysis.telemetry.status}</li>
                {analysis.telemetry.logs.slice(-3).map((log) => (
                  <li key={`${log.timestamp}-${log.stage}`}>
                    {log.stage}: {log.message}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="grid gap-6 lg:grid-cols-[1fr_1fr]">
            <div className="glass rounded-[2rem] p-6">
              <p className="font-mono text-xs uppercase tracking-[0.22em] text-[var(--blue-strong)]">
                Risk assessment
              </p>
              <ul className="mt-4 space-y-3 text-sm leading-6 text-slate-700">
                {analysis.evaluation.scalabilityRisks.map((risk) => (
                  <li key={risk}>{risk}</li>
                ))}
                {analysis.evaluation.securityConcerns.map((concern) => (
                  <li key={concern}>{concern}</li>
                ))}
              </ul>
            </div>
            <div className="glass rounded-[2rem] p-6">
              <p className="font-mono text-xs uppercase tracking-[0.22em] text-[var(--blue-strong)]">
                Technical debt
              </p>
              <ul className="mt-4 space-y-3 text-sm leading-6 text-slate-700">
                {analysis.evaluation.refactoringOpportunities.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>
          </div>

          <div className="glass rounded-[2rem] p-6">
            <p className="font-mono text-xs uppercase tracking-[0.22em] text-[var(--blue-strong)]">
              Next iteration roadmap
            </p>
            <h2 className="mt-2 text-xl font-semibold text-[var(--blue-deep)]">
              Recommended product follow-ups
            </h2>
            <ul className="mt-4 space-y-3 text-sm leading-6 text-slate-700">
              {analysis.evaluation.nextIterationRoadmap.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>

          <FeedbackForm analysisId={jobId} />

          <p className="rounded-[1.5rem] border border-[var(--line)] bg-white/80 px-5 py-4 text-sm leading-6 text-slate-600">
            {analysis.disclaimer}
          </p>
        </section>
      </div>
    </main>
  );
}
