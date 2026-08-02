export default function StatusMinum({
  status,
}: {
  status: "diminum" | "terlewat" | "ditunda" | null;
}) {
  if (status === "diminum")
    return (
      <span className="rounded-full bg-brand-50 px-3 py-1 text-xs font-semibold text-brand-700">
        Diminum
      </span>
    );

  if (status === "ditunda")
    return (
      <span className="rounded-full bg-yellow-50 px-3 py-1 text-xs font-semibold text-yellow-600">
        Ditunda
      </span>
    );

  if (status === "terlewat")
    return (
      <span className="rounded-full bg-red-50 px-3 py-1 text-xs font-semibold text-red-600">
        Terlewat
      </span>
    );

  return (
    <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-500">
      Belum lapor
    </span>
  );
}
