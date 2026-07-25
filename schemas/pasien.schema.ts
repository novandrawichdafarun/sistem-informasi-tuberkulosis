import z from "zod";

// Regex No Telp Indonesia (08.., 628.., +628..)
const phoneRegex = /^(\+62|62|0)8[1-9][0-9]{6,11}$/;
// Regex Nama (huruf, spasi, titik, koma, tanda petik, strip)
const nameRegex = /^[a-zA-Z\s.'-,]+$/;

const kategori = (label: string) =>
  z.string().trim().min(1, `${label} wajib dipilih`).max(50);

export const createPasienSchema = z.object({
  nama_lengkap: z
    .string()
    .trim()
    .min(3, "Nama minimal 3 karakter")
    .max(100, "Nama maksimal 100 karakter")
    .regex(nameRegex, "Nama hanya boleh berisi huruf dan tanda baca umum"),

  email: z.email("Format email tidak valid").trim().toLowerCase(),
  password: z
    .string()
    .min(6, "Kata sandi minimal 6 karakter")
    .max(50, "Kata sandi maksimal 50 karakter"),

  jenis_kelamin: z.enum(["L", "P"], {
    message: "Jenis kelamin wajib dipilih (L atau P)",
  }),

  usia: kategori("Kelompok usia"),
  domisili: z
    .string()
    .trim()
    .min(1, "Domisili wajib diisi")
    .max(255, "Domisili maksimal 255 karakter"),
  pendidikan: kategori("Pendidikan"),
  pekerjaan: kategori("Pekerjaan"),
  pendapatan: kategori("Pendapatan"),

  no_telp: z
    .string()
    .trim()
    .regex(phoneRegex, "Format nomor telepon tidak valid")
    .or(z.literal(""))
    .optional()
    .default(""),
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
