"use server";

import {
  createPemeriksaanSchema,
  updatePemeriksaanSchema,
} from "@/schemas/pemeriksaanKlinis.schema";
import {
  createPemeriksaanKlinis,
  deletePemeriksaanKlinis,
  getDaftarPemeriksaan,
  getPemeriksaanKlinisByUser,
  updatePemeriksaanKlinis,
} from "@/services/pemeriksaanKlinis.service";
import { ActionResponse } from "@/types/action";
import {
  PasienPemeriksaanOverview,
  PemeriksaanKlinisData,
} from "@/types/pemeriksaanKlinis";
import { handleActionError } from "@/utils/error";
import {
  requirePasienSession,
  requireSuperAdminSession,
} from "@/utils/session";
import { validateFormData } from "@/utils/validation";
import { revalidatePath } from "next/cache";

export async function getDaftarPemeriksaanAction(): Promise<
  ActionResponse<PasienPemeriksaanOverview[]>
> {
  try {
    const superAdminId = await requireSuperAdminSession();
    return await getDaftarPemeriksaan(superAdminId);
  } catch (error) {
    return handleActionError(error);
  }
}

export async function getPemeriksaanKlinisByUserAction(): Promise<
  ActionResponse<PemeriksaanKlinisData[]>
> {
  try {
    const userId = await requirePasienSession();
    return await getPemeriksaanKlinisByUser(userId);
  } catch (error) {
    return handleActionError(error);
  }
}

export async function createPemeriksaanAction(
  formData: FormData,
): Promise<ActionResponse> {
  try {
    const superAdminId = await requireSuperAdminSession();

    const { data, error } = validateFormData(formData, createPemeriksaanSchema);
    if (error || !data)
      return { success: false, error: error || "Validasi gagal." };

    const result = await createPemeriksaanKlinis(data, superAdminId);

    if (result.success) revalidatePath("/dashboard/pemeriksaan-klinis");

    return result;
  } catch (error) {
    return handleActionError(error);
  }
}

export async function updatePemeriksaanAction(
  formData: FormData,
): Promise<ActionResponse> {
  try {
    const superAdminId = await requireSuperAdminSession();

    const { data, error } = validateFormData(formData, updatePemeriksaanSchema);
    if (error || !data)
      return { success: false, error: error || "Validasi gagal." };

    const result = await updatePemeriksaanKlinis(data, superAdminId);

    if (result.success) revalidatePath("/dashboard/pemeriksaan-klinis");

    return result;
  } catch (error) {
    return handleActionError(error);
  }
}

export async function deletePemeriksaanAction(
  id_periksa: number,
): Promise<ActionResponse> {
  try {
    const superAdminId = await requireSuperAdminSession();

    const result = await deletePemeriksaanKlinis(id_periksa, superAdminId);

    if (result.success) revalidatePath("/dashboard/pemeriksaan-klinis");

    return result;
  } catch (error) {
    return handleActionError(error);
  }
}
