"use server";

import { ActionResponse } from "@/types/action";
import { StatistikAdmin } from "@/types/statistik";
import { getStatistikAdmin } from "@/services/statistik.service";
import { getSupabaseServer } from "@/utils/supabase/server";
import { requireSuperAdminSession } from "@/utils/session";
import { handleActionError } from "@/utils/error";

export async function getStatistikAdminAction(): Promise<
  ActionResponse<StatistikAdmin>
> {
  try {
    const superAdminId = await requireSuperAdminSession();
    const supabase = await getSupabaseServer();
    return await getStatistikAdmin(supabase, superAdminId);
  } catch (error) {
    return handleActionError(error);
  }
}
