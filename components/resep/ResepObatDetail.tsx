"use client";

import type { DetailObatData, JadwalMinumObatData } from "@/types/resep";

type Props = {
  detail: DetailObatData;
  jadwal: JadwalMinumObatData[];
};

export default function ResepObatDetail({ detail, jadwal }: Props) {
  const tanggalList = jadwal.map((item) => item.tanggal_jadwal).sort();
  const tanggalMulai = tanggalList[0] ?? "-";
  const tanggalSelesai = tanggalList[tanggalList.length - 1] ?? "-";
  const jamList = Array.from(
    new Set(jadwal.map((item) => item.jam_jadwal)),
  ).sort();

  return (
    <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
      <div className="flex items-center justify-between gap-3">
        <div>
          <div className="font-semibold text-gray-900">
            {detail.obat?.nama_obat ?? "Obat tidak diketahui"}
          </div>
          <div className="text-xs text-gray-500">
            {detail.obat?.dosis ?? "-"} · {detail.frekuensi_minum ?? "-"}
          </div>
        </div>
        <span className="rounded-full border border-slate-200 bg-white px-2 py-1 text-[11px] text-slate-600">
          {jadwal.length} jadwal
        </span>
      </div>

      <div className="grid gap-2 text-xs text-gray-500 mt-3">
        <div>Aturan pakai: {detail.aturan_pakai || "-"}</div>
        <div>
          Periode: {tanggalMulai} — {tanggalSelesai}
        </div>
        <div>Jam: {jamList.length > 0 ? jamList.join(", ") : "-"}</div>
        <div>
          Jumlah per minum:{" "}
          <span className="font-semibold text-gray-700">
            {detail.jumlah_obat_per_minum ?? "-"}
          </span>
        </div>
      </div>
    </div>
  );
}
