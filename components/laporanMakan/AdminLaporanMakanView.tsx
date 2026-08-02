import { getLaporanMakanGroupedAction } from "@/actions/laporanMakan";
import LaporanMakanAdminTable from "./LaporanMakanAdminTable";

export default async function AdminLaporanMakanView() {
  const res = await getLaporanMakanGroupedAction();
  const data = res.success && res.data ? res.data : [];

  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Laporan Makanan</h1>
        <p className="text-sm text-gray-500">
          Pantau asupan makanan harian pasien. Klik ikon detail untuk melihat
          seluruh laporan yang dikirim tiap pasien.
        </p>
      </div>

      {res.success === false && (
        <div className="rounded bg-red-50 p-4 text-sm text-red-600 border border-red-200">
          {res.error || "Gagal memuat data."}
        </div>
      )}

      <LaporanMakanAdminTable rows={data} />
    </div>
  );
}
