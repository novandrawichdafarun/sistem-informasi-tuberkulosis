export default function RoleBadge({ label }: { label: string }) {
  return (
    <div className="px-5 pt-4">
      <span className="inline-flex items-center rounded-full bg-brand-600 px-3 py-1 text-xs font-semibold text-white">
        {label}
      </span>
    </div>
  );
}
