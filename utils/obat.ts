export const REGIMEN = ["Kategori 1", "Kategori 2", "Kategori Anak", "OAT MDR"];
export const FASE = ["Intensif", "Lanjutan"];
export const FREKUENSI = ["1x sehari", "2x sehari", "3x sehari", "4x sehari"];
export const DEFAULT_JAM = "09:00";

export function normalizeJamValues(value?: string | string[]): string[] {
  if (Array.isArray(value)) return value.length ? value : [DEFAULT_JAM];
  if (!value) return [DEFAULT_JAM];

  const list = value
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);

  return list.length ? list : [DEFAULT_JAM];
}
