import { z } from "zod";

const basePemeriksaanSchema = {
  tanggal_periksa: z.string().min(1, "Tanggal periksa wajib diisi"),
  keluhan: z.string().optional(),
  tensi: z.string().optional(),
  suhu: z.coerce.number().optional(),
  pernapasan: z.coerce.number().optional(),
  nadi: z.coerce.number().optional(),
  saturasi_o2: z.coerce.number().optional(),
  tinggi_badan_saat_ini: z.coerce.number().optional(),
  berat_badan_saat_ini: z.coerce.number().optional(),
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
