"use client";

import { useState } from "react";
import { LaporanMakanPasienOverview } from "@/types/laporanMakan";
import { formatWaktuID } from "@/utils/date";
import { DetailIcon } from "../asset/icons";

export default function LaporanMakanRowView({
  data,
}: {
  data: LaporanMakanPasienOverview;
}) {
  const [isExpanded, setIsExpanded] = useState(false);
  const { nama_pasien, jenis_kelamin, total, terakhir, laporan } = data;

  return (
    <>
      <tr
        className={`transition-colors ${
          isExpanded ? "bg-emerald-50/30" : "hover:bg-gray-50"
        }`}
      >
        <td className="px-6 py-4 whitespace-nowrap">
          <div className="font-medium text-gray-800">{nama_pasien}</div>
          <div className="text-xs text-gray-400">
            {jenis_kelamin === "L"
              ? "Laki-laki"
              : jenis_kelamin === "P"
                ? "Perempuan"
                : "-"}
          </div>
        </td>

        <td className="px-6 py-4 whitespace-nowrap text-xs text-gray-600">
          <span className="font-semibold text-gray-700">{total}</span> laporan
        </td>

        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
          {formatWaktuID(terakhir)}
        </td>

        <td className="px-6 py-4 whitespace-nowrap text-center">
          <div className="flex justify-center items-center gap-2">
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              title={isExpanded ? "Tutup detail" : "Lihat selengkapnya"}
              aria-label="Lihat selengkapnya"
              className="inline-flex p-2 items-center bg-blue-100 text-blue-500 rounded-lg hover:bg-blue-500 hover:text-white transition shadow-sm"
            >
              <DetailIcon className="w-4 h-4" />
            </button>
          </div>
        </td>
      </tr>

      {isExpanded && (
        <tr>
          <td
            colSpan={4}
            className="bg-slate-50 border-b border-gray-200 p-0 shadow-inner"
          >
            <div className="p-4 pl-10 border-l-4 border-brand-400">
              <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">
                Riwayat Laporan Makan ({total})
              </h4>
              <div className="overflow-hidden rounded border border-gray-200 bg-white shadow-sm">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm text-gray-600 whitespace-nowrap">
                    <thead className="bg-gray-100 text-xs font-semibold text-gray-700">
                      <tr>
                        <th className="px-4 py-2 border-b">Waktu Makan</th>
                        <th className="px-4 py-2 border-b">Karbohidrat</th>
                        <th className="px-4 py-2 border-b">Protein</th>
                        <th className="px-4 py-2 border-b">Serat</th>
                        <th className="px-4 py-2 border-b">Catatan</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {laporan.map((item) => (
                        <tr key={item.id_laporan} className="hover:bg-gray-50/50">
                          <td className="px-4 py-3 font-medium text-gray-800">
                            {formatWaktuID(item.waktu_makan)}
                          </td>
                          <td className="px-4 py-3">{item.karbo}</td>
                          <td className="px-4 py-3">{item.protein}</td>
                          <td className="px-4 py-3">{item.serat}</td>
                          <td className="px-4 py-3 whitespace-normal max-w-[16rem]">
                            {item.catatan || "-"}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </td>
        </tr>
      )}
    </>
  );
}
