import Link from "next/link";

import { getRecentAnalyses } from "@/implementation/report-store";
import { AnalyzeForm } from "@/ui/home/analyze-form";
import { LabelPill } from "@/ui/shared/label-pill";

const examples = [
  "Claims that one all-out set beats every higher-volume program for natural lifters",
  "Advice that sleep debt does not affect hypertrophy outcomes",
  "Nutrition claims that carbohydrate timing alone drives muscle growth",
];

export default async function Home() {
  const recentAnalyses = await getRecentAnalyses();

  return (
    <main className="flex-1">
      <section className="relative overflow-hidden border-b border-[var(--line)]">
        <div className="absolute inset-0 grid-lines opacity-45" />
        <div className="shell relative grid min-h-[100svh] items-center gap-16 py-10 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="space-y-8 pb-10 pt-10 lg:pb-18 lg:pt-16">
            <div className="eyebrow fade-up">Science-informed hypertrophy review</div>
            <div className="space-y-6 fade-up-delay">
              <p className="font-mono text-sm uppercase tracking-[0.32em] text-[var(--blue-strong)]">
                SBL Checker
              </p>
              <h1 className="max-w-3xl text-5xl font-semibold leading-[0.95] tracking-[-0.05em] text-[var(--blue-deep)] sm:text-6xl lg:text-7xl">
                Audit lifting claims against curated research, not algorithmic confidence.
              </h1>
              <p className="max-w-2xl text-lg leading-8 text-slate-600 sm:text-xl">
                Submit a video or source URL, add a transcript if needed, and
                get a structured evidence-alignment score, citations, and an
                explanation of what the creator got right, overstated, or left
                uncertain.
              </p>
            </div>

            <div className="grid gap-4 text-sm text-slate-600 sm:grid-cols-3 fade-up-delay-2">
              <div className="glass rounded-[2rem] p-4">
                <p className="font-mono text-xs uppercase tracking-[0.22em] text-[var(--blue-strong)]">
                  Intake
                </p>
                <p className="mt-2 leading-6">
                  URL plus optional transcript or copied claims when the source
                  cannot be parsed automatically.
                </p>
              </div>
              <div className="glass rounded-[2rem] p-4">
                <p className="font-mono text-xs uppercase tracking-[0.22em] text-[var(--blue-strong)]">
                  Reasoning
                </p>
                <p className="mt-2 leading-6">
                  Multi-step analysis across volume, intensity, recovery,
                  nutrition, and evidence quality.
                </p>
              </div>
              <div className="glass rounded-[2rem] p-4">
                <p className="font-mono text-xs uppercase tracking-[0.22em] text-[var(--blue-strong)]">
                  Output
                </p>
                <p className="mt-2 leading-6">
                  Score, confidence notes, citation-backed verdicts, and a JSON
                  export for review or iteration.
                </p>
              </div>
            </div>

            <div className="flex flex-wrap gap-3">
              <Link
                href="/assistant"
                className="inline-flex rounded-full bg-[var(--blue-strong)] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[var(--blue-deep)]"
              >
                Open AI assistant
              </Link>
              <Link
                href="#analysis"
                className="inline-flex rounded-full border border-[var(--line)] bg-white/80 px-5 py-3 text-sm font-semibold text-slate-700 transition hover:border-[var(--blue-strong)]"
              >
                Run source analysis
              </Link>
            </div>
          </div>

          <AnalyzeForm />
        </div>
      </section>

      <section id="analysis" className="shell grid gap-10 py-20 lg:grid-cols-[0.9fr_1.1fr]">
        <div className="space-y-5">
          <div className="eyebrow">How it scores</div>
          <h2 className="section-title max-w-xl text-[var(--blue-deep)]">
            A structured evidence review instead of a black-box verdict.
          </h2>
          <p className="max-w-xl text-base leading-7 text-slate-600">
            The MVP uses a curated evidence library seeded from your provided
            references and maps detected claims to relevant research domains.
            Unclear or unsupported input gets downgraded with explicit
            uncertainty notes rather than being forced into a binary answer.
          </p>
          <div className="space-y-3 text-sm text-slate-600">
            {examples.map((example) => (
              <div
                key={example}
                className="glass rounded-[1.6rem] px-5 py-4 leading-6"
              >
                {example}
              </div>
            ))}
          </div>
        </div>

        <div className="glass rounded-[2rem] p-6 sm:p-8">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="font-mono text-xs uppercase tracking-[0.24em] text-[var(--blue-strong)]">
                Recent analyses
              </p>
              <h3 className="mt-2 text-2xl font-semibold text-[var(--blue-deep)]">
                Saved review snapshots
              </h3>
            </div>
            <p className="max-w-xs text-right text-sm leading-6 text-slate-500">
              Results persist in SQLite so the app can revisit previous scoring
              runs and feedback.
            </p>
          </div>

          <div className="mt-6 space-y-4">
            {recentAnalyses.length > 0 ? (
              recentAnalyses.map((analysis) => (
                <Link
                  key={analysis.jobId}
                  href={`/analysis/${analysis.jobId}`}
                  className="block rounded-[1.4rem] border border-[var(--line)] bg-white/80 px-5 py-4 transition-transform duration-200 hover:-translate-y-0.5"
                >
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div className="space-y-1">
                      <p className="font-medium text-slate-800">{analysis.url}</p>
                      <p className="text-sm text-slate-500">
                        Updated {analysis.createdAt}
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <p className="font-mono text-xs uppercase tracking-[0.22em] text-slate-500">
                          Score
                        </p>
                        <p className="text-2xl font-semibold text-[var(--blue-deep)]">
                          {analysis.score}
                        </p>
                      </div>
                      <LabelPill label={analysis.label} />
                    </div>
                  </div>
                </Link>
              ))
            ) : (
              <div className="rounded-[1.6rem] border border-dashed border-[var(--line)] px-5 py-10 text-sm leading-7 text-slate-500">
                Your first analysis will appear here after a submission. The
                app stores the full structured report, telemetry log, and
                feedback payload for each job.
              </div>
            )}
          </div>
        </div>
      </section>

      <section className="shell pb-20">
        <div className="glass grid gap-6 rounded-[2rem] p-6 sm:p-8 lg:grid-cols-[0.9fr_1.1fr]">
          <div className="space-y-4">
            <div className="eyebrow">Planned next step</div>
            <h2 className="section-title text-[var(--blue-deep)]">
              Creator reputation scoring is already modeled as the next layer.
            </h2>
            <p className="max-w-xl text-base leading-7 text-slate-600">
              V1 stays disciplined around single-source analysis, but the
              architecture already reserves a separate creator reputation module
              so future Instagram or channel scoring can aggregate repeated
              source analyses instead of inventing a brand-new pipeline.
            </p>
          </div>
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="rounded-[1.5rem] border border-[var(--line)] bg-white/80 p-5">
              <p className="font-mono text-xs uppercase tracking-[0.22em] text-[var(--blue-strong)]">
                V1
              </p>
              <p className="mt-3 text-sm leading-6 text-slate-700">
                Single URL review with transcript fallback, evidence matching,
                scoring, export, and feedback.
              </p>
            </div>
            <div className="rounded-[1.5rem] border border-[var(--line)] bg-white/80 p-5">
              <p className="font-mono text-xs uppercase tracking-[0.22em] text-[var(--blue-strong)]">
                V1.1
              </p>
              <p className="mt-3 text-sm leading-6 text-slate-700">
                Profile-level creator scoring using repeated source analyses,
                consistency signals, and citation behavior.
              </p>
            </div>
            <div className="rounded-[1.5rem] border border-[var(--line)] bg-white/80 p-5">
              <p className="font-mono text-xs uppercase tracking-[0.22em] text-[var(--blue-strong)]">
                V2
              </p>
              <p className="mt-3 text-sm leading-6 text-slate-700">
                Larger evidence ingestion pipeline, search tooling, reviewer
                workflows, and creator dashboards for global scale.
              </p>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
