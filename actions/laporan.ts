"use server";

import {
  laporanMakanSchema,
  laporanObatSchema,
} from "@/schemas/laporan.schema";
import {
  getDaftarLaporanMakan,
  getJadwalByPasienId,
  getKepatuhanByUser,
  getRiwayatMakanByUser,
  laporMakan,
  laporMinumObat,
} from "@/services/laporan.service";
import { ActionResponse } from "@/types/action";
import {
  JadwalObatHariIni,
  LaporanMakanData,
  LaporanMakanPasienOverview,
  RingkasanKepatuhan,
} from "@/types/laporan";
import { handleActionError } from "@/utils/error";
import {
  requirePasienSession,
  requireSuperAdminSession,
} from "@/utils/session";
import { validateFormData } from "@/utils/validation";
import { revalidatePath } from "next/cache";

export async function getJadwalByPasienIdAction(): Promise<
  ActionResponse<JadwalObatHariIni[]>
> {
  try {
    const pasienId = await requirePasienSession();
    return await getJadwalByPasienId(pasienId);
  } catch (error) {
    return handleActionError(error);
  }
}

export async function getKepatuhanAction(
  days = 30,
): Promise<ActionResponse<RingkasanKepatuhan>> {
  try {
    const userId = await requirePasienSession();
    return await getKepatuhanByUser(userId, days);
  } catch (error) {
    return handleActionError(error);
  }
}

export async function getRiwayatMakanAction(): Promise<
  ActionResponse<LaporanMakanData[]>
> {
  try {
    const userId = await requirePasienSession();
    return await getRiwayatMakanByUser(userId);
  } catch (error) {
    return handleActionError(error);
  }
}

export async function getDaftarLaporanMakanAction(): Promise<
  ActionResponse<LaporanMakanPasienOverview[]>
> {
  try {
    const superAdminId = await requireSuperAdminSession();
    return await getDaftarLaporanMakan(superAdminId);
  } catch (error) {
    return handleActionError(error);
  }
}

export async function submitLaporanObatAction(
  formData: FormData,
): Promise<ActionResponse> {
  try {
    const pasienId = await requirePasienSession();

    const { data, error } = validateFormData(formData, laporanObatSchema);
    if (error || !data)
      return { success: false, error: error || "Validasi gagal." };

    const result = await laporMinumObat(data, pasienId);

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

    const { data, error } = validateFormData(formData, laporanMakanSchema);
    if (error || !data)
      return { success: false, error: error || "Validasi gagal." };

    const result = await laporMakan(data, pasienId);

    if (result.success) {
      revalidatePath("/dashboard/laporan-obat");
      revalidatePath("/dashboard/riwayat-kepatuhan");
    }

    return result;
  } catch (error) {
    return handleActionError(error);
  }
}
