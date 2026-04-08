export function LabelPill({ label }: { label: string }) {
  const classes =
    label === "Evidence-Aligned"
      ? "bg-emerald-50 text-emerald-800 border-emerald-200"
      : label === "Mixed Evidence"
        ? "bg-amber-50 text-amber-900 border-amber-200"
        : "bg-rose-50 text-rose-800 border-rose-200";

  return (
    <span className={`rounded-full border px-3 py-1 text-xs font-semibold ${classes}`}>
      {label}
    </span>
  );
}
