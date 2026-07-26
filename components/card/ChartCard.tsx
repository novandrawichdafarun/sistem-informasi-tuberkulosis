export default function ChartCard({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6">
      <h2 className="text-base font-semibold text-brand-950">{title}</h2>
      {subtitle && <p className="mt-0.5 text-xs text-slate-400">{subtitle}</p>}
      <div className="mt-4 overflow-x-auto">{children}</div>
    </div>
  );
}
