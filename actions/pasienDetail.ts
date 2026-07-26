"use server";

import { ActionResponse } from "@/types/action";
import { PasienDetail } from "@/types/pasienDetail";
import { getPasienDetail } from "@/services/pasienDetail.service";
import { getSupabaseServer } from "@/utils/supabase/server";
import { requireSuperAdminSession } from "@/utils/session";
import { handleActionError } from "@/utils/error";

export async function getPasienDetailAction(
  id_pasien: number,
): Promise<ActionResponse<PasienDetail>> {
  try {
    const superAdminId = await requireSuperAdminSession();
    const supabase = await getSupabaseServer();
    return await getPasienDetail(supabase, id_pasien, superAdminId);
  } catch (error) {
    return handleActionError(error);
  }
}
