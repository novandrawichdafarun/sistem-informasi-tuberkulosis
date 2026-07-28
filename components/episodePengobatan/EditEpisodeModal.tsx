"use client";

import React, { useState, useTransition } from "react";
import { editEpisodeAction } from "@/actions/episodePengobatan";
import { EpisodePengobatanData } from "@/types/episodePengobatan";
import { cencelBtnClass, editBtnClass } from "@/utils/classTailwind";

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
      if (!res.success) setError(res.error);
      else onClose();
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-lg bg-white p-6 shadow-lg">
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
              className="w-full rounded border border-gray-300 p-2 text-sm focus:ring-blue-500 outline-none"
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
              className="w-full rounded border border-gray-300 p-2 text-sm focus:ring-blue-500 outline-none"
            />

            <label className="block text-sm font-medium mb-1">
              Tanggal Selesai
            </label>
            <input
              type="date"
              name="tanggal_selesai"
              defaultValue={episode.tanggal_selesai || ""}
              className="w-full rounded border border-gray-300 p-2 text-sm focus:ring-blue-500 outline-none"
            />
          </div>

          {episode.hasil_akhir && (
            <>
              <div className="col-span-1 md:col-span-2 pt-2 pb-1 border-t border-gray-100">
                <h4 className="text-sm font-semibold text-gray-600">
                  Hasil Akhir Pengobatan
                </h4>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1 text-gray-700">
                  Tanggal Penetapan *
                </label>
                <input
                  type="date"
                  name="tanggal_penetapan"
                  required
                  defaultValue={episode.hasil_akhir.tanggal_penetapan}
                  className="w-full rounded border border-gray-300 p-2 text-sm focus:ring-blue-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1 text-gray-700">
                  Status Akhir *
                </label>
                <select
                  name="status_akhir"
                  required
                  defaultValue={episode.hasil_akhir.status_akhir}
                  className="w-full rounded border border-gray-300 p-2 text-sm focus:ring-blue-500 outline-none bg-white"
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
                <label className="block text-sm font-medium mb-1 text-gray-700">
                  Catatan Akhir (Opsional)
                </label>
                <textarea
                  name="catatan_akhir"
                  rows={3}
                  defaultValue={episode.hasil_akhir.catatan_akhir || ""}
                  placeholder="Tambahkan catatan jika diperlukan..."
                  className="w-full rounded border border-gray-300 p-2 text-sm focus:ring-blue-500 outline-none resize-none"
                />
              </div>
            </>
          )}

          <div className="flex justify-end gap-2 pt-2">
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
    </div>
  );
}
