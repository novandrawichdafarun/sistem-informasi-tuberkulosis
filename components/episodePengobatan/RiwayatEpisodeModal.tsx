"use client";

import { EpisodePengobatanData } from "@/types/episodePengobatan";

interface RiwayatEpisodeModalProps {
  isOpen: boolean;
  onClose: () => void;
  namaPasien: string;
  riwayat: EpisodePengobatanData[];
}

export default function RiwayatEpisodeModal({
  isOpen,
  onClose,
  namaPasien,
  riwayat,
}: RiwayatEpisodeModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-2xl rounded-lg bg-white p-6 shadow-lg max-h-[80vh] flex flex-col">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-bold text-gray-900">
            Log Pengobatan {namaPasien}
          </h3>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-800"
          >
            Tutup
          </button>
        </div>

        <div className="overflow-y-auto flex-1">
          <table className="w-full border-collapse text-left text-sm text-gray-600">
            <thead className="bg-gray-50 text-xs uppercase text-gray-700 sticky top-0">
              <tr>
                <th className="px-4 py-2 border-b">Tipe Kasus</th>
                <th className="px-4 py-2 border-b">Tanggal Mulai</th>
                <th className="px-4 py-2 border-b">Tanggal Selesai</th>
                <th className="px-4 py-2 border-b">Status</th>
              </tr>
            </thead>
            <tbody>
              {riwayat.length === 0 ? (
                <tr>
                  <td
                    colSpan={4}
                    className="px-4 py-6 text-center text-gray-400"
                  >
                    Belum ada riwayat pengobatan
                  </td>
                </tr>
              ) : (
                riwayat.map((ep) => (
                  <tr key={ep.id_episode} className="border-b hover:bg-gray-50">
                    <td className="px-4 py-3">{ep.tipe_pasien}</td>
                    <td className="px-4 py-3">{ep.tanggal_mulai}</td>
                    <td className="px-4 py-3">{ep.tanggal_selesai || "-"}</td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${ep.status_episode === "aktif" ? "bg-blue-100 text-blue-700" : "bg-emerald-100 text-emerald-700"}`}
                      >
                        {ep.status_episode}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
