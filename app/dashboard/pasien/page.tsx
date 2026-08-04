import { getDaftarPasienAction } from "@/actions/pasien";
import { PasienData } from "@/types/pasien";
import PasienTableView from "@/components/pasien/PasienTableView";

export const metadata = {
  title: "Manajemen Pasien | NU-TBCare",
};

export default async function ManajemenPasienPage() {
  const response = await getDaftarPasienAction();
  const pasienList =
    response.success && response.data ? (response.data as PasienData[]) : [];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="sm:flex sm:items-center sm:justify-between mb-8">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Manajemen Pasien</h2>
          <p className="mt-1 text-sm text-gray-500">
            Daftar seluruh pasien TB yang terdaftar di sistem.
          </p>
        </div>
      </div>

      {response.success === false ? (
        <div className="rounded-md bg-red-50 p-4 border border-red-200">
          <p className="text-sm text-red-600">{response.error}</p>
        </div>
      ) : (
        <PasienTableView data={pasienList} />
      )}
    </div>
  );
}
