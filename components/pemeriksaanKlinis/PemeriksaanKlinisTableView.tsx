"use client";

import { useEffect, useMemo, useState } from "react";
import { PasienPemeriksaanOverview } from "@/types/pemeriksaanKlinis";
import TableSearchInput from "@/components/molecules/TableSearchInput";
import PemeriksaanRowView from "./PemeriksaanRowView";

export default function PemeriksaanKlinisTableView({
  data,
}: {
  data: PasienPemeriksaanOverview[];
}) {
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
    return data.filter((d) => d.nama_lengkap.toLowerCase().includes(q));
  }, [data, debouncedQuery]);

  return (
    <div className="space-y-4">
      <TableSearchInput
        value={query}
        onChange={setQuery}
        placeholder="Cari nama pasien..."
      />
      <div className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left text-sm text-gray-500 whitespace-nowrap">
            <thead className="bg-gray-50 text-xs uppercase text-gray-700 font-semibold border-b border-gray-200">
              <tr>
                <th className="px-6 py-3">Nama Pasien & Jenis Kelamin</th>
                <th className="px-6 py-3">Usia & Domisili</th>
                <th className="px-6 py-3">Status Episode</th>
                <th className="px-6 py-3">Total Pemeriksaan</th>
                <th className="px-6 py-3 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filtered.length === 0 ? (
                <tr>
                  <td
                    colSpan={5}
                    className="px-6 py-10 text-center text-gray-400"
                  >
                    {data.length === 0
                      ? "Belum ada data pasien terdaftar."
                      : "Pasien tidak ditemukan."}
                  </td>
                </tr>
              ) : (
                filtered.map((item) => (
                  <PemeriksaanRowView key={item.id_pasien} item={item} />
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
