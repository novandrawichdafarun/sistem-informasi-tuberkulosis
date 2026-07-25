"use server";

import {
  createPasien,
  deletePasien,
  getAllPasien,
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
import { handleActionError } from "@/utils/error";

export async function getDaftarPasienAction(): Promise<
  ActionResponse<PasienData[]>
> {
  try {
    await requireNakesSession();
    const supabase = await getSupabaseServer();
    return await getAllPasien(supabase);
  } catch (error) {
    return handleActionError(error);
  }
}

export async function createPasienAction(
  formData: FormData,
): Promise<ActionResponse> {
  try {
    await requireNakesSession();
    const supabase = await getSupabaseServer();

    const { data, error } = validateFormData(formData, createPasienSchema);
    if (error || !data)
      return { success: false, error: error || "Validasi gagal." };

    const result = await createPasien(supabase, data);

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
    await requireNakesSession();
    const supabase = await getSupabaseServer();

    const { data, error } = validateFormData(formData, updatePasienSchema);
    if (error || !data)
      return { success: false, error: error || "Validasi gagal." };

    const result = await updatePasien(supabase, data);

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
    await requireNakesSession();
    const supabase = await getSupabaseServer();

    const result = await deletePasien(supabase, id_pasien);

    if (result.success) revalidatePath("/dashboard/pasien");

    return result;
  } catch (error) {
    return handleActionError(error);
  }
}
