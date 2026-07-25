import { optionalString } from "@/utils/string";
import z from "zod";

const boolField = z
  .enum(["true", "false"])
  .transform((v) => v === "true");

export const createObatSchema = z.object({
  nama_obat: z
    .string()
    .trim()
    .min(2, "Nama obat minimal 2 karakter")
    .max(100, "Nama obat maksimal 100 karakter"),
  jenis_obat: optionalString(50),
  kategori_obat: optionalString(50),
  dosis: optionalString(50),
  deskripsi: optionalString(500),
  is_active: boolField,
});

export const updateObatSchema = createObatSchema.extend({
  id_obat: z.coerce.number().positive("ID Obat tidak valid"),
});
