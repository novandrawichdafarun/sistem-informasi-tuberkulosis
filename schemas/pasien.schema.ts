import { optionalNumber } from "@/utils/number";
import z from "zod";

// Regex untuk No Telp Indonesia (08.., 628.., +628..)
const phoneRegex = /^(\+62|62|0)8[1-9][0-9]{6,11}$/;
// Regex untuk Nama (Hanya huruf, spasi, titik, koma, tanda petik)
const nameRegex = /^[a-zA-Z\s.'-,]+$/;
// Regex untuk Tanggal (YYYY-MM-DD)
const dateRegex = /^\d{4}-\d{2}-\d{2}$/;

export const createPasienSchema = z.object({
  nama_lengkap: z
    .string()
    .trim()
    .min(3, "Nama minimal 3 karakter")
    .max(100, "Nama maksimal 100 karakter")
    .regex(nameRegex, "Nama hanya boleh berisi huruf dan tanda baca umum"),

  nik: z
    .string()
    .trim()
    .length(16, "NIK harus tepat 16 digit")
    .regex(/^\d+$/, "NIK hanya boleh berisi angka"),

  email: z.email("Format email tidak valid").trim().toLowerCase(),
  password: z
    .string()
    .min(6, "Kata sandi minimal 6 karakter")
    .max(50, "Kata sandi maksimal 50 karakter"),

  no_rm: z
    .string()
    .trim()
    .max(20, "No RM maksimal 20 karakter")
    .optional()
    .default(""),
  tanggal_lahir: z
    .string()
    .min(1, "Tanggal lahir wajib diisi")
    .regex(dateRegex, "Format tanggal lahir harus YYYY-MM-DD")
    .refine(
      (dateStr) => {
        const inputDate = new Date(dateStr);
        const today = new Date();
        today.setHours(24, 0, 0, 0);
        return inputDate <= today;
      },
      { message: "Tanggal tidak boleh melebihi hari ini" },
    ),
  jenis_kelamin: z.enum(["L", "P"], {
    message: "Jenis kelamin wajib dipilih (L atau P)",
  }),

  alamat: z
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
