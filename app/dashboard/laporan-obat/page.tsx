import MedicationBanner from "@/components/banner/MedicationBanner";
import {
  getTodayMedicationAction,
  getAdherenceAction,
} from "@/actions/pasienPortal";
import { formatTanggalID, formatJam, formatWaktuID } from "@/utils/date";

export const metadata = { title: "Laporan Obat Harian | NU-TBCare" };

export default async function LaporanObatPage() {
  const [medRes, adherenceRes] = await Promise.all([
    getTodayMedicationAction(),
    getAdherenceAction(14),
  ]);

  const medication = medRes.success ? (medRes.data ?? null) : null;
  const days =
    adherenceRes.success && adherenceRes.data
      ? [...adherenceRes.data.days].reverse()
      : [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-brand-950">
          Laporan Obat Harian
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          Konfirmasi minum obat Anda setiap hari agar Nakes dapat memantau
          kepatuhan pengobatan.
        </p>
      </div>

      <MedicationBanner medication={medication} />

      {/* Detail obat hari ini */}
      {medication && medication.obat.length > 0 && (
        <div className="rounded-2xl border border-slate-200 bg-white p-6">
          <h2 className="text-base font-semibold text-brand-950">
            Obat untuk {formatTanggalID(medication.tanggal_jadwal)} · pukul{" "}
            {formatJam(medication.jam_jadwal)}
          </h2>
          <ul className="mt-4 divide-y divide-slate-100">
            {medication.obat.map((o, i) => (
              <li
                key={`${o.nama_obat}-${i}`}
                className="flex items-center justify-between py-3"
              >
                <span className="font-medium text-slate-800">
                  {o.nama_obat}
                </span>
                <span className="text-sm text-slate-500">{o.dosis}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Riwayat laporan 14 hari */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6">
        <h2 className="text-base font-semibold text-brand-950">
          Riwayat 14 Hari Terakhir
        </h2>

        {days.length === 0 ? (
          <p className="mt-4 rounded-xl bg-slate-50 p-4 text-center text-sm text-slate-500">
            Belum ada jadwal minum obat. Riwayat akan muncul setelah Nakes
            menetapkan resep pengobatan.
          </p>
        ) : (
          <ul className="mt-4 divide-y divide-slate-100">
            {days.map((d, i) => (
              <li
                key={`${d.tanggal}-${i}`}
                className="flex items-center justify-between py-3"
              >
                <div>
                  <p className="text-sm font-medium text-slate-800">
                    {formatTanggalID(d.tanggal)}
                  </p>
                  <p className="text-xs text-slate-400">
                    Jadwal pukul {formatJam(d.jam_jadwal)}
                    {d.reported_at
                      ? ` · dilaporkan ${formatWaktuID(d.reported_at)}`
                      : ""}
                  </p>
                </div>
                <StatusPill status={d.status} />
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

function StatusPill({ status }: { status: "diminum" | "terlewat" | null }) {
  if (status === "diminum")
    return (
      <span className="rounded-full bg-brand-50 px-3 py-1 text-xs font-semibold text-brand-700">
        Diminum
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
