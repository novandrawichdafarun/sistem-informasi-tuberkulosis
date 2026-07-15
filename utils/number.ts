export function parseOptionalNumber(
  value: FormDataEntryValue | null,
): number | undefined {
  if (!value || typeof value !== "string" || value.trim() === "")
    return undefined;
  const parsed = Number(value);
  return isNaN(parsed) ? undefined : parsed;
}

export function hitungIMT(bb?: number | null, tb?: number | null) {
  if (!bb || !tb) return null;

  const tbMeter = tb / 100; // Ubah cm ke meter
  const imt = bb / (tbMeter * tbMeter);

  let kategori = "";
  let colorClass = "";

  if (imt < 18.5) {
    kategori = "Kurang";
    colorClass = "bg-amber-100 text-amber-700";
  } else if (imt < 25) {
    kategori = "Normal";
    colorClass = "bg-emerald-100 text-emerald-700";
  } else if (imt < 30) {
    kategori = "Berlebih";
    colorClass = "bg-orange-100 text-orange-700";
  } else {
    kategori = "Obesitas";
    colorClass = "bg-red-100 text-red-700";
  }

  return { nilai: imt.toFixed(1), kategori, colorClass };
}
