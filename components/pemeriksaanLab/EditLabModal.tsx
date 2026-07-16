// components/pemeriksaanLab/EditLabModal.tsx
"use client";

import React, { useState, useTransition } from "react";
import { createPortal } from "react-dom";
import { updatePemeriksaanLabAction } from "@/actions/pemeriksaanLab";
import { PemeriksaanLabData } from "@/types/pemeriksaanLab";

interface EditLabModalProps {
  data: PemeriksaanLabData;
  isOpen: boolean;
  onClose: () => void;
}

export default function EditLabModal({
  data,
  isOpen,
  onClose,
}: EditLabModalProps) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  if (!isOpen || typeof document === "undefined") return null;

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    const formData = new FormData(e.currentTarget);

    startTransition(async () => {
      const res = await updatePemeriksaanLabAction(formData);
      if (!res.success) setError(res.error);
      else onClose();
    });
  };

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-lg bg-white p-6 shadow-lg">
        <h3 className="text-lg font-bold text-gray-900 mb-4">
          Edit Pemeriksaan Laboratorium
        </h3>

        {error && (
          <div className="mb-4 text-sm text-red-600 bg-red-50 p-3 rounded border border-red-100">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <input type="hidden" name="id_tes" value={data.id_tes} />
          <input type="hidden" name="id_episode" value={data.id_episode} />

          <div className="grid grid-cols-1 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1 text-gray-700">
                Tanggal Tes *
              </label>
              <input
                type="date"
                name="tanggal_tes"
                required
                defaultValue={data.tanggal_tes}
                className="w-full rounded border border-gray-300 p-2 text-sm focus:ring-blue-500 outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1 text-gray-700">
                Jenis Tes *
              </label>
              <input
                type="text"
                name="jenis_tes"
                required
                list="opsi-jenis-tes-edit"
                defaultValue={data.jenis_tes}
                className="w-full rounded border border-gray-300 p-2 text-sm focus:ring-blue-500 outline-none"
              />
              <datalist id="opsi-jenis-tes-edit">
                <option value="TCM" />
                <option value="IGRA" />
                <option value="Mantoux" />
                <option value="BTA" />
                <option value="Rontgen" />
              </datalist>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1 text-gray-700">
                Hasil Tes *
              </label>
              <input
                type="text"
                name="hasil_tes"
                required
                defaultValue={data.hasil_tes}
                className="w-full rounded border border-gray-300 p-2 text-sm focus:ring-blue-500 outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1 text-gray-700">
                Periode Bulanan{" "}
                <span className="text-gray-400 font-normal">(Opsional)</span>
              </label>
              <input
                type="text"
                name="periode_bulanan"
                defaultValue={data.periode_bulanan || ""}
                className="w-full rounded border border-gray-300 p-2 text-sm focus:ring-blue-500 outline-none"
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
