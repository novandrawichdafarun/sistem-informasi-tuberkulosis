import { z } from "zod";

export const bukaEpisodeSchema = z.object({
  id_pasien: z.coerce.number().positive("ID Pasien tidak valid"),
  tanggal_mulai: z.string().min(1, "Tanggal mulai wajib diisi"),
  tipe_pasien: z.string().min(1, "Tipe pasien wajib diisi"),
});

export const tutupEpisodeSchema = z.object({
  id_episode: z.coerce.number().positive("ID Episode tidak valid"),
  tanggal_selesai: z.string().min(1, "Tanggal selesai wajib diisi"),
  tipe_pasien: z.string().min(1, "Tipe pasien wajib diisi"),
});

export const editEpisodeSchema = z.object({
  id_episode: z.coerce.number().positive("ID Episode tidak valid"),
  tanggal_mulai: z.string().min(1, "Tanggal mulai wajib diisi"),
  tanggal_selesai: z.string().nullable().optional(),
  tipe_pasien: z.string().min(1, "Tipe pasien wajib diisi"),
});
