import { getDaftarDiagnosisAction } from "@/actions/diagnosis";
import DiagnosisTableView from "@/components/diagnosis/DiagnosisTableView";

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
          Manajemen Diagnosis Pasien
        </h1>
        <p className="text-gray-500 text-sm mt-1">
          Kelola data diagnosis pasien secara terpusat di dalam sistem.
        </p>
      </div>

      <DiagnosisTableView data={daftarPasien} />
    </div>
  );
}
