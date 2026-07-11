"use server";

import {
  requestPasswordReset,
  ResetPassword,
  verifyOtp,
} from "@/services/auth.service";

export async function requestOtpAction(formData: FormData) {
  const email = formData.get("email") as string;
  if (!email) return { error: "Alamat email tidak boleh kosong!" };

  const result = await requestPasswordReset(email);
  if (!result.success) return { error: result.message };

  return { success: true };
}

export async function verifyOtpAction(formData: FormData) {
  const email = formData.get("email") as string;
  const token = formData.get("token") as string;

  if (!email || !token) return { error: "Data tidak lengkap!" };

  const result = await verifyOtp({ email, token });

  if (!result.success) return { error: result.message };

  return { success: true };
}

export async function resetPasswordAction(formData: FormData) {
  const email = formData.get("email") as string;
  const token = formData.get("token") as string;
  const newPassword = formData.get("newPassword") as string;

  if (!email || !token || !newPassword)
    return { error: "Semua kolom harus diisi!" };
  if (newPassword.length < 6)
    return { error: "Kata sandi minimal 6 karakter!" };

  const result = await ResetPassword({ email, newPassword });
  if (!result.success) return { error: result.message };

  return { success: true };
}
