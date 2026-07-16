import { optionalString } from "@/utils/string";
import z from "zod";

const dateRegex = /^\d{4}-\d{2}-\d{2}$/;

const basePemeriksaanLabSchema = {
  jenis_tes: z
    .string()
    .trim()
    .min(1, "Jenis tes tidak boleh kosong")
    .max(20, "Tipe pasien maksimal 50 karakter"),

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

  hasil_tes: z.string().trim().min(1, "Hasil tes tidak boleh kosong"),

  periode_bulanan: optionalString(50),
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
