"use client";

import React, { useState, useTransition } from "react";
import { createPortal } from "react-dom";
import { updatePemeriksaanAction } from "@/actions/pemeriksaanKlinis";
import { PemeriksaanKlinisData } from "@/types/pemeriksaanKlinis";

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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-lg bg-white p-6 shadow-lg">
        <h3 className="text-lg font-bold text-gray-900 mb-4">
          Edit Data Pemeriksaan Klinis
        </h3>

        {error && (
          <div className="mb-4 text-sm text-red-600 bg-red-50 p-3 rounded">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Dua input tersembunyi yang krusial untuk proses Edit */}
          <input type="hidden" name="id_periksa" value={periksa.id_periksa} />
          <input type="hidden" name="id_episode" value={periksa.id_episode} />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">
                Tanggal Periksa *
              </label>
              <input
                type="date"
                name="tanggal_periksa"
                required
                defaultValue={periksa.tanggal_periksa}
                className="w-full rounded border p-2 text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">
                Tekanan Darah (Tensi)
              </label>
              <input
                type="text"
                name="tensi"
                placeholder="cth: 120/80"
                defaultValue={periksa.tensi || ""}
                className="w-full rounded border p-2 text-sm"
              />
            </div>

            {/* Input Angka dengan step yang sesuai */}
            <div>
              <label className="block text-sm font-medium mb-1">
                Berat Badan (kg)
              </label>
              <input
                type="number"
                step="0.01"
                name="berat_badan_saat_ini"
                defaultValue={periksa.berat_badan_saat_ini || ""}
                className="w-full rounded border p-2 text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">
                Tinggi Badan (cm)
              </label>
              <input
                type="number"
                name="tinggi_badan_saat_ini"
                defaultValue={periksa.tinggi_badan_saat_ini || ""}
                className="w-full rounded border p-2 text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">
                Suhu Tubuh (°C)
              </label>
              <input
                type="number"
                step="0.1"
                name="suhu"
                defaultValue={periksa.suhu || ""}
                className="w-full rounded border p-2 text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">
                Pernapasan (x/menit)
              </label>
              <input
                type="number"
                name="pernapasan"
                defaultValue={periksa.pernapasan || ""}
                className="w-full rounded border p-2 text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">
                Denyut Nadi (x/menit)
              </label>
              <input
                type="number"
                name="nadi"
                defaultValue={periksa.nadi || ""}
                className="w-full rounded border p-2 text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">
                Saturasi O2 (%)
              </label>
              <input
                type="number"
                name="saturasi_o2"
                defaultValue={periksa.saturasi_o2 || ""}
                className="w-full rounded border p-2 text-sm"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">
              Keluhan Pasien
            </label>
            <textarea
              name="keluhan"
              rows={3}
              defaultValue={periksa.keluhan || ""}
              className="w-full rounded border p-2 text-sm"
              placeholder="Catat keluhan klinis yang dirasakan pasien..."
            />
          </div>

          <div className="flex justify-end gap-2 pt-4 border-t">
            <button
              type="button"
              onClick={onClose}
              disabled={isPending}
              className="bg-gray-100 px-4 py-2 text-sm font-medium rounded text-gray-700"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={isPending}
              className="bg-blue-600 text-white px-4 py-2 text-sm font-medium rounded hover:bg-blue-700"
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
