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
import { createClient } from "@/utils/supabase/server";
import { cookies } from "next/headers";

export async function clearDbSessionAction(
  sessionToken: string,
): Promise<ActionResponse> {
  try {
    const cookieStore = await cookies();
    const supabase = createClient(cookieStore);

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
    const rawData = Object.fromEntries(formData.entries());
    const validation = requestOtpSchema.safeParse(rawData);

    if (!validation.success) {
      return { success: false, error: validation.error.issues[0].message };
    }

    const cookieStore = await cookies();
    const supabase = createClient(cookieStore);

    return await requestPasswordReset(supabase, validation.data.email);
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
    const rawData = Object.fromEntries(formData.entries());
    const validation = verifyOtpSchema.safeParse(rawData);

    if (!validation.success) {
      return { success: false, error: validation.error.issues[0].message };
    }

    const cookieStore = await cookies();
    const supabase = createClient(cookieStore);

    return await verifyOtp(supabase, validation.data);
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
    const rawData = Object.fromEntries(formData.entries());
    const validation = resetPasswordSchema.safeParse(rawData);

    if (!validation.success) {
      return { success: false, error: validation.error.issues[0].message };
    }

    const cookieStore = await cookies();
    const supabase = createClient(cookieStore);

    return await ResetPassword(supabase, validation.data);
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
