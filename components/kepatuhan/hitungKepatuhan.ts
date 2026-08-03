import { KepatuhanHarian } from "@/types/laporan";

export type RingkasKepatuhanObat = {
  persentase: number; // 0–100, mulai dari 100%
  dinilai: number; // dosis yang sudah jatuh tempo (dasar penilaian)
  diminum: number; // diminum tepat waktu
  terlewat: number; // dilaporkan tapi telat
  tidakMinum: number; // jatuh tempo tapi tidak dilaporkan
};

/**
 * Kepatuhan minum obat dengan model "mulai 100%, berkurang tiap telat/tidak minum".
 *
 * - Hanya dosis yang **sudah jatuh tempo** yang dinilai.
 * - Dosis hari ini / mendatang yang **belum dilaporkan** diberi grace (tidak dihitung),
 *   sehingga tidak langsung menurunkan persentase sebelum waktunya.
 * - Persentase = diminum / dinilai. Telat (terlewat) dan tidak minum sama-sama mengurangi.
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
    else tidakMinum++; // null (lewat, tak dilaporkan) atau "ditunda"
  }

  const dinilai = diminum + terlewat + tidakMinum;
  const persentase = dinilai > 0 ? Math.round((diminum / dinilai) * 100) : 100;

  return { persentase, dinilai, diminum, terlewat, tidakMinum };
}
