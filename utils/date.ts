import { dailyFrequencyRegex } from "./regex";

const BULAN_ID = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "Mei",
  "Jun",
  "Jul",
  "Agu",
  "Sep",
  "Okt",
  "Nov",
  "Des",
];

export function todayISO(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(
    d.getDate(),
  ).padStart(2, "0")}`;
}

// Tambah `n` hari ke tanggal "YYYY-MM-DD" (aman dari zona waktu, pakai UTC).
export function addDays(dateStr: string, n: number): string {
  const [y, m, d] = dateStr.split("-").map(Number);
  const dt = new Date(Date.UTC(y, m - 1, d));
  dt.setUTCDate(dt.getUTCDate() + n);
  return dt.toISOString().slice(0, 10);
}

type MonthMeta = { key: string; label: string; start: string; end: string };

export function buildMonths(n = 6): MonthMeta[] {
  const months: MonthMeta[] = [];
  const now = new Date();
  for (let i = n - 1; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const y = d.getFullYear();
    const m = d.getMonth();
    const key = `${y}-${String(m + 1).padStart(2, "0")}`;
    const endDay = new Date(y, m + 1, 0).getDate();
    months.push({
      key,
      label: BULAN_ID[m],
      start: `${key}-01`,
      end: `${key}-${String(endDay).padStart(2, "0")}`,
    });
  }
  return months;
}

export function isoDaysAgo(days: number): string {
  const d = new Date();
  d.setDate(d.getDate() - days);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(
    d.getDate(),
  ).padStart(2, "0")}`;
}

export function formatTanggalID(
  value?: string | null,
  opts: Intl.DateTimeFormatOptions = {
    day: "numeric",
    month: "long",
    year: "numeric",
  },
): string {
  if (!value) return "-";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "-";
  return d.toLocaleDateString("id-ID", opts);
}

export function formatTanggalSingkat(value?: string | null): string {
  return formatTanggalID(value, {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export function formatJam(jam?: string | null): string {
  if (!jam) return "-";
  return jam.slice(0, 5); // "09:00:00" -> "09:00"
}

export function formatWaktuID(value?: string | null): string {
  if (!value) return "-";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "-";
  return d.toLocaleString("id-ID", {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function dayNumber(tanggal: string) {
  return tanggal.slice(8, 10); // "2026-07-25" -> "25"
}

export const diffDaysInclusive = (from: string, to: string) => {
  const start = new Date(from);
  const end = new Date(to);
  return Math.max(
    1,
    Math.round((end.valueOf() - start.valueOf()) / (1000 * 60 * 60 * 24)) + 1,
  );
};

export const getDayCount = (start: string, end: string) => {
  const startDate = new Date(start);
  const endDate = new Date(end);
  const diff = Math.round(
    (endDate.valueOf() - startDate.valueOf()) / (1000 * 60 * 60 * 24),
  );
  return Math.max(1, diff + 1);
};

export const getDailyFrequencyCount = (value: string) => {
  const match = /^(\d+)x sehari$/i.exec(value.trim());
  return match ? Number(match[1]) : 1;
};

export const parseDailyFrequency = (value: string) => {
  const match = dailyFrequencyRegex.exec(value.trim().toLowerCase());
  return match ? Number(match[1]) : null;
};

export function isReportLate(
  tanggalMinum: string,
  waktuMinum: string,
  toleranceHours: number = 1,
): boolean {
  const scheduleDateTimeString = `${tanggalMinum}T${waktuMinum}`;
  const scheduledTime = new Date(scheduleDateTimeString);

  const toleranceMilliseconds = toleranceHours * 60 * 60 * 1000;

  const maxValidTime = new Date(
    scheduledTime.getTime() + toleranceMilliseconds,
  );
  const currentTime = new Date();

  return currentTime > maxValidTime;
}

export function formatRemainingTime(ms: number) {
  const minutes = Math.ceil(ms / 60000);
  if (minutes <= 0) return "kurang dari 1 menit";
  if (minutes === 1) return "1 menit";
  return `${minutes} menit`;
}

export function formatTimeOnly(date: Date) {
  return date.toLocaleTimeString("id-ID", {
    hour: "2-digit",
    minute: "2-digit",
  });
}
