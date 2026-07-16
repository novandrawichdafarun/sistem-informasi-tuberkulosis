"use server";

import {
  createPasien,
  deletePasien,
  getPasienByNakesId,
  updatePasien,
} from "@/services/pasien.service";
import { PasienData } from "@/types/pasien";
import { revalidatePath } from "next/cache";
import { ActionResponse } from "@/types/action";
import { requireNakesSession } from "@/utils/session";
import {
  createPasienSchema,
  updatePasienSchema,
} from "@/schemas/pasien.schema";
import { getSupabaseServer } from "@/utils/supabase/server";
import { validateFormData } from "@/utils/validation";

export async function getDaftarPasienAction(): Promise<
  ActionResponse<PasienData[]>
> {
  try {
    const nakesId = await requireNakesSession();
    const supabase = await getSupabaseServer();
    return await getPasienByNakesId(supabase, nakesId);
  } catch (error) {
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Terjadi kesalahan yang tidak diketahui",
    };
  }
}

export async function createPasienAction(
  formData: FormData,
): Promise<ActionResponse> {
  try {
    const nakesId = await requireNakesSession();
    const supabase = await getSupabaseServer();

    const { data, error } = validateFormData(formData, createPasienSchema);
    if (error || !data)
      return { success: false, error: error || "Validasi gagal." };

    const result = await createPasien(supabase, data, nakesId);

    if (result.success) revalidatePath("/dashboard/pasien");

    return result;
  } catch (error) {
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Terjadi kesalahan server",
    };
  }
}

export async function updatePasienAction(
  formData: FormData,
): Promise<ActionResponse> {
  try {
    const nakesId = await requireNakesSession();
    const supabase = await getSupabaseServer();

    const { data, error } = validateFormData(formData, updatePasienSchema);
    if (error || !data)
      return { success: false, error: error || "Validasi gagal." };

    const result = await updatePasien(supabase, data, nakesId);

    if (result.success) revalidatePath("/dashboard/pasien");

    return result;
  } catch (error) {
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Terjadi kesalahan server",
    };
  }
}

export async function deletePasienAction(
  id_pasien: number,
): Promise<ActionResponse> {
  try {
    const nakesId = await requireNakesSession();
    const supabase = await getSupabaseServer();

    const result = await deletePasien(supabase, id_pasien, nakesId);

    if (result.success) revalidatePath("/dashboard/pasien");

    return result;
  } catch (error) {
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Terjadi kesalahan server",
    };
  }
}
