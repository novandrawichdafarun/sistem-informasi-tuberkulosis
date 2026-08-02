import { getDaftarEpisodeOverviewAction } from "@/actions/episodePengobatan";
import EpisodeTableView from "@/components/episodePengobatan/EpisodeTableView";

export const metadata = {
  title: "Manajemen Episode Pengobatan | PantauTB",
};

export default async function EpisodePengobatanPage() {
  const res = await getDaftarEpisodeOverviewAction();
  const daftarPasienEpisode = res.success && res.data ? res.data : [];

  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-800">
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

      <EpisodeTableView data={daftarPasienEpisode} />
    </div>
  );
}
