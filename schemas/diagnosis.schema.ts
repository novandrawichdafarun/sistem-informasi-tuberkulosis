import { optionalString } from "@/utils/string";
import z from "zod";

const dateRegex = /^\d{4}-\d{2}-\d{2}$/;

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

  kode_icd10: z
    .string()
    .trim()
    .min(1, "Kode icd10 tidak boleh kosong")
    .max(30, "Kode icd10 maksimal 30 karakter"),

  klasifikasi_anatomi: optionalString(50),
  lokasi_anatomi: optionalString(100),

  klasifikasi_resistensi: z
    .string()
    .trim()
    .min(1, "Klasifikasi resistensi tidak boleh kososng")
    .max(50, "Klasifikasi Resistensi maksimal 50 karakter"),
  tipe_resistensi: optionalString(50),

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
