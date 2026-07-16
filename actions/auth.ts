"use server";

import {
  requestOtpSchema,
  resetPasswordSchema,
  verifyOtpSchema,
} from "@/schemas/auth.schema";
import {
  clearDbSessionService,
  requestPasswordReset,
  ResetPassword,
  verifyOtp,
} from "@/services/auth.service";
import { ActionResponse } from "@/types/action";
import { getSupabaseServer } from "@/utils/supabase/server";
import { validateFormData } from "@/utils/validation";

export async function clearDbSessionAction(
  sessionToken: string,
): Promise<ActionResponse> {
  try {
    const supabase = await getSupabaseServer();

    return await clearDbSessionService(supabase, sessionToken);
  } catch (error) {
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Gagal menghapus sesi database.",
    };
  }
}

export async function requestOtpAction(
  formData: FormData,
): Promise<ActionResponse> {
  try {
    const supabase = await getSupabaseServer();
    const { data, error } = validateFormData(formData, requestOtpSchema);

    if (error || !data)
      return { success: false, error: error || "Validasi gagal." };

    return await requestPasswordReset(supabase, data.email);
  } catch (error) {
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Terjadi kesalahan pada server.",
    };
  }
}

export async function verifyOtpAction(
  formData: FormData,
): Promise<ActionResponse> {
  try {
    const supabase = await getSupabaseServer();
    const { data, error } = validateFormData(formData, verifyOtpSchema);

    if (error || !data)
      return { success: false, error: error || "Validasi gagal." };

    return await verifyOtp(supabase, data);
  } catch (error) {
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Terjadi kesalahan pada server.",
    };
  }
}

export async function resetPasswordAction(
  formData: FormData,
): Promise<ActionResponse> {
  try {
    const supabase = await getSupabaseServer();
    const { data, error } = validateFormData(formData, resetPasswordSchema);

    if (error || !data)
      return { success: false, error: error || "Validasi gagal." };

    return await ResetPassword(supabase, data);
  } catch (error) {
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Terjadi kesalahan pada server.",
    };
  }
}
