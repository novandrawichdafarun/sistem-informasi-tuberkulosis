"use client";

import { bukaEpisodeAction } from "@/actions/episodePengobatan";
import { useState, useTransition } from "react";

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

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);

    const formData = new FormData(e.currentTarget);

    startTransition(async () => {
      const res = await bukaEpisodeAction(formData);
      if (res?.error) {
        setError(res.error);
      } else {
        onClose();
      }
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 text-left">
      <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-lg">
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
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Tanggal Mulai *
            </label>
            <input
              type="date"
              name="tanggal_mulai"
              required
              className="w-full rounded border border-gray-300 p-2 text-sm focus:border-blue-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Tipe Pasien *
            </label>
            <select
              name="tipe_pasien"
              required
              className="w-full rounded border border-gray-300 p-2 text-sm focus:border-blue-500 focus:outline-none bg-white"
            >
              <option value="">-- Pilih Tipe Pasien --</option>
              <option value="Kasus Baru">Kasus Baru</option>
              <option value="Kambuh">Kambuh</option>
              <option value="Default">Default</option>
              <option value="Gagal">Gagal</option>
            </select>
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
              className="rounded bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
            >
              {isPending ? "Menyimpan..." : "Buka Episode"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
