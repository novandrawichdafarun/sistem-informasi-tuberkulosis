import { optionalString } from "@/utils/string";
import z from "zod";

const makananField = (label: string) =>
  z
    .string()
    .trim()
    .min(1, `${label} tidak boleh kosong`)
    .max(50, `${label} maksimal 50 karakter`);

export const createLaporanMakanSchema = z.object({
  waktu_makan: z.string().min(1, "Waktu makan wajib diisi"),
  karbo: makananField("Karbohidrat"),
  protein: makananField("Protein"),
  serat: makananField("Serat"),
  catatan: optionalString(500),
});
