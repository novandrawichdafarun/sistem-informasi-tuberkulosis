"use client";

import { useMemo, useState } from "react";
import { ObatData } from "@/types/obat";
import TableSearchInput from "@/components/molecules/TableSearchInput";
import EditObatModal from "./EditObatModal";
import DeleteObatButton from "./DeleteObatButton";
import ToggleStatusObat from "./ToggleStatusObat";

interface Props {
  data: ObatData[];
}

export default function ObatTableView({ data }: Props) {
  const [query, setQuery] = useState("");
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return data;
    return data.filter(
      (o) =>
        o.nama_obat.toLowerCase().includes(q) ||
        (o.kategori_obat || "").toLowerCase().includes(q) ||
        (o.jenis_obat || "").toLowerCase().includes(q),
    );
  }, [data, query]);

  return (
    <div className="space-y-4">
      <TableSearchInput
        value={query}
        onChange={setQuery}
        placeholder="Cari nama / kategori obat..."
      />
      <div className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
          <thead className="bg-gray-50 border-b border-gray-200 text-gray-600">
            <tr>
              <th className="px-4 py-3 font-semibold">Nama Obat</th>
              <th className="px-4 py-3 font-semibold">Kategori & Jenis</th>
              <th className="px-4 py-3 font-semibold">Dosis</th>
              <th className="px-4 py-3 font-semibold">Deskripsi</th>
              <th className="px-4 py-3 font-semibold text-center">status</th>
              <th className="px-4 py-3 font-semibold text-center">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {filtered.map((obat) => (
              <tr
                key={obat.id_obat}
                className="hover:bg-gray-50 transition-colors group"
              >
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
                <td className="px-4 py-3 items-center text-center">
                  <ToggleStatusObat
                    id_obat={obat.id_obat}
                    status={obat.is_active}
                  />
                </td>
                <td className="px-4 py-3 text-center">
                  <div className="flex gap-2 items-center justify-center">
                    <EditObatModal data={obat} />
                    <DeleteObatButton
                      id_obat={obat.id_obat}
                      nama={obat.nama_obat}
                    />
                  </div>
                </td>
              </tr>
            ))}

            {filtered.length === 0 && (
              <tr>
                <td colSpan={6} className="p-6 text-center text-gray-500">
                  {data.length === 0
                    ? "Belum ada data obat"
                    : "Obat tidak ditemukan."}
                </td>
              </tr>
            )}
          </tbody>
        </table>
        </div>
      </div>
    </div>
  );
}
