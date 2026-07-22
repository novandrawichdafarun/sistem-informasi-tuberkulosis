"use client";

import { PasienEpisodeOverview } from "@/types/episodePengobatan";
import { useState } from "react";
import BukaEpisodeModal from "./BukaEpisodeModal";
import TutupEpisodeModal from "./TutupEpisodeModal";
import RiwayatSubRow from "./RiwayatSubRow";

interface EpisodeRowViewProps {
  item: PasienEpisodeOverview;
}

export default function EpisodeRowView({ item }: EpisodeRowViewProps) {
  const [isModalBukaOpen, setIsModalBukaOpen] = useState(false);
  const [isModalTutupOpen, setIsModalTutupOpen] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);

  const {
    id_pasien,
    nama_lengkap,
    usia,
    domisili,
    episodeAktif,
    riwayat_episode,
  } = item;
  const hasRiwayat = riwayat_episode && riwayat_episode.length > 0;

  return (
    <>
      <tr className="hover:bg-gray-50 transition-colors">
        {/* Kolom 1: Nama Pasien */}
        <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900">
          {nama_lengkap}
        </td>

        {/* Kolom 2: Usia & Domisili */}
        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
          <div className="font-medium text-gray-800">{usia || "-"}</div>
          <div className="text-xs text-gray-400">{domisili || "-"}</div>
        </td>

        {/* Kolom 3: Status Pengobatan */}
        <td className="px-6 py-4 whitespace-nowrap">
          {episodeAktif ? (
            <span className="inline-flex items-center rounded-full bg-blue-50 px-2.5 py-0.5 text-xs font-medium text-blue-700 border border-blue-100">
              Aktif
            </span>
          ) : (
            <span className="inline-flex items-center rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-600 border border-slate-200">
              Tidak Ada Episode
            </span>
          )}
        </td>

        {/* Kolom 4: Tipe Kasus / Tgl Mulai */}
        <td className="px-6 py-4 whitespace-nowrap text-xs text-gray-600">
          {episodeAktif ? (
            <div className="flex flex-col">
              <span className="font-semibold text-gray-700">
                {episodeAktif.tipe_pasien}
              </span>
              <span className="text-gray-400">
                Mulai {episodeAktif.tanggal_mulai}
              </span>
            </div>
          ) : (
            <span className="text-gray-400">-</span>
          )}
        </td>

        {/* Kolom 5: Aksi */}
        <td className="px-6 py-4 whitespace-nowrap text-right text-xs space-x-2">
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            disabled={!hasRiwayat}
            className={`rounded px-3 py-1.5 font-semibold transition border ${
              hasRiwayat
                ? "bg-gray-100 text-gray-700 border-gray-200 hover:bg-gray-200"
                : "bg-gray-50 text-gray-300 border-transparent cursor-not-allowed"
            }`}
          >
            {isExpanded ? "Tutup Log ▴" : "Lihat Log ▾"}
          </button>

          {episodeAktif ? (
            <button
              onClick={() => setIsModalTutupOpen(true)}
              className="rounded bg-emerald-50 px-3 py-1.5 font-semibold text-emerald-700 border border-emerald-200 hover:bg-emerald-100 transition"
            >
              Selesaikan
            </button>
          ) : (
            <button
              onClick={() => setIsModalBukaOpen(true)}
              className="rounded bg-blue-600 px-3 py-1.5 font-semibold text-white hover:bg-blue-700 transition"
            >
              Buka Episode
            </button>
          )}
        </td>
      </tr>

      {/* TAMPILAN DROPDOWN ROW RIWAYAT */}
      {isExpanded && (
        <tr>
          <td
            colSpan={5}
            className="bg-slate-50 border-b border-gray-200 p-0 shadow-inner"
          >
            <div className="p-4 pl-10 border-l-4 border-blue-400">
              <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">
                Histori Pengobatan ({riwayat_episode.length})
              </h4>
              <div className="overflow-hidden rounded border border-gray-200 bg-white shadow-sm">
                <table className="w-full text-left text-sm text-gray-600">
                  <thead className="bg-gray-100 text-xs font-semibold text-gray-700">
                    <tr>
                      <th className="px-4 py-2 border-b">Tipe Kasus</th>
                      <th className="px-4 py-2 border-b">Tanggal Mulai</th>
                      <th className="px-4 py-2 border-b">Tanggal Selesai</th>
                      <th className="px-4 py-2 border-b">Status</th>
                      <th className="px-4 py-2 border-b text-right">Aksi</th>
                    </tr>
                  </thead>
                  <tbody>
                    {riwayat_episode.map((ep) => (
                      <RiwayatSubRow key={ep.id_episode} episode={ep} />
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </td>
        </tr>
      )}

      {/* Modal Buka & Tutup */}
      <BukaEpisodeModal
        id_pasien={id_pasien}
        isOpen={isModalBukaOpen}
        onClose={() => setIsModalBukaOpen(false)}
      />
      {episodeAktif && (
        <TutupEpisodeModal
          id_episode={episodeAktif.id_episode}
          tipePasienSekarang={episodeAktif.tipe_pasien}
          isOpen={isModalTutupOpen}
          onClose={() => setIsModalTutupOpen(false)}
        />
      )}
    </>
  );
}
