"use server";

import {
  loginUser,
  requestPasswordReset,
  verifyAndResetPassword,
} from "@/services/auth.service";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export async function loginAction(formData: FormData) {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const rememberMe = formData.get("rememberMe") === "on";

  if (!email || !password) {
    return { error: "Email dan Password harus diisi!" };
  }

  const result = await loginUser({ email, password, rememberMe });

  if (!result.success) {
    return { error: result.message };
  }

  revalidatePath("/", "layout");
  redirect("/dashboard");
}

export async function requestOtpAction(formData: FormData) {
  const email = formData.get("email") as string;
  if (!email) return { error: "Alamat email tidak boleh kosong!" };

  const result = await requestPasswordReset(email);
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

  const result = await verifyAndResetPassword({ email, token, newPassword });
  if (!result.success) return { error: result.message };

  return { success: true };
}
