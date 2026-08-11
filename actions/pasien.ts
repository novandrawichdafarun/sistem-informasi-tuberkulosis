"use server";

import {
  createPasien,
  deletePasien,
  getDaftarPasien,
  getPasienDetail,
  getPasienProfileByUser,
  updatePasien,
} from "@/services/pasien.service";
import { PasienData, PasienDetail, PasienProfile } from "@/types/pasien";
import { revalidatePath } from "next/cache";
import { ActionResponse } from "@/types/action";
import {
  requirePasienSession,
  requireSuperAdminSession,
} from "@/utils/session";
import {
  createPasienSchema,
  updatePasienSchema,
} from "@/schemas/pasien.schema";
import { validateFormData } from "@/utils/validation";
import { handleActionError } from "@/utils/error";

export async function getDaftarPasienAction(): Promise<
  ActionResponse<PasienData[]>
> {
  try {
    const superAdminId = await requireSuperAdminSession();
    return await getDaftarPasien(superAdminId);
  } catch (error) {
    return handleActionError(error);
  }
}

export async function getPasienDetailAction(
  id_pasien: number,
): Promise<ActionResponse<PasienDetail>> {
  try {
    const superAdminId = await requireSuperAdminSession();
    return await getPasienDetail(id_pasien, superAdminId);
  } catch (error) {
    return handleActionError(error);
  }
}

export async function getPasienProfileAction(): Promise<
  ActionResponse<PasienProfile>
> {
  try {
    const userId = await requirePasienSession();
    return await getPasienProfileByUser(userId);
  } catch (error) {
    return handleActionError(error);
  }
}

export async function createPasienAction(
  formData: FormData,
): Promise<ActionResponse> {
  try {
    const superAdminId = await requireSuperAdminSession();

    const { data, error } = validateFormData(formData, createPasienSchema);
    if (error || !data)
      return { success: false, error: error || "Validasi gagal." };

    const result = await createPasien(data, superAdminId);

    if (result.success) revalidatePath("/dashboard/pasien");

    return result;
  } catch (error) {
    return handleActionError(error);
  }
}

export async function updatePasienAction(
  formData: FormData,
): Promise<ActionResponse> {
  try {
    const superAdminId = await requireSuperAdminSession();

    const { data, error } = validateFormData(formData, updatePasienSchema);
    if (error || !data)
      return { success: false, error: error || "Validasi gagal." };

    const result = await updatePasien(data, superAdminId);

    if (result.success) revalidatePath("/dashboard/pasien");

    return result;
  } catch (error) {
    return handleActionError(error);
  }
}

export async function deletePasienAction(
  id_pasien: number,
): Promise<ActionResponse> {
  try {
    const superAdminId = await requireSuperAdminSession();

    const result = await deletePasien(id_pasien, superAdminId);

    if (result.success) revalidatePath("/dashboard/pasien");

    return result;
  } catch (error) {
    return handleActionError(error);
  }
}
