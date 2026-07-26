"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createResepAction } from "@/actions/resep";
import { ObatData } from "@/types/obat";

const inputClass =
  "mt-1 block w-full rounded border border-gray-300 p-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500";

const REGIMEN = ["Kategori 1", "Kategori 2", "Kategori Anak", "OAT MDR"];
const FASE = ["Intensif", "Lanjutan"];

export default function TambahResepModal({
  id_episode,
  obatList,
  isOpen,
  onClose,
}: {
  id_episode: number;
  obatList: ObatData[];
  isOpen: boolean;
  onClose: () => void;
}) {
  const router = useRouter();
  const [selected, setSelected] = useState<number[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  if (!isOpen) return null;

  const toggle = (id: number) =>
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    if (selected.length === 0) {
      setError("Pilih minimal satu obat.");
      return;
    }
    const formData = new FormData(e.currentTarget);
    formData.set("obat_ids", selected.join(","));

    startTransition(async () => {
      const res = await createResepAction(formData);
      if (!res.success) {
        setError(res.error);
        return;
      }
      setSelected([]);
      onClose();
      router.refresh();
    });
  };

  const today = new Date().toLocaleDateString("en-CA");

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="fixed inset-0 bg-gray-900/50 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-xl bg-white p-6 shadow-2xl text-gray-600">
        <h3 className="text-lg font-bold text-gray-900 mb-4">
          Buat Resep &amp; Jadwal Minum Obat
        </h3>

        {error && (
          <div className="mb-4 rounded bg-red-50 p-3 text-sm text-red-600 border border-red-200">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <input type="hidden" name="id_episode" value={id_episode} />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Kategori Regimen *
              </label>
              <select
                name="kategori_regimen"
                required
                className={`${inputClass} bg-white`}
              >
                <option value="">-- Pilih --</option>
                {REGIMEN.map((r) => (
                  <option key={r} value={r}>
                    {r}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Fase Pengobatan *
              </label>
              <select
                name="fase_pengobatan"
                required
                className={`${inputClass} bg-white`}
              >
                <option value="">-- Pilih --</option>
                {FASE.map((f) => (
                  <option key={f} value={f}>
                    {f}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Tanggal Mulai Obat *
              </label>
              <input
                type="date"
                name="tanggal_mulai_obat"
                required
                defaultValue={today}
                className={inputClass}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Durasi (hari) *
              </label>
              <input
                type="number"
                name="durasi_hari"
                required
                min={1}
                max={365}
                defaultValue={180}
                className={inputClass}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Jam Minum *
              </label>
              <input
                type="time"
                name="jam_jadwal"
                required
                defaultValue="07:00"
                className={inputClass}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Jumlah / Minum *
              </label>
              <input
                type="number"
                name="jumlah_per_minum"
                required
                min={0.25}
                step={0.25}
                defaultValue={1}
                className={inputClass}
              />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-gray-700">
                Aturan Pakai
              </label>
              <input
                type="text"
                name="aturan_pakai"
                placeholder="cth: Sesudah makan pagi"
                className={inputClass}
              />
            </div>
          </div>

          {/* Pilih obat */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Obat (pilih satu atau lebih) *
            </label>
            {obatList.length === 0 ? (
              <div className="rounded border border-dashed border-gray-300 p-4 text-center text-sm text-gray-500">
                Belum ada obat di master.{" "}
                <Link
                  href="/dashboard/obat"
                  className="text-blue-600 underline"
                >
                  Tambahkan di Master Obat
                </Link>{" "}
                dulu.
              </div>
            ) : (
              <div className="max-h-44 overflow-y-auto rounded border border-gray-200 divide-y divide-gray-100">
                {obatList.map((o) => (
                  <label
                    key={o.id_obat}
                    className="flex items-center gap-3 px-3 py-2 text-sm hover:bg-gray-50 cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      checked={selected.includes(o.id_obat)}
                      onChange={() => toggle(o.id_obat)}
                      className="h-4 w-4 rounded border-gray-300 text-blue-600"
                    />
                    <span className="font-medium text-gray-800">
                      {o.nama_obat}
                    </span>
                    <span className="text-xs text-gray-400">
                      {o.dosis || ""} {o.jenis_obat ? `· ${o.jenis_obat}` : ""}
                    </span>
                    {!o.is_active && (
                      <span className="ml-auto text-[10px] text-amber-600">
                        nonaktif
                      </span>
                    )}
                  </label>
                ))}
              </div>
            )}
          </div>

          <div className="flex justify-end gap-2 pt-4 border-t border-gray-100">
            <button
              type="button"
              onClick={onClose}
              disabled={pending}
              className="rounded bg-gray-100 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-200 disabled:opacity-50"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={pending || obatList.length === 0}
              className="rounded bg-blue-600 px-5 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:bg-blue-400"
            >
              {pending ? "Menyimpan..." : "Simpan Resep"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
