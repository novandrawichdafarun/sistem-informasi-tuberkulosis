"use server";

import {
  bukaEpisodeSchema,
  editEpisodeSchema,
  tutupEpisodeSchema,
} from "@/schemas/episodePengobatan.schema";
import {
  bukaEpisode,
  editEpisode,
  getDaftarPasienDanEpisode,
  getEpisodeAktifByPasienId,
  hapusEpisode,
  tutupEpisode,
} from "@/services/episodePengobatan.service";
import { ActionResponse } from "@/types/action";
import {
  EpisodePengobatanData,
  PasienEpisodeOverview,
} from "@/types/episodePengobatan";
import { handleActionError } from "@/utils/error";
import { requireSuperAdminSession } from "@/utils/session";
import { getSupabaseServer } from "@/utils/supabase/server";
import { validateFormData } from "@/utils/validation";
import { revalidatePath } from "next/cache";

export async function getDaftarEpisodeOverviewAction(): Promise<
  ActionResponse<PasienEpisodeOverview[]>
> {
  try {
    const superAdminId = await requireSuperAdminSession();
    const supabase = await getSupabaseServer();

    return await getDaftarPasienDanEpisode(supabase, superAdminId);
  } catch (error) {
    return handleActionError(error);
  }
}

export async function getEpisodeAktifAction(
  id_pasien: number,
): Promise<ActionResponse<EpisodePengobatanData>> {
  try {
    const superAdminId = await requireSuperAdminSession();
    const supabase = await getSupabaseServer();

    return await getEpisodeAktifByPasienId(supabase, id_pasien, superAdminId);
  } catch (error) {
    return handleActionError(error);
  }
}

export async function bukaEpisodeAction(
  formData: FormData,
): Promise<ActionResponse> {
  try {
    const superAdminId = await requireSuperAdminSession();
    const supabase = await getSupabaseServer();

    const { data, error } = validateFormData(formData, bukaEpisodeSchema);
    if (error || !data)
      return { success: false, error: error || "Validasi gagal." };

    const result = await bukaEpisode(supabase, data, superAdminId);
    if (result.success) revalidatePath("/dashboard/episode-pengobatan");
    return result;
  } catch (error) {
    return handleActionError(error);
  }
}

export async function tutupEpisodeAction(
  formData: FormData,
): Promise<ActionResponse> {
  try {
    const superAdminId = await requireSuperAdminSession();
    const supabase = await getSupabaseServer();

    const { data, error } = validateFormData(formData, tutupEpisodeSchema);
    if (error || !data)
      return { success: false, error: error || "Validasi gagal." };

    const result = await tutupEpisode(supabase, data, superAdminId);
    if (result.success) revalidatePath("/dashboard/episode-pengobatan");
    return result;
  } catch (error) {
    return handleActionError(error);
  }
}

export async function editEpisodeAction(
  formData: FormData,
): Promise<ActionResponse> {
  try {
    const superAdminId = await requireSuperAdminSession();
    const supabase = await getSupabaseServer();

    const { data, error } = validateFormData(formData, editEpisodeSchema);
    if (error || !data)
      return { success: false, error: error || "Validasi gagal." };

    const result = await editEpisode(supabase, data, superAdminId);

    if (result.success) revalidatePath("/dashboard/episode-pengobatan");
    return result;
  } catch (error) {
    return handleActionError(error);
  }
}

export async function hapusEpisodeAction(
  id_episode: number,
): Promise<ActionResponse> {
  try {
    const superAdminId = await requireSuperAdminSession();
    const supabase = await getSupabaseServer();

    const result = await hapusEpisode(supabase, id_episode, superAdminId);

    if (result.success) revalidatePath("/dashboard/episode-pengobatan");

    return result;
  } catch (error: unknown) {
    return handleActionError(error);
  }
}
