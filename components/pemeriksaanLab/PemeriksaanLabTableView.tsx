"use client";

import { useMemo, useState } from "react";
import { PasienPemeriksaanLabOverview } from "@/types/pemeriksaanLab";
import TableSearchInput from "@/components/molecules/TableSearchInput";
import PemeriksaanLabRowView from "./PemeriksaanLabRowView";

export default function PemeriksaanLabTableView({
  data,
}: {
  data: PasienPemeriksaanLabOverview[];
}) {
  const [query, setQuery] = useState("");
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return data;
    return data.filter((d) => d.nama_lengkap.toLowerCase().includes(q));
  }, [data, query]);

  return (
    <div className="space-y-4">
      <TableSearchInput
        value={query}
        onChange={setQuery}
        placeholder="Cari nama pasien..."
      />
      <div className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse whitespace-nowrap text-left text-sm text-gray-500">
            <thead className="bg-gray-50 text-xs uppercase text-gray-700 font-semibold border-b border-gray-200">
              <tr>
                <th className="px-6 py-4">Nama Pasien & Jenis Kelamin</th>
                <th className="px-6 py-4">Usia & Domisili</th>
                <th className="px-6 py-4">Status Episode</th>
                <th className="px-6 py-4">Total Pemeriksaan</th>
                <th className="px-6 py-4 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-10 text-center text-gray-400">
                    {data.length === 0
                      ? "Belum ada data pasien atau pemeriksaan lab."
                      : "Pasien tidak ditemukan."}
                  </td>
                </tr>
              ) : (
                filtered.map((pasien) => (
                  <PemeriksaanLabRowView key={pasien.id_pasien} data={pasien} />
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
