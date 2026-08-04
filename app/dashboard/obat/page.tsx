import { getDaftarObatAction } from "@/actions/obat";
import ObatTableView from "@/components/obat/ObatTableView";
import TambahObatModal from "@/components/obat/TambahObatModal";

export const metadata = {
  title: "Manajemen Obat | NU-TBCARE",
};

export default async function ObatPage() {
  const result = await getDaftarObatAction();

  if (result.success === false) {
    return (
      <div className="p-6">
        <div className="bg-red-50 text-red-600 p-4 rounded-md shadow-sm border border-red-200">
          Terjadi kesalahan: {result.error || "Gagal memuat data."}
        </div>
      </div>
    );
  }

  const daftarObat = result.data || [];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="sm:flex sm:items-center sm:justify-between mb-8">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Manajemen Obat</h2>
          <p className="mt-1 text-sm text-gray-500">
            Daftar seluruh Kelola data master obat untuk resep pasien Anda.
          </p>
        </div>
      </div>

      <ObatTableView data={daftarObat} />
    </div>
  );
}
