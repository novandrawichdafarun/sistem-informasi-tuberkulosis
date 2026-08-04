export default function StatCard({
  label,
  value,
  sub,
  tone = "brand",
}: {
  label: string;
  value: string;
  sub?: string;
  tone?: "brand" | "slate" | "red";
}) {
  return (
    <div className="rounded-2xl border border-brand-200 bg-white p-6">
      <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
        {label}
      </p>
      <p
        className={`mt-2 text-4xl font-bold ${
          tone === "brand" ? "text-brand-700" : "text-brand-950"
        }`}
      >
        {value}
      </p>
      {sub && <p className="mt-1 text-sm text-slate-500">{sub}</p>}
    </div>
  );
}
