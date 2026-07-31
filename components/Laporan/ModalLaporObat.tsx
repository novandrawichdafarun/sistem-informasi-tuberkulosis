"use client";

import React, { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { submitLaporanObatAction } from "@/actions/laporan";
import { StatusLaporanInput, ReporterRole } from "@/types/laporan";
import { cencelBtnClass, submitBtnClass } from "@/utils/classTailwind";

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
  const [status, setStatus] = useState<StatusLaporanInput>("diminum");
  const [catatan, setCatatan] = useState("");
  const [reportedBy, setReportedBy] = useState<ReporterRole>("pasien");
  const [error, setError] = useState<string | null>(null);

  // useTransition digunakan untuk menangani status "loading" saat Server Action dipanggil
  const [isPending, startTransition] = useTransition();

  // Fungsi yang dijalankan saat tombol "Simpan" ditekan
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault(); // Mencegah browser melakukan refresh halaman
    setError(null);

    // Membungkus pemanggilan Server Action dengan startTransition
    startTransition(async () => {
      const formData = new FormData();
      formData.append("id_jadwal", String(idJadwal));
      formData.append("status_input", status);
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
        {/* Header Modal */}
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

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Input Status */}
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Status
            </label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as StatusLaporanInput)}
              className="w-full rounded-md border border-gray-300 p-2"
              disabled={isPending}
            >
              <option value="diminum">Sudah Diminum</option>
              <option value="ditunda">Ditunda</option>
            </select>
          </div>

          {/* Input Catatan (Hanya wajib jika ditunda, tapi bisa diisi kapan saja) */}
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Catatan:{" "}
              {status === "ditunda" && <span className="text-red-500">*</span>}
            </label>
            <textarea
              value={catatan}
              onChange={(e) => setCatatan(e.target.value)}
              placeholder={
                status === "ditunda"
                  ? "Tuliskan alasan penundaan (wajib)..."
                  : "Catatan tambahan (opsional)..."
              }
              className="h-24 w-full rounded-md border border-gray-300 p-2"
              required={status === "ditunda"}
              disabled={isPending}
            />
          </div>

          {/* Input Dilaporkan Oleh */}
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

          {/* Footer / Buttons */}
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
