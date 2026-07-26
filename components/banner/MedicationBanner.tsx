"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { CheckIcon, PillIcon, ClockIcon } from "../asset/icons";
import { reportMedicationAction } from "@/actions/pasienPortal";
import { MedicationToday } from "@/types/pasienPortal";

function formatJam(jam?: string | null) {
  if (!jam) return "07:00";
  return jam.slice(0, 5); // "07:00:00" -> "07:00"
}

function formatWaktu(iso?: string | null) {
  if (!iso) return null;
  try {
    return new Date(iso).toLocaleTimeString("id-ID", {
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return null;
  }
}

export default function MedicationBanner({
  medication,
}: {
  medication: MedicationToday | null;
}) {
  const router = useRouter();
  const [confirming, setConfirming] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const submit = () => {
    setError(null);
    startTransition(async () => {
      const res = await reportMedicationAction("diminum");
      if (!res.success) {
        setError(res.error);
        return;
      }
      setConfirming(false);
      router.refresh();
    });
  };

  // Tidak ada jadwal minum obat untuk hari ini.
  if (!medication) {
    return (
      <div className="mb-6 flex items-center gap-4 rounded-2xl border border-slate-200 bg-white p-5">
        <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">
          <PillIcon className="h-7 w-7" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-lg font-bold text-brand-950">
            Belum ada jadwal obat hari ini
          </p>
          <p className="mt-0.5 text-sm text-slate-500">
            Jadwal minum obat Anda akan muncul di sini setelah Nakes menetapkan
            resep pengobatan.
          </p>
        </div>
      </div>
    );
  }

  const jam = formatJam(medication.jam_jadwal);
  const waktuLapor = formatWaktu(medication.reported_at);

  // Sudah dilaporkan diminum.
  if (medication.status === "diminum") {
    return (
      <div className="mb-6 flex items-center gap-4 rounded-2xl border border-brand-200 bg-brand-50 p-5">
        <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-brand-600 text-white">
          <CheckIcon className="h-7 w-7" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-lg font-bold text-brand-950">
            Obat sudah diminum hari ini
          </p>
          <p className="mt-0.5 text-sm text-brand-800/80">
            {waktuLapor
              ? `Dilaporkan pukul ${waktuLapor} · Terima kasih sudah patuh!`
              : "Terima kasih sudah patuh!"}
          </p>
        </div>
      </div>
    );
  }

  // Ditandai terlewat.
  if (medication.status === "terlewat") {
    return (
      <div className="mb-6 flex items-center gap-4 rounded-2xl border border-red-200 bg-red-50 p-5">
        <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-red-500 text-white">
          <ClockIcon className="h-7 w-7" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-lg font-bold text-red-900">Dosis terlewat</p>
          <p className="mt-0.5 text-sm text-red-800/80">
            Dosis pukul {jam} tercatat terlewat. Segera hubungi Nakes bila
            perlu.
          </p>
        </div>
      </div>
    );
  }

  // Belum dilaporkan (status null).
  return (
    <>
      <div className="mb-6 flex flex-col gap-4 rounded-2xl border border-amber-200 bg-amber-50 p-5 sm:flex-row sm:items-center">
        <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-amber-500 text-white">
          <PillIcon className="h-7 w-7" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-lg font-bold text-amber-900">
            Belum ada laporan hari ini
          </p>
          <p className="mt-0.5 text-sm text-amber-800/80">
            Jadwal minum obat Anda pukul {jam}. Apakah sudah diminum?
          </p>
          {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
        </div>
        <button
          type="button"
          onClick={() => setConfirming(true)}
          className="shrink-0 rounded-lg bg-brand-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm shadow-brand-600/20 transition-all hover:bg-brand-700 hover:shadow-md"
        >
          Konfirmasi Sudah Minum
        </button>
      </div>

      {/* Confirmation dialog */}
      {confirming && (
        <div
          className="fixed inset-0 z-[60] flex items-center justify-center p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="med-confirm-title"
        >
          <div
            onClick={() => !pending && setConfirming(false)}
            aria-hidden
            className="absolute inset-0 bg-slate-900/40"
          />
          <div className="relative z-10 w-full max-w-sm rounded-2xl bg-white p-6 shadow-xl">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-brand-100 text-brand-600">
              <PillIcon className="h-7 w-7" />
            </div>
            <h2
              id="med-confirm-title"
              className="mt-4 text-center text-lg font-bold text-brand-950"
            >
              Konfirmasi Minum Obat
            </h2>
            <p className="mt-1 text-center text-sm text-slate-500">
              Apakah Anda yakin sudah meminum obat untuk hari ini?
            </p>
            {error && (
              <p className="mt-2 text-center text-sm text-red-600">{error}</p>
            )}
            <div className="mt-6 flex gap-3">
              <button
                type="button"
                disabled={pending}
                onClick={() => setConfirming(false)}
                className="flex-1 rounded-lg border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-600 transition-colors hover:bg-slate-50 disabled:opacity-50"
              >
                Batal
              </button>
              <button
                type="button"
                disabled={pending}
                onClick={submit}
                className="flex-1 rounded-lg bg-brand-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm shadow-brand-600/20 transition-all hover:bg-brand-700 hover:shadow-md disabled:opacity-50"
              >
                {pending ? "Menyimpan..." : "Ya, Sudah Minum"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
