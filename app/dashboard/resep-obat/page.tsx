import { getDaftarResepAction } from "@/actions/resep";
import { getDaftarObatAction } from "@/actions/obat";
import ResepTableView from "@/components/resep/ResepTableView";

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

      <ResepTableView data={daftar} obatList={obatList} />
    </div>
  );
}
