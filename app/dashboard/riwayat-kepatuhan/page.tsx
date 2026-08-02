import { formatTanggalID, formatJam } from "@/utils/date";
import Donut from "@/components/grafik/Donut";
import Legend from "@/components/molecules/Legend";
import StatCard from "@/components/card/StatCard";
import { KepatuhanHarian } from "@/types/laporan";
import { getKepatuhanAction } from "@/actions/laporan";

export const metadata = { title: "Riwayat Kepatuhan | NU-TBCare" };

function cellClass(d: KepatuhanHarian) {
  if (d.status === "diminum") return "bg-brand-600 text-white";
  if (d.status === "terlewat") return "bg-red-100 text-red-600";
  return "bg-slate-100 text-slate-400";
}

export default async function RiwayatKepatuhanPage() {
  const res = await getKepatuhanAction(30);
  const summary =
    res.success && res.data
      ? res.data
      : {
          total: 0,
          diminum: 0,
          terlewat: 0,
          belum: 0,
          persentase: 0,
          days: [],
        };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-brand-950">Riwayat Kepatuhan</h1>
        <p className="mt-1 text-sm text-slate-500">
          Ringkasan kepatuhan minum obat Anda selama 30 hari terakhir.
        </p>
      </div>

      {/* Ringkasan */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="flex flex-col items-center justify-center rounded-2xl border border-slate-200 bg-white p-6">
          <Donut percent={summary.persentase} />
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3 lg:col-span-2 lg:grid-cols-1 xl:grid-cols-3">
          <StatCard
            label="Diminum"
            value={String(summary.diminum)}
            tone="brand"
          />
          <StatCard
            label="Terlewat"
            value={String(summary.terlewat)}
            tone="red"
          />
          <StatCard
            label="Belum lapor"
            value={String(summary.belum)}
            tone="slate"
          />
        </div>
      </div>

      {/* Kalender 30 hari */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6">
        <h2 className="text-base font-semibold text-brand-950">
          Kalender 30 Hari
        </h2>

        {summary.days.length === 0 ? (
          <p className="mt-4 rounded-xl bg-slate-50 p-4 text-center text-sm text-slate-500">
            Belum ada jadwal minum obat yang tercatat.
          </p>
        ) : (
          <>
            <div className="mt-4 grid grid-cols-7 gap-2 sm:grid-cols-10">
              {summary.days.map((d, i) => (
                <div
                  key={`${d.tanggal}-${i}`}
                  title={`${formatTanggalID(d.tanggal)} · ${
                    d.status ?? "belum lapor"
                  } · jadwal ${formatJam(d.jam_jadwal)}`}
                  className={`flex h-10 items-center justify-center rounded-lg text-xs font-semibold ${cellClass(
                    d,
                  )}`}
                >
                  {d.tanggal.slice(8, 10)}
                </div>
              ))}
            </div>

            <div className="mt-5 flex flex-wrap gap-x-4 gap-y-2 border-t border-slate-100 pt-4 text-xs text-slate-500">
              <Legend className="bg-brand-600" label="Diminum" />
              <Legend className="bg-red-100" label="Terlewat" />
              <Legend className="bg-slate-100" label="Belum lapor" />
            </div>
          </>
        )}
      </div>
    </div>
  );
}
