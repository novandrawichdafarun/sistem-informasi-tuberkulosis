import { KepatuhanHarian } from "@/types/laporan";

export type RingkasKepatuhanObat = {
  persentase: number; // 0–100, mulai dari 100%
  dinilai: number; // obat yang sudah jatuh tempo (dasar penilaian)
  diminum: number; // diminum tepat waktu
  terlewat: number; // dilaporkan tapi telat
  tidakMinum: number; // jatuh tempo tapi tidak dilaporkan
};

/**
 * Kepatuhan minum obat dengan model "mulai 100%, berkurang tiap telat/belum lapor".
 *
 * - Hanya obat yang **sudah jatuh tempo** yang dinilai.
 * - Obat hari ini / mendatang yang **belum dilaporkan** diberi grace (tidak dihitung),
 *   sehingga tidak langsung menurunkan persentase sebelum waktunya.
 * - Persentase = diminum / dinilai. Telat (terlewat) dan belum lapor sama-sama mengurangi.
 */
export function hitungKepatuhanObat(
  days: KepatuhanHarian[],
  today: string, // "YYYY-MM-DD"
): RingkasKepatuhanObat {
  let diminum = 0;
  let terlewat = 0;
  let tidakMinum = 0;

  for (const d of days) {
    const sudahLapor = d.status != null;
    // Hari ini / mendatang yang belum dilaporkan → belum jatuh tempo, dilewati.
    if (!sudahLapor && d.tanggal >= today) continue;

    if (d.status === "diminum") diminum++;
    else if (d.status === "terlewat") terlewat++;
    else if (d.status === null) tidakMinum++;
    else tidakMinum++; // null (lewat, tak dilaporkan) atau "ditunda"
  }

  const dinilai = diminum + terlewat + tidakMinum;
  const persentase = dinilai > 0 ? Math.round((diminum / dinilai) * 100) : 100;

  return { persentase, dinilai, diminum, terlewat, tidakMinum };
}

export type CellKeyValue = "diminum" | "terlewat" | "belum";
export type CellStatus = "diminum" | "terlewat" | "belum" | "kosong" | "depan";
export const KNOWN_STATUSES: CellStatus[] = [
  "diminum",
  "terlewat",
  "belum",
  "depan",
  "kosong",
];

export function cellKey(day: KepatuhanHarian): CellKeyValue {
  if (day.status === "diminum") return "diminum";
  if (day.status === "terlewat") return "terlewat";
  return "belum";
}

export const STATUS_STYLE: Record<
  Exclude<CellStatus, "kosong" | "depan">,
  string
> = {
  diminum: "bg-brand-600 text-white ring-1 ring-inset ring-brand-700/20",
  terlewat: "bg-red-500 text-white ring-1 ring-inset ring-red-600/20",
  belum: "bg-slate-100 text-slate-500 ring-1 ring-inset ring-slate-200",
};

/** Gabungkan beberapa jadwal pada satu tanggal jadi satu status ringkas. */
export function aggregate(records: KepatuhanHarian[]): CellStatus {
  if (records.length === 0) return "kosong";
  const diminum = records.filter((r) => r.status === "diminum").length;
  const terlewat = records.filter((r) => r.status === "terlewat").length;
  if (diminum === records.length) return "diminum";
  if (terlewat > 0) return "terlewat";
  return "belum";
}

export const STATUS_DOT_CLASS: Record<CellStatus, string> = {
  diminum: "bg-brand-600",
  terlewat: "bg-red-500",
  belum: "bg-slate-400",
  depan: "bg-slate-200",
  kosong: "bg-slate-100",
};

export const STATUS_LABEL: Record<CellStatus, string> = {
  diminum: "diminum",
  terlewat: "telat lapor",
  belum: "tidak lapor",
  depan: "belum lapor",
  kosong: "tidak ada jadwal",
};

export function getStatusTone(status: CellStatus) {
  if (status === "kosong" || status === "depan") {
    return "bg-slate-50 text-slate-400";
  }
  return STATUS_STYLE[status as "diminum" | "terlewat" | "belum"];
}

export function getStatusDotClass(status: CellStatus) {
  if (status === "kosong" || status === "depan") {
    return "bg-slate-200";
  }
  return STATUS_DOT_CLASS[status as "diminum" | "terlewat" | "belum"];
}

export function normalizeCellStatus(value: string | undefined): CellStatus {
  if (KNOWN_STATUSES.includes(value as CellStatus)) {
    return value as CellStatus;
  }
  return "kosong";
}
