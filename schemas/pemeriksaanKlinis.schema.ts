import { optionalNumber } from "@/utils/number";
import { optionalString } from "@/utils/string";
import { z } from "zod";

const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
const tensiRegex = /^\d{2,3}\/\d{2,3}$/; // Contoh valid: 120/80

const basePemeriksaanSchema = {
  tanggal_periksa: z
    .string()
    .min(1, "Tanggal periksa wajib diisi")
    .regex(dateRegex, "Format tanggal harus YYYY-MM-DD"),
  keluhan: optionalString(1000),

  tensi: z.preprocess(
    (val) => (val === "" ? undefined : val),
    z
      .string()
      .trim()
      .regex(tensiRegex, "Format tensi tidak valid (Contoh: 120/80)")
      .optional(),
  ),

  suhu: optionalNumber(30, 45, "Suhu"), // Suhu manusia 30°C - 45°C
  pernapasan: optionalNumber(10, 60, "Pernapasan"), // RR manusia wajar 10-60x/menit
  nadi: optionalNumber(30, 250, "Nadi"), // HR wajar 30-250 bpm
  saturasi_o2: optionalNumber(0, 100, "Saturasi O2"), // Saturasi maksimal 100%
  tinggi_badan_saat_ini: optionalNumber(30, 300, "Tinggi badan"),
  berat_badan_saat_ini: optionalNumber(1, 400, "Berat badan"),
};

export const createPemeriksaanSchema = z.object({
  ...basePemeriksaanSchema,
  id_episode: z.coerce.number().positive("ID Episode tidak valid"),
});

export const updatePemeriksaanSchema = z.object({
  ...basePemeriksaanSchema,
  id_periksa: z.coerce.number().positive("ID Periksa tidak valid"),
  id_episode: z.coerce.number().positive("ID Episode tidak valid"),
});
