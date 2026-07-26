import { getDaftarEpisodeOverviewAction } from "@/actions/episodePengobatan";
import EpisodeRowView from "@/components/episodePengobatan/EpisodeRowView";

export const metadata = {
  title: "Manajemen Episode Pengobatan | PantauTB",
};

export default async function EpisodePengobatanPage() {
  const res = await getDaftarEpisodeOverviewAction();
  const daftarPasienEpisode = res.success && res.data ? res.data : [];

  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">
          Manajemen Episode Pengobatan
        </h1>
        <p className="text-sm text-gray-500">
          Pantau dan kelola periode aktif pengobatan tuberkulosis untuk seluruh
          pasien secara terpusat di dalam sistem.
        </p>
      </div>

      {res.success === false && (
        <div className="rounded bg-red-50 p-4 text-sm text-red-600 border border-red-200">
          {res.error || "Gagal memuat data episode pengobatan."}
        </div>
      )}

      <div className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left text-sm text-gray-500">
            <thead className="bg-gray-50 text-xs uppercase text-gray-700 font-semibold border-b border-gray-200">
              <tr>
                <th className="px-6 py-3">Nama Pasien</th>
                <th className="px-6 py-3">Usia & Domisili</th>
                <th className="px-6 py-3">Status Pengobatan</th>
                <th className="px-6 py-3">Tipe Kasus / Tgl Mulai</th>
                <th className="px-6 py-3 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {daftarPasienEpisode.length === 0 ? (
                <tr>
                  <td
                    colSpan={5}
                    className="px-6 py-10 text-center text-gray-400"
                  >
                    Belum ada data pasien terdaftar di dalam sistem.
                  </td>
                </tr>
              ) : (
                daftarPasienEpisode.map((item) => (
                  <EpisodeRowView key={item.id_pasien} item={item} />
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
