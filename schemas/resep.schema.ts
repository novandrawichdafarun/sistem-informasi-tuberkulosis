import { parseDailyFrequency } from "@/utils/date";
import { dateRegex, timeRegex } from "@/utils/regex";
import z from "zod";

const obatItemSchema = z
  .object({
    id_obat: z.coerce.number().positive("Obat tidak valid"),
    jumlah_per_minum: z.coerce
      .number()
      .min(0.25, "Jumlah per minum tidak valid")
      .max(20, "Jumlah per minum terlalu besar"),
    frekuensi_minum: z
      .string()
      .trim()
      .min(1, "Frekuensi minum wajib diisi")
      .max(50),
    aturan_pakai: z
      .string()
      .trim()
      .min(1, "Aturan pakai tidak boleh kosong")
      .max(100, "Aturan pakai maksimal 100 karakter"),
    tanggal_mulai_obat: z
      .string()
      .regex(dateRegex, "Format tanggal harus YYYY-MM-DD"),
    tanggal_selesai_obat: z
      .string()
      .regex(dateRegex, "Format tanggal harus YYYY-MM-DD"),
    jam_jadwal: z.preprocess(
      (value) => {
        if (typeof value === "string") {
          return value
            .split(",")
            .map((item) => item.trim())
            .filter(Boolean);
        }
        if (Array.isArray(value)) {
          return value.map((item) => String(item).trim()).filter(Boolean);
        }
        return value;
      },
      z
        .array(z.string().regex(timeRegex, "Format jam harus HH:MM"))
        .min(1, "Pilih minimal satu jam jadwal"),
    ),
    jumlah_total_diberikan: z.coerce
      .number()
      .int("Jumlah total diberikan harus bilangan bulat")
      .positive("Jumlah total diberikan harus lebih besar dari 0"),
  })
  .superRefine((item, ctx) => {
    if (item.tanggal_selesai_obat < item.tanggal_mulai_obat) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["tanggal_selesai_obat"],
        message: "Tanggal selesai harus sama atau setelah tanggal mulai",
      });
    }

    const expected = parseDailyFrequency(item.frekuensi_minum);
    if (expected !== null) {
      const uniqueTimes = Array.from(new Set(item.jam_jadwal));
      if (item.jam_jadwal.length !== expected) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["jam_jadwal"],
          message: `Frekuensi ${item.frekuensi_minum} memerlukan ${expected} jam jadwal`,
        });
      } else if (uniqueTimes.length !== item.jam_jadwal.length) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["jam_jadwal"],
          message: "Jam jadwal harus berbeda untuk setiap pengambilan",
        });
      }
    }
  });

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
  obat_items: z
    .preprocess((value) => {
      if (typeof value === "string") {
        try {
          return JSON.parse(value);
        } catch {
          return value;
        }
      }
      return value;
    }, z.array(obatItemSchema))
    .refine(
      (arr) => Array.isArray(arr) && arr.length > 0,
      "Pilih minimal satu obat",
    ),
});
