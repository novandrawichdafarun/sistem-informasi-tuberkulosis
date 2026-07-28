"use client";

import { useState } from "react";
import Link from "next/link";
import { PasienResepOverview } from "@/types/resep";
import { ObatData } from "@/types/obat";
import TambahResepModal from "./TambahResepModal";
import DeleteResepButton from "./DeleteResepButton";

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
        className={`transition-colors ${isExpanded ? "bg-blue-50/30" : "hover:bg-gray-50"}`}
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
        <td className="px-6 py-4 whitespace-nowrap text-right text-xs space-x-2">
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
            <div className="p-4 pl-10 border-l-4 border-blue-400 space-y-3">
              {resepList.map((r) => {
                const persen =
                  r.jumlahJadwal > 0
                    ? Math.round((r.jumlahDiminum / r.jumlahJadwal) * 100)
                    : 0;
                return (
                  <div
                    key={r.id_resep}
                    className="rounded-lg border border-gray-200 bg-white p-4"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="font-semibold text-gray-800">
                          {r.kategori_regimen || "-"}{" "}
                          <span className="text-xs font-normal text-gray-400">
                            · Fase {r.fase_pengobatan || "-"}
                          </span>
                        </p>
                        <p className="text-xs text-gray-500">
                          Mulai {r.tanggal_mulai_obat || "-"} ·{" "}
                          {r.durasi_hari || 0} hari
                          {r.statusEpisode !== "aktif" && (
                            <span className="ml-2 rounded bg-slate-100 px-1.5 py-0.5 text-[10px] text-slate-500">
                              episode selesai
                            </span>
                          )}
                        </p>
                      </div>
                      <DeleteResepButton id_resep={r.id_resep} />
                    </div>

                    {/* Obat */}
                    <div className="mt-2 flex flex-wrap gap-1.5">
                      {r.detail_obat.length === 0 ? (
                        <span className="text-xs text-gray-400">
                          Tidak ada obat
                        </span>
                      ) : (
                        r.detail_obat.map((d) => (
                          <span
                            key={d.id_detail_obat}
                            className="rounded-full bg-blue-50 px-2.5 py-0.5 text-xs text-blue-700"
                          >
                            {d.obat?.nama_obat ?? "Obat"}
                            {d.obat?.dosis ? ` ${d.obat.dosis}` : ""}
                          </span>
                        ))
                      )}
                    </div>

                    {/* Kepatuhan */}
                    <div className="mt-3 border-t border-gray-100 pt-2">
                      <div className="flex items-center justify-between text-xs text-gray-500">
                        <span>
                          Kepatuhan: {r.jumlahDiminum}/{r.jumlahJadwal} dosis
                        </span>
                        <span className="font-semibold text-gray-700">
                          {persen}%
                        </span>
                      </div>
                      <div className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-gray-100">
                        <div
                          className="h-full rounded-full bg-emerald-500"
                          style={{ width: `${persen}%` }}
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
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
