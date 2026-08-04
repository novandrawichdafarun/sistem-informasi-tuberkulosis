"use client";

import { PasienDiagnosisOverview } from "@/types/diagnosis";
import { useState } from "react";
import TambahDiagnosisModal from "./TambahDiagnosisModal";
import RiwayatDiagnosisSubRow from "./RiwayatDiagnosisSubRow";
import { DetailIcon, PlusIcon } from "@/components/asset/icons";

interface Props {
  data: PasienDiagnosisOverview;
}

export default function DiagnosisRowView({ data }: Props) {
  const [isExpanded, setIsExpanded] = useState(false);
  const isEpisodeAktif = data.episodeAktif?.status_episode === "aktif";

  const [isModalTambahOpen, setIsModalTambahOpen] = useState(false);

  const {
    nama_lengkap,
    jenis_kelamin,
    usia,
    domisili,
    episodeAktif,
    riwayat_diagnosis,
  } = data;
  const hasRiwayat = riwayat_diagnosis && riwayat_diagnosis.length > 0;

  const isDiagnosisExists = episodeAktif
    ? riwayat_diagnosis?.some(
        (diagnosis) =>
          diagnosis?.id_episode &&
          diagnosis.id_episode === episodeAktif.id_episode,
      ) || false
    : false;

  return (
    <>
      <tr className="hover:bg-gray-50 transition-colors group">
        {/* Kolom 1: Nama Pasien & Jenis Kelamin */}
        <td className="px-6 py-4 whitespace-nowrap">
          <div className="font-medium text-gray-800">{nama_lengkap}</div>
          <div className="text-xs text-gray-400">
            {jenis_kelamin === "L" ? "Laki-laki" : "Perempuan"}
          </div>
        </td>

        {/* Kolom 2: Usia & Domisili */}
        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
          <div className="font-medium text-gray-800">{usia || "-"}</div>
          <div className="text-xs text-gray-400">{domisili || "-"}</div>
        </td>

        {/* Kolom 3: Status Episode */}
        <td className="px-6 py-4 whitespace-nowrap">
          {episodeAktif ? (
            <span className="inline-flex items-center rounded-full bg-blue-50 px-2.5 py-0.5 text-xs font-medium text-blue-700 border border-blue-100">
              Episode Aktif
            </span>
          ) : (
            <span className="inline-flex items-center rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-600 border border-slate-200">
              Tidak Ada Episode
            </span>
          )}
        </td>

        {/* Kolom 4: Total Pemeriksaan */}
        <td className="px-6 py-4 whitespace-nowrap text-xs text-gray-600">
          <div className="font-semibold text-gray-700">
            {riwayat_diagnosis.length} Diagnosis
          </div>
        </td>

        {/* Kolom 4: Aksi */}
        <td className="px-6 py-4 whitespace-nowrap text-center">
          <div className="flex justify-center items-center gap-2">
            {/* Tombol Lihat Data */}
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              disabled={!hasRiwayat}
              title={
                hasRiwayat
                  ? isExpanded
                    ? "Tutup data"
                    : "Lihat data"
                  : "Belum ada data"
              }
              className={`flex p-2 items-center rounded-lg transition shadow-sm ${
                hasRiwayat
                  ? "bg-blue-100 text-blue-500 hover:bg-blue-500 hover:text-white"
                  : "bg-gray-100 text-gray-300 cursor-not-allowed"
              }`}
            >
              <DetailIcon className="w-4 h-4" />
            </button>

            {/* Tombol Tambah Diagnosis (Hanya muncul jika episode aktif & belum ada diagnosis) */}
            {isEpisodeAktif && episodeAktif && !isDiagnosisExists && (
              <>
                <button
                  onClick={() => setIsModalTambahOpen(true)}
                  title="Tambah diagnosis"
                  className="flex p-2 items-center bg-emerald-100 text-emerald-600 rounded-lg hover:bg-emerald-500 hover:text-white transition shadow-sm"
                >
                  <PlusIcon className="w-4 h-4" />
                </button>
                <TambahDiagnosisModal
                  id_episode={episodeAktif.id_episode}
                  isOpen={isModalTambahOpen}
                  onClose={() => setIsModalTambahOpen(false)}
                />
              </>
            )}
          </div>
        </td>
      </tr>

      {/* Area Sub-Row (Riwayat Diagnosis) */}
      {isExpanded && (
        <tr>
          <td
            colSpan={5}
            className="bg-slate-50 border-b border-gray-200 p-0 shadow-inner"
          >
            <div className="p-4 pl-10 border-l-4 border-emerald-400">
              <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">
                Histori Diagnosis ({riwayat_diagnosis.length})
              </h4>
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
