"use server";

import {
  laporanMakanSchema,
  laporanObatSchema,
} from "@/schemas/laporan.schema";
import {
  getJadwalByPasienId,
  getKepatuhanByUser,
  getRiwayatMakanByUser,
  laporMakan,
  laporMinumObat,
} from "@/services/laporan.service";
import { ActionResponse } from "@/types/action";
import {
  JadwalObatHariIni,
  RingkasanKepatuhan,
  RiwayatLaporanMakan,
} from "@/types/laporan";
import { handleActionError } from "@/utils/error";
import { requirePasienSession } from "@/utils/session";
import { getSupabaseServer } from "@/utils/supabase/server";
import { validateFormData } from "@/utils/validation";
import { revalidatePath } from "next/cache";

export async function getJadwalByPasienIdAction(): Promise<
  ActionResponse<JadwalObatHariIni[]>
> {
  try {
    const pasienId = await requirePasienSession();
    const supabase = await getSupabaseServer();
    return await getJadwalByPasienId(supabase, pasienId);
  } catch (error) {
    return handleActionError(error);
  }
}

export async function getKepatuhanAction(
  days = 30,
): Promise<ActionResponse<RingkasanKepatuhan>> {
  try {
    const userId = await requirePasienSession();
    const supabase = await getSupabaseServer();
    return await getKepatuhanByUser(supabase, userId, days);
  } catch (error) {
    return handleActionError(error);
  }
}

export async function getRiwayatMakanAction(): Promise<
  ActionResponse<RiwayatLaporanMakan[]>
> {
  try {
    const userId = await requirePasienSession();
    const supabase = await getSupabaseServer();
    return await getRiwayatMakanByUser(supabase, userId);
  } catch (error) {
    return handleActionError(error);
  }
}

export async function submitLaporanObatAction(
  formData: FormData,
): Promise<ActionResponse> {
  try {
    const pasienId = await requirePasienSession();
    const supabase = await getSupabaseServer();

    const { data, error } = validateFormData(formData, laporanObatSchema);
    if (error || !data)
      return { success: false, error: error || "Validasi gagal." };

    const result = await laporMinumObat(supabase, data, pasienId);

    if (result.success) {
      revalidatePath("/dashboard/laporan-obat");
      revalidatePath("/dashboard/riwayat-kepatuhan");
    }

    return result;
  } catch (error) {
    return handleActionError(error);
  }
}

export async function submitLaporanMakanAction(
  formData: FormData,
): Promise<ActionResponse> {
  try {
    const pasienId = await requirePasienSession();
    const supabase = await getSupabaseServer();

    const { data, error } = validateFormData(formData, laporanMakanSchema);
    if (error || !data)
      return { success: false, error: error || "Validasi gagal." };

    const result = await laporMakan(supabase, data, pasienId);

    if (result.success) {
      revalidatePath("/dashboard/laporan-obat");
      revalidatePath("/dashboard/riwayat-kepatuhan");
    }

    return result;
  } catch (error) {
    return handleActionError(error);
  }
}
