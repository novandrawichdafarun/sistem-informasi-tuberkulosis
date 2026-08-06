"use client";

import { useState } from "react";
import Link from "next/link";
import { PasienPemeriksaanOverview } from "@/types/pemeriksaanKlinis";
import TambahPemeriksaanModal from "./TambahPemeriksaanModal";
import RiwayatSubRow from "./RiwayatSubRow";
import { DetailIcon, PlusIcon, CalendarIcon } from "@/components/asset/icons";

// --- KOMPONEN UTAMA ROW ---
export default function PemeriksaanRowView({
  item,
}: {
  item: PasienPemeriksaanOverview;
}) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isModalTambahOpen, setIsModalTambahOpen] = useState(false);

  const {
    nama_lengkap,
    usia,
    domisili,
    jenis_kelamin,
    episodeAktif,
    riwayat_pemeriksaan,
  } = item;
  const hasRiwayat = riwayat_pemeriksaan && riwayat_pemeriksaan.length > 0;

  return (
    <>
      <tr
        className={`transition-colors ${isExpanded ? "bg-emerald-50/30" : "hover:bg-gray-50"}`}
      >
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
            {riwayat_pemeriksaan.length} Pemeriksaan Klinis
          </div>
        </td>

        {/* Kolom 5: Aksi */}
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

            {/* Tombol Tambah Periksa (Hanya muncul jika ada episode aktif) */}
            {episodeAktif ? (
              <button
                onClick={() => setIsModalTambahOpen(true)}
                title="Tambah data klinis"
                className="flex p-2 items-center bg-emerald-100 text-emerald-600 rounded-lg hover:bg-emerald-500 hover:text-white transition shadow-sm"
              >
                <PlusIcon className="w-4 h-4" />
              </button>
            ) : (
              <Link
                href="/dashboard/episode-pengobatan"
                className="flex p-2 items-center bg-amber-100 text-amber-600 rounded-lg hover:bg-amber-500 hover:text-white transition shadow-sm"
                title="Buka episode dulu — pemeriksaan hanya bisa ditambah pada episode aktif"
              >
                <CalendarIcon className="w-4 h-4" />
              </Link>
            )}
          </div>
        </td>
      </tr>

      {/* DROPDOWN SUB-TABEL RIWAYAT */}
      {isExpanded && (
        <tr>
          <td
            colSpan={5}
            className="bg-slate-50 border-b border-gray-200 p-0 shadow-inner"
          >
            <div className="p-4 pl-10 border-l-4 border-emerald-400">
              <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">
                Histori Pemeriksaan Klinis ({riwayat_pemeriksaan.length})
              </h4>
              <div className="overflow-hidden rounded border border-gray-200 bg-white shadow-sm">
                <table className="w-full text-left text-sm text-gray-600">
                  <thead className="bg-gray-100 text-xs font-semibold text-gray-700">
                    <tr>
                      <th className="px-4 py-2 border-b">Tanggal</th>
                      <th className="px-4 py-2 border-b">
                        Antropometri (BB/TB)
                      </th>
                      <th className="px-4 py-2 border-b">Tanda Vital</th>
                      <th className="px-4 py-2 border-b">Keluhan</th>
                      <th className="px-4 py-2 border-b text-center">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {riwayat_pemeriksaan.map((periksa) => (
                      <RiwayatSubRow
                        key={periksa.id_periksa}
                        periksa={periksa}
                        id_episode_aktif={episodeAktif?.id_episode}
                      />
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </td>
        </tr>
      )}

      {/* Modal Tambah Data */}
      {episodeAktif && (
        <TambahPemeriksaanModal
          id_episode={episodeAktif.id_episode}
          isOpen={isModalTambahOpen}
          onClose={() => setIsModalTambahOpen(false)}
        />
      )}
    </>
  );
}
