import { formatWaktuID } from "@/utils/date";
import LaporanMakanForm from "./LaporanMakanForm";
import { getRiwayatMakanAction } from "@/actions/laporan";

export default async function PasienLaporanMakanView() {
  const res = await getRiwayatMakanAction();
  const data = res.success && res.data ? res.data : [];

  const todayDate = new Date().toISOString().slice(0, 10);
  const todaysReports = data.filter((d) => d.waktu_makan.startsWith(todayDate));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-brand-950">Laporan Makanan</h1>
        <p className="mt-1 text-sm text-slate-500">
          Catat asupan makanan harian Anda selama masa pengobatan TB.
        </p>
      </div>

      {res.success === false && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-600">
          {res.error}
        </div>
      )}

      <LaporanMakanForm todaysReports={todaysReports} />

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
        <div className="border-b border-slate-100 px-6 py-4">
          <h2 className="text-base font-semibold text-brand-950">
            Riwayat Laporan Makan
          </h2>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200 text-sm">
            <thead className="bg-slate-50 text-left text-xs font-semibold uppercase text-slate-500">
              <tr>
                <th className="px-4 py-3">Waktu Makan</th>
                <th className="px-4 py-3">Karbohidrat</th>
                <th className="px-4 py-3">Protein</th>
                <th className="px-4 py-3">Serat</th>
                <th className="px-4 py-3">Catatan</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-600">
              {data.length === 0 ? (
                <tr>
                  <td
                    colSpan={5}
                    className="px-4 py-10 text-center text-slate-400"
                  >
                    Belum ada laporan makan. Mulai catat lewat form di atas.
                  </td>
                </tr>
              ) : (
                data.map((r) => (
                  <tr key={r.id_laporan} className="hover:bg-slate-50">
                    <td className="whitespace-nowrap px-4 py-3 font-medium text-slate-800">
                      {formatWaktuID(r.waktu_makan)}
                    </td>
                    <td className="px-4 py-3">{r.karbo}</td>
                    <td className="px-4 py-3">{r.protein}</td>
                    <td className="px-4 py-3">{r.serat}</td>
                    <td className="max-w-[16rem] px-4 py-3">
                      {r.catatan || "-"}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
