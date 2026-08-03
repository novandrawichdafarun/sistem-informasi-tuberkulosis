import MedicationBanner from "@/components/banner/MedicationBanner";
import {
  getJadwalByPasienIdAction,
  getKepatuhanAction,
} from "@/actions/laporan";
import { formatTanggalID, formatJam, formatWaktuID } from "@/utils/date";
import StatusMinum from "@/components/Laporan/StatusMinum";

export const metadata = { title: "Laporan Obat Harian | NU-TBCare" };

export default async function LaporanObatPage() {
  const [jadwalRes, kepatuhanRes] = await Promise.all([
    getJadwalByPasienIdAction(),
    getKepatuhanAction(14),
  ]);

  const jadwalHariIni =
    jadwalRes.success && jadwalRes.data ? jadwalRes.data : [];
  const days =
    kepatuhanRes.success && kepatuhanRes.data
      ? [...kepatuhanRes.data.days].reverse()
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

      <MedicationBanner jadwalList={jadwalHariIni} />

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
                <StatusMinum status={d.status} />
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
