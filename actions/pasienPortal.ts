"use server";

import { revalidatePath } from "next/cache";
import { ActionResponse } from "@/types/action";
import { getSupabaseServer } from "@/utils/supabase/server";
import { requirePasienSession } from "@/utils/sessionPasien";
import { handleActionError } from "@/utils/error";
import {
  getAdherenceByUser,
  getChatByUser,
  getLabResultsByUser,
  getPasienProfileByUser,
  getTodayMedicationByUser,
  getVitalSignsByUser,
  reportTodayMedicationByUser,
  sendChatByUser,
} from "@/services/pasienPortal.service";
import {
  AdherenceSummary,
  ChatMessage,
  MedicationStatus,
  MedicationToday,
  PasienPortalProfile,
  PemeriksaanKlinisData,
  PemeriksaanLabData,
} from "@/types/pasienPortal";

export async function getPasienProfileAction(): Promise<
  ActionResponse<PasienPortalProfile>
> {
  try {
    const userId = await requirePasienSession();
    const supabase = await getSupabaseServer();
    return await getPasienProfileByUser(supabase, userId);
  } catch (error) {
    return handleActionError(error);
  }
}

export async function getTodayMedicationAction(): Promise<
  ActionResponse<MedicationToday | null>
> {
  try {
    const userId = await requirePasienSession();
    const supabase = await getSupabaseServer();
    return await getTodayMedicationByUser(supabase, userId);
  } catch (error) {
    return handleActionError(error);
  }
}

export async function reportMedicationAction(
  status: MedicationStatus,
): Promise<ActionResponse> {
  try {
    const userId = await requirePasienSession();
    const supabase = await getSupabaseServer();
    const result = await reportTodayMedicationByUser(supabase, userId, status);

    if (result.success) {
      revalidatePath("/dashboard");
      revalidatePath("/dashboard/laporan-obat");
      revalidatePath("/dashboard/riwayat-kepatuhan");
    }

    return result;
  } catch (error) {
    return handleActionError(error);
  }
}

export async function getAdherenceAction(
  days = 30,
): Promise<ActionResponse<AdherenceSummary>> {
  try {
    const userId = await requirePasienSession();
    const supabase = await getSupabaseServer();
    return await getAdherenceByUser(supabase, userId, days);
  } catch (error) {
    return handleActionError(error);
  }
}

export async function getVitalSignsAction(): Promise<
  ActionResponse<PemeriksaanKlinisData[]>
> {
  try {
    const userId = await requirePasienSession();
    const supabase = await getSupabaseServer();
    return await getVitalSignsByUser(supabase, userId);
  } catch (error) {
    return handleActionError(error);
  }
}

export async function getLabResultsAction(): Promise<
  ActionResponse<PemeriksaanLabData[]>
> {
  try {
    const userId = await requirePasienSession();
    const supabase = await getSupabaseServer();
    return await getLabResultsByUser(supabase, userId);
  } catch (error) {
    return handleActionError(error);
  }
}

export async function getChatAction(): Promise<ActionResponse<ChatMessage[]>> {
  try {
    await requirePasienSession();
    return await getChatByUser();
  } catch (error) {
    return handleActionError(error);
  }
}

// isi_pesan dipertahankan agar tanda tangan aksi stabil untuk ChatPanel.
export async function sendChatAction(
  isi_pesan: string,
): Promise<ActionResponse> {
  try {
    void isi_pesan;
    await requirePasienSession();
    return await sendChatByUser();
  } catch (error) {
    return handleActionError(error);
  }
}
