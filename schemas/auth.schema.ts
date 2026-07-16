import { z } from "zod";

export const requestOtpSchema = z.object({
  email: z.email("Format email tidak valid"),
});

export const verifyOtpSchema = z.object({
  email: z.email("Format email tidak valid"),
  token: z.string().min(6, "Token OTP tidak valid"),
});

export const resetPasswordSchema = z
  .object({
    email: z.email("Format email tidak valid"),
    token: z.string().min(1, "Token tidak boleh kosong"),
    newPassword: z.string().min(6, "Kata sandi minimal 6 karakter"),
    confirmPassword: z
      .string()
      .min(6, "Konfirmasi kata sandi minimal 6 karakter"),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Kata sandi dan konfirmasi kata sandi tidak cocok!",
    path: ["confirmPassword"], // Menandai field mana yang error
  });
