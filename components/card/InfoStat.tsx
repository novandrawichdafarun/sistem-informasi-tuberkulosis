import type { ReactElement } from "react";

type Tone = "brand" | "emerald" | "red" | "slate" | "amber" | "blue";

const TONES: Record<Tone, { chip: string; value: string; ring: string }> = {
  brand: {
    chip: "bg-brand-100 text-brand-700",
    value: "text-brand-700",
    ring: "border-brand-100",
  },
  emerald: {
    chip: "bg-emerald-100 text-emerald-600",
    value: "text-emerald-600",
    ring: "border-emerald-100",
  },
  red: {
    chip: "bg-red-100 text-red-600",
    value: "text-red-600",
    ring: "border-red-100",
  },
  slate: {
    chip: "bg-slate-100 text-slate-500",
    value: "text-slate-700",
    ring: "border-slate-200",
  },
  amber: {
    chip: "bg-amber-100 text-amber-600",
    value: "text-amber-600",
    ring: "border-amber-100",
  },
  blue: {
    chip: "bg-blue-100 text-blue-600",
    value: "text-blue-600",
    ring: "border-blue-100",
  },
};

/** Kartu statistik ringkas: ikon berwarna + angka besar + label. */
export default function InfoStat({
  icon,
  label,
  value,
  sub,
  tone = "brand",
}: {
  icon: (props: { className?: string }) => ReactElement;
  label: string;
  value: string;
  sub?: string;
  tone?: Tone;
}) {
  const t = TONES[tone];
  const Icon = icon;
  return (
    <div
      className={`flex items-center gap-4 rounded-2xl border bg-white p-4 sm:p-5 ${t.ring}`}
    >
      <div
        className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${t.chip}`}
      >
        <Icon className="h-5 w-5" />
      </div>
      <div className="min-w-0">
        <p className="truncate text-xs font-medium text-slate-500">{label}</p>
        <p className={`text-2xl font-bold leading-tight ${t.value}`}>{value}</p>
        {sub && <p className="truncate text-xs text-slate-400">{sub}</p>}
      </div>
    </div>
  );
}
