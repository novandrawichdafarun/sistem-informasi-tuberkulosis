import { optionalString } from "@/utils/string";
import z from "zod";

const dateRegex = /^\d{4}-\d{2}-\d{2}$/;

export const bukaEpisodeSchema = z.object({
  id_pasien: z.coerce.number().positive("ID Pasien tidak valid"),
  tanggal_mulai: z
    .string()
    .min(1, "Tanggal mulai wajib diisi")
    .regex(dateRegex, "Format tanggal harus YYYY-MM-DD")
    .refine(
      (dateStr) => {
        const inputDate = new Date(dateStr);
        const today = new Date();
        today.setHours(24, 0, 0, 0);
        return inputDate <= today;
      },
      { message: "Tanggal Mulai tidak boleh melebihi hari ini" },
    ),
  tanggal_selesai: z
    .string()
    .min(1, "Tanggal se;esai wajib diisi")
    .regex(dateRegex, "Format tanggal harus YYYY-MM-DD"),

  tipe_pasien: z
    .string()
    .trim()
    .min(1, "Tipe pasien wajib diisi")
    .max(50, "Tipe pasien maksimal 50 karakter"),
});

export const tutupEpisodeSchema = z.object({
  id_episode: z.coerce.number().positive("ID Episode tidak valid"),
  tanggal_penetapan: z
    .string()
    .min(1, "Tanggal Penetapan wajib diisi")
    .regex(dateRegex, "Format tanggal harus YYYY-MM-DD")
    .refine(
      (dateStr) => {
        const inputDate = new Date(dateStr);
        const today = new Date();
        today.setHours(24, 0, 0, 0);
        return inputDate <= today;
      },
      { message: "Tanggal tidak boleh melebihi hari ini" },
    ),
  status_akhir: z.string().trim().min(1, "Tipe pasien wajib diisi"),
  catatan_akhir: optionalString(255),
});

export const editEpisodeSchema = z
  .object({
    id_episode: z.coerce.number().positive("ID Episode tidak valid"),
    tanggal_mulai: z
      .string()
      .min(1, "Tanggal mulai wajib diisi")
      .regex(dateRegex, "Format tanggal harus YYYY-MM-DD")
      .refine(
        (dateStr) => {
          const inputDate = new Date(dateStr);
          const today = new Date();
          today.setHours(24, 0, 0, 0);
          return inputDate <= today;
        },
        { message: "Tanggal tidak boleh melebihi hari ini" },
      ),
    tanggal_selesai: z
      .string()
      .min(1, "Tanggal selesai wajib diisi")
      .regex(dateRegex, "Format tanggal harus YYYY-MM-DD"),

    tipe_pasien: z
      .string()
      .trim()
      .min(1, "Tipe pasien wajib diisi")
      .max(50, "Tipe pasien maksimal 50 karakter"),

    tanggal_penetapan: z
      .string()
      .regex(dateRegex, "Format tanggal harus YYYY-MM-DD")
      .optional(),
    status_akhir: z
      .string()
      .trim()
      .min(1, "Status akhir wajib diisi")
      .optional(),
    catatan_akhir: optionalString(255).optional(),
  })
  .transform((data) => ({
    id_episode: data.id_episode,
    tanggal_mulai: data.tanggal_mulai,
    tanggal_selesai: data.tanggal_selesai,
    tipe_pasien: data.tipe_pasien,
    hasil_akhir:
      data.tanggal_penetapan || data.status_akhir || data.catatan_akhir
        ? {
            tanggal_penetapan: data.tanggal_penetapan ?? "",
            status_akhir: data.status_akhir ?? "",
            catatan_akhir: data.catatan_akhir,
          }
        : undefined,
  }))
  .refine(
    (value) => {
      if (!value.hasil_akhir) return true;
      return (
        value.hasil_akhir.tanggal_penetapan.length > 0 &&
        value.hasil_akhir.status_akhir.length > 0
      );
    },
    {
      message: "Data hasil akhir wajib lengkap saat ada",
      path: ["hasil_akhir"],
    },
  );
