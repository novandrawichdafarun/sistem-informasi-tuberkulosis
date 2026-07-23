"use server";

import {
  createDiagnosisSchema,
  updateDaiganosisSchema,
} from "@/schemas/diagnosis.schema";
import {
  createDiagnosis,
  deleteDiagnosis,
  getDaftarDiagnosis,
  updateDiagnosis,
} from "@/services/diagnosis.service";
import { ActionResponse } from "@/types/action";
import { PasienDiagnosisOverview } from "@/types/diagnosis";
import { handleActionError } from "@/utils/error";
import { requireSuperAdminSession } from "@/utils/session";
import { getSupabaseServer } from "@/utils/supabase/server";
import { validateFormData } from "@/utils/validation";
import { revalidatePath } from "next/cache";

export async function getDaftarDiagnosisAction(): Promise<
  ActionResponse<PasienDiagnosisOverview[]>
> {
  try {
    const superAdminId = await requireSuperAdminSession();
    const supabase = await getSupabaseServer();

    return await getDaftarDiagnosis(supabase, superAdminId);
  } catch (error) {
    return handleActionError(error);
  }
}

export async function createDiagnosisAction(
  formData: FormData,
): Promise<ActionResponse> {
  try {
    const superAdminId = await requireSuperAdminSession();
    const supabase = await getSupabaseServer();

    const { data, error } = validateFormData(formData, createDiagnosisSchema);
    if (error || !data)
      return { success: false, error: error || "Validasi gagal." };

    const result = await createDiagnosis(supabase, data, superAdminId);
    if (result.success) revalidatePath("/dashboard/diagnosis");

    return result;
  } catch (error) {
    return handleActionError(error);
  }
}

export async function updateDiagnosisAction(
  formData: FormData,
): Promise<ActionResponse> {
  try {
    const superAdminId = await requireSuperAdminSession();
    const supabase = await getSupabaseServer();

    const { data, error } = validateFormData(formData, updateDaiganosisSchema);
    if (error || !data)
      return { success: false, error: error || "Validasi gagal." };

    const result = await updateDiagnosis(supabase, data, superAdminId);
    if (result.success) revalidatePath("/dashboard/diagnosis");

    return result;
  } catch (error) {
    return handleActionError(error);
  }
}

export async function deleteDiagnosisAction(
  id_diagnosis: number,
): Promise<ActionResponse> {
  try {
    const superAdminId = await requireSuperAdminSession();
    const supabase = await getSupabaseServer();

    const result = await deleteDiagnosis(supabase, id_diagnosis, superAdminId);

    if (result.success) revalidatePath("/dashboard/diagnosis");

    return result;
  } catch (error) {
    return handleActionError(error);
  }
}
