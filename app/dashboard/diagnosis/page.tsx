import { getDaftarDiagnosisAction } from "@/actions/diagnosis";
import DiagnosisRowView from "@/components/diagnosis/DiagnosisRowVIew";

export const metadata = {
  title: "Manajemen Diagnosis Pasien | NU-TBCARE",
};

export default async function DiagnosisPage() {
  const result = await getDaftarDiagnosisAction();

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
          Kelola data pemeriksaan laboratorium pasien secara terpusat di dalam
          sistem.
        </p>
      </div>

      <div className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left text-sm text-gray-500 whitespace-nowrap">
            <thead className="bg-gray-50 text-xs uppercase text-gray-700 font-semibold border-b border-gray-200">
              <tr>
                <th className="px-6 py-3">Nama Pasien & Jenis Kelamin</th>
                <th className="px-6 py-3">Usia & Domisili</th>
                <th className="px-6 py-3">Status Episode</th>
                <th className="px-6 py-3">Status Pengobatan</th>
                <th className="px-6 py-3 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {daftarPasien.length === 0 ? (
                <tr>
                  <td
                    colSpan={5}
                    className="px-6 py-8 text-center text-gray-500"
                  >
                    Belum ada data pasien atau pemeriksaan lab.
                  </td>
                </tr>
              ) : (
                daftarPasien.map((pasien) => (
                  <DiagnosisRowView key={pasien.id_pasien} data={pasien} />
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
