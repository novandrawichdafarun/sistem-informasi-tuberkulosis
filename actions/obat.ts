"use server";

import { revalidatePath } from "next/cache";
import { ActionResponse } from "@/types/action";
import { ObatData } from "@/types/obat";
import {
  createObat,
  deleteObat,
  getAllObat,
  updateObat,
} from "@/services/obat.service";
import { createObatSchema, updateObatSchema } from "@/schemas/obat.schema";
import { getSupabaseServer } from "@/utils/supabase/server";
import { requireNakesSession } from "@/utils/session";
import { validateFormData } from "@/utils/validation";
import { handleActionError } from "@/utils/error";

export async function getDaftarObatAction(): Promise<
  ActionResponse<ObatData[]>
> {
  try {
    await requireNakesSession();
    const supabase = await getSupabaseServer();
    return await getAllObat(supabase);
  } catch (error) {
    return handleActionError(error);
  }
}

export async function createObatAction(
  formData: FormData,
): Promise<ActionResponse> {
  try {
    await requireNakesSession();
    const supabase = await getSupabaseServer();

    const { data, error } = validateFormData(formData, createObatSchema);
    if (error || !data)
      return { success: false, error: error || "Validasi gagal." };

    const result = await createObat(supabase, data);
    if (result.success) revalidatePath("/dashboard/obat");
    return result;
  } catch (error) {
    return handleActionError(error);
  }
}

export async function updateObatAction(
  formData: FormData,
): Promise<ActionResponse> {
  try {
    await requireNakesSession();
    const supabase = await getSupabaseServer();

    const { data, error } = validateFormData(formData, updateObatSchema);
    if (error || !data)
      return { success: false, error: error || "Validasi gagal." };

    const result = await updateObat(supabase, data);
    if (result.success) revalidatePath("/dashboard/obat");
    return result;
  } catch (error) {
    return handleActionError(error);
  }
}

export async function deleteObatAction(
  id_obat: number,
): Promise<ActionResponse> {
  try {
    await requireNakesSession();
    const supabase = await getSupabaseServer();

    const result = await deleteObat(supabase, id_obat);
    if (result.success) revalidatePath("/dashboard/obat");
    return result;
  } catch (error) {
    return handleActionError(error);
  }
}
