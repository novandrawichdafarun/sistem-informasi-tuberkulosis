"use server";

import {
  createPemeriksaanSchema,
  updatePemeriksaanSchema,
} from "@/schemas/pemeriksaanKlinis.schema";
import {
  createPemeriksaanKlinis,
  deletePemeriksaanKlinis,
  getDaftarPemeriksaanByNakes,
  updatePemeriksaanKlinis,
} from "@/services/pemeriksaanKlinis.service";
import { ActionResponse } from "@/types/action";
import { PasienPemeriksaanOverview } from "@/types/pemeriksaanKlinis";
import { requireNakesSession } from "@/utils/session";
import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";

export async function getDaftarPemeriksaanAction(): Promise<
  ActionResponse<PasienPemeriksaanOverview[]>
> {
  try {
    const nakesId = await requireNakesSession();
    const cookieStore = await cookies();
    const supabase = createClient(cookieStore);
    return await getDaftarPemeriksaanByNakes(supabase, nakesId);
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

export async function createPemeriksaanAction(formData: FormData) {
  try {
    const nakesId = await requireNakesSession();
    const cookieStore = await cookies();
    const supabase = createClient(cookieStore);

    const rawData = Object.fromEntries(formData.entries());

    const validation = createPemeriksaanSchema.safeParse(rawData);

    if (!validation.success) {
      const firstError = validation.error.issues[0].message;
      return { success: false, error: firstError };
    }

    const result = await createPemeriksaanKlinis(
      supabase,
      validation.data,
      nakesId,
    );

    if (result.success) revalidatePath("/dashboard/pemeriksaan-klinis");

    return result;
  } catch (error) {
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Terjadi kesalahan server",
    };
  }
}

export async function updatePemeriksaanAction(formData: FormData) {
  try {
    const nakesId = await requireNakesSession();
    const cookieStore = await cookies();
    const supabase = createClient(cookieStore);

    const rawData = Object.fromEntries(formData.entries());

    const validation = updatePemeriksaanSchema.safeParse(rawData);

    if (!validation.success) {
      const firstError = validation.error.issues[0].message;
      return { success: false, error: firstError };
    }

    const result = await updatePemeriksaanKlinis(
      supabase,
      validation.data,
      nakesId,
    );

    if (result.success) revalidatePath("/dashboard/pemeriksaan-klinis");

    return result;
  } catch (error) {
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Terjadi kesalahan server",
    };
  }
}

export async function deletePemeriksaanAction(id_periksa: number) {
  try {
    const nakesId = await requireNakesSession();
    const cookieStore = await cookies();
    const supabase = createClient(cookieStore);

    const result = await deletePemeriksaanKlinis(supabase, id_periksa, nakesId);

    if (result.success) revalidatePath("/dashboard/pemeriksaan-klinis");

    return result;
  } catch (error) {
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Terjadi kesalahan server",
    };
  }
}
