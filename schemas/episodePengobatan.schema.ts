import { z } from "zod";

const dateRegex = /^\d{4}-\d{2}-\d{2}$/;

export const bukaEpisodeSchema = z.object({
  id_pasien: z.coerce.number().positive("ID Pasien tidak valid"),
  tanggal_mulai: z
    .string()
    .min(1, "Tanggal mulai wajib diisi")
    .regex(dateRegex, "Format tanggal harus YYYY-MM-DD"),
  tipe_pasien: z
    .string()
    .trim()
    .min(1, "Tipe pasien wajib diisi")
    .max(50, "Tipe pasien maksimal 50 karakter"),
});

export const tutupEpisodeSchema = z.object({
  id_episode: z.coerce.number().positive("ID Episode tidak valid"),
  tanggal_selesai: z
    .string()
    .min(1, "Tanggal selesai wajib diisi")
    .regex(dateRegex, "Format tanggal harus YYYY-MM-DD"),
  tipe_pasien: z
    .string()
    .trim()
    .min(1, "Tipe pasien wajib diisi")
    .max(50, "Tipe pasien maksimal 50 karakter"),
});

export const editEpisodeSchema = z.object({
  id_episode: z.coerce.number().positive("ID Episode tidak valid"),
  tanggal_mulai: z
    .string()
    .min(1, "Tanggal mulai wajib diisi")
    .regex(dateRegex, "Format tanggal harus YYYY-MM-DD"),
  tanggal_selesai: z
    .string()
    .regex(dateRegex, "Format tanggal harus YYYY-MM-DD")
    .nullable()
    .optional()
    .or(z.literal("")),
  tipe_pasien: z
    .string()
    .trim()
    .min(1, "Tipe pasien wajib diisi")
    .max(50, "Tipe pasien maksimal 50 karakter"),
});
