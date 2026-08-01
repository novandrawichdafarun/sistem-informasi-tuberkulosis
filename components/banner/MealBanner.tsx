"use client";

import { RiwayatLaporanMakan } from "@/types/laporan";
import { formatJam } from "@/utils/date";
import { useState } from "react";
import ModalLaporMakan from "../Laporan/ModalLaporMakan";

interface MealBannerProps {
  todaysReports: RiwayatLaporanMakan[];
}

export default function MealBanner({ todaysReports }: MealBannerProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const reportCount = todaysReports.length;
  const maxReached = reportCount >= 3;

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h2 className="text-base font-semibold text-brand-950">
            Laporan Makan Hari Ini
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            Catat makanan yang Anda makan agar Nakes bisa memantau asupan harian
            Anda.
          </p>
        </div>

        <span
          className={`rounded-full px-3 py-1 text-xs font-semibold ${
            maxReached
              ? "bg-amber-100 text-amber-700"
              : "bg-brand-50 text-brand-700"
          }`}
        >
          {reportCount} / 3 laporan
        </span>
      </div>

      <div className="mt-4 space-y-3">
        <div className="flex flex-col gap-3 rounded-xl border border-slate-200 p-4 sm:flex-row sm:items-center sm:justify-between">
          {reportCount === 0 ? (
            <p>
              Belum ada laporan makan hari ini. Mulai laporkan makanan Anda
              sekarang.
            </p>
          ) : (
            <div>
              {todaysReports.map((report) => (
                <div
                  key={report.id_laporan}
                  className="p-4 text-sm text-slate-700"
                >
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="font-medium text-slate-900">
                        {formatJam(report.waktu_makan)}
                      </p>
                      <p className="text-slate-500">
                        {report.karbo}, {report.protein}, {report.serat}
                      </p>
                    </div>
                    <span className="rounded-full bg-brand-100 px-3 py-1 text-xs font-semibold text-brand-700">
                      Terlapor
                    </span>
                  </div>
                  {report.catatan ? (
                    <p className="mt-3 rounded-2xl bg-white p-3 text-xs text-slate-600">
                      Catatan: {report.catatan}
                    </p>
                  ) : null}
                </div>
              ))}
            </div>
          )}

          <button
            type="button"
            onClick={() => setIsModalOpen(true)}
            disabled={maxReached}
            className={`rounded-lg px-4 py-2 text-sm font-semibold transition ${
              maxReached
                ? "cursor-not-allowed bg-slate-200 text-slate-500"
                : "bg-brand-600 text-white hover:bg-brand-700"
            }`}
          >
            {maxReached ? "Batas laporan tercapai" : "Laporkan makan baru"}
          </button>

          {isModalOpen && (
            <ModalLaporMakan onClose={() => setIsModalOpen(false)} />
          )}
        </div>

        {maxReached ? (
          <p className="mt-4 rounded-2xl bg-amber-50 p-4 text-sm text-amber-700">
            Anda telah melaporkan makan 3 kali hari ini. Batas maksimal laporan
            sudah tercapai.
          </p>
        ) : null}
      </div>
    </div>
  );
}
