"use server";

import {
  createPasien,
  deletePasien,
  getPasienByNakesId,
  updatePasien,
} from "@/services/pasien.service";
import { PasienData } from "@/types/pasien";
import { revalidatePath } from "next/cache";
import { ActionResponse } from "@/types/action";
import { requireNakesSession } from "@/utils/session";
import {
  createPasienSchema,
  updatePasienSchema,
} from "@/schemas/pasien.schema";

export async function getDaftarPasienAction(): Promise<
  ActionResponse<PasienData[]>
> {
  try {
    const nakesId = await requireNakesSession();
    return await getPasienByNakesId(nakesId);
  } catch (error) {
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Terjadi kesalahan yang tidak diketahui",
    };
  }
}

export async function createPasienAction(
  formData: FormData,
): Promise<ActionResponse> {
  try {
    const nakesId = await requireNakesSession();

    const rawData = Object.fromEntries(formData.entries());

    const validation = createPasienSchema.safeParse(rawData);

    if (!validation.success) {
      const firstError = validation.error.issues[0].message;
      return { success: false, error: firstError };
    }

    const result = await createPasien(validation.data, nakesId);

    if (result.success) revalidatePath("/dashboard/pasien");

    return result;
  } catch (error: unknown) {
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Terjadi kesalahan server",
    };
  }
}

export async function updatePasienAction(formData: FormData) {
  try {
    const nakesId = await requireNakesSession();
    const rawData = Object.fromEntries(formData.entries());

    const validation = updatePasienSchema.safeParse(rawData);

    if (!validation.success) {
      return { success: false, error: validation.error.issues[0].message };
    }

    const result = await updatePasien(validation.data, nakesId);

    if (result.success) revalidatePath("/dashboard/pasien");

    return result;
  } catch (error: unknown) {
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Terjadi kesalahan server",
    };
  }
}

export async function deletePasienAction(
  id_pasien: number,
): Promise<ActionResponse> {
  try {
    const nakesId = await requireNakesSession();

    const result = await deletePasien(id_pasien, nakesId);

    if (result.success) revalidatePath("/dashboard/pasien");

    return result;
  } catch (error: unknown) {
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Terjadi kesalahan server",
    };
  }
}
