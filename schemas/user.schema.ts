import z from "zod";

export const createUserSchema = z
  .object({
    email: z
      .string()
      .min(1, "Email wajib diisi")
      .email("Format email tidak valid"),
    password: z.string().min(6, "Password minimal 6 karakter"),
    confirmPassword: z.string().min(1, "Konfirmasi password wajib diisi"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    // Validasi tambahan untuk mencocokkan password
    message: "Password dan konfirmasi password tidak cocok",
    path: ["confirmPassword"], // Error akan diarahkan ke field confirmPassword
  });

export const updateUserSchema = z
  .object({
    id_user: z.uuid("ID User tidak valid"),
    email: z
      .string()
      .min(1, "Email wajib diisi")
      .email("Format email tidak valid"),
    // Menggunakan transform agar string kosong ("") dari input form diubah menjadi undefined
    password: z
      .string()
      .transform((val) => (val === "" ? undefined : val))
      .optional(),
    confirmPassword: z
      .string()
      .transform((val) => (val === "" ? undefined : val))
      .optional(),
  })
  .superRefine((data, ctx) => {
    // Logika khusus: JIKA user mengisi password baru, maka lakukan validasi ketat
    if (data.password) {
      if (data.password.length < 6) {
        ctx.addIssue({
          code: z.ZodIssueCode.too_small,
          minimum: 6,
          type: "string",
          inclusive: true,
          origin: "string",
          message: "Password minimal 6 karakter",
          path: ["password"],
        });
      }
      if (data.password !== data.confirmPassword) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Password dan konfirmasi password tidak cocok",
          path: ["confirmPassword"],
        });
      }
    }
  });
