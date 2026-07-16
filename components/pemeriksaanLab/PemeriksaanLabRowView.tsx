// components/pemeriksaanLab/PemeriksaanLabRowView.tsx
"use client";

import { PasienPemeriksaanLabOverview } from "@/types/pemeriksaanLab";
import { useState } from "react";
import RiwayatLabSubRow from "./RiwayatLabSubRow";
import TambahLabModal from "./TambahLabModal";

interface Props {
  data: PasienPemeriksaanLabOverview;
}

export default function PemeriksaanLabRowView({ data }: Props) {
  const [isExpanded, setIsExpanded] = useState(false);
  const isEpisodeAktif = data.episodeAktif?.status_episode === "aktif";
  const [isModalTambahOpen, setIsModalTambahOpen] = useState(false);

  return (
    <>
      <tr className="hover:bg-gray-50 transition-colors group">
        <td className="px-6 py-4 font-medium text-gray-900">{data.no_rm}</td>
        <td className="px-6 py-4">
          <div className="font-medium text-gray-800">{data.nama_lengkap}</div>
          <div className="text-xs text-gray-500">NIK: {data.nik}</div>
        </td>
        <td className="px-6 py-4">
          {isEpisodeAktif ? (
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
              Episode Aktif
            </span>
          ) : (
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
              Tidak Aktif
            </span>
          )}
        </td>
        <td className="px-6 py-4 text-right space-x-2">
          {/* Tombol Buka Riwayat */}
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="text-sm px-3 py-1.5 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors"
          >
            {isExpanded
              ? "Tutup Riwayat"
              : `Lihat Riwayat (${data.riwayat_pemeriksaan_lab.length})`}
          </button>

          {/* Tombol Tambah Lab (Hanya muncul jika episode aktif) */}
          {isEpisodeAktif && data.episodeAktif && (
            <>
              <button
                className="text-sm px-3 py-1.5 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                onClick={() => setIsModalTambahOpen(true)}
              >
                + Tambah Lab
              </button>
              <TambahLabModal
                id_episode={data.episodeAktif.id_episode}
                isOpen={isModalTambahOpen}
                onClose={() => setIsModalTambahOpen(false)}
              />
            </>
          )}
        </td>
      </tr>

      {/* Area Sub-Row (Riwayat Pemeriksaan) */}
      {isExpanded && (
        <tr>
          <td
            colSpan={4}
            className="bg-gray-50/50 p-0 border-b border-gray-200"
          >
            <div className="px-6 py-4">
              <RiwayatLabSubRow
                riwayat={data.riwayat_pemeriksaan_lab}
                id_episode={data.episodeAktif?.id_episode}
              />
            </div>
          </td>
        </tr>
      )}
    </>
  );
}
