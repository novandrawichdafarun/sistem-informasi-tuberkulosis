// components/pemeriksaanLab/RiwayatLabSubRow.tsx
"use client";

import { PemeriksaanLabData } from "@/types/pemeriksaanLab";
import { useState } from "react";
import DeleteLabButton from "./DeleteLabButton";
import EditLabModal from "./EditLabModal";
import { EditIcon } from "../asset/icons";

interface Props {
  riwayat: PemeriksaanLabData[];
  id_episode?: number; // Digunakan jika ingin mengamankan aksi
}

export default function RiwayatLabSubRow({ riwayat }: Props) {
  const [labToEdit, setLabToEdit] = useState<PemeriksaanLabData | null>(null);

  if (riwayat.length === 0) {
    return (
      <div className="text-center py-4 text-sm text-gray-500 bg-white rounded-md border border-gray-200 border-dashed">
        Belum ada riwayat pemeriksaan lab untuk pasien ini.
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded border border-gray-200 bg-white shadow-sm">
      <table className="w-full text-left text-sm text-gray-600 whitespace-nowrap">
        <thead className="bg-gray-100 text-xs font-semibold text-gray-700">
          <tr>
            <th className="px-4 py-2 border-b">Tanggal Tes</th>
            <th className="px-4 py-2 border-b">Jenis Tes</th>
            <th className="px-4 py-2 border-b">Detail Sample</th>
            <th className="px-4 py-2 border-b">Hasil Tes</th>
            <th className="px-4 py-2 border-b text-center">Opsi</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {riwayat.map((lab) => (
            <tr
              key={lab.id_tes}
              className="border-b border-gray-100 hover:bg-gray-50/50 transition"
            >
              <td className="px-4 py-3">
                <div className="font-medium text-gray-800">
                  {lab.tanggal_tes}
                </div>
                <div className="text-xs text-gray-500">
                  {lab.periode_pemeriksaan || "-"}
                </div>
              </td>
              <td className="px-4 py-3">
                <div className="font-medium text-blue-700">{lab.jenis_tes}</div>
              </td>
              <td className="px-4 py-3 text-sm">
                <div>
                  DNA:{" "}
                  <span className="font-medium text-gray-800">
                    {lab.dna_bakteri_tb}
                  </span>
                </div>
                <div>
                  Status:{" "}
                  <span
                    className={`font-semibold mt-0.5 ${lab.status_resistensi.toLowerCase().includes("resisten") ? "text-red-600" : "text-green-600"}`}
                  >
                    {lab.status_resistensi}
                  </span>
                </div>
                <div>
                  Jenis Sample:{" "}
                  <span className="font-medium">{lab.jenis_sample || "-"}</span>
                </div>
                <div>
                  Kualitas Sample:{" "}
                  <span className="font-medium">
                    {lab.kualitas_sample || "-"}
                  </span>
                </div>
              </td>
              <td className="px-4 py-3">
                <div>
                  <span
                    className={`inline-flex px-2 py-1 rounded text-xs font-semibold ${
                      lab.hasil_tes.toLowerCase().includes("positif")
                        ? "bg-red-100 text-red-700"
                        : lab.hasil_tes.toLowerCase().includes("negatif")
                          ? "bg-green-100 text-green-700"
                          : "bg-gray-100 text-gray-700"
                    }`}
                  >
                    {lab.hasil_tes}
                  </span>
                </div>
                <div>
                  BTA:{" "}
                  <span className="inline-flex px-2 py-1 rounded text-xs font-semibold bg-gray-100 text-gray-700 mt-1">
                    {lab.hasil_bta || "-"}
                  </span>
                </div>
              </td>
              <td className="px-4 py-3">
                <div className="flex justify-center items-center gap-2">
                  <button
                    onClick={() => setLabToEdit(lab)}
                    title="Edit Pemeriksaan Lab"
                    className="inline-flex p-2 items-center bg-yellow-100 text-yellow-500 rounded-lg hover:bg-yellow-500 hover:text-white transition shadow-sm"
                  >
                    <EditIcon className="w-4 h-4" />
                  </button>
                  <DeleteLabButton id_tes={lab.id_tes} />
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {labToEdit && (
        <EditLabModal
          data={labToEdit}
          isOpen={!!labToEdit}
          onClose={() => setLabToEdit(null)}
        />
      )}
    </div>
  );
}
