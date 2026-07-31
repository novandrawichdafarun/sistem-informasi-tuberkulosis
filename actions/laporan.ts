"use server";

import { laporanObatSchema } from "@/schemas/laporan.schema";
import {
  getJadwalByPasienId,
  laporMinumObat,
} from "@/services/laporan.service";
import { ActionResponse } from "@/types/action";
import { JadwalObatHariIni } from "@/types/laporan";
import { handleActionError } from "@/utils/error";
import { requirePasienSession } from "@/utils/session";
import { getSupabaseServer } from "@/utils/supabase/server";
import { validateFormData } from "@/utils/validation";
import { revalidatePath } from "next/cache";

export async function getJadwalByPasienIdAction(): Promise<
  ActionResponse<JadwalObatHariIni[]>
> {
  try {
    const pasienId = await requirePasienSession();
    const supabase = await getSupabaseServer();
    return await getJadwalByPasienId(supabase, pasienId);
  } catch (error) {
    return handleActionError(error);
  }
}

export async function submitLaporanObatAction(
  formData: FormData,
): Promise<ActionResponse> {
  try {
    const pasienId = await requirePasienSession();
    const supabase = await getSupabaseServer();

    const { data, error } = validateFormData(formData, laporanObatSchema);
    if (error || !data)
      return { success: false, error: error || "Validasi gagal." };

    const result = await laporMinumObat(supabase, data, pasienId);

    if (result.success) revalidatePath("/dashboard/laporan-obat");

    return result;
  } catch (error) {
    return handleActionError(error);
  }
}
