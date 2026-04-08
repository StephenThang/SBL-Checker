"use client";

import { useActionState, useState } from "react";

import type { AssistantResponsePayload } from "@/domain/sbl/types";

type AssistantState = {
  error: string | null;
  result: AssistantResponsePayload | null;
};

export function AssistantForm() {
  const [question, setQuestion] = useState(
    "How should I think about low volume versus moderate volume for hypertrophy if I train three days per week and recover poorly?",
  );
  const [goal, setGoal] = useState("Build muscle while staying natural");
  const [trainingAge, setTrainingAge] = useState("Intermediate, 3 years");
  const [weeklyFrequency, setWeeklyFrequency] = useState("3 lifting days per week");
  const [equipment, setEquipment] = useState("Full gym");
  const [recoveryPriority, setRecoveryPriority] = useState("Sleep and recovery are inconsistent");

  const [state, submit, pending] = useActionState<AssistantState, FormData>(
    async (_previousState, formData) => {
      const response = await fetch("/api/assistant", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          question: formData.get("question"),
          profile: {
            goal: formData.get("goal"),
            trainingAge: formData.get("trainingAge"),
            weeklyFrequency: formData.get("weeklyFrequency"),
            equipment: formData.get("equipment"),
            recoveryPriority: formData.get("recoveryPriority"),
          },
        }),
      });

      const payload = await response.json();
      if (!response.ok) {
        return {
          error: Array.isArray(payload.errors)
            ? payload.errors.join(" ")
            : "Unable to generate the assistant response right now.",
          result: null,
        };
      }

      return {
        error: null,
        result: payload,
      };
    },
    { error: null, result: null },
  );

  return (
    <div className="grid gap-8 lg:grid-cols-[0.92fr_1.08fr]">
      <form action={submit} className="glass rounded-[2rem] p-6 sm:p-8">
        <div className="space-y-3">
          <p className="font-mono text-xs uppercase tracking-[0.24em] text-[var(--blue-strong)]">
            AI assistant
          </p>
          <h1 className="text-4xl font-semibold tracking-[-0.05em] text-[var(--blue-deep)]">
            Ask for personalized, research-backed lifting guidance.
          </h1>
          <p className="text-sm leading-6 text-slate-600">
            The assistant searches recent literature from reputable research APIs
            and then generates a personalized answer using your training profile.
          </p>
        </div>

        <div className="mt-8 space-y-4">
          <label className="block space-y-2">
            <span className="text-sm font-medium text-slate-700">Question</span>
            <textarea
              name="question"
              rows={5}
              value={question}
              onChange={(event) => setQuestion(event.target.value)}
              className="w-full rounded-[1.2rem] border border-[var(--line)] bg-white px-4 py-3 text-sm leading-6 outline-none transition focus:border-[var(--blue-strong)]"
            />
          </label>

          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block space-y-2">
              <span className="text-sm font-medium text-slate-700">Goal</span>
              <input
                name="goal"
                value={goal}
                onChange={(event) => setGoal(event.target.value)}
                className="w-full rounded-[1.2rem] border border-[var(--line)] bg-white px-4 py-3 text-sm outline-none transition focus:border-[var(--blue-strong)]"
              />
            </label>
            <label className="block space-y-2">
              <span className="text-sm font-medium text-slate-700">Training age</span>
              <input
                name="trainingAge"
                value={trainingAge}
                onChange={(event) => setTrainingAge(event.target.value)}
                className="w-full rounded-[1.2rem] border border-[var(--line)] bg-white px-4 py-3 text-sm outline-none transition focus:border-[var(--blue-strong)]"
              />
            </label>
            <label className="block space-y-2">
              <span className="text-sm font-medium text-slate-700">Weekly frequency</span>
              <input
                name="weeklyFrequency"
                value={weeklyFrequency}
                onChange={(event) => setWeeklyFrequency(event.target.value)}
                className="w-full rounded-[1.2rem] border border-[var(--line)] bg-white px-4 py-3 text-sm outline-none transition focus:border-[var(--blue-strong)]"
              />
            </label>
            <label className="block space-y-2">
              <span className="text-sm font-medium text-slate-700">Equipment</span>
              <input
                name="equipment"
                value={equipment}
                onChange={(event) => setEquipment(event.target.value)}
                className="w-full rounded-[1.2rem] border border-[var(--line)] bg-white px-4 py-3 text-sm outline-none transition focus:border-[var(--blue-strong)]"
              />
            </label>
          </div>

          <label className="block space-y-2">
            <span className="text-sm font-medium text-slate-700">Recovery priority</span>
            <input
              name="recoveryPriority"
              value={recoveryPriority}
              onChange={(event) => setRecoveryPriority(event.target.value)}
              className="w-full rounded-[1.2rem] border border-[var(--line)] bg-white px-4 py-3 text-sm outline-none transition focus:border-[var(--blue-strong)]"
            />
          </label>
        </div>

        <div className="mt-6 flex flex-wrap items-center gap-3">
          <button
            type="submit"
            disabled={pending}
            className="rounded-full bg-[var(--blue-strong)] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[var(--blue-deep)] disabled:opacity-60"
          >
            {pending ? "Researching..." : "Ask assistant"}
          </button>
          <p className="text-sm text-slate-500">
            Uses live research retrieval. If no OpenAI key is configured, the
            app returns a structured non-AI fallback summary.
          </p>
        </div>

        {state.error ? (
          <p className="mt-4 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
            {state.error}
          </p>
        ) : null}
      </form>

      <div className="space-y-6">
        <div className="glass rounded-[2rem] p-6 sm:p-8">
          <p className="font-mono text-xs uppercase tracking-[0.24em] text-[var(--blue-strong)]">
            Response
          </p>
          {state.result ? (
            <div className="mt-4 space-y-5">
              <div className="rounded-[1.5rem] bg-white/75 p-5">
                <p className="text-base leading-7 text-slate-700">
                  {state.result.answer}
                </p>
                <p className="mt-4 text-xs uppercase tracking-[0.22em] text-slate-500">
                  Search query: {state.result.searchQuery}
                </p>
                <p className="mt-2 text-xs uppercase tracking-[0.22em] text-slate-500">
                  Mode: {state.result.usedAi ? "OpenAI-assisted" : "Fallback summary"}
                </p>
              </div>

              <div className="grid gap-4 lg:grid-cols-3">
                <div className="rounded-[1.5rem] border border-[var(--line)] bg-white/80 p-4">
                  <h2 className="text-sm font-semibold text-[var(--blue-deep)]">
                    Key takeaways
                  </h2>
                  <ul className="mt-3 space-y-2 text-sm leading-6 text-slate-700">
                    {state.result.bullets.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                </div>
                <div className="rounded-[1.5rem] border border-[var(--line)] bg-white/80 p-4">
                  <h2 className="text-sm font-semibold text-[var(--blue-deep)]">
                    Cautions
                  </h2>
                  <ul className="mt-3 space-y-2 text-sm leading-6 text-slate-700">
                    {state.result.cautions.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                </div>
                <div className="rounded-[1.5rem] border border-[var(--line)] bg-white/80 p-4">
                  <h2 className="text-sm font-semibold text-[var(--blue-deep)]">
                    Suggested actions
                  </h2>
                  <ul className="mt-3 space-y-2 text-sm leading-6 text-slate-700">
                    {state.result.suggestedActions.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          ) : (
            <p className="mt-4 text-sm leading-7 text-slate-600">
              Ask a lifting question with your profile details and the assistant
              will retrieve recent papers, summarize them, and tailor the answer
              to your constraints.
            </p>
          )}
        </div>

        <div className="glass rounded-[2rem] p-6 sm:p-8">
          <p className="font-mono text-xs uppercase tracking-[0.24em] text-[var(--blue-strong)]">
            Research feed
          </p>
          <div className="mt-4 space-y-4">
            {state.result?.articles?.length ? (
              state.result.articles.map((article) => (
                <a
                  key={article.id}
                  href={article.url}
                  target="_blank"
                  rel="noreferrer"
                  className="block rounded-[1.4rem] border border-[var(--line)] bg-white/80 p-4 transition-transform hover:-translate-y-0.5"
                >
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <p className="font-medium text-slate-800">{article.title}</p>
                      <p className="mt-1 text-sm text-slate-500">
                        {article.journal ?? article.source}{" "}
                        {article.year ? `• ${article.year}` : ""}
                      </p>
                    </div>
                    <div className="rounded-full border border-[var(--line)] px-3 py-1 text-xs font-semibold text-slate-600">
                      {article.evidenceLevel}
                    </div>
                  </div>
                </a>
              ))
            ) : (
              <p className="text-sm leading-7 text-slate-600">
                Retrieved papers will appear here with direct links once you run
                a personalized search.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
