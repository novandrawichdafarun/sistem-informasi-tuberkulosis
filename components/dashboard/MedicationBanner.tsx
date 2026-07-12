"use client";

import { useEffect, useState } from "react";
import { CheckIcon, PillIcon } from "./icons";

// Reports are tracked per calendar day. Wire this to a server action / Supabase
// later; for now the confirmation is persisted locally so "today" survives reloads.
function todayKey() {
  const d = new Date();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `pantautb:med-taken-${d.getFullYear()}-${mm}-${dd}`;
}

export default function MedicationBanner({
  scheduleTime = "07:00",
}: {
  scheduleTime?: string;
}) {
  const [mounted, setMounted] = useState(false);
  const [takenAt, setTakenAt] = useState<string | null>(null);

  useEffect(() => {
    setMounted(true);
    try {
      setTakenAt(localStorage.getItem(todayKey()));
    } catch {
      /* ignore */
    }
  }, []);

  const confirm = () => {
    const now = new Date().toLocaleTimeString("id-ID", {
      hour: "2-digit",
      minute: "2-digit",
    });
    setTakenAt(now);
    try {
      localStorage.setItem(todayKey(), now);
    } catch {
      /* ignore */
    }
  };

  const undo = () => {
    setTakenAt(null);
    try {
      localStorage.removeItem(todayKey());
    } catch {
      /* ignore */
    }
  };

  // Neutral placeholder on first paint to avoid a hydration mismatch.
  if (!mounted) {
    return (
      <div className="mb-6 h-[104px] animate-pulse rounded-2xl border border-slate-200 bg-white" />
    );
  }

  if (takenAt) {
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
            Dilaporkan pukul {takenAt} &middot; Terima kasih sudah patuh!
          </p>
        </div>
        <button
          type="button"
          onClick={undo}
          className="shrink-0 rounded-lg px-3 py-1.5 text-xs font-medium text-brand-700 transition-colors hover:bg-brand-100"
        >
          Urungkan
        </button>
      </div>
    );
  }

  return (
    <div className="mb-6 flex flex-col gap-4 rounded-2xl border border-amber-200 bg-amber-50 p-5 sm:flex-row sm:items-center">
      <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-amber-500 text-white">
        <PillIcon className="h-7 w-7" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-lg font-bold text-amber-900">
          Belum ada laporan hari ini
        </p>
        <p className="mt-0.5 text-sm text-amber-800/80">
          Jadwal minum obat Anda pukul {scheduleTime}. Apakah sudah diminum?
        </p>
      </div>
      <button
        type="button"
        onClick={confirm}
        className="shrink-0 rounded-lg bg-brand-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm shadow-brand-600/20 transition-all hover:bg-brand-700 hover:shadow-md"
      >
        Konfirmasi Sudah Minum
      </button>
    </div>
  );
}
