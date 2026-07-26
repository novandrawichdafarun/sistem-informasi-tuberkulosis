import Link from "next/link";
import {
  PillIcon,
  TrendIcon,
  CheckIcon,
  CloseIcon,
  MinusIcon,
} from "../asset/icons";
import { AdherenceDay, AdherenceSummary } from "@/types/pasienPortal";
import AdherenceDonut from "../grafik/AdherenceDonut";
import { dayNumber } from "@/utils/date";

type CellKey = "diminum" | "terlewat" | "belum";

const STATUS_STYLES: Record<
  CellKey,
  {
    label: string;
    cell: string;
    icon: (props: { className?: string }) => React.ReactElement;
  }
> = {
  diminum: {
    label: "Diminum",
    cell: "bg-brand-600 text-white",
    icon: CheckIcon,
  },
  terlewat: {
    label: "Terlewat",
    cell: "bg-red-100 text-red-500",
    icon: CloseIcon,
  },
  belum: {
    label: "Belum lapor",
    cell: "bg-slate-100 text-slate-400",
    icon: MinusIcon,
  },
};

function cellKey(day: AdherenceDay): CellKey {
  if (day.status === "diminum") return "diminum";
  if (day.status === "terlewat") return "terlewat";
  return "belum";
}

const QUICK_ACTIONS = [
  {
    label: "Laporan Obat Harian",
    href: "/dashboard/laporan-obat",
    icon: PillIcon,
    className: "border-brand-200 bg-brand-50/60 text-brand-700",
    iconClassName: "text-brand-600",
  },
  {
    label: "Riwayat Kepatuhan",
    href: "/dashboard/riwayat-kepatuhan",
    icon: TrendIcon,
    className: "border-violet-200 bg-violet-50/60 text-violet-700",
    iconClassName: "text-violet-600",
  },
];

export default function PatientOverview({
  summary,
  fase,
}: {
  summary: AdherenceSummary;
  fase?: string | null;
}) {
  const week = summary.days.slice(-7);
  const diminum = week.filter((d) => d.status === "diminum").length;
  const totalTerlapor = week.filter((d) => d.status !== null).length;

  return (
    <div className="space-y-6">
      {/* Adherence + weekly tracker */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Adherence card */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6">
          <div className="flex justify-center">
            <AdherenceDonut percent={summary.persentase} />
          </div>
          <div className="mt-6 space-y-2 border-t border-slate-100 pt-4 text-sm">
            <div className="flex items-center justify-between">
              <span className="text-slate-500">Total dosis dilaporkan</span>
              <span className="font-semibold text-brand-950">
                {summary.diminum} / {summary.total} dosis
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-500">Tipe kasus</span>
              <span className="font-semibold text-brand-950">
                {fase || "Belum ada episode aktif"}
              </span>
            </div>
          </div>
        </div>

        {/* Weekly tracker card */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-semibold text-brand-950">
              7 Hari Terakhir
            </h3>
            {totalTerlapor > 0 && (
              <span className="text-xs text-slate-500">
                {diminum}/{totalTerlapor} dosis
              </span>
            )}
          </div>

          {week.length === 0 ? (
            <p className="mt-6 rounded-xl bg-slate-50 p-4 text-center text-sm text-slate-500">
              Belum ada jadwal minum obat dalam 7 hari terakhir.
            </p>
          ) : (
            <>
              <div
                className="mt-4 grid gap-2"
                style={{
                  gridTemplateColumns: `repeat(${week.length}, minmax(0, 1fr))`,
                }}
              >
                {week.map((d) => {
                  const s = STATUS_STYLES[cellKey(d)];
                  const Icon = s.icon;
                  return (
                    <div
                      key={d.tanggal}
                      className="flex flex-col items-center gap-1.5"
                      title={`${d.tanggal} · ${s.label}`}
                    >
                      <div
                        className={`flex h-11 w-full items-center justify-center rounded-xl ${s.cell}`}
                      >
                        <Icon className="h-5 w-5" />
                      </div>
                      <span className="text-xs text-slate-500">
                        {dayNumber(d.tanggal)}
                      </span>
                    </div>
                  );
                })}
              </div>

              {/* Legend */}
              <div className="mt-5 flex flex-wrap gap-x-4 gap-y-2 border-t border-slate-100 pt-4">
                {(Object.keys(STATUS_STYLES) as CellKey[]).map((key) => {
                  const s = STATUS_STYLES[key];
                  const Icon = s.icon;
                  return (
                    <div key={key} className="flex items-center gap-1.5">
                      <span
                        className={`flex h-5 w-5 items-center justify-center rounded-md ${s.cell}`}
                      >
                        <Icon className="h-3.5 w-3.5" />
                      </span>
                      <span className="text-xs text-slate-500">{s.label}</span>
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Quick actions */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {QUICK_ACTIONS.map((action) => {
          const Icon = action.icon;
          return (
            <Link
              key={action.label}
              href={action.href}
              className={`flex items-center gap-3 rounded-2xl border p-4 font-semibold transition-shadow hover:shadow-md ${action.className}`}
            >
              <Icon className={`h-6 w-6 ${action.iconClassName}`} />
              {action.label}
            </Link>
          );
        })}
      </div>
    </div>
  );
}
