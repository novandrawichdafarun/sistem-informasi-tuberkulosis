"use client";

import { tutupEpisodeAction } from "@/actions/episodePengobatan";
import { useState, useTransition } from "react";
import { createPortal } from "react-dom";

interface TutupEpisodeModalProps {
  id_episode: number;
  tipePasienSekarang: string;
  isOpen: boolean;
  onClose: () => void;
}

export default function TutupEpisodeModal({
  id_episode,
  tipePasienSekarang,
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-lg">
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
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Pembaruan Tipe Pasien
            </label>
            <select
              name="tipe_pasien"
              required
              defaultValue={tipePasienSekarang}
              className="w-full rounded border border-gray-300 p-2 text-sm focus:border-blue-500 focus:outline-none bg-white"
            >
              <option value="">-- Pilih Tipe Pasien --</option>
              <option value="Kasus Baru">Kasus Baru</option>
              <option value="Kambuh">Kambuh</option>
              <option value="Negatif TB">Negatif TB</option>
              <option value="Positif TB">Positif TB</option>
              <option value="Gagal">Gagal</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Tanggal Selesai Pengobatan
            </label>
            <input
              type="date"
              name="tanggal_selesai"
              defaultValue={todayDate}
              required
              className="w-full rounded border border-gray-300 p-2 text-sm focus:border-blue-500 focus:outline-none"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              disabled={isPending}
              className="rounded bg-gray-100 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-200 disabled:opacity-50"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={isPending}
              className="rounded bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700 disabled:opacity-50"
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
