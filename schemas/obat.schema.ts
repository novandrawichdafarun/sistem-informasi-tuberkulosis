import { nameRegex } from "@/utils/regex";
import { optionalString } from "@/utils/string";
import z from "zod";

const baseObatSchema = {
  nama_obat: z
    .string()
    .trim()
    .min(1, "Nama obat Wajib diisi")
    .max(100, "Nama obat maksimal 100 karakter")
    .regex(nameRegex, "Nama hanya boleh berisi huruf dan tanda baca umum"),

  deskripsi: optionalString(255),
  dosis: z
    .string()
    .trim()
    .min(1, "Dosis wajib diisi")
    .transform((val) => Number(val))
    .pipe(
      z
        .number({ error: "Dosis harus berupa angka" })
        .min(0, "Dosis obat tidak boleh minus")
        .max(1000, "Dosis terlalu tinggi"),
    ),
  is_active: z.boolean().default(true),
};

export const createObatSchema = z.object({
  ...baseObatSchema,
});

export const updateObatSchema = z
  .object(baseObatSchema)
  .omit({ is_active: true })
  .extend({
    id_obat: z.coerce.number().positive("ID Obat tidak valid"),
  });
