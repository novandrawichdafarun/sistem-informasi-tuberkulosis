"use server";

import { createObatSchema, updateObatSchema } from "@/schemas/obat.schema";
import {
  createObat,
  deleteObat,
  getDaftarObat,
  toggleStatusObat,
  updateObat,
} from "@/services/obat.service";
import { ActionResponse } from "@/types/action";
import { ObatData } from "@/types/obat";
import { handleActionError } from "@/utils/error";
import { requireSuperAdminSession } from "@/utils/session";
import { validateFormData } from "@/utils/validation";
import { revalidatePath } from "next/cache";

export async function getDaftarObatAction(): Promise<
  ActionResponse<ObatData[]>
> {
  try {
    const superAdminId = await requireSuperAdminSession();
    return await getDaftarObat(superAdminId);
  } catch (error) {
    return handleActionError(error);
  }
}

export async function createObatAction(
  formData: FormData,
): Promise<ActionResponse> {
  try {
    const superAdminId = await requireSuperAdminSession();

    const { data, error } = validateFormData(formData, createObatSchema);
    if (error || !data)
      return { success: false, error: error || "Validasi gagal." };

    const result = await createObat(data, superAdminId);

    if (result.success) revalidatePath("/dashboard/pasien");

    return result;
  } catch (error) {
    return handleActionError(error);
  }
}

export async function updateObatAction(
  formData: FormData,
): Promise<ActionResponse> {
  try {
    const superAdminId = await requireSuperAdminSession();

    const { data, error } = validateFormData(formData, updateObatSchema);
    if (error || !data)
      return { success: false, error: error || "Validasi gagal." };

    const result = await updateObat(data, superAdminId);

    if (result.success) revalidatePath("/dashboard/pasien");

    return result;
  } catch (error) {
    return handleActionError(error);
  }
}

export async function toggleStatusObatAction(
  id_obat: number,
  status: boolean,
): Promise<ActionResponse> {
  try {
    const superAdminId = await requireSuperAdminSession();

    const result = await toggleStatusObat(id_obat, status, superAdminId);

    if (result.success) revalidatePath("/dashboard/pasien");

    return result;
  } catch (error) {
    return handleActionError(error);
  }
}

export async function deleteObatAction(
  id_obat: number,
): Promise<ActionResponse> {
  try {
    const superAdminId = await requireSuperAdminSession();

    const result = await deleteObat(id_obat, superAdminId);

    if (result.success) revalidatePath("/dashboard/pasien");

    return result;
  } catch (error) {
    return handleActionError(error);
  }
}
