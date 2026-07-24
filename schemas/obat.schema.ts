import { optionalString } from "@/utils/string";
import z from "zod";

const nameRegex = /^[a-zA-Z\s.'-,]+$/;

const baseObatSchema = {
  nama_obat: z
    .string()
    .trim()
    .min(1, "Nama obat Wajib diisi")
    .max(100, "Nama obat maksimal 100 karakter")
    .regex(nameRegex, "Nama hanya boleh berisi huruf dan tanda baca umum"),

  jenis_obat: z
    .string()
    .trim()
    .min(1, "Jenis obat wajib disis")
    .max(50, "Jenis obat maksimal 50 karakter"),

  kategori_obat: z
    .string()
    .trim()
    .min(1, "Kategori obat wajib diisi")
    .max(50, "Kategori obat maksimal 50 karakter"),

  deskripsi: optionalString(255),
  dosis: optionalString(100),
  is_active: z.boolean().default(true),
};

export const createObatSchema = z.object({
  ...baseObatSchema,
});

export const updateObatSchema = z.object({
  ...baseObatSchema,
  id_obat: z.coerce.number().positive("ID Episode tidak valid"),
});
