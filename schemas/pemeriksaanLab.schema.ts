import { optionalString } from "@/utils/string";
import z from "zod";

const dateRegex = /^\d{4}-\d{2}-\d{2}$/;

const basePemeriksaanLabSchema = {
  jenis_tes: z
    .string()
    .trim()
    .min(1, "Jenis Tes tidak boleh kosong")
    .max(50, "Jenis Tes maksimal 50 karakter"),

  tanggal_tes: z
    .string()
    .min(1, "Tanggal tes wajib diisi")
    .regex(dateRegex, "Format tanggal harus YYYY-MM-DD")
    .refine(
      (dateStr) => {
        const inputDate = new Date(dateStr);
        const today = new Date();
        today.setHours(24, 0, 0, 0);
        return inputDate <= today;
      },
      { message: "Tanggal tes tidak boleh melebihi hari ini" },
    ),

  periode_pemeriksaan: z
    .string()
    .trim()
    .min(1, "Periode Pemeriksaan tidak boleh kosong")
    .max(50, "Periode Pemeriksaan maksimal 50 karakter"),

  jenis_sample: optionalString(50),

  dna_bakteri_tb: z
    .string()
    .trim()
    .min(1, "DNA Bakteri tidak boleh kosong")
    .max(50, "DNA Bakteri maksimal 50 karakter"),

  status_resistensi: z
    .string()
    .trim()
    .min(1, "Status Resistensi tidak boleh kosong")
    .max(50, "Status Resistensi maksimal 50 karakter"),

  hasil_tes: z
    .string()
    .trim()
    .min(1, "Hasil Tes tidak boleh kosong")
    .max(50, "Hasil Tes maksimal 50 karakter"),

  hasil_bta: optionalString(50),
  berkas_pendukung_url: optionalString(255),
};

export const createPemeriksaanLabSchema = z.object({
  ...basePemeriksaanLabSchema,
  id_episode: z.coerce.number().positive("ID Episode tidak valid"),
});

export const updatePemeriksaanLabSchema = z.object({
  ...basePemeriksaanLabSchema,
  id_tes: z.coerce.number().positive("ID Tes tidak valid"),
  id_episode: z.coerce.number().positive("ID Episode tidak valid"),
});
