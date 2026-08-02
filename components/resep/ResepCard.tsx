"use client";

import DeleteResepButton from "./DeleteResepButton";
import ResepObatDetail from "./ResepObatDetail";
import type { ResepData } from "@/types/resep";

type Props = {
  resep: ResepData;
};

export default function ResepCard({ resep }: Props) {
  return (
    <div className="rounded-lg border border-gray-200 bg-white p-4 w-full">
      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between gap-3">
          <div>
            <div className="font-semibold text-gray-900">
              {resep.kategori_regimen || "-"}{" "}
              <span className="text-xs font-normal text-gray-400">
                · Fase {resep.fase_pengobatan || "-"}
              </span>
            </div>
            <div className="text-xs text-gray-500">
              Mulai {resep.tanggal_mulai_obat || "-"} · {resep.durasi_hari || 0}{" "}
              hari
              {resep.statusEpisode !== "aktif" && (
                <span className="ml-2 rounded bg-slate-100 px-1.5 py-0.5 text-[10px] text-slate-500">
                  episode selesai
                </span>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="rounded-full border border-slate-200 bg-slate-50 px-2 py-1 text-[11px] text-slate-600">
              {resep.jadwal_minum_obat?.length ?? 0} jadwal
            </span>
            <DeleteResepButton id_resep={resep.id_resep} />
          </div>
        </div>

        <div className="grid gap-3">
          {resep.detail_obat.length === 0 ? (
            <div className="text-xs text-gray-500">Tidak ada detail obat.</div>
          ) : (
            resep.detail_obat.map((detail) => (
              <ResepObatDetail
                key={detail.id_detail_obat}
                detail={detail}
                jadwal={
                  resep.jadwal_minum_obat?.filter(
                    (jadwal) => jadwal.id_detail_obat === detail.id_detail_obat,
                  ) ?? []
                }
              />
            ))
          )}
        </div>
      </div>
    </div>
  );
}
