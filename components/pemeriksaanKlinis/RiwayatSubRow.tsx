"use client";

import { PemeriksaanKlinisData } from "@/types/pemeriksaanKlinis";
import { hitungBMI } from "@/utils/number";
import { useState, useTransition } from "react";
import EditPemeriksaanModal from "./EditPemeriksaanModal";
import DeletePemeriksaanButton from "./DeletePemeriksaanButton";
import { EditIcon } from "../asset/icons";

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
  const imtData = hitungBMI(periksa.berat_badan, periksa.tinggi_badan);

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
        <div>Suhu: {`${periksa.suhu}°C` || "-"}</div>
        <div>Nadi: {`${periksa.nadi}/menit` || "-"}</div>
      </td>
      <td className="px-4 py-3 text-gray-600 max-w-65 whitespace-normal wrap-break-word leading-relaxed">
        {periksa.keluhan || "-"}
      </td>
      <td className="px-4 py-3">
        {isEditable ? (
          <div className="flex justify-center items-center gap-2">
            <button
              onClick={() => setIsEditOpen(true)}
              disabled={isPending}
              title="Edit Pemeriksaan Klinis"
              className="inline-flex p-2 items-center bg-yellow-100 text-yellow-500 rounded-lg hover:bg-yellow-500 hover:text-white transition shadow-sm"
            >
              <EditIcon className="w-4 h-4" />
            </button>
            <DeletePemeriksaanButton periksa={periksa} />
          </div>
        ) : (
          <span className="flex justify-center text-xs text-gray-400 italic">
            Arsip (Selesai)
          </span>
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
