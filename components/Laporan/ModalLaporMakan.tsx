"use client";

import React, { useState, useTransition } from "react";
import { submitLaporanMakanAction } from "@/actions/laporan";
import { cencelBtnClass, submitBtnClass } from "@/utils/classTailwind";

interface ModalLaporMakanProps {
  onClose: () => void;
}

export default function ModalLaporMakan({ onClose }: ModalLaporMakanProps) {
  const [karbo, setKarbo] = useState("");
  const [protein, setProtein] = useState("");
  const [serat, setSerat] = useState("");
  const [catatan, setCatatan] = useState("");

  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    startTransition(async () => {
      const formData = new FormData();
      formData.append("karbo", karbo);
      formData.append("protein", protein);
      formData.append("serat", serat);
      formData.append("catatan", catatan);

      const response = await submitLaporanMakanAction(formData);

      if (response.success) {
        setError("");
        setTimeout(() => {
          onClose();
        }, 1000);
      } else {
        setError(response.error ?? "Gagal mengirim laporan");
      }
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md overflow-hidden">
        <div className="px-6 py-4 border-b">
          <h3 className="text-lg font-semibold text-gray-800">Lapor Makan</h3>
          <p className="text-sm text-gray-500">
            Waktu pelaporan akan dicatat secara otomatis oleh sistem.
          </p>
        </div>

        {error && (
          <div className="mb-4 rounded bg-red-50 p-3 text-sm text-red-600 border border-red-200">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="p-6 flex flex-col gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Sumber Karbohidrat <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={karbo}
              onChange={(e) => setKarbo(e.target.value)}
              placeholder="Contoh: Nasi putih, Kentang rebus..."
              className="w-full border border-gray-300 rounded-md p-2 focus:ring-blue-500 focus:border-blue-500"
              required
              disabled={isPending}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Sumber Protein <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={protein}
              onChange={(e) => setProtein(e.target.value)}
              placeholder="Contoh: Telur dadar, Dada ayam..."
              className="w-full border border-gray-300 rounded-md p-2 focus:ring-blue-500 focus:border-blue-500"
              required
              disabled={isPending}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Sumber Serat <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={serat}
              onChange={(e) => setSerat(e.target.value)}
              placeholder="Contoh: Sayur bayam, Buah pepaya..."
              className="w-full border border-gray-300 rounded-md p-2 focus:ring-blue-500 focus:border-blue-500"
              required
              disabled={isPending}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Catatan Tambahan
            </label>
            <textarea
              value={catatan}
              onChange={(e) => setCatatan(e.target.value)}
              placeholder="Opsional..."
              className="w-full border border-gray-300 rounded-md p-2 focus:ring-blue-500 focus:border-blue-500 h-20"
              disabled={isPending}
            />
          </div>

          <div className="flex justify-end gap-3 mt-4">
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
