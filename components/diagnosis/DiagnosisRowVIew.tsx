"use client";

import { PasienDiagnosisOverview } from "@/types/diagnosis";
import { useState } from "react";
import TambahDiagnosisModal from "./TambahDiagnosisModal";
import RiwayatDiagnosisSubRow from "./RiwayatDiagnosisSubRow";

interface Props {
  data: PasienDiagnosisOverview;
}

export default function DiagnosisRowView({ data }: Props) {
  const [isExpanded, setIsExpanded] = useState(false);
  const isEpisodeAktif = data.episodeAktif?.status_episode === "aktif";
  const [isModalTambahOpen, setIsModalTambahOpen] = useState(false);

  const { nama_lengkap, usia, domisili, episodeAktif, riwayat_diagnosis } =
    data;
  const hasRiwayat = riwayat_diagnosis && riwayat_diagnosis.length > 0;

  return (
    <>
      <tr className="hover:bg-gray-50 transition-colors group">
        {/* Kolom 1: Nama Pasien */}
        <td className="px-6 py-4 font-medium text-gray-900">{nama_lengkap}</td>

        {/* Kolom 2: Usia & Domisili*/}
        <td className="px-6 py-4 text-sm text-gray-600">
          <div className="font-medium text-gray-800">{usia || "-"}</div>
          <div className="text-xs text-gray-400">{domisili || "-"}</div>
        </td>

        {/* Kolom 3: Status Episode */}
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

        {/* Kolom 4: Aksi */}
        <td className="px-6 py-4 text-right space-x-2">
          {/* Tombol Buka Riwayat */}
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            disabled={!hasRiwayat}
            className={`text-sm px-3 py-1.5 border rounded-md transition-colors ${
              hasRiwayat
                ? "border-gray-300 text-gray-700 hover:bg-gray-50"
                : "border-transparent bg-gray-50 text-gray-300 cursor-not-allowed"
            }`}
          >
            {isExpanded
              ? "Tutup Riwayat"
              : `Lihat Riwayat (${riwayat_diagnosis.length})`}
          </button>

          {/* Tombol Tambah Lab (Hanya muncul jika episode aktif) */}
          {isEpisodeAktif && episodeAktif && (
            <>
              <button
                className="text-sm px-3 py-1.5 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                onClick={() => setIsModalTambahOpen(true)}
              >
                + Tambah Lab
              </button>
              <TambahDiagnosisModal
                id_episode={episodeAktif.id_episode}
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
              <RiwayatDiagnosisSubRow
                riwayat={riwayat_diagnosis}
                id_episode={episodeAktif?.id_episode}
              />
            </div>
          </td>
        </tr>
      )}
    </>
  );
}
