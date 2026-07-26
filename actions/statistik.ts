"use server";

import { ActionResponse } from "@/types/action";
import { StatistikAdmin } from "@/types/statistik";
import { getStatistikAdmin } from "@/services/statistik.service";
import { getSupabaseServer } from "@/utils/supabase/server";
import { requireNakesSession } from "@/utils/session";
import { handleActionError } from "@/utils/error";

export async function getStatistikAdminAction(): Promise<
  ActionResponse<StatistikAdmin>
> {
  try {
    await requireNakesSession();
    const supabase = await getSupabaseServer();
    return await getStatistikAdmin(supabase);
  } catch (error) {
    return handleActionError(error);
  }
}
