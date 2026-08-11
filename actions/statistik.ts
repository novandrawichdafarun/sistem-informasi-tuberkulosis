"use server";

import { ActionResponse } from "@/types/action";
import { StatistikAdmin } from "@/types/statistik";
import { getStatistikAdmin } from "@/services/statistik.service";
import { requireSuperAdminSession } from "@/utils/session";
import { handleActionError } from "@/utils/error";

export async function getStatistikAdminAction(): Promise<
  ActionResponse<StatistikAdmin>
> {
  try {
    const superAdminId = await requireSuperAdminSession();
    return await getStatistikAdmin(superAdminId);
  } catch (error) {
    return handleActionError(error);
  }
}
