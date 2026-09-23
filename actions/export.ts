"use server";

import { getExportData } from "@/services/export.service";
import { ActionResponse } from "@/types/action";
import { ComprehensiveExportData, ExportFilters } from "@/types/eksport";
import { handleActionError } from "@/utils/error";
import { requireSuperAdminSession } from "@/utils/session";

export async function getExportDataAction(
  payload: ExportFilters,
): Promise<ActionResponse<ComprehensiveExportData>> {
  try {
    const superAdminId = await requireSuperAdminSession();
    const result = await getExportData(superAdminId, payload);

    return result;
  } catch (error) {
    return handleActionError(error);
  }
}
