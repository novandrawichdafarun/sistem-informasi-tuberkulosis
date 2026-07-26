"use server";

import { revalidatePath } from "next/cache";
import { ActionResponse } from "@/types/action";
import { PasienResepOverview } from "@/types/resep";
import {
  createResepWithJadwal,
  deleteResep,
  getDaftarResep,
} from "@/services/resep.service";
import { createResepSchema } from "@/schemas/resep.schema";
import { getSupabaseServer } from "@/utils/supabase/server";
import { requireNakesSession } from "@/utils/session";
import { validateFormData } from "@/utils/validation";
import { handleActionError } from "@/utils/error";

export async function getDaftarResepAction(): Promise<
  ActionResponse<PasienResepOverview[]>
> {
  try {
    await requireNakesSession();
    const supabase = await getSupabaseServer();
    return await getDaftarResep(supabase);
  } catch (error) {
    return handleActionError(error);
  }
}

export async function createResepAction(
  formData: FormData,
): Promise<ActionResponse> {
  try {
    await requireNakesSession();
    const supabase = await getSupabaseServer();

    const { data, error } = validateFormData(formData, createResepSchema);
    if (error || !data)
      return { success: false, error: error || "Validasi gagal." };

    const result = await createResepWithJadwal(supabase, data);
    if (result.success) {
      revalidatePath("/dashboard/resep-obat");
      revalidatePath("/dashboard/statistik");
    }
    return result;
  } catch (error) {
    return handleActionError(error);
  }
}

export async function deleteResepAction(
  id_resep: number,
): Promise<ActionResponse> {
  try {
    await requireNakesSession();
    const supabase = await getSupabaseServer();

    const result = await deleteResep(supabase, id_resep);
    if (result.success) {
      revalidatePath("/dashboard/resep-obat");
      revalidatePath("/dashboard/statistik");
    }
    return result;
  } catch (error) {
    return handleActionError(error);
  }
}
