"use client";

import React, { useEffect, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { submitLaporanMakanAction } from "@/actions/laporan";
import { LaporanMakanData } from "@/types/laporan";
import { CheckIcon, CloseIcon } from "@/components/asset/icons";

interface LaporanMakanProps {
  todaysReports: LaporanMakanData[];
}

export default function LaporanMakanForm({ todaysReports }: LaporanMakanProps) {
  const router = useRouter();
  const formRef = useRef<HTMLFormElement>(null);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [sukses, setSukses] = useState<string | null>(null);
  const reportCount = todaysReports.length;
  const maxReached = reportCount >= 3;

  // Pesan sukses otomatis hilang setelah beberapa detik (tampil seperti alert).
  useEffect(() => {
    if (!sukses) return;
    const t = setTimeout(() => setSukses(null), 4000);
    return () => clearTimeout(t);
  }, [sukses]);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (maxReached) {
      setError(
        "Sudah mencapai batas pelaporan makan hari ini (3x). Anda tidak bisa melaporkan lagi.",
      );
      setSukses(null);
      return;
    }

    setError(null);
    setSukses(null);
    const formData = new FormData(e.currentTarget);

    startTransition(async () => {
      const res = await submitLaporanMakanAction(formData);
      if (!res.success) {
        setError(res.error);
      } else {
        setSukses(res.message ?? "Laporan makan berhasil disimpan!");
        formRef.current?.reset();
        router.refresh();
      }
    });
  };

  const inputClass = `w-full rounded-lg border border-slate-300 p-2 text-sm outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 ${
    maxReached ? "cursor-not-allowed bg-slate-100" : ""
  }`;

  return (
    <form
      ref={formRef}
      onSubmit={handleSubmit}
      className="rounded-2xl border border-slate-200 bg-white p-6"
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-base font-semibold text-brand-950">
            Catat Makanan Hari Ini
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            Isi apa yang Anda makan agar Nakes dapat memantau asupan gizi selama
            pengobatan.
          </p>
        </div>

        <div className="rounded-full border border-brand-200 bg-brand-50 px-3 py-1 text-sm font-semibold text-brand-700">
          {reportCount}/3
        </div>
      </div>

      {maxReached ? (
        <div className="mt-4 rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-700">
          Sudah mencapai batas pelaporan makan hari ini (3x). Anda tidak bisa
          melaporkan lagi.
        </div>
      ) : (
        <div className="mt-4 rounded-lg border border-slate-200 bg-slate-50 p-3 text-sm text-slate-600">
          Anda masih bisa melaporkan {3 - reportCount} kali lagi hari ini.
        </div>
      )}

      {error && (
        <div className="mt-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-600">
          {error}
        </div>
      )}
      {sukses && (
        <div
          role="alert"
          className="mt-4 flex items-center gap-2 rounded-lg border border-brand-200 bg-brand-50 p-3 text-sm font-medium text-brand-700"
        >
          <CheckIcon className="h-4 w-4 shrink-0" />
          <span className="flex-1">{sukses}</span>
          <button
            type="button"
            onClick={() => setSukses(null)}
            aria-label="Tutup"
            className="rounded p-0.5 text-brand-600 transition-colors hover:bg-brand-100"
          >
            <CloseIcon className="h-4 w-4" />
          </button>
        </div>
      )}

      <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
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
            disabled={maxReached}
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
            disabled={maxReached}
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
            disabled={maxReached}
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
            disabled={maxReached}
          />
        </div>
      </div>

      <div className="mt-5 flex justify-end">
        <button
          type="submit"
          disabled={isPending || maxReached}
          className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-brand-700 disabled:bg-brand-400"
        >
          {isPending ? "Menyimpan..." : "Simpan Laporan"}
        </button>
      </div>
    </form>
  );
}
