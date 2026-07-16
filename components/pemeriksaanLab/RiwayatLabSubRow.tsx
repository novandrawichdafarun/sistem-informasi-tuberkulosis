// components/pemeriksaanLab/RiwayatLabSubRow.tsx
"use client";

import { PemeriksaanLabData } from "@/types/pemeriksaanLab";
import { useState } from "react";
import DeleteLabButton from "./DeleteLabButton";
import EditLabModal from "./EditLabModal";

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
    <div className="bg-white border border-gray-200 rounded-md shadow-sm overflow-hidden">
      <table className="w-full text-left text-sm">
        <thead className="bg-gray-100/80 border-b border-gray-200 text-gray-600">
          <tr>
            <th className="px-4 py-3 font-medium">Tanggal Tes</th>
            <th className="px-4 py-3 font-medium">Jenis Tes</th>
            <th className="px-4 py-3 font-medium">Hasil</th>
            <th className="px-4 py-3 font-medium">Periode Bulanan</th>
            <th className="px-4 py-3 font-medium text-right">Opsi</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {riwayat.map((lab) => (
            <tr key={lab.id_tes} className="hover:bg-gray-50/50">
              <td className="px-4 py-3">{lab.tanggal_tes}</td>
              <td className="px-4 py-3 font-medium text-gray-800">
                {lab.jenis_tes}
              </td>
              <td className="px-4 py-3">
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
              </td>
              <td className="px-4 py-3 text-gray-500">
                {lab.periode_bulanan || "-"}
              </td>
              <td className="px-4 py-3 text-right space-x-2">
                <button
                  onClick={() => setLabToEdit(lab)}
                  className="text-blue-600 hover:text-blue-800 text-xs font-medium"
                >
                  Edit
                </button>
                <DeleteLabButton id_tes={lab.id_tes} />
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
