"use server";

import { revalidatePath } from "next/cache";
import { ActionResponse } from "@/types/action";
import {
  LaporanMakanData,
  LaporanMakanPasienOverview,
} from "@/types/laporanMakan";
import { createLaporanMakanSchema } from "@/schemas/laporanMakan.schema";
import {
  createLaporanMakan,
  getLaporanMakanGrouped,
  getLaporanMakanByUser,
} from "@/services/laporanMakan.service";
import { handleActionError } from "@/utils/error";
import {
  requirePasienSession,
  requireSuperAdminSession,
} from "@/utils/session";
import { getSupabaseServer } from "@/utils/supabase/server";
import { validateFormData } from "@/utils/validation";

// Pasien: buat laporan makan.
export async function createLaporanMakanAction(
  formData: FormData,
): Promise<ActionResponse> {
  try {
    const userId = await requirePasienSession();
    const supabase = await getSupabaseServer();

    const { data, error } = validateFormData(
      formData,
      createLaporanMakanSchema,
    );
    if (error || !data)
      return { success: false, error: error || "Validasi gagal." };

    const result = await createLaporanMakan(supabase, userId, data);

    if (result.success) revalidatePath("/dashboard/laporan-makan");

    return result;
  } catch (error) {
    return handleActionError(error);
  }
}

// Pasien: daftar laporan makan miliknya.
export async function getLaporanMakanPasienAction(): Promise<
  ActionResponse<LaporanMakanData[]>
> {
  try {
    const userId = await requirePasienSession();
    const supabase = await getSupabaseServer();
    return await getLaporanMakanByUser(supabase, userId);
  } catch (error) {
    return handleActionError(error);
  }
}

// Super admin: laporan makan dikelompokkan per pasien.
export async function getLaporanMakanGroupedAction(): Promise<
  ActionResponse<LaporanMakanPasienOverview[]>
> {
  try {
    await requireSuperAdminSession();
    const supabase = await getSupabaseServer();
    return await getLaporanMakanGrouped(supabase);
  } catch (error) {
    return handleActionError(error);
  }
}
