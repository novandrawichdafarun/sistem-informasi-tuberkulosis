"use server";

import {
  createPemeriksaanLabSchema,
  updatePemeriksaanLabSchema,
} from "@/schemas/pemeriksaanLab.schema";
import {
  createPemeriksaanLab,
  deletePemeriksaanLab,
  getDaftarPemeriksaanLab,
  updatePemeriksaanLab,
} from "@/services/pemeriksaanLab.service";
import { ActionResponse } from "@/types/action";
import { PasienPemeriksaanLabOverview } from "@/types/pemeriksaanLab";
import { handleActionError } from "@/utils/error";
import { requireNakesSession } from "@/utils/session";
import { getSupabaseServer } from "@/utils/supabase/server";
import { validateFormData } from "@/utils/validation";
import { revalidatePath } from "next/cache";

export async function getDaftarPemeriksaanLabAction(): Promise<
  ActionResponse<PasienPemeriksaanLabOverview[]>
> {
  try {
    await requireNakesSession();
    const supabase = await getSupabaseServer();

    return await getDaftarPemeriksaanLab(supabase);
  } catch (error) {
    return handleActionError(error);
  }
}

export async function createPemeriksaanLabAction(
  formData: FormData,
): Promise<ActionResponse> {
  try {
    await requireNakesSession();
    const supabase = await getSupabaseServer();

    const { data, error } = validateFormData(
      formData,
      createPemeriksaanLabSchema,
    );
    if (error || !data)
      return { success: false, error: error || "Validasi gagal." };

    const result = await createPemeriksaanLab(supabase, data);

    if (result.success) revalidatePath("/dashboard/pemeriksaan-lab");

    return result;
  } catch (error) {
    return handleActionError(error);
  }
}

export async function updatePemeriksaanLabAction(
  formData: FormData,
): Promise<ActionResponse> {
  try {
    await requireNakesSession();
    const supabase = await getSupabaseServer();

    const { data, error } = validateFormData(
      formData,
      updatePemeriksaanLabSchema,
    );
    if (error || !data)
      return { success: false, error: error || "Validasi gagal." };

    const result = await updatePemeriksaanLab(supabase, data);

    if (result.success) revalidatePath("/dashboard/pemeriksaan-lab");

    return result;
  } catch (error) {
    return handleActionError(error);
  }
}

export async function deletePemeriksaanLabAction(
  id_tes: number,
): Promise<ActionResponse> {
  try {
    await requireNakesSession();
    const supabase = await getSupabaseServer();

    const result = await deletePemeriksaanLab(supabase, id_tes);

    if (result.success) revalidatePath("/dashboard/pemeriksaan-lab");

    return result;
  } catch (error) {
    return handleActionError(error);
  }
}
