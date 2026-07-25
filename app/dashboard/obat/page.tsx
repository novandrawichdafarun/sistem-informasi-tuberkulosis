import { getDaftarObatAction } from "@/actions/obat";
import { ObatData } from "@/types/obat";
import ObatModal from "@/components/obat/ObatModal";
import DeleteObatButton from "@/components/obat/DeleteObatButton";

export const metadata = { title: "Master Obat | NU-TBCare" };

export default async function ObatPage() {
  const res = await getDaftarObatAction();
  const obatList = res.success && res.data ? (res.data as ObatData[]) : [];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="sm:flex sm:items-center sm:justify-between mb-8">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Master Obat</h2>
          <p className="mt-1 text-sm text-gray-500">
            Daftar obat yang tersedia untuk diresepkan ke pasien.
          </p>
        </div>
        <div className="mt-4 sm:mt-0">
          <ObatModal />
        </div>
      </div>

      {res.success === false ? (
        <div className="rounded-md bg-red-50 p-4 border border-red-200 text-sm text-red-600">
          {res.error}
        </div>
      ) : (
        <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 rounded-lg bg-white">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-300">
              <thead className="bg-gray-50">
                <tr>
                  <th className="py-3.5 pl-6 pr-3 text-left text-sm font-semibold text-gray-900">
                    Nama Obat
                  </th>
                  <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                    Jenis / Kategori
                  </th>
                  <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                    Dosis
                  </th>
                  <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                    Status
                  </th>
                  <th className="relative py-3.5 pl-3 pr-6 text-gray-900">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 bg-white">
                {obatList.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-sm text-gray-500">
                      Belum ada obat. Tambahkan obat terlebih dahulu.
                    </td>
                  </tr>
                ) : (
                  obatList.map((obat) => (
                    <tr key={obat.id_obat} className="hover:bg-gray-50">
                      <td className="whitespace-nowrap py-4 pl-6 pr-3 text-sm font-medium text-gray-900">
                        {obat.nama_obat}
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                        {obat.jenis_obat || "-"}
                        <br />
                        <span className="text-xs text-gray-400">
                          {obat.kategori_obat || "-"}
                        </span>
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                        {obat.dosis || "-"}
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm">
                        {obat.is_active ? (
                          <span className="rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-semibold text-emerald-700">
                            Aktif
                          </span>
                        ) : (
                          <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-semibold text-slate-500">
                            Nonaktif
                          </span>
                        )}
                      </td>
                      <td className="whitespace-nowrap py-4 pl-3 pr-6 text-center text-sm font-medium">
                        <ObatModal obat={obat} />
                        <DeleteObatButton id_obat={obat.id_obat} nama={obat.nama_obat} />
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
