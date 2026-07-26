"use server";

import {
  createPemeriksaanSchema,
  updatePemeriksaanSchema,
} from "@/schemas/pemeriksaanKlinis.schema";
import {
  createPemeriksaanKlinis,
  deletePemeriksaanKlinis,
  getDaftarPemeriksaan,
  updatePemeriksaanKlinis,
} from "@/services/pemeriksaanKlinis.service";
import { ActionResponse } from "@/types/action";
import { PasienPemeriksaanOverview } from "@/types/pemeriksaanKlinis";
import { handleActionError } from "@/utils/error";
import { requireSuperAdminSession } from "@/utils/session";
import { getSupabaseServer } from "@/utils/supabase/server";
import { validateFormData } from "@/utils/validation";
import { revalidatePath } from "next/cache";

export async function getDaftarPemeriksaanAction(): Promise<
  ActionResponse<PasienPemeriksaanOverview[]>
> {
  try {
    const superAdminId = await requireSuperAdminSession();
    const supabase = await getSupabaseServer();

    return await getDaftarPemeriksaan(supabase, superAdminId);
  } catch (error) {
    return handleActionError(error);
  }
}

export async function createPemeriksaanAction(
  formData: FormData,
): Promise<ActionResponse> {
  try {
    const superAdminId = await requireSuperAdminSession();
    const supabase = await getSupabaseServer();

    const { data, error } = validateFormData(formData, createPemeriksaanSchema);
    if (error || !data)
      return { success: false, error: error || "Validasi gagal." };

    const result = await createPemeriksaanKlinis(supabase, data, superAdminId);

    if (result.success) revalidatePath("/dashboard/pemeriksaan-klinis");

    return result;
  } catch (error) {
    return handleActionError(error);
  }
}

export async function updatePemeriksaanAction(
  formData: FormData,
): Promise<ActionResponse> {
  try {
    const superAdminId = await requireSuperAdminSession();
    const supabase = await getSupabaseServer();

    const { data, error } = validateFormData(formData, updatePemeriksaanSchema);
    if (error || !data)
      return { success: false, error: error || "Validasi gagal." };

    const result = await updatePemeriksaanKlinis(supabase, data, superAdminId);

    if (result.success) revalidatePath("/dashboard/pemeriksaan-klinis");

    return result;
  } catch (error) {
    return handleActionError(error);
  }
}

export async function deletePemeriksaanAction(
  id_periksa: number,
): Promise<ActionResponse> {
  try {
    const superAdminId = await requireSuperAdminSession();
    const supabase = await getSupabaseServer();

    const result = await deletePemeriksaanKlinis(
      supabase,
      id_periksa,
      superAdminId,
    );

    if (result.success) revalidatePath("/dashboard/pemeriksaan-klinis");

    return result;
  } catch (error) {
    return handleActionError(error);
  }
}
