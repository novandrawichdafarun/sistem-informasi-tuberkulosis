// Helper format tanggal/jam berbahasa Indonesia untuk portal pasien.
// File baru — tidak menyentuh utils/date.ts yang sudah ada.

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
  return jam.slice(0, 5); // "07:00:00" -> "07:00"
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
