"use client";

import { useState } from "react";
import { PillIcon, CheckIcon, ClockIcon } from "../asset/icons";
import ModalLaporObat from "@/components/Laporan/ModalLaporObat";
import { JadwalObatHariIni } from "@/types/laporan";
import { formatJam } from "@/utils/date";

export default function MedicationBanner({
  jadwalList,
}: {
  jadwalList: JadwalObatHariIni[];
}) {
  const [selectedJadwal, setSelectedJadwal] =
    useState<JadwalObatHariIni | null>(null);

  if (!jadwalList || jadwalList.length === 0) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-5">
        <div className="flex items-center gap-4">
          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">
            <PillIcon className="h-7 w-7" />
          </div>
          <div>
            <p className="text-lg font-bold text-brand-950">
              Belum ada jadwal obat hari ini
            </p>
            <p className="mt-0.5 text-sm text-slate-500">
              Jadwal minum obat Anda akan muncul di sini setelah Nakes
              menetapkan resep pengobatan.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h2 className="text-base font-semibold text-brand-950">
            Obat yang harus diminum hari ini
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            Pilih obat yang sudah Anda minum untuk melaporkannya.
          </p>
        </div>
        <span className="rounded-full bg-brand-50 px-3 py-1 text-xs font-semibold text-brand-700">
          {jadwalList.length} jadwal
        </span>
      </div>

      <div className="mt-4 space-y-3">
        {jadwalList.map((item) => {
          const namaObat =
            item.detail_obat?.obat?.nama_obat || "Obat tanpa nama";
          const sudahDilaporkan = Boolean(item.medication_log);
          const telat = item.medication_log?.status === "terlewat";

          return (
            <div
              key={item.id_jadwal}
              className="flex flex-col gap-3 rounded-xl border border-slate-200 p-4 sm:flex-row sm:items-center sm:justify-between"
            >
              <div>
                <p className="font-semibold text-slate-800">{namaObat}</p>
                <p className="mt-1 text-sm text-slate-500">
                  {item.detail_obat?.jumlah_obat_per_minum ?? 0} dosis •{" "}
                  {item.detail_obat?.aturan_pakai || "-"}
                </p>
                <p className="mt-2 text-xs text-slate-400">
                  Jadwal pukul {formatJam(item.jam_jadwal)}
                </p>
              </div>

              {sudahDilaporkan ? (
                telat ? (
                  <span
                    title="Lapor telat — lebih dari 1 jam dari jadwal"
                    className="inline-flex items-center rounded-full bg-amber-50 px-3 py-1 text-sm font-semibold text-amber-700"
                  >
                    <ClockIcon className="mr-1 h-4 w-4" />
                    Dilaporkan (telat)
                  </span>
                ) : (
                  <span className="inline-flex items-center rounded-full bg-green-50 px-3 py-1 text-sm font-semibold text-green-700">
                    <CheckIcon className="mr-1 h-4 w-4" />
                    Sudah dilaporkan
                  </span>
                )
              ) : (
                <button
                  type="button"
                  onClick={() => setSelectedJadwal(item)}
                  className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-brand-700"
                >
                  Lapor sudah minum
                </button>
              )}
            </div>
          );
        })}
      </div>
      {selectedJadwal && (
        <ModalLaporObat
          idJadwal={selectedJadwal.id_jadwal}
          namaObat={selectedJadwal.detail_obat?.obat?.nama_obat || "Obat"}
          waktuMinum={formatJam(selectedJadwal.jam_jadwal)}
          onClose={() => setSelectedJadwal(null)}
        />
      )}
    </div>
  );
}
