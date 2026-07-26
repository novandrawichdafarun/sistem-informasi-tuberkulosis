"use client";

import { PasienPemeriksaanLabOverview } from "@/types/pemeriksaanLab";
import { useState } from "react";
import Link from "next/link";
import RiwayatLabSubRow from "./RiwayatLabSubRow";
import TambahLabModal from "./TambahLabModal";

interface Props {
  data: PasienPemeriksaanLabOverview;
}

export default function PemeriksaanLabRowView({ data }: Props) {
  const [isExpanded, setIsExpanded] = useState(false);
  const isEpisodeAktif = data.episodeAktif?.status_episode === "aktif";
  const [isModalTambahOpen, setIsModalTambahOpen] = useState(false);

  const {
    nama_lengkap,
    usia,
    domisili,
    episodeAktif,
    riwayat_pemeriksaan_lab,
  } = data;
  const hasRiwayat =
    riwayat_pemeriksaan_lab && riwayat_pemeriksaan_lab.length > 0;

  return (
    <>
      <tr className="hover:bg-gray-50 transition-colors group">
        <td className="px-6 py-4 font-medium text-gray-900">
          {data.usia || "-"}
        </td>
        <td className="px-6 py-4">
          <div className="font-medium text-gray-800">{data.nama_lengkap}</div>
          <div className="text-xs text-gray-500">
            {data.jenis_kelamin === "L" ? "Laki-laki" : "Perempuan"}
          </div>
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
              : `Lihat Riwayat (${riwayat_pemeriksaan_lab.length})`}
          </button>

          {/* Tombol Tambah Lab (Hanya muncul jika episode aktif) */}
          {isEpisodeAktif && data.episodeAktif ? (
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
          ) : (
            <Link
              href="/dashboard/episode-pengobatan"
              className="text-sm px-3 py-1.5 border border-amber-200 bg-amber-50 text-amber-700 rounded-md hover:bg-amber-100 transition-colors"
              title="Pemeriksaan lab hanya bisa ditambah pada episode yang aktif"
            >
              Buka Episode dulu →
            </Link>
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
                riwayat={riwayat_pemeriksaan_lab}
                id_episode={episodeAktif?.id_episode}
              />
            </div>
          </td>
        </tr>
      )}
    </>
  );
}
