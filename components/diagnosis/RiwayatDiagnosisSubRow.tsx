"use client";

import { DiagnosisData } from "@/types/diagnosis";
import { useState } from "react";
import DeleteDiagnosisButton from "./DeleteDiagnosisButton";
import EditDiagnosisModal from "./EditDiagnosisModal";
import { EditIcon } from "../asset/icons";

interface Props {
  riwayat: DiagnosisData[];
  id_episode?: number; // Digunakan jika ingin mengamankan aksi
}

export default function RiwayatDiagnosisSubRow({ riwayat }: Props) {
  const [toEdit, setToEdit] = useState<DiagnosisData | null>(null);

  if (riwayat.length === 0) {
    return (
      <div className="text-center py-4 text-sm text-gray-500 bg-white rounded-md border border-gray-200 border-dashed">
        Belum ada riwayat diagnosis untuk pasien ini.
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded border border-gray-200 bg-white shadow-sm">
      <table className="w-full text-left text-sm text-gray-600">
        <thead className="bg-gray-100 text-xs font-semibold text-gray-700">
          <tr>
            <th className="px-4 py-2 border-b">Tanggal & Kode</th>
            <th className="px-4 py-2 border-b">Detail Diagnosa</th>
            <th className="px-4 py-2 border-b">Resistensi</th>
            <th className="px-4 py-2 border-b">Dasar Diagnosa</th>
            <th className="px-4 py-2 border-b text-center">Opsi</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {riwayat.map((diagnosis) => (
            <tr
              key={diagnosis.id_diagnosis}
              className="border-b border-gray-100 hover:bg-gray-50/50 transition"
            >
              <td className="px-4 py-3">
                <div className="font-medium text-gray-800">
                  {diagnosis.tanggal_diagnosis}
                </div>
              </td>
              <td className="px-4 py-3">
                <div className="font-medium text-blue-700">
                  {diagnosis.klasifikasi_anatomi || "-"}
                </div>
                <div className="text-xs text-gray-500">
                  {diagnosis.lokasi_anatomi || "-"}
                </div>
              </td>
              <td className="px-4 py-3">
                <div
                  className={`text-xs font-semibold mt-0.5 ${diagnosis.klasifikasi_resistensi.toLowerCase().includes("resisten") ? "text-red-600" : "text-green-600"}`}
                >
                  {diagnosis.klasifikasi_resistensi}
                </div>
                <div className="text-sm font-medium text-gray-800">
                  {diagnosis.tipe_resistensi || "-"}
                </div>
              </td>
              <td className="px-4 py-3">
                <div className="font-medium text-gray-800">
                  {diagnosis.dasar_diagnosis || "-"}
                </div>
                <div className="text-xs text-gray-500 whitespace-normal break-all leading-relaxed">
                  {diagnosis.catatan_klinis || "-"}
                </div>
              </td>
              <td className="px-4 py-3">
                <div className="flex justify-center items-center gap-2">
                  <button
                    onClick={() => setToEdit(diagnosis)}
                    title="Edit Diagnosis"
                    className="inline-flex p-2 items-center bg-yellow-100 text-yellow-500 rounded-lg hover:bg-yellow-500 hover:text-white transition shadow-sm"
                  >
                    <EditIcon className="w-4 h-4" />
                  </button>
                  <DeleteDiagnosisButton
                    id_diagnosis={diagnosis.id_diagnosis}
                  />
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {toEdit && (
        <EditDiagnosisModal
          data={toEdit}
          isOpen={!!toEdit}
          onClose={() => setToEdit(null)}
        />
      )}
    </div>
  );
}
