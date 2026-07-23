"use client";

import { updateDiagnosisAction } from "@/actions/diagnosis";
import { DiagnosisData } from "@/types/diagnosis";
import React, { useState, useTransition } from "react";
import { createPortal } from "react-dom";

interface EditDiagnosisModalProps {
  data: DiagnosisData;
  isOpen: boolean;
  onClose: () => void;
}

export default function EditDiagnosisModal({
  data,
  isOpen,
  onClose,
}: EditDiagnosisModalProps) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  if (!isOpen || typeof document === "undefined") return null;

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    const formData = new FormData(e.currentTarget);

    startTransition(async () => {
      const res = await updateDiagnosisAction(formData);
      if (!res.success) setError(res.error);
      else onClose();
    });
  };

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-lg bg-white p-6 shadow-lg">
        <h3 className="text-lg font-bold text-gray-900 mb-4">
          Edit Diagnosa Pasien
        </h3>

        {error && (
          <div className="mb-4 text-sm text-red-600 bg-red-50 p-3 rounded border border-red-100">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <input type="hidden" name="id_tes" value={data.id_diagnosis} />
          <input type="hidden" name="id_episode" value={data.id_episode} />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1 text-gray-700">
                Tanggal Diagnosa *
              </label>
              <input
                type="date"
                name="tanggal_diagnosis"
                required
                defaultValue={data.tanggal_diagnosis}
                className="w-full rounded border border-gray-300 p-2 text-sm focus:ring-blue-500 outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1 text-gray-700">
                Kode ICD-10 *
              </label>
              <input
                type="text"
                name="kode_icd10"
                required
                list="opsi-kode-icd10"
                defaultValue={data.kode_icd10}
                placeholder="A15.0 (TB Paru), A18.2 (TB Kelenjar), dll"
                className="w-full rounded border border-gray-300 p-2 text-sm focus:ring-blue-500 outline-none"
              />
              <datalist id="opsi-kode-icd10">
                <option value="A15.0 (TB Paru)" />
                <option value="A18.2 (TB Kelenjar)" />
              </datalist>
            </div>

            <div className="col-span-1 md:col-span-2 pt-2 pb-1 border-t border-gray-100">
              <h4 className="text-sm font-semibold text-gray-600">
                Detail Diagnosa
              </h4>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1 text-gray-700">
                Klasifikasi Anatomi
              </label>
              <select
                name="klasifikasi_anatomi"
                defaultValue={data.klasifikasi_anatomi || ""}
                className="w-full rounded border border-gray-300 p-2 text-sm focus:ring-blue-500 outline-none"
              >
                <option value="">-- Klasifikasikan TB --</option>
                <option value="TB Paru">TB Paru</option>
                <option value="TB Ekstra Paru">TB Ekstra Paru</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1 text-gray-700">
                Lokasi Anatomi
              </label>
              <input
                type="text"
                name="lokasi_anatomi"
                defaultValue={data.lokasi_anatomi || ""}
                placeholder="Jika Ekstraparu, sebutkan: Kelenjar getah bening, Pleura, ..."
                className="w-full rounded border border-gray-300 p-2 text-sm focus:ring-blue-500 outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1 text-gray-700">
                Klasifikasi Resistensi *
              </label>
              <select
                name="klasifikasi_resistensi"
                required
                defaultValue={data.klasifikasi_resistensi}
                className="w-full rounded border border-gray-300 p-2 text-sm focus:ring-blue-500 outline-none"
              >
                <option value="">-- Klaifikasikan Resistensi --</option>
                <option value="TB-SO (Sensitif Obat)">
                  TB-SO (Sensitif Obat)
                </option>
                <option value="TB-RO (Resisten Obat)">
                  TB-RO (Resisten Obat)
                </option>
                <option value="Terduga TB-RO">Terduga TB-RO</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1 text-gray-700">
                Tipe Resistensi
              </label>
              <input
                type="text"
                name="tipe_resistensi"
                list="opsi-tipe-resistensi"
                placeholder="Kosong jika SO"
                defaultValue={data.tipe_resistensi || ""}
                className="w-full rounded border border-gray-300 p-2 text-sm focus:ring-blue-500 outline-none"
              />
              <datalist id="opsi-tipe-resistensi">
                <option value="Monoresisten Rifampisin (TB-RR)" />
                <option value="MDR-TB" />
                <option value="XDR-TB" />
              </datalist>
            </div>

            <div className="col-span-1 md:col-span-2 pt-2 pb-1 border-t border-gray-100">
              <h4 className="text-sm font-semibold text-gray-600">
                Dasar & Catatan Diagnosa
              </h4>
            </div>

            <div className="col-span-1 md:col-span-2">
              <label className="block text-sm font-medium mb-1 text-gray-700">
                Dasar Diagnosa
              </label>
              <input
                type="text"
                name="dasar_diagnosis"
                placeholder="contoh: Terkonfirmasi Bakteriologis (TCM/BTA+)"
                defaultValue={data.dasar_diagnosis || ""}
                className="w-full rounded border border-gray-300 px-3 p-2 text-sm focus:ring-blue-500 outline-none"
              />
            </div>
            <div className="col-span-1 md:col-span-2">
              <label className="block text-sm font-medium mb-1 text-gray-700">
                Catatan Klinis
              </label>
              <input
                type="text"
                name="catatan_klinis"
                placeholder="Catatan tambahan dokter"
                defaultValue={data.catatan_klinis || ""}
                className="w-full rounded border border-gray-300 px-3 p-2 text-sm focus:ring-blue-500 outline-none"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-5 mt-2 border-t border-gray-100">
            <button
              type="button"
              onClick={onClose}
              disabled={isPending}
              className="bg-gray-100 px-4 py-2 text-sm font-medium rounded text-gray-700 hover:bg-gray-200"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={isPending}
              className="bg-blue-600 text-white px-4 py-2 text-sm font-medium rounded hover:bg-blue-700 disabled:bg-blue-400"
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
