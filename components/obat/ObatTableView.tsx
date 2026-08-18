"use client";

import { useMemo, useState, useEffect } from "react";
import { ObatData } from "@/types/obat";
import TableSearchInput from "@/components/molecules/TableSearchInput";
import EditObatModal from "./EditObatModal";
import DeleteObatButton from "./DeleteObatButton";
import ToggleStatusObat from "./ToggleStatusObat";
import TambahObatModal from "./TambahObatModal";

interface Props {
  data: ObatData[];
}

export default function ObatTableView({ data }: Props) {
  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState(query);

  useEffect(() => {
    const t = setTimeout(
      () => setDebouncedQuery(query.trim().toLowerCase()),
      500,
    );
    return () => clearTimeout(t);
  }, [query]);

  const filtered = useMemo(() => {
    const q = debouncedQuery;
    if (!q) return data;
    return data.filter(
      (o) =>
        o.nama_obat.toLowerCase().includes(q) ||
        (o.dosis || "").toLowerCase().includes(q),
    );
  }, [data, debouncedQuery]);

  return (
    <div className="space-y-4">
      <div className="flex justify-between">
        <div className="w-auto sm:flex-1">
          <TableSearchInput
            value={query}
            onChange={setQuery}
            placeholder="Cari nama / dosis obat..."
          />
        </div>
        <div className="flex justify-end w-auto">
          <TambahObatModal />
        </div>
      </div>
      <div className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-gray-50 border-b border-gray-200 text-gray-600">
              <tr>
                <th className="px-4 py-3 font-semibold">Nama Obat</th>
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
                    <div className="font-bold text-gray-800">
                      {obat.nama_obat}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="font-medium text-gray-700">
                      {`${obat.dosis} mg` || "-"}
                    </div>
                  </td>
                  <td className="px-4 py-3 max-w-65">
                    <div className="text-xs text-gray-500 whitespace-normal wrap-break-word leading-relaxed">
                      {obat.deskripsi || "-"}
                    </div>
                  </td>
                  <td className="px-4 py-3 items-center text-center justify-center align-middle">
                    <ToggleStatusObat
                      id_obat={obat.id_obat}
                      status={obat.is_active}
                    />
                  </td>
                  <td className="px-4 py-3">
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
                  <td colSpan={5} className="p-6 text-center text-gray-500">
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
