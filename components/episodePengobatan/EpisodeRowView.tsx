"use client";

import { PasienEpisodeOverview } from "@/types/episodePengobatan";
import { useState } from "react";
import BukaEpisoodeModal from "./BukaEpisodeModal";
import TutupEpisodeModal from "./TutupEpisodeModal";
import RiwayatEpisodeModal from "./RiwayatEpisodeModal";

interface EpisodeRowViewProps {
  item: PasienEpisodeOverview;
}

export default function EpisodeRowView({ item }: EpisodeRowViewProps) {
  const [isModalBukaOpen, setIsModalBukaOpen] = useState(false);
  const [isModalTutupOpen, setIsModalTutupOpen] = useState(false);
  const [isModalRiwayatOpen, setIsModalRiwayatOpen] = useState(false);

  const { id_pasien, no_rm, nama_lengkap, nik, episodeAktif, riwayat_episode } =
    item;

  return (
    <tr className="hover:bg-gray-50 transition-colors">
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="font-medium text-gray-900">{no_rm || "-"}</div>
        <div className="text-xs text-gray-400">NIK {nik}</div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-800">
        {nama_lengkap}
      </td>
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
      <td className="px-6 py-4 whitespace-nowrap text-right text-xs space-x-2">
        <button
          onClick={() => setIsModalRiwayatOpen(true)}
          className="rounded bg-gray-100 px-3 py-1.5 font-semibold text-gray-700 border border-gray-200 hover:bg-gray-200 transition"
        >
          Lihat Log
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

        <BukaEpisoodeModal
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

        <RiwayatEpisodeModal
          isOpen={isModalRiwayatOpen}
          onClose={() => setIsModalRiwayatOpen(false)}
          namaPasien={nama_lengkap}
          riwayat={riwayat_episode}
        />
      </td>
    </tr>
  );
}
