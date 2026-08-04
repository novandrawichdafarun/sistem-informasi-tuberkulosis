"use client";

import { useState } from "react";
import Link from "next/link";
import ResepCard from "./ResepCard";
import TambahResepModal from "./TambahResepModal";
import { DetailIcon, PlusIcon, CalendarIcon } from "@/components/asset/icons";
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
        <td className="px-6 py-4 whitespace-nowrap text-center">
          <div className="flex justify-center items-center gap-2">
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              disabled={!hasResep}
              title={
                hasResep
                  ? isExpanded
                    ? "Tutup resep"
                    : "Lihat resep"
                  : "Belum ada resep"
              }
              className={`flex p-2 items-center rounded-lg transition shadow-sm ${
                hasResep
                  ? "bg-blue-100 text-blue-500 hover:bg-blue-500 hover:text-white"
                  : "bg-gray-100 text-gray-300 cursor-not-allowed"
              }`}
            >
              <DetailIcon className="w-4 h-4" />
            </button>

            {episodeAktif ? (
              <button
                onClick={() => setIsTambahOpen(true)}
                title="Tambah resep"
                className="flex p-2 items-center bg-brand-100 text-brand-600 rounded-lg hover:bg-brand-600 hover:text-white transition shadow-sm"
              >
                <PlusIcon className="w-4 h-4" />
              </button>
            ) : (
              <Link
                href="/dashboard/episode-pengobatan"
                className="flex p-2 items-center bg-amber-100 text-amber-600 rounded-lg hover:bg-amber-500 hover:text-white transition shadow-sm"
                title="Buka episode dulu — resep hanya bisa ditambah pada episode aktif"
              >
                <CalendarIcon className="w-4 h-4" />
              </Link>
            )}
          </div>
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
