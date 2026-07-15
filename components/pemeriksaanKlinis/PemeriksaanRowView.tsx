"use client";

import { useState } from "react";
import { PasienPemeriksaanOverview } from "@/types/pemeriksaanKlinis";
import TambahPemeriksaanModal from "./TambahPemeriksaanModal";
import RiwayatSubRow from "./RiwayatSubRow";

// --- KOMPONEN UTAMA ROW ---
export default function PemeriksaanRowView({
  item,
}: {
  item: PasienPemeriksaanOverview;
}) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isModalTambahOpen, setIsModalTambahOpen] = useState(false);

  const { no_rm, nama_lengkap, nik, episodeAktif, riwayat_pemeriksaan } = item;
  const hasRiwayat = riwayat_pemeriksaan && riwayat_pemeriksaan.length > 0;

  return (
    <>
      <tr
        className={`transition-colors ${isExpanded ? "bg-emerald-50/30" : "hover:bg-gray-50"}`}
      >
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
              Episode Aktif
            </span>
          ) : (
            <span className="inline-flex items-center rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-600 border border-slate-200">
              Tidak Ada Episode
            </span>
          )}
        </td>
        <td className="px-6 py-4 whitespace-nowrap text-right text-xs space-x-2">
          {/* Tombol Lihat Log */}
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            disabled={!hasRiwayat}
            className={`rounded px-3 py-1.5 font-semibold transition border ${hasRiwayat ? "bg-gray-100 text-gray-700 border-gray-200 hover:bg-gray-200" : "bg-gray-50 text-gray-300 border-transparent cursor-not-allowed"}`}
          >
            {isExpanded ? "Tutup Data ▴" : "Lihat Data ▾"}
          </button>

          {/* Tombol Tambah Periksa (Hanya muncul jika ada episode aktif) */}
          {episodeAktif && (
            <button
              onClick={() => setIsModalTambahOpen(true)}
              className="rounded bg-emerald-600 px-3 py-1.5 font-semibold text-white hover:bg-emerald-700 transition"
            >
              + Tambah Periksa
            </button>
          )}
        </td>
      </tr>

      {/* DROPDOWN SUB-TABEL RIWAYAT */}
      {isExpanded && (
        <tr>
          <td
            colSpan={4}
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
                      <th className="px-4 py-2 border-b text-right">Aksi</th>
                    </tr>
                  </thead>
                  <tbody>
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
