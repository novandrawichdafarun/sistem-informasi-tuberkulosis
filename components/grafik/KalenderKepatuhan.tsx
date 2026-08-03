"use client";

import { useMemo, useState } from "react";
import { KepatuhanHarian } from "@/types/laporan";
import { formatTanggalID } from "@/utils/date";
import { CheckIcon, ClockIcon, MinusIcon } from "@/components/asset/icons";
import { ChevronLeft, ChevronRight } from "lucide-react";

const HARI = ["Min", "Sen", "Sel", "Rab", "Kam", "Jum", "Sab"];
const BULAN = [
  "Januari",
  "Februari",
  "Maret",
  "April",
  "Mei",
  "Juni",
  "Juli",
  "Agustus",
  "September",
  "Oktober",
  "November",
  "Desember",
];

type CellStatus = "diminum" | "terlewat" | "belum" | "kosong" | "depan";

const STATUS_STYLE: Record<Exclude<CellStatus, "kosong" | "depan">, string> = {
  diminum: "bg-brand-600 text-white ring-1 ring-inset ring-brand-700/20",
  terlewat: "bg-red-500 text-white ring-1 ring-inset ring-red-600/20",
  belum: "bg-slate-100 text-slate-500 ring-1 ring-inset ring-slate-200",
};

const monthKeyOf = (y: number, m: number) =>
  `${y}-${String(m + 1).padStart(2, "0")}`;

/** Gabungkan beberapa jadwal pada satu tanggal jadi satu status ringkas. */
function aggregate(records: KepatuhanHarian[]): CellStatus {
  if (records.length === 0) return "kosong";
  const diminum = records.filter((r) => r.status === "diminum").length;
  const terlewat = records.filter((r) => r.status === "terlewat").length;
  if (diminum === records.length) return "diminum";
  if (terlewat > 0) return "terlewat";
  return "belum";
}

export default function KalenderKepatuhan({
  days,
  today,
}: {
  days: KepatuhanHarian[];
  today: string; // "YYYY-MM-DD" dari server (hindari mismatch hidrasi)
}) {
  const [ty, tmStr] = today.split("-");
  const curYear = Number(ty);
  const curMonth = Number(tmStr) - 1; // 0-based
  const curKey = monthKeyOf(curYear, curMonth);

  // Rentang navigasi: 12 bulan ke belakang & 12 bulan ke depan dari bulan berjalan.
  const earliestKey = useMemo(() => {
    const d = new Date(curYear, curMonth - 12, 1);
    return monthKeyOf(d.getFullYear(), d.getMonth());
  }, [curYear, curMonth]);
  const latestKey = useMemo(() => {
    const d = new Date(curYear, curMonth + 12, 1);
    return monthKeyOf(d.getFullYear(), d.getMonth());
  }, [curYear, curMonth]);

  const [cursor, setCursor] = useState({ y: curYear, m: curMonth });
  const cursorKey = monthKeyOf(cursor.y, cursor.m);

  const canPrev = cursorKey > earliestKey;
  const canNext = cursorKey < latestKey;

  const goPrev = () =>
    setCursor(({ y, m }) => (m === 0 ? { y: y - 1, m: 11 } : { y, m: m - 1 }));
  const goNext = () =>
    setCursor(({ y, m }) => (m === 11 ? { y: y + 1, m: 0 } : { y, m: m + 1 }));
  const goToday = () => setCursor({ y: curYear, m: curMonth });

  // Kelompokkan jadwal per tanggal untuk bulan yang sedang ditampilkan.
  const { cells, firstWeekday, tally } = useMemo(() => {
    const daysInMonth = new Date(cursor.y, cursor.m + 1, 0).getDate();
    const first = new Date(cursor.y, cursor.m, 1).getDay();

    const byDate = new Map<string, KepatuhanHarian[]>();
    for (const d of days) {
      if (!d.tanggal.startsWith(cursorKey)) continue;
      const arr = byDate.get(d.tanggal) ?? [];
      arr.push(d);
      byDate.set(d.tanggal, arr);
    }

    const t = { diminum: 0, terlewat: 0, belum: 0 };
    const out: {
      dd: number;
      dateStr: string;
      status: CellStatus;
      isToday: boolean;
    }[] = [];
    for (let dd = 1; dd <= daysInMonth; dd++) {
      const dateStr = `${cursorKey}-${String(dd).padStart(2, "0")}`;
      const records = byDate.get(dateStr) ?? [];
      let status = aggregate(records);
      if (status === "diminum") t.diminum++;
      else if (status === "terlewat") t.terlewat++;
      else if (status === "belum") t.belum++;
      if (status === "kosong" && dateStr > today) status = "depan";
      out.push({ dd, dateStr, status, isToday: dateStr === today });
    }
    return { cells: out, firstWeekday: first, tally: t };
  }, [days, cursor, cursorKey, today]);

  const adaJadwal = tally.diminum + tally.terlewat + tally.belum > 0;

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-6">
      {/* Toolbar navigasi */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={goPrev}
            disabled={!canPrev}
            aria-label="Bulan sebelumnya"
            className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 text-slate-600 transition hover:bg-slate-50 hover:text-brand-700 disabled:cursor-not-allowed disabled:opacity-40"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <h2 className="min-w-[9.5rem] text-center text-base font-semibold text-brand-950 sm:min-w-[10rem] sm:text-left">
            {BULAN[cursor.m]} {cursor.y}
          </h2>
          <button
            type="button"
            onClick={goNext}
            disabled={!canNext}
            aria-label="Bulan berikutnya"
            className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 text-slate-600 transition hover:bg-slate-50 hover:text-brand-700 disabled:cursor-not-allowed disabled:opacity-40"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
          {cursorKey !== curKey && (
            <button
              type="button"
              onClick={goToday}
              className="ml-1 rounded-lg border border-brand-200 bg-brand-50 px-3 py-1.5 text-xs font-semibold text-brand-700 transition hover:bg-brand-100"
            >
              Bulan ini
            </button>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-slate-500">
          <LegendDot className="bg-brand-600" label="Diminum" />
          <LegendDot className="bg-red-500" label="Telat lapor" />
          <LegendDot className="bg-slate-200" label="Belum lapor" />
        </div>
      </div>

      {/* Ringkasan bulan terpilih */}
      {adaJadwal && (
        <div className="mt-4 flex flex-wrap gap-2 text-xs">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-brand-50 px-3 py-1 font-medium text-brand-700">
            <CheckIcon className="h-3.5 w-3.5" /> {tally.diminum} diminum
          </span>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-red-50 px-3 py-1 font-medium text-red-600">
            <ClockIcon className="h-3.5 w-3.5" /> {tally.terlewat} telat lapor
          </span>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-3 py-1 font-medium text-slate-500">
            <MinusIcon className="h-3.5 w-3.5" /> {tally.belum} belum lapor
          </span>
        </div>
      )}

      {/* Header hari */}
      <div className="mt-4 grid grid-cols-7 gap-1.5 sm:gap-2">
        {HARI.map((h, i) => (
          <div
            key={h}
            className={`pb-1 text-center text-[11px] font-semibold uppercase tracking-wide ${
              i === 0 ? "text-red-400" : "text-slate-400"
            }`}
          >
            {h}
          </div>
        ))}

        {/* Sel kosong sebelum tanggal 1 */}
        {Array.from({ length: firstWeekday }).map((_, i) => (
          <div key={`pad-${i}`} />
        ))}

        {/* Tanggal */}
        {cells.map((c) => {
          const base =
            "relative flex min-h-14 flex-col rounded-lg p-1.5 text-xs font-semibold sm:min-h-20 sm:rounded-xl sm:p-2 sm:text-sm";
          const tone =
            c.status === "kosong" || c.status === "depan"
              ? "bg-slate-50 text-slate-400"
              : STATUS_STYLE[c.status];
          const ring = c.isToday
            ? " outline outline-2 outline-offset-1 outline-brand-500"
            : "";
          const title =
            c.status === "kosong" || c.status === "depan"
              ? `${formatTanggalID(c.dateStr)} · tidak ada jadwal`
              : `${formatTanggalID(c.dateStr)} · ${
                  c.status === "belum"
                    ? "belum lapor"
                    : c.status === "terlewat"
                      ? "telat lapor"
                      : c.status
                }`;
          return (
            <div
              key={c.dateStr}
              title={title}
              className={`${base} ${tone}${ring}`}
            >
              <span className="leading-none">{c.dd}</span>
              {c.status === "diminum" && (
                <CheckIcon className="absolute right-1 top-1 hidden h-3.5 w-3.5 opacity-80 sm:block" />
              )}
              {c.status === "terlewat" && (
                <ClockIcon className="absolute right-1 top-1 hidden h-3.5 w-3.5 opacity-80 sm:block" />
              )}
              {c.status === "belum" && (
                <MinusIcon className="absolute right-1 top-1 hidden h-3.5 w-3.5 opacity-70 sm:block" />
              )}
            </div>
          );
        })}
      </div>

      {!adaJadwal && (
        <p className="mt-4 rounded-xl bg-slate-50 p-4 text-center text-sm text-slate-500">
          {cursorKey > curKey
            ? `Belum ada data laporan untuk ${BULAN[cursor.m]} ${cursor.y}.`
            : `Tidak ada jadwal minum obat pada ${BULAN[cursor.m]} ${cursor.y}.`}
        </p>
      )}
    </div>
  );
}

function LegendDot({ className, label }: { className: string; label: string }) {
  return (
    <span className="inline-flex items-center gap-1.5">
      <span className={`h-3 w-3 rounded-full ${className}`} />
      {label}
    </span>
  );
}
