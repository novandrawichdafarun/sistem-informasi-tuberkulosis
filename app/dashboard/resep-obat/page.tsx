import { getDaftarResepAction } from "@/actions/resep";
import { getDaftarObatAction } from "@/actions/obat";
import ResepRowView from "@/components/resep/ResepRowView";

export const metadata = { title: "Resep & Jadwal Obat | NU-TBCare" };

export default async function ResepObatPage() {
  const [resepRes, obatRes] = await Promise.all([
    getDaftarResepAction(),
    getDaftarObatAction(),
  ]);

  const daftar = resepRes.success && resepRes.data ? resepRes.data : [];
  const obatList = obatRes.success && obatRes.data ? obatRes.data : [];

  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Resep &amp; Jadwal Obat</h1>
        <p className="text-sm text-gray-500">
          Buat resep pengobatan dan jadwal minum obat harian pasien. Jadwal yang
          dibuat akan tampil di aplikasi pasien &amp; menjadi dasar perhitungan
          kepatuhan.
        </p>
      </div>

      {resepRes.success === false && (
        <div className="rounded bg-red-50 p-4 text-sm text-red-600 border border-red-200">
          {resepRes.error || "Gagal memuat data resep."}
        </div>
      )}

      <div className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left text-sm text-gray-500">
            <thead className="bg-gray-50 text-xs uppercase text-gray-700 font-semibold border-b border-gray-200">
              <tr>
                <th className="px-6 py-3">Usia / L-P</th>
                <th className="px-6 py-3">Nama Pasien</th>
                <th className="px-6 py-3">Episode / Resep</th>
                <th className="px-6 py-3 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {daftar.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-10 text-center text-gray-400">
                    Belum ada data pasien.
                  </td>
                </tr>
              ) : (
                daftar.map((item) => (
                  <ResepRowView
                    key={item.id_pasien}
                    item={item}
                    obatList={obatList}
                  />
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
