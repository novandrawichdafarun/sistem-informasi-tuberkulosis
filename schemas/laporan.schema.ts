import { nameRegex } from "@/utils/regex";
import { optionalString } from "@/utils/string";
import z from "zod";

export const laporanObatSchema = z
  .object({
    id_jadwal: z.coerce.number().positive("ID Jadwal tidak valid"),
    status_input: z.enum(["diminum", "ditunda"]),
    catatan_kepatuhan: optionalString(255),
    reported_by: z.enum(["pasien", "pendamping", "nakes"]),
  })
  .refine(
    (data) => {
      if (data.status_input === "ditunda") {
        return (
          data.catatan_kepatuhan !== undefined &&
          data.catatan_kepatuhan.trim().length > 0
        );
      }
      return true;
    },
    {
      message: "Alasan wajib diisi jika obat ditunda",
      path: ["catatan_kepatuhan"],
    },
  );

export const laporanMakanSchema = z.object({
  id_episode: z.coerce.number().positive("ID Episode tidak valid"),

  karbo: z
    .string()
    .trim()
    .min(1, "Sumber karbohidrat wajib diisi")
    .max(50, "Karbo maksimal 50 karakter")
    .regex(nameRegex, "Makanan hanya boleh berisi huruf dan tanda baca umum"),

  protein: z
    .string()
    .trim()
    .min(1, "Sumber protein wajib diisi")
    .max(50, "Protein maksimal 50 karakter")
    .regex(nameRegex, "Makanan hanya boleh berisi huruf dan tanda baca umum"),

  serat: z
    .string()
    .trim()
    .min(1, "Sumber serat wajib diisi")
    .max(50, "Serat maksimal 50 karakter")
    .regex(nameRegex, "Makanan hanya boleh berisi huruf dan tanda baca umum"),

  catatan: optionalString(255),
});
