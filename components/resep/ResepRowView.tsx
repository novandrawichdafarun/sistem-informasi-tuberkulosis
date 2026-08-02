"use client";

import { useState } from "react";
import Link from "next/link";
import ResepCard from "./ResepCard";
import TambahResepModal from "./TambahResepModal";
import { PasienResepOverview } from "@/types/resep";
import { ObatData } from "@/types/obat";

export default function ResepRowView({
  item,
  obatList,
}: {
  item: PasienResepOverview;
  obatList: ObatData[];
}) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isTambahOpen, setIsTambahOpen] = useState(false);

  const { nama_lengkap, usia, jenis_kelamin, episodeAktif, resepList } = item;
  const hasResep = resepList.length > 0;

  return (
    <>
      <tr
        className={`transition-colors ${
          isExpanded ? "bg-blue-50/30" : "hover:bg-gray-50"
        }`}
      >
        <td className="px-6 py-4 whitespace-nowrap">
          <div className="font-medium text-gray-900">{usia || "-"}</div>
          <div className="text-xs text-gray-400">
            {jenis_kelamin === "L" ? "Laki-laki" : "Perempuan"}
          </div>
        </td>
        <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-800">
          {nama_lengkap}
        </td>
        <td className="px-6 py-4 whitespace-nowrap">
          {episodeAktif ? (
            <span className="inline-flex items-center rounded-full bg-blue-50 px-2.5 py-0.5 text-xs font-medium text-blue-700 border border-blue-100">
              Episode Aktif
            </span>
          ) : (
            <span className="inline-flex items-center rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-600 border border-slate-200">
              Tidak Ada Episode
            </span>
          )}
          <span className="ml-2 text-xs text-gray-400">
            {resepList.length} resep
          </span>
        </td>
        <td className="px-6 py-4 whitespace-nowrap text-center text-xs space-x-2">
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            disabled={!hasResep}
            className={`rounded px-3 py-1.5 font-semibold transition border ${
              hasResep
                ? "bg-gray-100 text-gray-700 border-gray-200 hover:bg-gray-200"
                : "bg-gray-50 text-gray-300 border-transparent cursor-not-allowed"
            }`}
          >
            {isExpanded ? "Tutup ▴" : "Lihat Resep ▾"}
          </button>

          {episodeAktif ? (
            <button
              onClick={() => setIsTambahOpen(true)}
              className="rounded bg-brand-600 px-3 py-1.5 font-semibold text-white hover:bg-brand-700 transition"
            >
              + Tambah Resep
            </button>
          ) : (
            <Link
              href="/dashboard/episode-pengobatan"
              className="rounded border border-amber-200 bg-amber-50 px-3 py-1.5 font-semibold text-amber-700 hover:bg-amber-100 transition"
            >
              Buka Episode dulu →
            </Link>
          )}
        </td>
      </tr>

      {isExpanded && (
        <tr>
          <td
            colSpan={4}
            className="bg-slate-50 border-b border-gray-200 p-0 shadow-inner"
          >
            <div className="p-4 pl-10 border-l-4 border-brand-400 space-y-3">
              {resepList.map((r) => (
                <ResepCard key={r.id_resep} resep={r} />
              ))}
            </div>
          </td>
        </tr>
      )}

      {episodeAktif && (
        <TambahResepModal
          id_episode={episodeAktif.id_episode}
          obatList={obatList}
          isOpen={isTambahOpen}
          onClose={() => setIsTambahOpen(false)}
        />
      )}
    </>
  );
}
