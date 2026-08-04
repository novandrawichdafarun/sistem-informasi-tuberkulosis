"use client";

import { PasienPemeriksaanLabOverview } from "@/types/pemeriksaanLab";
import { useState } from "react";
import Link from "next/link";
import RiwayatLabSubRow from "./RiwayatLabSubRow";
import TambahLabModal from "./TambahLabModal";
import { DetailIcon, PlusIcon, CalendarIcon } from "@/components/asset/icons";

interface Props {
  data: PasienPemeriksaanLabOverview;
}

export default function PemeriksaanLabRowView({ data }: Props) {
  const [isExpanded, setIsExpanded] = useState(false);
  const isEpisodeAktif = data.episodeAktif?.status_episode === "aktif";
  const [isModalTambahOpen, setIsModalTambahOpen] = useState(false);

  const {
    nama_lengkap,
    jenis_kelamin,
    usia,
    domisili,
    episodeAktif,
    riwayat_pemeriksaan_lab,
  } = data;
  const hasRiwayat =
    riwayat_pemeriksaan_lab && riwayat_pemeriksaan_lab.length > 0;

  return (
    <>
      <tr
        className={`transition-colors ${isExpanded ? "bg-emerald-50/30" : "hover:bg-gray-50"}`}
      >
        {/* Kolom 1: Nama Pasien */}
        <td className="px-6 py-4 whitespace-nowrap">
          <div className="font-medium text-gray-800">{nama_lengkap}</div>
          <div className="text-xs text-gray-400">
            {jenis_kelamin === "L" ? "Laki-laki" : "Perempuan"}
          </div>
        </td>

        {/* Kolom 2: Usia & Domisili*/}
        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
          <div className="font-medium text-gray-800">{usia || "-"}</div>
          <div className="text-xs text-gray-400">{domisili || "-"}</div>
        </td>

        {/* Kolom 3: Status Episode */}
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

        {/* Kolom 4: Total Pemeriksaan */}
        <td className="px-6 py-4 whitespace-nowrap text-xs text-gray-600">
          <div className="font-semibold text-gray-700">
            {riwayat_pemeriksaan_lab.length} Pemeriksaan Lab
          </div>
        </td>

        {/* Kolom 5: Aksi */}
        <td className="px-6 py-4 whitespace-nowrap text-center">
          <div className="flex justify-center items-center gap-2">
            {/* Tombol Buka Riwayat */}
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

            {/* Tombol Tambah Lab (Hanya muncul jika episode aktif) */}
            {isEpisodeAktif && data.episodeAktif ? (
              <>
                <button
                  onClick={() => setIsModalTambahOpen(true)}
                  title="Tambah data lab"
                  className="flex p-2 items-center bg-emerald-100 text-emerald-600 rounded-lg hover:bg-emerald-500 hover:text-white transition shadow-sm"
                >
                  <PlusIcon className="w-4 h-4" />
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
                className="flex p-2 items-center bg-amber-100 text-amber-600 rounded-lg hover:bg-amber-500 hover:text-white transition shadow-sm"
                title="Buka episode dulu — pemeriksaan lab hanya bisa ditambah pada episode aktif"
              >
                <CalendarIcon className="w-4 h-4" />
              </Link>
            )}
          </div>
        </td>
      </tr>

      {/* Area Sub-Row (Riwayat Pemeriksaan) */}
      {isExpanded && (
        <tr>
          <td
            colSpan={5}
            className="bg-slate-50 border-b border-gray-200 p-0 shadow-inner"
          >
            <div className="p-4 pl-10 border-l-4 border-brand-400">
              <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">
                Histori Pengobatan ({riwayat_pemeriksaan_lab.length})
              </h4>
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
