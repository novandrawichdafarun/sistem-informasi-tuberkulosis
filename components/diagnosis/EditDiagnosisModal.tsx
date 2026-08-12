"use client";

import { updateDiagnosisAction } from "@/actions/diagnosis";
import { DiagnosisData } from "@/types/diagnosis";
import {
  cencelBtnClass,
  editBtnClass,
  inputClass,
  selectClass,
} from "@/utils/classTailwind";
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/50 p-4 backdrop-blur-sm">
      <div className="w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-xl bg-white p-6 shadow-2xl">
        <h3 className="text-lg font-bold text-gray-900 mb-4">
          Edit Diagnosa Pasien
        </h3>

        {error && (
          <div className="mb-4 text-sm text-red-600 bg-red-50 p-3 rounded border border-red-100">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <input type="hidden" name="id_diagnosis" value={data.id_diagnosis} />
          <input type="hidden" name="id_episode" value={data.id_episode} />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="col-span-1 md:col-span-2">
              <label className="block text-sm font-medium text-gray-700">
                Tanggal Diagnosa *
              </label>
              <input
                type="date"
                name="tanggal_diagnosis"
                required
                defaultValue={data.tanggal_diagnosis}
                className={inputClass}
              />
            </div>

            <div className="col-span-1 md:col-span-2 pt-2 pb-1 border-t border-gray-100">
              <h4 className="text-sm font-semibold text-gray-600">
                Detail Diagnosa
              </h4>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Klasifikasi Anatomi *
              </label>
              <select
                name="klasifikasi_anatomi"
                defaultValue={data.klasifikasi_anatomi}
                required
                className={selectClass}
              >
                <option value="">-- Klasifikasikan TB --</option>
                <option value="TB Paru">TB Paru</option>
                <option value="TB Ekstra Paru">TB Ekstra Paru</option>
                <option value="Bukan TB">Bukan TB</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Lokasi Anatomi
              </label>
              <input
                type="text"
                name="lokasi_anatomi"
                defaultValue={data.lokasi_anatomi || ""}
                placeholder="Jika Ekstraparu, sebutkan: Kelenjar getah bening, Pleura, ..."
                className={inputClass}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Klasifikasi Resistensi *
              </label>
              <select
                name="klasifikasi_resistensi"
                required
                defaultValue={data.klasifikasi_resistensi}
                className={selectClass}
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
              <label className="block text-sm font-medium text-gray-700">
                Tipe Resistensi
              </label>
              <input
                type="text"
                name="tipe_resistensi"
                list="opsi-tipe-resistensi"
                placeholder="Kosongkan jika SO"
                defaultValue={data.tipe_resistensi || ""}
                className={inputClass}
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
              <label className="block text-sm font-medium text-gray-700">
                Dasar Diagnosa
              </label>
              <input
                type="text"
                name="dasar_diagnosis"
                placeholder="contoh: Terkonfirmasi Bakteriologis (TCM/BTA+)"
                defaultValue={data.dasar_diagnosis || ""}
                className={inputClass}
              />
            </div>
            <div className="col-span-1 md:col-span-2">
              <label className="block text-sm font-medium text-gray-700">
                Catatan Klinis
              </label>
              <input
                type="text"
                name="catatan_klinis"
                placeholder="Catatan tambahan dokter"
                defaultValue={data.catatan_klinis || ""}
                className={inputClass}
              />
            </div>
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
