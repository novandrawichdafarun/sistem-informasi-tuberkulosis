"use client";

import React, { useState, useTransition } from "react";
import { createPortal } from "react-dom";
import { updatePemeriksaanAction } from "@/actions/pemeriksaanKlinis";
import { PemeriksaanKlinisData } from "@/types/pemeriksaanKlinis";
import {
  cencelBtnClass,
  editBtnClass,
  inputClass,
} from "@/utils/classTailwind";

interface EditPemeriksaanModalProps {
  periksa: PemeriksaanKlinisData;
  isOpen: boolean;
  onClose: () => void;
}

export default function EditPemeriksaanModal({
  periksa,
  isOpen,
  onClose,
}: EditPemeriksaanModalProps) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  // Mencegah Hydration Mismatch & Hanya me-render modal jika sedang dibuka di sisi Client
  if (!isOpen || typeof document === "undefined") return null;

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    const formData = new FormData(e.currentTarget);

    startTransition(async () => {
      const res = await updatePemeriksaanAction(formData);
      if (!res.success) setError(res.error);
      else onClose();
    });
  };

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/50 p-4 backdrop-blur-sm">
      <div className="w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-xl bg-white p-6 shadow-2xl">
        <div className="mb-4 flex items-start justify-between">
          <h3 className="text-lg font-bold text-gray-900">
            Edit Data Pemeriksaan Klinis
          </h3>
          <button
            type="button"
            onClick={onClose}
            aria-label="Tutup"
            className="text-2xl font-semibold text-gray-400 hover:text-gray-600"
          >
            &times;
          </button>
        </div>

        {error && (
          <div className="mb-6 rounded-md border border-red-200 bg-red-50 p-4 text-sm text-red-600">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Dua input tersembunyi yang krusial untuk proses Edit */}
          <input type="hidden" name="id_periksa" value={periksa.id_periksa} />
          <input type="hidden" name="id_episode" value={periksa.id_episode} />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Tanggal Periksa *
              </label>
              <input
                type="date"
                name="tanggal_periksa"
                required
                defaultValue={periksa.tanggal_periksa}
                className={inputClass}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Tekanan Darah (Tensi)
              </label>
              <input
                type="text"
                name="tensi"
                placeholder="cth: 120/80"
                defaultValue={periksa.tensi || ""}
                className={inputClass}
              />
            </div>

            {/* Input Angka dengan step yang sesuai */}
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Berat Badan (kg)
              </label>
              <input
                type="number"
                step="0.01"
                name="berat_badan"
                defaultValue={periksa.berat_badan || ""}
                className={inputClass}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Tinggi Badan (cm)
              </label>
              <input
                type="number"
                name="tinggi_badan"
                defaultValue={periksa.tinggi_badan || ""}
                className={inputClass}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Suhu Tubuh (°C)
              </label>
              <input
                type="number"
                step="0.1"
                name="suhu"
                defaultValue={periksa.suhu || ""}
                className={inputClass}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Pernapasan (x/menit)
              </label>
              <input
                type="number"
                name="pernapasan"
                defaultValue={periksa.pernapasan || ""}
                className={inputClass}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Denyut Nadi (x/menit)
              </label>
              <input
                type="number"
                name="nadi"
                defaultValue={periksa.nadi || ""}
                className={inputClass}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Saturasi O2 (%)
              </label>
              <input
                type="number"
                name="saturasi_o2"
                defaultValue={periksa.saturasi_o2 || ""}
                className={inputClass}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Keluhan Pasien
            </label>
            <textarea
              name="keluhan"
              rows={3}
              defaultValue={periksa.keluhan || ""}
              className={inputClass}
              placeholder="Catat keluhan klinis yang dirasakan pasien..."
            />
          </div>

          <div className="flex justify-end gap-2 pt-4 border-t border-gray-100">
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
              className={editBtnClass}
            >
              {isPending ? "Menyimpan..." : "Simpan Perubahan"}
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body,
  );
}
