export default function DistribusiBar({
  label,
  range,
  count,
  total,
  color,
}: {
  label: string;
  range: string;
  count: number;
  total: number;
  color: string;
}) {
  const pct = total > 0 ? Math.round((count / total) * 100) : 0;
  return (
    <div>
      <div className="flex items-center justify-between text-sm">
        <span className="font-medium text-slate-700">
          {label} <span className="text-slate-400">{range}</span>
        </span>
        <span className="font-semibold text-slate-800">{count} pasien</span>
      </div>
      <div className="mt-1.5 h-2.5 w-full overflow-hidden rounded-full bg-slate-100">
        <div
          className={`h-full rounded-full ${color}`}
          style={{ width: `${pct}%` }}
        />
      </div>
      <p className="mt-1 text-xs text-slate-400">{pct}% dari pasien dinilai</p>
    </div>
  );
}
