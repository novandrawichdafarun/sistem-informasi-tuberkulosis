"use client";

import { useState, useTransition, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createResepAction } from "@/actions/resep";
import { ObatData, ObatFormValues } from "@/types/obat";
import { createPortal } from "react-dom";
import {
  cencelBtnClass,
  inputClass,
  submitBtnClass,
} from "@/utils/classTailwind";
import { getDayCount, getDailyFrequencyCount } from "@/utils/date";
import { FASE, REGIMEN } from "@/utils/obat";
import ObatItemForm from "./ObatItemForm";

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
  const [obatForm, setObatForm] = useState<Record<number, ObatFormValues>>({});
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const [today] = useState(() => new Date().toISOString().slice(0, 10));
  const [defaultEnd] = useState(() =>
    new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10),
  );

  if (!isOpen) return null;
  if (typeof document === "undefined") return null;

  const selectedIds = Object.keys(obatForm).map(Number);

  const toggleObat = (id: number) =>
    setObatForm((prev) => {
      if (prev[id]) {
        const next = { ...prev };
        delete next[id];
        return next;
      }

      return {
        ...prev,
        [id]: {
          jumlah_per_minum: "1",
          frekuensi_minum: "1x sehari",
          aturan_pakai: "",
          tanggal_mulai_obat: today,
          tanggal_selesai_obat: defaultEnd,
          jam_jadwal: "09:00",
        },
      };
    });

  const updateItem = (
    id: number,
    field: keyof ObatFormValues,
    value: string | string[],
  ) =>
    setObatForm((prev) => ({
      ...prev,
      [id]: {
        ...prev[id],
        [field]: value,
      },
    }));

  const DEFAULT_JAM = "09:00";

  const normalizeJamJadwal = (
    raw: string | string[] | undefined,
    frekuensi: string,
  ): string[] => {
    let list: string[] = [];

    if (Array.isArray(raw)) {
      list = raw.map((it) => String(it).trim()).filter(Boolean);
    } else if (typeof raw === "string") {
      list = raw
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean);
    }

    const expected = getDailyFrequencyCount(frekuensi);
    if (expected !== null) {
      if (list.length < expected) {
        while (list.length < expected) list.push(DEFAULT_JAM);
      } else if (list.length > expected) {
        list = list.slice(0, expected);
      }
    } else {
      if (list.length === 0) list = [DEFAULT_JAM];
    }

    return list;
  };

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);

    if (selectedIds.length === 0) {
      setError("Pilih minimal satu obat.");
      return;
    }

    const obatItems = selectedIds.map((id) => {
      const data = obatForm[id];

      const jamJadwal = normalizeJamJadwal(
        data?.jam_jadwal,
        data?.frekuensi_minum ?? "1x sehari",
      );

      const quantity = Number(data.jumlah_per_minum);
      const days = getDayCount(
        data.tanggal_mulai_obat,
        data.tanggal_selesai_obat,
      );
      const times = jamJadwal.length;

      return {
        id_obat: id,
        jumlah_per_minum: quantity,
        frekuensi_minum: data.frekuensi_minum,
        aturan_pakai: data.aturan_pakai.trim() || undefined,
        tanggal_mulai_obat: data.tanggal_mulai_obat,
        tanggal_selesai_obat: data.tanggal_selesai_obat,
        jam_jadwal: jamJadwal,
        jumlah_total_diberikan: Math.round(
          quantity * days * Math.max(times, 1),
        ),
      };
    });

    const formData = new FormData(e.currentTarget);
    formData.set("obat_items", JSON.stringify(obatItems));

    startTransition(async () => {
      const res = await createResepAction(formData);
      if (!res.success) {
        setError(res.error);
        return;
      }
      setError(null);
      setObatForm({});
      onClose();
      router.refresh();
    });
  };

  return createPortal(
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
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Obat (pilih satu atau lebih) *
            </label>

            {obatList.length === 0 ? (
              <div className="rounded border border-dashed border-gray-300 p-4 text-center text-sm text-gray-500">
                Belum ada obat di master.{" "}
                <Link
                  href="/dashboard/obat"
                  className="text-brand-600 underline"
                >
                  Tambahkan di Master Obat
                </Link>{" "}
                dulu.
              </div>
            ) : (
              <div className="space-y-3 rounded border border-gray-200 p-3">
                {obatList.map((o) => (
                  <ObatItemForm
                    key={o.id_obat}
                    obat={o}
                    selected={selectedIds.includes(o.id_obat)}
                    values={obatForm[o.id_obat] ?? {}}
                    today={today}
                    defaultEnd={defaultEnd}
                    onToggle={() => toggleObat(o.id_obat)}
                    onChange={(field, value) =>
                      updateItem(o.id_obat, field, value)
                    }
                  />
                ))}
              </div>
            )}
          </div>

          <div className="flex justify-end gap-2 pt-4 border-t border-gray-100">
            <button
              type="button"
              onClick={onClose}
              disabled={pending}
              className={cencelBtnClass}
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={pending || selectedIds.length === 0}
              className={submitBtnClass}
            >
              {pending ? "Menyimpan..." : "Simpan Resep"}
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body,
  );
}
