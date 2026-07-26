import bcrypt from "bcryptjs";
import { OtpPayload, ResetPasswordPayload, UserAuthData } from "@/types/auth";
import { SupabaseClient } from "@supabase/supabase-js";
import { ActionResponse } from "@/types/action";
import { randomUUID } from "crypto";
import { handleServiceError } from "@/utils/error";

export const loginUserService = async (
  supabase: SupabaseClient,
  email: string,
  password: string,
  userAgent: string,
): Promise<ActionResponse<UserAuthData>> => {
  try {
    const { data: user, error } = await supabase
      .from("users")
      .select("id_user, email, password_hash, role")
      .eq("email", email)
      .single();

    if (error || !user)
      return handleServiceError(
        error?.message,
        "Kredensial tidak valid (Email tidak ditemukan)",
      );

    const isPasswordValid = await bcrypt.compare(password, user.password_hash);
    if (!isPasswordValid)
      return {
        success: false,
        error: "Kredensial tidak valid (Kata sandi salah)",
      };

    const newSessionToken = randomUUID();

    // Manajemen limitasi sesi (Maksimal 3 perangkat aktif)
    const { data: activeSessions } = await supabase
      .from("user_sessions")
      .select("id, session_token")
      .eq("id_user", user.id_user)
      .order("last_active_at", { ascending: true });

    if (activeSessions && activeSessions.length >= 3) {
      const overLimitCount = activeSessions.length - 2;
      const sessionsToKick = activeSessions
        .slice(0, overLimitCount)
        .map((s) => s.session_token);

      await supabase
        .from("user_sessions")
        .delete()
        .in("session_token", sessionsToKick);
    }

    const { error: sessionError } = await supabase
      .from("user_sessions")
      .insert({
        id_user: user.id_user,
        session_token: newSessionToken,
        device_info: userAgent,
      });

    if (sessionError)
      return handleServiceError(
        sessionError?.message,
        "Gagal membuat sesi otentikasi",
      );

    return {
      success: true,
      data: {
        id: user.id_user,
        email: user.email,
        role: user.role,
        sessionToken: newSessionToken,
      },
    };
  } catch (error) {
    return handleServiceError(error, "Terjadi kesalahan internal saat login.");
  }
};

export const clearDbSessionService = async (
  supabase: SupabaseClient,
  sessionToken: string,
): Promise<ActionResponse> => {
  try {
    await supabase
      .from("user_sessions")
      .delete()
      .eq("session_token", sessionToken);
    return { success: true };
  } catch (error) {
    return handleServiceError(
      error,
      "Terjadi kesalahan internal saat menghapus session.",
    );
  }
};

export const requestPasswordReset = async (
  supabase: SupabaseClient,
  email: string,
): Promise<ActionResponse> => {
  try {
    const { data: user } = await supabase
      .from("users")
      .select("email")
      .eq("email", email)
      .single();
    if (!user)
      return { success: false, error: "Email tidak terdaftar di sistem." };

    const now = new Date().toISOString();
    await supabase
      .from("password_resets")
      .delete()
      .or(`email.eq.${email},expires_at.lt.${now}`);

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000).toISOString(); // 5 menit

    const { error } = await supabase
      .from("password_resets")
      .insert({ email, token: otp, expires_at: expiresAt });

    if (error)
      return handleServiceError(error?.message, "Gagal membuat kode otp");

    //TODO: KIRIM EMAIL
    // await sendEmail({ to: email, subject: "Kode Reset", body: `Kode OTP Anda: ${otp}` });
    console.log(`[TUTORIAL] Kode OTP untuk ${email} adalah: ${otp}`);

    return { success: true, message: "Kode OTP telah dikirim ke email." };
  } catch (error) {
    return handleServiceError(
      error,
      "Terjadi kesalahan internal saat membuat/mengirim kode otp.",
    );
  }
};

export const verifyOtp = async (
  supabase: SupabaseClient,
  payload: OtpPayload,
): Promise<ActionResponse> => {
  try {
    const { email, token } = payload;
    const { data: resetRecord, error } = await supabase
      .from("password_resets")
      .select("id")
      .eq("email", email)
      .eq("token", token)
      .gte("expires_at", new Date().toISOString())
      .single();

    if (error || !resetRecord)
      return handleServiceError(
        error?.message,
        "Kode OOTP salah atau sudah kadaluarsa",
      );

    return { success: true, message: "Kode OTP valid." };
  } catch (error) {
    return handleServiceError(
      error,
      "Terjadi kesalahan internal verifikasi kode otp.",
    );
  }
};

export const ResetPassword = async (
  supabase: SupabaseClient,
  payload: ResetPasswordPayload,
): Promise<ActionResponse> => {
  try {
    const { email, token, newPassword } = payload;
    const { data: resetRecord, error } = await supabase
      .from("password_resets")
      .select("id")
      .eq("email", email)
      .eq("token", token)
      .gte("expires_at", new Date().toISOString())
      .single();

    if (error || !resetRecord)
      return handleServiceError(
        error?.message,
        "Akses ditolak: Token tidak sah atau kedaluwarsa.",
      );

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    const { error: updateError } = await supabase
      .from("users")
      .update({ password_hash: hashedPassword })
      .eq("email", email);

    if (updateError)
      return handleServiceError(
        updateError?.message,
        "Gagal memeperbarui password.",
      );

    await supabase.from("password_resets").delete().eq("id", resetRecord.id);

    return {
      success: true,
      message: "Kata sandi berhasil diubah. Silakan login kembali.",
    };
  } catch (error: unknown) {
    return handleServiceError(
      error,
      "Terjadi kesalahan internal saat memperbarui password.",
    );
  }
};
