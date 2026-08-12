"use client";

import { tutupEpisodeAction } from "@/actions/episodePengobatan";
import {
  cencelBtnClass,
  submitBtnClass,
  inputClass,
  selectClass,
} from "@/utils/classTailwind";
import { useState, useTransition } from "react";
import { createPortal } from "react-dom";

interface TutupEpisodeModalProps {
  id_episode: number;
  isOpen: boolean;
  onClose: () => void;
}

export default function TutupEpisodeModal({
  id_episode,
  isOpen,
  onClose,
}: TutupEpisodeModalProps) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const todayDate = new Date().toLocaleDateString("en-CA");

  if (!isOpen || typeof document === "undefined") return null;

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);

    const formData = new FormData(e.currentTarget);

    startTransition(async () => {
      const res = await tutupEpisodeAction(formData);
      if (!res.success) {
        setError(res.error);
      } else {
        onClose();
      }
    });
  };

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/50 p-4 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-2xl">
        <h3 className="text-lg font-bold text-gray-900 mb-2">
          Selesaikan Episode Pengobatan
        </h3>
        <p className="text-sm text-gray-500 mb-4">
          Silakan lengkapi data akhir pengobatan pasien ini
        </p>

        {error && (
          <div className="mb-4 rounded bg-red-50 p-3 text-sm text-red-600 border border-red-200">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <input type="hidden" name="id_episode" value={id_episode} />

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Tanggal Penetapan *
            </label>
            <input
              type="date"
              name="tanggal_penetapan"
              required
              defaultValue={todayDate}
              className={inputClass}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Status Akhir *
            </label>
            <select
              name="status_akhir"
              required
              className={selectClass}
            >
              <option value="">-- Pilih Status Akhir --</option>
              <option value="Sembuh">Sembuh</option>
              <option value="Pengobatan Lengkap">Pengobatan Lengkap</option>
              <option value="Gagal">Gagal</option>
              <option value="Putus Berobat (Loss to Follow-up)">
                Putus Berobat (Loss to Follow-up)
              </option>
              <option value="Meninggal">Meninggal</option>
              <option value="Pindah">Pindah</option>
              <option value="Tidak Dievaluasi">Tidak Dievaluasi</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Catatan Akhir (Opsional)
            </label>
            <textarea
              name="catatan_akhir"
              rows={3}
              placeholder="Tambahkan catatan jika diperlukan..."
              className={inputClass}
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
              className={submitBtnClass}
            >
              {isPending ? "Memproses..." : "Selesaikan Episode"}
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body,
  );
}
