"use client";

import { bukaEpisodeAction } from "@/actions/episodePengobatan";
import {
  cencelBtnClass,
  submitBtnClass,
  inputClass,
} from "@/utils/classTailwind";
import { useState, useTransition } from "react";
import { createPortal } from "react-dom";

interface BukaEpisodeModalProps {
  id_pasien: number;
  isOpen: boolean;
  onClose: () => void;
}

export default function BukaEpisoodeModal({
  id_pasien,
  isOpen,
  onClose,
}: BukaEpisodeModalProps) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const todayDate = new Date().toLocaleDateString("en-CA");

  if (!isOpen || typeof document === "undefined") return null;

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);

    const formData = new FormData(e.currentTarget);

    startTransition(async () => {
      const res = await bukaEpisodeAction(formData);
      if (!res.success) {
        setError(res.error);
      } else {
        onClose();
      }
    });
  };

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/50 p-4 text-left backdrop-blur-sm">
      <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-2xl">
        <h3 className="text-lg font-bold text-gray-900 mb-4">
          Buka Episode Pengobatan Baru
        </h3>

        {error && (
          <div className="mb-4 rounded bg-red-50 p-3 text-sm text-red-600 border border-red-200">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Hidden input untuk id_pasien */}
          <input type="hidden" name="id_pasien" value={id_pasien} />

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Tanggal Mulai *
            </label>
            <input
              type="date"
              name="tanggal_mulai"
              defaultValue={todayDate}
              required
              className={inputClass}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Tanggal Selesai *
            </label>
            <input
              type="date"
              name="tanggal_selesai"
              required
              className={inputClass}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Tipe Pasien *
            </label>
            <input
              type="text"
              name="tipe_pasien"
              list="list-tipe-pasien"
              required
              placeholder="Pilih atau ketik tipe pasien..."
              className={inputClass}
            />
            <datalist id="list-tipe-pasien">
              <option value="Kasus Baru" />
              <option value="Kambuh" />
              <option value="Pengobatan Ulang" />
              <option value="Pindahan" />
            </datalist>
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
              className={submitBtnClass}
            >
              {isPending ? "Menyimpan..." : "Buka Episode"}
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body,
  );
}
