"use client";

import { useActionState } from "react";

interface FeedbackFormProps {
  analysisId: string;
}

export function FeedbackForm({ analysisId }: FeedbackFormProps) {
  const [state, submit, pending] = useActionState<
    { message: string; error: string | null },
    FormData
  >(
    async (_previousState, formData) => {
      const response = await fetch("/api/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          analysisId,
          rating: Number(formData.get("rating")),
          helpfulness: formData.get("helpfulness"),
          notes: formData.get("notes"),
        }),
      });

      if (!response.ok) {
        return {
          message: "",
          error: "Unable to store feedback right now.",
        };
      }

      return {
        message: "Feedback saved for the next iteration of the recommendation engine.",
        error: null,
      };
    },
    { message: "", error: null },
  );

  return (
    <form action={submit} className="space-y-4 rounded-[1.6rem] border border-[var(--line)] bg-white/75 p-5">
      <div className="space-y-1">
        <p className="font-mono text-xs uppercase tracking-[0.22em] text-[var(--blue-strong)]">
          Evaluation loop
        </p>
        <h3 className="text-xl font-semibold text-[var(--blue-deep)]">
          Rate this analysis
        </h3>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <label className="space-y-2 text-sm text-slate-700">
          <span>Accuracy rating</span>
          <select
            name="rating"
            className="w-full rounded-xl border border-[var(--line)] bg-white px-3 py-2"
            defaultValue="4"
          >
            {Array.from({ length: 5 }, (_, index) => index + 1).map((value) => (
              <option key={value} value={value}>
                {value}
              </option>
            ))}
          </select>
        </label>

        <label className="space-y-2 text-sm text-slate-700">
          <span>Helpfulness</span>
          <select
            name="helpfulness"
            className="w-full rounded-xl border border-[var(--line)] bg-white px-3 py-2"
            defaultValue="useful"
          >
            <option value="useful">Useful</option>
            <option value="needs-more-evidence">Needs more evidence</option>
            <option value="too-harsh">Too harsh</option>
          </select>
        </label>
      </div>

      <label className="block space-y-2 text-sm text-slate-700">
        <span>Notes</span>
        <textarea
          name="notes"
          rows={3}
          className="w-full rounded-xl border border-[var(--line)] bg-white px-3 py-2"
          placeholder="What would improve the next recommendation pass?"
        />
      </label>

      <button
        type="submit"
        disabled={pending}
        className="rounded-full bg-[var(--blue-strong)] px-4 py-2 text-sm font-semibold text-white disabled:opacity-60"
      >
        {pending ? "Saving..." : "Save feedback"}
      </button>

      {state.error ? <p className="text-sm text-rose-700">{state.error}</p> : null}
      {state.message ? <p className="text-sm text-emerald-700">{state.message}</p> : null}
    </form>
  );
}
