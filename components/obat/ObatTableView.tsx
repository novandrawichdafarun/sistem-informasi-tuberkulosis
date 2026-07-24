"use client";

import { ObatData } from "@/types/obat";
import EditObatModal from "./EditObatModal";
import DeleteObatButton from "./DeleteObatButton";
import ToggleStatusObat from "./ToggleStatusObat";

interface Props {
  data: ObatData[];
}

export default function ObatTableView({ data }: Props) {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm whitespace-nowrap">
          <thead className="bg-gray-50 border-b border-gray-200 text-gray-600">
            <tr>
              <th className="px-4 py-3 font-semibold">Nama Obat</th>
              <th className="px-4 py-3 font-semibold">Kategori & Jenis</th>
              <th className="px-4 py-3 font-semibold">Dosis</th>
              <th className="px-4 py-3 font-semibold">Deskripsi</th>
              <th className="px-4 py-3 font-semibold">status</th>
              <th className="px-4 py-3 font-semibold text-right">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {data.map((obat) => (
              <tr key={obat.id_obat} className="border-b hover:bg-gray-50">
                <td className="px-4 py-3">
                  <div className="font-medium text-gray-800">
                    {obat.nama_obat}
                  </div>
                </td>
                <td className="px-4 py-3">
                  <div className="font-medium text-blue-700">
                    {obat.kategori_obat}
                  </div>
                  <div className="text-xs text-gray-500">{obat.jenis_obat}</div>
                </td>
                <td className="px-4 py-3">
                  <div className="font-medium text-gray-700">
                    {obat.dosis || "-"}
                  </div>
                </td>
                <td className="px-4 py-3 max-w-65">
                  <div className="text-xs text-gray-500 whitespace-normal break-all leading-relaxed">
                    {obat.deskripsi || "-"}
                  </div>
                </td>
                <td className="px-4 py-3">
                  <ToggleStatusObat
                    id_obat={obat.id_obat}
                    status={obat.is_active}
                  />
                </td>
                <td className="px-4 py-3">
                  <div className="flex gap-3 items-center">
                    <EditObatModal data={obat} />
                    <DeleteObatButton
                      id_obat={obat.id_obat}
                      nama_obat={obat.nama_obat}
                    />
                  </div>
                </td>
              </tr>
            ))}

            {data.length === 0 && (
              <tr>
                <td colSpan={6} className="p-6 text-center text-gray-500">
                  Belum ada data obat
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
