import { getRiwayatMakanAction } from "@/actions/laporan";
import MealBanner from "@/components/banner/MealBanner";
import { formatJam, formatTanggalID } from "@/utils/date";

export const metadata = {
  title: "Laporan Makan Harian | PantauTB",
};

export default async function LaporanMakanPage() {
  const riwayat = await getRiwayatMakanAction();
  const data = riwayat.success && riwayat.data ? riwayat.data : [];

  const todayDate = new Date().toISOString().slice(0, 10);
  const todaysReports = data.filter((d) => d.waktu_makan.startsWith(todayDate));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-brand-950">
          Laporan Makan Harian
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          Konfirmasi makan Anda setiap hari agar Nakes dapat memantau kepatuhan
          pengobatan.
        </p>
      </div>

      <MealBanner todaysReports={todaysReports} />

      <div className="rounded-2xl border border-slate-200 bg-white p-6">
        <h2 className="text-base font-semibold text-brand-950">
          Riwayat 14 Hari Terakhir
        </h2>

        {data === null ? (
          <p className="mt-4 rounded-xl bg-slate-50 p-4 text-center text-sm text-slate-500">
            Belum ada jadwal minum obat. Riwayat akan muncul setelah Nakes
            menetapkan resep pengobatan.
          </p>
        ) : (
          <ul className="mt-4 divide-y divide-slate-100">
            {data.map((d, i) => (
              <li
                key={`${d.waktu_makan}-${i}`}
                className="flex items-center justify-between py-3"
              >
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="text-sm font-semibold text-slate-800">
                      {formatTanggalID(d.waktu_makan)}
                    </p>
                    <p className="text-xs text-slate-400">
                      Waktu makan: {formatJam(d.waktu_makan)}
                    </p>
                  </div>
                </div>

                <div className="mt-4 grid gap-3 sm:grid-cols-3">
                  <div className="rounded-2xl bg-white p-3 text-sm text-slate-700">
                    <p className="font-medium text-slate-900">Karbohidrat</p>
                    <p>{d.karbo}</p>
                  </div>
                  <div className="rounded-2xl bg-white p-3 text-sm text-slate-700">
                    <p className="font-medium text-slate-900">Protein</p>
                    <p>{d.protein}</p>
                  </div>
                  <div className="rounded-2xl bg-white p-3 text-sm text-slate-700">
                    <p className="font-medium text-slate-900">Serat</p>
                    <p>{d.serat}</p>
                  </div>
                </div>

                {d.catatan ? (
                  <p className="mt-4 rounded-2xl bg-slate-100 p-3 text-sm text-slate-600">
                    Catatan: {d.catatan}
                  </p>
                ) : null}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
