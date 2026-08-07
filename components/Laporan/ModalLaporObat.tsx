"use client";

import React, { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { submitLaporanObatAction } from "@/actions/laporan";
import { ReporterRole } from "@/types/laporan";
import { cencelBtnClass, submitBtnClass } from "@/utils/classTailwind";
import { formatRemainingTime, formatTimeOnly, todayISO } from "@/utils/date";

interface ModalLaporObatProps {
  idJadwal: number;
  namaObat: string;
  waktuMinum: string;
  onClose: () => void;
}

export default function ModalLaporObat({
  idJadwal,
  namaObat,
  waktuMinum,
  onClose,
}: ModalLaporObatProps) {
  const router = useRouter();
  const [catatan, setCatatan] = useState("");
  const [reportedBy, setReportedBy] = useState<ReporterRole>("pasien");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const [currentTime, setCurrentTime] = useState(() => Date.now());
  const [today] = useState(() => todayISO());

  useEffect(() => {
    const interval = setInterval(() => setCurrentTime(Date.now()), 10000);
    return () => clearInterval(interval);
  }, []);

  const jadwalWaktu = new Date(`${today}T${waktuMinum}:00`);
  const terlambatBatas = new Date(jadwalWaktu.getTime() + 60 * 60 * 1000);
  const isCurrentlyLate = currentTime > terlambatBatas.getTime();
  const remainingMs = terlambatBatas.getTime() - currentTime;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    startTransition(async () => {
      const formData = new FormData();
      formData.append("id_jadwal", String(idJadwal));
      formData.append("catatan_kepatuhan", catatan);
      formData.append("reported_by", reportedBy);

      const response = await submitLaporanObatAction(formData);

      if (response.success) {
        setError("");
        router.refresh();
        setTimeout(() => {
          onClose();
        }, 1000);
      } else {
        setError(response.error ?? "Gagal mengirim laporan");
      }
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-lg">
        <h3 className="text-lg font-bold text-gray-900 mb-4">
          Lapor Minum Obat
        </h3>
        <p className="text-sm text-gray-500">
          {namaObat} - Jadwal: {waktuMinum}
        </p>

        {error && (
          <div className="mb-4 rounded bg-red-50 p-3 text-sm text-red-600 border border-red-200">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Catatan
              {isCurrentlyLate && <span className="text-red-500"> *</span>}
            </label>
            <textarea
              value={catatan}
              onChange={(e) => setCatatan(e.target.value)}
              placeholder={
                isCurrentlyLate
                  ? "Tuliskan alasan keterlambatan..."
                  : "Catatan tambahan (opsional)..."
              }
              className="h-24 w-full rounded-md border border-gray-300 p-2"
              required={isCurrentlyLate}
              disabled={isPending}
            />
            <p className="mt-2 text-xs text-slate-500">
              {isCurrentlyLate
                ? `Laporan ini otomatis terhitung telat sejak ${formatTimeOnly(
                    terlambatBatas,
                  )}.`
                : `Anda akan dianggap telat jika melapor setelah ${formatTimeOnly(
                    terlambatBatas,
                  )} (${formatRemainingTime(remainingMs)} lagi).`}
            </p>
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Dilaporkan Oleh
            </label>
            <select
              value={reportedBy}
              onChange={(e) => setReportedBy(e.target.value as ReporterRole)}
              className="w-full rounded-md border border-gray-300 p-2"
              disabled={isPending}
            >
              <option value="pasien">Pasien</option>
              <option value="pendamping">Pendamping Pasien (PMO)</option>
              <option value="nakes">Tenaga Kesehatan</option>
            </select>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              disabled={isPending}
              className={cencelBtnClass}
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={isPending}
              className={submitBtnClass}
            >
              {isPending ? "Menyimpan..." : "Simpan Laporan"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
