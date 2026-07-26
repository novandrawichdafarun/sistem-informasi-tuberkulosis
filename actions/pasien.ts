"use server";

import {
  createPasien,
  deletePasien,
  getDaftarPasien,
  updatePasien,
} from "@/services/pasien.service";
import { PasienData } from "@/types/pasien";
import { revalidatePath } from "next/cache";
import { ActionResponse } from "@/types/action";
import { requireSuperAdminSession } from "@/utils/session";
import {
  createPasienSchema,
  updatePasienSchema,
} from "@/schemas/pasien.schema";
import { getSupabaseServer } from "@/utils/supabase/server";
import { validateFormData } from "@/utils/validation";
import { handleActionError } from "@/utils/error";

export async function getDaftarPasienAction(): Promise<
  ActionResponse<PasienData[]>
> {
  try {
    const superAdminId = await requireSuperAdminSession();
    const supabase = await getSupabaseServer();
    return await getDaftarPasien(supabase, superAdminId);
  } catch (error) {
    return handleActionError(error);
  }
}

export async function createPasienAction(
  formData: FormData,
): Promise<ActionResponse> {
  try {
    const superAdminId = await requireSuperAdminSession();
    const supabase = await getSupabaseServer();

    const { data, error } = validateFormData(formData, createPasienSchema);
    if (error || !data)
      return { success: false, error: error || "Validasi gagal." };

    const result = await createPasien(supabase, data, superAdminId);

    if (result.success) revalidatePath("/dashboard/pasien");

    return result;
  } catch (error) {
    return handleActionError(error);
  }
}

export async function updatePasienAction(
  formData: FormData,
): Promise<ActionResponse> {
  try {
    const superAdminId = await requireSuperAdminSession();
    const supabase = await getSupabaseServer();

    const { data, error } = validateFormData(formData, updatePasienSchema);
    if (error || !data)
      return { success: false, error: error || "Validasi gagal." };

    const result = await updatePasien(supabase, data, superAdminId);

    if (result.success) revalidatePath("/dashboard/pasien");

    return result;
  } catch (error) {
    return handleActionError(error);
  }
}

export async function deletePasienAction(
  id_pasien: number,
): Promise<ActionResponse> {
  try {
    const superAdminId = await requireSuperAdminSession();
    const supabase = await getSupabaseServer();

    const result = await deletePasien(supabase, id_pasien, superAdminId);

    if (result.success) revalidatePath("/dashboard/pasien");

    return result;
  } catch (error) {
    return handleActionError(error);
  }
}
