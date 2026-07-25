import { optionalString } from "@/utils/string";
import z from "zod";

const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
const timeRegex = /^\d{2}:\d{2}$/;

export const createResepSchema = z.object({
  id_episode: z.coerce.number().positive("Episode tidak valid"),
  kategori_regimen: z
    .string()
    .trim()
    .min(1, "Kategori regimen wajib dipilih")
    .max(50),
  fase_pengobatan: z
    .string()
    .trim()
    .min(1, "Fase pengobatan wajib dipilih")
    .max(50),
  tanggal_mulai_obat: z
    .string()
    .regex(dateRegex, "Format tanggal harus YYYY-MM-DD"),
  durasi_hari: z.coerce
    .number()
    .int("Durasi harus bilangan bulat")
    .min(1, "Durasi minimal 1 hari")
    .max(365, "Durasi maksimal 365 hari"),
  jam_jadwal: z.string().regex(timeRegex, "Format jam harus HH:MM"),
  obat_ids: z
    .string()
    .transform((s) =>
      s
        .split(",")
        .map((x) => x.trim())
        .filter(Boolean)
        .map(Number),
    )
    .refine(
      (arr) => arr.length > 0 && arr.every((n) => Number.isFinite(n) && n > 0),
      "Pilih minimal satu obat",
    ),
  jumlah_per_minum: z.coerce
    .number()
    .min(0.25, "Jumlah per minum tidak valid")
    .max(20, "Jumlah per minum terlalu besar"),
  aturan_pakai: optionalString(100),
});
