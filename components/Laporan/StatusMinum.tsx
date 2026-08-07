import { CheckIcon, ClockIcon, MinusIcon } from "@/components/asset/icons";

export default function StatusMinum({
  status,
}: {
  status: "diminum" | "terlewat" | null;
}) {
  if (status === "diminum")
    return (
      <span
        title="Dilaporkan tepat waktu"
        className="inline-flex items-center gap-1 rounded-full bg-brand-50 px-3 py-1 text-xs font-semibold text-brand-700"
      >
        <CheckIcon className="h-3.5 w-3.5" />
        Diminum
      </span>
    );

  if (status === "terlewat")
    return (
      <span
        title="Lapor telat — lebih dari 1 jam dari jadwal"
        className="inline-flex items-center gap-1 rounded-full bg-red-50 px-3 py-1 text-xs font-semibold text-red-600"
      >
        <ClockIcon className="h-3.5 w-3.5" />
        Telat
      </span>
    );

  return (
    <span
      title="Belum dilaporkan"
      className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-500"
    >
      <MinusIcon className="h-3.5 w-3.5" />
      Belum lapor
    </span>
  );
}
