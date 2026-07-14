"use client";

import React, { useState, useTransition } from "react";
import { editEpisodeAction } from "@/actions/episodePengobatan";
import { EpisodePengobatanData } from "@/types/episodePengobatan";

interface EditEpisodeModalProps {
  episode: EpisodePengobatanData;
  isOpen: boolean;
  onClose: () => void;
}

export default function EditEpisodeModal({
  episode,
  isOpen,
  onClose,
}: EditEpisodeModalProps) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    const formData = new FormData(e.currentTarget);

    startTransition(async () => {
      const res = await editEpisodeAction(formData);
      if (res?.error) setError(res.error);
      else onClose();
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-lg">
        <h3 className="text-lg font-bold text-gray-900 mb-4">
          Edit Data Episode
        </h3>
        {error && (
          <div className="mb-4 text-sm text-red-600 bg-red-50 p-3 rounded">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <input type="hidden" name="id_episode" value={episode.id_episode} />

          <div>
            <label className="block text-sm font-medium mb-1">
              Tipe Pasien
            </label>
            <select
              name="tipe_pasien"
              required
              defaultValue={episode.tipe_pasien}
              className="w-full rounded border p-2 text-sm bg-white"
            >
              <option value="Kasus Baru">Kasus Baru</option>
              <option value="Kambuh">Kambuh</option>
              <option value="Default">Default</option>
              <option value="Gagal">Gagal</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">
              Tanggal Mulai
            </label>
            <input
              type="date"
              name="tanggal_mulai"
              required
              defaultValue={episode.tanggal_mulai}
              className="w-full rounded border p-2 text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">
              Tanggal Selesai
            </label>
            <input
              type="date"
              name="tanggal_selesai"
              defaultValue={episode.tanggal_selesai || ""}
              className="w-full rounded border p-2 text-sm"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              disabled={isPending}
              className="bg-gray-100 px-4 py-2 text-sm rounded"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={isPending}
              className="bg-blue-600 text-white px-4 py-2 text-sm rounded"
            >
              {isPending ? "Menyimpan..." : "Simpan Perubahan"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
