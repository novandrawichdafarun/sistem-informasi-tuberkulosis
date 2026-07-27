import { getDaftarPemeriksaanLabAction } from "@/actions/pemeriksaanLab";
import PemeriksaanLabRowView from "@/components/pemeriksaanLab/PemeriksaanLabRowView";

export const metadata = {
  title: "Manajemen Pemeriksaan Lab | NU-TBCARE",
};

export default async function PemeriksaanLabPage() {
  const result = await getDaftarPemeriksaanLabAction();
  const daftarPasien = result.success && result.data ? result.data : [];

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-800">
          Manajemen Pemeriksaan Lab
        </h1>
        <p className="text-sm text-gray-500">
          Kelola data pemeriksaan laboratorium seluruh pasien.
        </p>
      </div>

      {result.success === false && (
        <div className="rounded bg-red-50 p-4 text-sm text-red-600 border border-red-200">
          {result.error || "Gagal memuat data episode pengobatan."}
        </div>
      )}

      <div className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse whitespace-nowrap text-left text-sm text-gray-500">
            <thead className="bg-gray-50 text-xs uppercase text-gray-700 font-semibold border-b border-gray-200">
              <tr>
                <th className="px-6 py-4">Nama Pasien & Jenis Kelamin</th>
                <th className="px-6 py-4">Usia & Domisili</th>
                <th className="px-6 py-4">Status Episode</th>
                <th className="px-6 py-4">Total Pemeriksaan</th>
                <th className="px-6 py-4 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {daftarPasien.length === 0 ? (
                <tr>
                  <td
                    colSpan={5}
                    className="px-6 py-10 text-center text-gray-400"
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
