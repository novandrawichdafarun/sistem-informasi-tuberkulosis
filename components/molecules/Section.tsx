export default function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6">
      <h2 className="text-base font-semibold text-brand-950">{title}</h2>
      <div className="mt-4">{children}</div>
    </div>
  );
}
