import z from "zod";

// Regex untuk No Telp Indonesia (08.., 628.., +628..)
const phoneRegex = /^(\+62|62|0)8[1-9][0-9]{6,11}$/;
// Regex untuk Nama (Hanya huruf, spasi, titik, koma, tanda petik)
const nameRegex = /^[a-zA-Z\s.'-,]+$/;

export const createPasienSchema = z.object({
  email: z.email("Format email tidak valid").trim().toLowerCase(),

  password: z
    .string()
    .min(6, "Kata sandi minimal 6 karakter")
    .max(50, "Kata sandi maksimal 50 karakter"),

  nama_lengkap: z
    .string()
    .trim()
    .min(3, "Nama minimal 3 karakter")
    .max(100, "Nama maksimal 100 karakter")
    .regex(nameRegex, "Nama hanya boleh berisi huruf dan tanda baca umum"),

  usia: z
    .string()
    .trim()
    .min(3, "Usia minimal 3 karakter")
    .max(20, "Usia maksimal 20 karakter"),

  jenis_kelamin: z.enum(["L", "P"], {
    message: "Jenis kelamin wajib dipilih (L atau P)",
  }),

  domisili: z
    .string()
    .trim()
    .max(255, "Alamat maksimal 255 karakter")
    .optional()
    .default(""),

  no_telp: z
    .string()
    .trim()
    .regex(phoneRegex, "Format nomor telepon tidak valid")
    .or(z.literal("")) // Mengizinkan string kosong jika user tidak mengisi
    .optional()
    .default(""),

  pendidikan: z
    .string()
    .trim()
    .min(3, "Pendidikan minimal 3 karakter")
    .max(20, "Pendidikan maksimal 20 karakter"),

  pekerjaan: z
    .string()
    .trim()
    .min(3, "Pekerjaan minimal 3 karakter")
    .max(50, "Pekerjaan maksimal 50 karakter"),

  pendapatan: z
    .string()
    .trim()
    .min(3, "Pendapatan minimal 3 karakter")
    .max(50, "Pendapatan maksimal 50 karakter"),
});

export const updatePasienSchema = createPasienSchema.extend({
  id_pasien: z.coerce.number().positive("ID Pasien tidak valid"),
  id_user: z.uuid("ID User tidak valid"),

  password: z
    .string()
    .min(6, "Kata sandi minimal 6 karakter")
    .max(50, "Kata sandi maksimal 50 karakter")
    .optional()
    .or(z.literal("")),
});
