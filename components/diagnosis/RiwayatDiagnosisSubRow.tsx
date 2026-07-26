"use client";

import { DiagnosisData } from "@/types/diagnosis";
import { useState } from "react";
import DeleteDiagnosisButton from "./DeleteDiagnosisButton";
import EditDiagnosisModal from "./EditDiagnosisModal";

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
    <div className="bg-white border border-gray-200 rounded-md shadow-sm overflow-hidden">
      <table className="w-full text-left text-sm">
        <thead className="bg-gray-100/80 border-b border-gray-200 text-gray-600">
          <tr>
            <th className="px-4 py-3 font-medium">Tanggal & Kode</th>
            <th className="px-4 py-3 font-medium">Detail Diagnosa</th>
            <th className="px-4 py-3 font-medium">Resistensi</th>
            <th className="px-4 py-3 font-medium">Dasar Diagnosa</th>
            <th className="px-4 py-3 font-medium text-right">Opsi</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {riwayat.map((diagnosis) => (
            <tr key={diagnosis.id_diagnosis} className="hover:bg-gray-50/50">
              <td className="px-4 py-3">
                <div className="font-medium text-gray-800">
                  {diagnosis.tanggal_diagnosis}
                </div>
                <div className="text-xs text-gray-500">
                  {diagnosis.kode_icd10}
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
                <div className="text-xs text-gray-500">
                  {diagnosis.catatan_klinis || "-"}
                </div>
              </td>
              <td className="px-4 py-3 text-right space-x-2">
                <button
                  onClick={() => setToEdit(diagnosis)}
                  className="text-blue-600 hover:text-blue-800 text-xs font-medium"
                >
                  Edit
                </button>
                <DeleteDiagnosisButton id_diagnosis={diagnosis.id_diagnosis} />
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
