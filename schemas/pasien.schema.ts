import z from "zod";

export const createPasienSchema = z.object({
  nama_lengkap: z.string().min(1, "Nama lengkap wajib diisi"),

  nik: z
    .string()
    .length(16, "NIK harus tepat 16 digit")
    .regex(/^\d+$/, "NIK hanya boleh berisi angka"),

  email: z.email("Format email tidak valid"),
  password: z.string().min(6, "Kata sandi minimal 6 karakter"),

  no_rm: z.string().optional().default(""),
  tanggal_lahir: z.string().min(1, "Tanggal lahir wajib diisi"),
  jenis_kelamin: z.enum(["L", "P"], {
    message: "Jenis kelamin wajib dipilih (L atau P)",
  }),

  alamat: z.string().optional().default(""),
  no_telp: z.string().optional().default(""),

  tinggi_badan_awal: z.coerce
    .number()
    .min(0, "Tinggi badan tidak boleh minus")
    .default(0),
  berat_badan_awal: z.coerce
    .number()
    .min(0, "Berat badan tidak boleh minus")
    .default(0),
});

export const updatePasienSchema = createPasienSchema.extend({
  id_pasien: z.coerce.number().positive("ID Pasien tidak valid"),
  id_user: z.uuid("ID User tidak valid"),

  password: z
    .string()
    .min(6, "Kata sandi minimal 6 karakter")
    .optional()
    .or(z.literal("")),
});
