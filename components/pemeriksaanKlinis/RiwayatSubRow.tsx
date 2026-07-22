"use client";

import { PemeriksaanKlinisData } from "@/types/pemeriksaanKlinis";
import { hitungIMT } from "@/utils/number";
import { useState, useTransition } from "react";
import EditPemeriksaanModal from "./EditPemeriksaanModal";
import DeletePemeriksaanButton from "./DeletePemeriksaanButton";

export default function RiwayatSubRow({
  periksa,
  id_episode_aktif,
}: {
  periksa: PemeriksaanKlinisData;
  id_episode_aktif?: number;
}) {
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isPending] = useTransition();

  // Super admin hanya bisa mengedit/menghapus data jika data tersebut milik episode yang sedang aktif
  const isEditable = periksa.id_episode === id_episode_aktif;
  const imtData = hitungIMT(periksa.berat_badan, periksa.tinggi_badan);

  return (
    <tr className="border-b border-gray-100 hover:bg-gray-50/50 transition">
      <td className="px-4 py-3 font-medium text-gray-700">
        {periksa.tanggal_periksa}
      </td>
      <td className="px-4 py-3">
        <div>
          BB:{" "}
          <span className="font-semibold">{periksa.berat_badan || "-"}</span> kg
        </div>
        <div>
          TB:{" "}
          <span className="font-semibold">{periksa.tinggi_badan || "-"}</span>{" "}
          cm
        </div>

        {/* TAMPILAN IMT */}
        {imtData && (
          <div className="mt-1 pt-1 border-t border-gray-200 flex items-center gap-1.5">
            <span className="text-xs text-gray-500">IMT:</span>
            <span className="font-bold text-xs text-gray-700">
              {imtData.nilai}
            </span>
            <span
              className={`px-1.5 py-0.5 rounded text-[10px] font-semibold uppercase tracking-wider ${imtData.colorClass}`}
            >
              {imtData.kategori}
            </span>
          </div>
        )}
      </td>
      <td className="px-4 py-3">
        <div>Tensi: {periksa.tensi || "-"}</div>
        <div>Suhu: {periksa.suhu ? `${periksa.suhu}°C` : "-"}</div>
      </td>
      <td className="px-4 py-3 text-gray-600">{periksa.keluhan || "-"}</td>
      <td className="px-4 py-3 text-right space-x-2">
        {isEditable ? (
          <>
            <button
              onClick={() => setIsEditOpen(true)}
              disabled={isPending}
              className="text-blue-600 hover:text-blue-800 text-xs font-medium px-2"
            >
              Edit
            </button>
            <DeletePemeriksaanButton periksa={periksa} />
          </>
        ) : (
          <span className="text-xs text-gray-400 italic">Arsip (Selesai)</span>
        )}

        <EditPemeriksaanModal
          periksa={periksa}
          isOpen={isEditOpen}
          onClose={() => setIsEditOpen(false)}
        />
      </td>
    </tr>
  );
}
