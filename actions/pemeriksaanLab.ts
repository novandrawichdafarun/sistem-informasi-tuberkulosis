"use server";

import {
  createPemeriksaanLabSchema,
  updatePemeriksaanLabSchema,
} from "@/schemas/pemeriksaanLab.schema";
import {
  createPemeriksaanLab,
  deletePemeriksaanLab,
  getDaftarPemeriksaanLab,
  getPemeriksaanLabByUser,
  updatePemeriksaanLab,
} from "@/services/pemeriksaanLab.service";
import { ActionResponse } from "@/types/action";
import {
  PasienPemeriksaanLabOverview,
  PemeriksaanLabData,
} from "@/types/pemeriksaanLab";
import { handleActionError } from "@/utils/error";
import {
  requirePasienSession,
  requireSuperAdminSession,
} from "@/utils/session";
import { validateFormData } from "@/utils/validation";
import { revalidatePath } from "next/cache";

export async function getDaftarPemeriksaanLabAction(): Promise<
  ActionResponse<PasienPemeriksaanLabOverview[]>
> {
  try {
    const superAdminId = await requireSuperAdminSession();
    return await getDaftarPemeriksaanLab(superAdminId);
  } catch (error) {
    return handleActionError(error);
  }
}

export async function getPemeriksaanLabByUserAction(): Promise<
  ActionResponse<PemeriksaanLabData[]>
> {
  try {
    const userId = await requirePasienSession();
    return await getPemeriksaanLabByUser(userId);
  } catch (error) {
    return handleActionError(error);
  }
}

export async function createPemeriksaanLabAction(
  formData: FormData,
): Promise<ActionResponse> {
  try {
    const superAdminId = await requireSuperAdminSession();

    const { data, error } = validateFormData(
      formData,
      createPemeriksaanLabSchema,
    );
    if (error || !data)
      return { success: false, error: error || "Validasi gagal." };

    const result = await createPemeriksaanLab(data, superAdminId);

    if (result.success) revalidatePath("/dashboard/pemeriksaan-lab");

    return result;
  } catch (error) {
    return handleActionError(error);
  }
}

export async function updatePemeriksaanLabAction(
  formData: FormData,
): Promise<ActionResponse> {
  try {
    const superAdminId = await requireSuperAdminSession();

    const { data, error } = validateFormData(
      formData,
      updatePemeriksaanLabSchema,
    );
    if (error || !data)
      return { success: false, error: error || "Validasi gagal." };

    const result = await updatePemeriksaanLab(data, superAdminId);

    if (result.success) revalidatePath("/dashboard/pemeriksaan-lab");

    return result;
  } catch (error) {
    return handleActionError(error);
  }
}

export async function deletePemeriksaanLabAction(
  id_tes: number,
): Promise<ActionResponse> {
  try {
    const superAdminId = await requireSuperAdminSession();

    const result = await deletePemeriksaanLab(id_tes, superAdminId);

    if (result.success) revalidatePath("/dashboard/pemeriksaan-lab");

    return result;
  } catch (error) {
    return handleActionError(error);
  }
}
