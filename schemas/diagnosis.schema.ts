import { dateRegex } from "@/utils/regex";
import { optionalString } from "@/utils/string";
import z from "zod";

const baseDiagnosisSchema = {
  tanggal_diagnosis: z
    .string()
    .min(1, "Tanggal diagnosis wajib diisi")
    .regex(dateRegex, "Format tanggal harus YYYY-MM-DD")
    .refine(
      (dateStr) => {
        const inputDate = new Date(dateStr);
        const today = new Date();
        today.setHours(24, 0, 0, 0);
        return inputDate <= today;
      },
      { message: "Tanggal diagnosis tidak boleh melebihi hari ini" },
    ),

  klasifikasi_anatomi: z
    .string()
    .trim()
    .min(1, "Klasifikasi Jenis TB tidak boleh kososng")
    .max(50, "Klasifikasi Jenis TB maksimal 50 karakter"),
  lokasi_anatomi: optionalString(100),

  dasar_diagnosis: optionalString(50),
  catatan_klinis: optionalString(255),
};

export const createDiagnosisSchema = z.object({
  ...baseDiagnosisSchema,
  id_episode: z.coerce.number().positive("ID Episode tidak valid"),
});

export const updateDaiganosisSchema = z.object({
  ...baseDiagnosisSchema,
  id_diagnosis: z.coerce.number().positive("ID Diagnosis tidak valid"),
  id_episode: z.coerce.number().positive("ID Episode tidak valid"),
});
