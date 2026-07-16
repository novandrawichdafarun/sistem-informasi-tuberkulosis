import { getDaftarPemeriksaanLabAction } from "@/actions/pemeriksaanLab";
import PemeriksaanLabRowView from "@/components/pemeriksaanLab/PemeriksaanLabRowView";

export default async function PemeriksaanLabPage() {
  const result = await getDaftarPemeriksaanLabAction();

  if (result.success === false) {
    return (
      <div className="p-6">
        <div className="bg-red-50 text-red-600 p-4 rounded-md shadow-sm border border-red-200">
          Terjadi kesalahan: {result.error || "Gagal memuat data."}
        </div>
      </div>
    );
  }

  const daftarPasien = result.data || [];

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-800">
          Manajemen Pemeriksaan Lab
        </h1>
        <p className="text-gray-500 text-sm mt-1">
          Kelola data pemeriksaan laboratorium pasien yang Anda tangani.
        </p>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-gray-50 border-b border-gray-200 text-gray-600">
              <tr>
                <th className="px-6 py-4 font-semibold">No. RM</th>
                <th className="px-6 py-4 font-semibold">Nama Pasien</th>
                <th className="px-6 py-4 font-semibold">Status Episode</th>
                <th className="px-6 py-4 font-semibold text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {daftarPasien.length === 0 ? (
                <tr>
                  <td
                    colSpan={4}
                    className="px-6 py-8 text-center text-gray-500"
                  >
                    Belum ada data pasien atau pemeriksaan lab.
                  </td>
                </tr>
              ) : (
                daftarPasien.map((pasien) => (
                  <PemeriksaanLabRowView key={pasien.id_pasien} data={pasien} />
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
