import z from "zod";

export function parseOptionalNumber(
  value: FormDataEntryValue | null,
): number | undefined {
  if (!value || typeof value !== "string" || value.trim() === "")
    return undefined;
  const parsed = Number(value);
  return isNaN(parsed) ? undefined : parsed;
}

export function hitungBMI(bb?: number | null, tb?: number | null) {
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

export const optionalNumber = (min: number, max: number, name: string) =>
  z.preprocess(
    (val) =>
      val === "" || val === undefined || val === null ? undefined : Number(val),
    z
      .number()
      .min(min, `${name} terlalu rendah`)
      .max(max, `${name} terlalu tinggi`)
      .optional(),
  );

/** Kategori kualitatif dari persentase kepatuhan. */
export function kategori(persen: number): { label: string; className: string } {
  if (persen >= 80)
    return {
      label: "Kepatuhan Baik",
      className: "bg-emerald-100 text-emerald-700",
    };
  if (persen >= 60)
    return {
      label: "Kepatuhan Cukup",
      className: "bg-amber-100 text-amber-700",
    };
  return { label: "Perlu Ditingkatkan", className: "bg-red-100 text-red-700" };
}

export function nilai(v: number | string | null | undefined, unit = "") {
  if (v === null || v === undefined || v === "") return "-";
  return `${v}${unit}`;
}

export function fmt(v: number | null) {
  if (v == null) return "-";
  return Number.isInteger(v) ? String(v) : v.toFixed(1);
}
