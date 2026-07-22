import Link from "next/link";
import {
  PillIcon,
  BellIcon,
  TrendIcon,
  ChatIcon,
  CheckIcon,
  CloseIcon,
} from "../asset/icons";

// NOTE: sample data for the UI. Replace with real adherence data from Supabase.
const ADHERENCE_PERCENT = 87;
const DOSES_TAKEN = 6;
const DOSES_TOTAL = 7;
const PHASE = "Intensif";
const WEEK: { day: string; taken: boolean }[] = [
  { day: "01", taken: true },
  { day: "02", taken: true },
  { day: "03", taken: true },
  { day: "04", taken: true },
  { day: "05", taken: false },
  { day: "06", taken: true },
  { day: "07", taken: true },
];

const QUICK_ACTIONS = [
  {
    label: "Laporan Obat Harian",
    href: "#",
    icon: PillIcon,
    className: "border-brand-200 bg-brand-50/60 text-brand-700",
    iconClassName: "text-brand-600",
  },
  {
    label: "Jadwal & Alarm",
    href: "#",
    icon: BellIcon,
    className: "border-sky-200 bg-sky-50/60 text-sky-700",
    iconClassName: "text-sky-600",
  },
  {
    label: "Riwayat Kepatuhan",
    href: "#",
    icon: TrendIcon,
    className: "border-brand-200 bg-brand-50/60 text-brand-700",
    iconClassName: "text-brand-600",
  },
  {
    label: "Chat Nakes",
    href: "#",
    icon: ChatIcon,
    className: "border-violet-200 bg-violet-50/60 text-violet-700",
    iconClassName: "text-violet-600",
  },
];

function AdherenceDonut({ percent }: { percent: number }) {
  const radius = 54;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference * (1 - percent / 100);

  return (
    <div className="relative h-32 w-32">
      <svg viewBox="0 0 128 128" className="h-32 w-32 -rotate-90">
        <circle
          cx="64"
          cy="64"
          r={radius}
          fill="none"
          stroke="#e2e8f0"
          strokeWidth="12"
        />
        <circle
          cx="64"
          cy="64"
          r={radius}
          fill="none"
          stroke="var(--brand-600)"
          strokeWidth="12"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-2xl font-bold text-brand-950">{percent}%</span>
        <span className="text-xs text-slate-500">Kepatuhan</span>
      </div>
    </div>
  );
}

export default function PatientOverview() {
  return (
    <div className="space-y-6">
      {/* Adherence + weekly tracker */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Adherence card */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6">
          <div className="flex justify-center">
            <AdherenceDonut percent={ADHERENCE_PERCENT} />
          </div>
          <div className="mt-6 space-y-2 border-t border-slate-100 pt-4 text-sm">
            <div className="flex items-center justify-between">
              <span className="text-slate-500">7 hari terakhir</span>
              <span className="font-semibold text-brand-950">
                {DOSES_TAKEN} / {DOSES_TOTAL} dosis
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-500">Fase pengobatan</span>
              <span className="font-semibold text-brand-950">{PHASE}</span>
            </div>
          </div>
        </div>

        {/* Weekly tracker card */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6">
          <h3 className="text-base font-semibold text-brand-950">
            7 Hari Terakhir
          </h3>
          <div className="mt-4 grid grid-cols-7 gap-2">
            {WEEK.map((d) => (
              <div key={d.day} className="flex flex-col items-center gap-1.5">
                <div
                  className={`flex h-11 w-full items-center justify-center rounded-xl ${
                    d.taken
                      ? "bg-brand-600 text-white"
                      : "bg-red-100 text-red-500"
                  }`}
                >
                  {d.taken ? (
                    <CheckIcon className="h-5 w-5" />
                  ) : (
                    <CloseIcon className="h-5 w-5" />
                  )}
                </div>
                <span className="text-xs text-slate-500">{d.day}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Quick actions */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
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
