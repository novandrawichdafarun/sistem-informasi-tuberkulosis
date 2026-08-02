"use client";

import React, { useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { createLaporanMakanAction } from "@/actions/laporanMakan";

// Nilai default input datetime-local dalam waktu lokal (YYYY-MM-DDTHH:mm).
function nowLocalInput() {
  const d = new Date();
  const offset = d.getTimezoneOffset() * 60000;
  return new Date(d.getTime() - offset).toISOString().slice(0, 16);
}

export default function LaporanMakanForm() {
  const router = useRouter();
  const formRef = useRef<HTMLFormElement>(null);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [sukses, setSukses] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setSukses(null);
    const formData = new FormData(e.currentTarget);

    startTransition(async () => {
      const res = await createLaporanMakanAction(formData);
      if (!res.success) {
        setError(res.error);
      } else {
        setSukses(res.message ?? "Laporan makan berhasil disimpan!");
        formRef.current?.reset();
        router.refresh();
      }
    });
  };

  const inputClass =
    "w-full rounded-lg border border-slate-300 p-2 text-sm outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500";

  return (
    <form
      ref={formRef}
      onSubmit={handleSubmit}
      className="rounded-2xl border border-slate-200 bg-white p-6"
    >
      <h2 className="text-base font-semibold text-brand-950">
        Catat Makanan Hari Ini
      </h2>
      <p className="mt-1 text-sm text-slate-500">
        Isi apa yang Anda makan agar Nakes dapat memantau asupan gizi selama
        pengobatan.
      </p>

      {error && (
        <div className="mt-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-600">
          {error}
        </div>
      )}
      {sukses && (
        <div className="mt-4 rounded-lg border border-brand-200 bg-brand-50 p-3 text-sm text-brand-700">
          {sukses}
        </div>
      )}

      <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <label className="mb-1 block text-sm font-medium text-slate-700">
            Waktu Makan *
          </label>
          <input
            type="datetime-local"
            name="waktu_makan"
            required
            defaultValue={nowLocalInput()}
            className={inputClass}
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">
            Karbohidrat *
          </label>
          <input
            type="text"
            name="karbo"
            required
            maxLength={50}
            placeholder="Contoh: Nasi Putih"
            className={inputClass}
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">
            Protein *
          </label>
          <input
            type="text"
            name="protein"
            required
            maxLength={50}
            placeholder="Contoh: Dada Ayam"
            className={inputClass}
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">
            Serat / Sayur-Buah *
          </label>
          <input
            type="text"
            name="serat"
            required
            maxLength={50}
            placeholder="Contoh: Sayur Bayam"
            className={inputClass}
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">
            Catatan (opsional)
          </label>
          <input
            type="text"
            name="catatan"
            maxLength={500}
            placeholder="Contoh: porsi sedikit karena mual"
            className={inputClass}
          />
        </div>
      </div>

      <div className="mt-5 flex justify-end">
        <button
          type="submit"
          disabled={isPending}
          className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-brand-700 disabled:bg-brand-400"
        >
          {isPending ? "Menyimpan..." : "Simpan Laporan"}
        </button>
      </div>
    </form>
  );
}
