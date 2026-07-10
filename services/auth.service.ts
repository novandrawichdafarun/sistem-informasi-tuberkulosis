import { createClient } from "@/utils/supabase/server";
import { cookies } from "next/headers";
import bcrypt from "bcryptjs";
import { LoginPayLoad, ResetPasswordPayload } from "@/types/auth";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
);

export const loginUser = async (payload: LoginPayLoad) => {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);
  const { data, error } = await supabase.auth.signInWithPassword({
    email: payload.email,
    password: payload.password,
  });

  if (error) {
    return {
      success: false,
      message: error.message,
    };
  }

  return {
    success: true,
    message: "Anda berhasil login",
    data: data.user,
  };
};

export const requestPasswordReset = async (email: string) => {
  const { data: user } = await supabase
    .from("users")
    .select("email")
    .eq("email", email)
    .single();

  if (!user) {
    return { success: false, message: "Email tidak terdaftar." };
  }

  const otp = Math.floor(100000 + Math.random() * 900000).toString();

  const expiresAt = new Date(Date.now() + 15 * 60 * 1000).toISOString();

  const { error } = await supabase.from("password_resets").insert({
    email,
    token: otp,
    expires_at: expiresAt,
  });

  if (error) return { success: false, message: "Gagal membuat sesi reset." };

  //TODO: KIRIM EMAIL
  // await sendEmail({ to: email, subject: "Kode Reset", body: `Kode OTP Anda: ${otp}` });
  console.log(`[TUTORIAL] Kode OTP untuk ${email} adalah: ${otp}`);

  return { success: true, message: "Kode OTP telah dikirim ke email." };
};

export const verifyAndResetPassword = async (payload: ResetPasswordPayload) => {
  const { email, token, newPassword } = payload;

  const { data: resetRecord, error } = await supabase
    .from("password_resets")
    .select("*")
    .eq("email", email)
    .eq("token", token)
    .gte("expires_at", new Date().toISOString())
    .single();

  if (error || !resetRecord) {
    return {
      success: false,
      message: "Kode OTP salah atau sudah kedaluwarsa.",
    };
  }

  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(newPassword, salt);

  const { error: updateError } = await supabase
    .from("users")
    .update({ password_hash: hashedPassword })
    .eq("email", email);

  if (updateError)
    return { success: false, message: "Gagal memperbarui password." };

  await supabase.from("password_resets").delete().eq("id", resetRecord.id);

  return { success: true, message: "Kata sandi berhasil diubah." };
};
