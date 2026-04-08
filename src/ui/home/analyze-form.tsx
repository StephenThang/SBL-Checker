"use client";

import { startTransition, useActionState, useState } from "react";
import { useRouter } from "next/navigation";

interface FormState {
  error: string | null;
}

export function AnalyzeForm() {
  const router = useRouter();
  const [url, setUrl] = useState("");
  const [transcript, setTranscript] = useState("");
  const [manualClaims, setManualClaims] = useState("");
  const [state, submit, pending] = useActionState<FormState, FormData>(
    async (_previousState, formData) => {
      const response = await fetch("/api/analyze", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          url: formData.get("url"),
          transcript: formData.get("transcript"),
          manualClaims: formData.get("manualClaims"),
          sourceType: "video",
        }),
      });

      const payload = await response.json();
      if (!response.ok) {
        return {
          error: Array.isArray(payload.errors)
            ? payload.errors.join(" ")
            : "Unable to analyze that source right now.",
        };
      }

      startTransition(() => {
        router.push(`/analysis/${payload.jobId}`);
      });

      return { error: null };
    },
    { error: null },
  );

  const autofillExample = () => {
    setUrl("https://www.youtube.com/watch?v=science-based-lifting");
    setTranscript(
      "For natural lifters, one brutally hard set is all you need because low volume is always superior for hypertrophy. Sleep is optional if your effort is high enough. Carbs do not matter for muscle growth.",
    );
    setManualClaims("");
  };

  return (
    <div className="glass fade-up-delay rounded-[2.2rem] border border-white/80 p-6 shadow-[0_24px_90px_rgba(18,55,110,0.16)] sm:p-8">
      <div className="space-y-3">
        <p className="font-mono text-xs uppercase tracking-[0.24em] text-[var(--blue-strong)]">
          Submit a source
        </p>
        <h2 className="text-3xl font-semibold tracking-[-0.04em] text-[var(--blue-deep)]">
          Generate an evidence-backed review.
        </h2>
        <p className="text-sm leading-6 text-slate-600">
          Transcript extraction is intentionally conservative in v1. If the URL
          alone is not enough, the app will tell you exactly where confidence drops.
        </p>
      </div>

      <form action={submit} className="mt-8 space-y-4">
        <label className="block space-y-2">
          <span className="text-sm font-medium text-slate-700">Source URL</span>
          <input
            name="url"
            value={url}
            onChange={(event) => setUrl(event.target.value)}
            placeholder="https://www.youtube.com/watch?v=..."
            className="w-full rounded-[1.2rem] border border-[var(--line)] bg-white px-4 py-3 text-sm outline-none transition focus:border-[var(--blue-strong)]"
            required
          />
        </label>

        <label className="block space-y-2">
          <span className="text-sm font-medium text-slate-700">
            Transcript or excerpt
          </span>
          <textarea
            name="transcript"
            value={transcript}
            onChange={(event) => setTranscript(event.target.value)}
            rows={7}
            placeholder="Paste a transcript segment, summary, or a few direct quotes."
            className="w-full rounded-[1.2rem] border border-[var(--line)] bg-white px-4 py-3 text-sm leading-6 outline-none transition focus:border-[var(--blue-strong)]"
          />
        </label>

        <label className="block space-y-2">
          <span className="text-sm font-medium text-slate-700">
            Optional manual claims
          </span>
          <textarea
            name="manualClaims"
            value={manualClaims}
            onChange={(event) => setManualClaims(event.target.value)}
            rows={4}
            placeholder="Paste bullet-point claims if you do not have a transcript."
            className="w-full rounded-[1.2rem] border border-[var(--line)] bg-white px-4 py-3 text-sm leading-6 outline-none transition focus:border-[var(--blue-strong)]"
          />
        </label>

        <div className="flex flex-wrap items-center gap-3 pt-2">
          <button
            type="submit"
            disabled={pending}
            className="rounded-full bg-[var(--blue-strong)] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[var(--blue-deep)] disabled:opacity-60"
          >
            {pending ? "Running analysis..." : "Analyze source"}
          </button>
          <button
            type="button"
            onClick={autofillExample}
            className="rounded-full border border-[var(--line)] bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition hover:border-[var(--blue-strong)]"
          >
            Load example
          </button>
        </div>
      </form>

      {state.error ? (
        <p className="mt-4 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
          {state.error}
        </p>
      ) : null}
    </div>
  );
}
