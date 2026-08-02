"use client";

import { useMemo, useState } from "react";
import { LaporanMakanPasienOverview } from "@/types/laporanMakan";
import { SearchIcon } from "../asset/icons";
import LaporanMakanRowView from "./LaporanMakanRowView";

export default function LaporanMakanAdminTable({
  rows,
}: {
  rows: LaporanMakanPasienOverview[];
}) {
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return rows;
    return rows.filter((r) => r.nama_pasien.toLowerCase().includes(q));
  }, [rows, query]);

  return (
    <div className="space-y-4">
      {/* Pencarian data pasien */}
      <div className="relative max-w-sm">
        <SearchIcon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Cari nama pasien..."
          aria-label="Cari nama pasien"
          className="w-full rounded-lg border border-gray-300 bg-white py-2 pl-9 pr-3 text-sm text-gray-700 outline-none transition-colors focus:border-brand-400 focus:ring-1 focus:ring-brand-400"
        />
      </div>

      <div className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse whitespace-nowrap text-left text-sm text-gray-500">
            <thead className="bg-gray-50 text-xs uppercase text-gray-700 font-semibold border-b border-gray-200">
              <tr>
                <th className="px-6 py-3">Nama Pasien</th>
                <th className="px-6 py-3">Total Laporan</th>
                <th className="px-6 py-3">Laporan Terakhir</th>
                <th className="px-6 py-3 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-10 text-center text-gray-400">
                    {rows.length === 0
                      ? "Belum ada laporan makan dari pasien."
                      : "Pasien tidak ditemukan."}
                  </td>
                </tr>
              ) : (
                filtered.map((r) => (
                  <LaporanMakanRowView key={r.id_pasien} data={r} />
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
