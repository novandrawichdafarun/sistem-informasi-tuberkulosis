export default function StatTile({
  label,
  value,
  sub,
  accent = "brand",
}: {
  label: string;
  value: string;
  sub?: string;
  accent?: "brand" | "blue" | "amber" | "slate";
}) {
  const accents = {
    brand: "text-brand-700",
    blue: "text-blue-600",
    amber: "text-amber-600",
    slate: "text-slate-700",
  } as const;
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5">
      <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
        {label}
      </p>
      <p className={`mt-2 text-3xl font-bold ${accents[accent]}`}>{value}</p>
      {sub && <p className="mt-0.5 text-xs text-slate-400">{sub}</p>}
    </div>
  );
}
