"use server";

import {
  createPemeriksaanSchema,
  updatePemeriksaanSchema,
} from "@/schemas/pemeriksaanKlinis.schema";
import {
  createPemeriksaanKlinis,
  deletePemeriksaanKlinis,
  getDaftarPemeriksaanByNakes,
  updatePemeriksaanKlinis,
} from "@/services/pemeriksaanKlinis.service";
import { ActionResponse } from "@/types/action";
import { PasienPemeriksaanOverview } from "@/types/pemeriksaanKlinis";
import { requireNakesSession } from "@/utils/session";
import { getSupabaseServer } from "@/utils/supabase/server";
import { validateFormData } from "@/utils/validation";
import { revalidatePath } from "next/cache";

export async function getDaftarPemeriksaanAction(): Promise<
  ActionResponse<PasienPemeriksaanOverview[]>
> {
  try {
    const nakesId = await requireNakesSession();
    const supabase = await getSupabaseServer();

    return await getDaftarPemeriksaanByNakes(supabase, nakesId);
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

export async function createPemeriksaanAction(
  formData: FormData,
): Promise<ActionResponse> {
  try {
    const nakesId = await requireNakesSession();
    const supabase = await getSupabaseServer();

    const { data, error } = validateFormData(formData, createPemeriksaanSchema);
    if (error || !data)
      return { success: false, error: error || "Validasi gagal." };

    const result = await createPemeriksaanKlinis(supabase, data, nakesId);

    if (result.success) revalidatePath("/dashboard/pemeriksaan-klinis");

    return result;
  } catch (error) {
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Terjadi kesalahan server",
    };
  }
}

export async function updatePemeriksaanAction(
  formData: FormData,
): Promise<ActionResponse> {
  try {
    const nakesId = await requireNakesSession();
    const supabase = await getSupabaseServer();

    const { data, error } = validateFormData(formData, updatePemeriksaanSchema);
    if (error || !data)
      return { success: false, error: error || "Validasi gagal." };

    const result = await updatePemeriksaanKlinis(supabase, data, nakesId);

    if (result.success) revalidatePath("/dashboard/pemeriksaan-klinis");

    return result;
  } catch (error) {
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Terjadi kesalahan server",
    };
  }
}

export async function deletePemeriksaanAction(
  id_periksa: number,
): Promise<ActionResponse> {
  try {
    const nakesId = await requireNakesSession();
    const supabase = await getSupabaseServer();

    const result = await deletePemeriksaanKlinis(supabase, id_periksa, nakesId);

    if (result.success) revalidatePath("/dashboard/pemeriksaan-klinis");

    return result;
  } catch (error) {
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Terjadi kesalahan server",
    };
  }
}
