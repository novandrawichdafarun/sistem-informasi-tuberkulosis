"use server";

import {
  bukaEpisodeSchema,
  editEpisodeSchema,
  tutupEpisodeSchema,
} from "@/schemas/episodePengobatan.schema";
import {
  bukaEpisode,
  editEpisode,
  getDaftarPasienDanEpisodeByNakes,
  getEpisodeAktifByPasienId,
  hapusEpisode,
  tutupEpisode,
} from "@/services/episodePengobatan.service";
import { ActionResponse } from "@/types/action";
import {
  EpisodePengobatanData,
  PasienEpisodeOverview,
} from "@/types/episodePengobatan";
import { requireNakesSession } from "@/utils/session";
import { getSupabaseServer } from "@/utils/supabase/server";
import { validateFormData } from "@/utils/validation";
import { revalidatePath } from "next/cache";

export async function getDaftarEpisodeOverviewAction(): Promise<
  ActionResponse<PasienEpisodeOverview[]>
> {
  try {
    const nakesId = await requireNakesSession();
    const supabase = await getSupabaseServer();

    return await getDaftarPasienDanEpisodeByNakes(supabase, nakesId);
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

export async function getEpisodeAktifAction(
  id_pasien: number,
): Promise<ActionResponse<EpisodePengobatanData>> {
  try {
    const nakesId = await requireNakesSession();
    const supabase = await getSupabaseServer();

    return await getEpisodeAktifByPasienId(supabase, id_pasien, nakesId);
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

export async function bukaEpisodeAction(
  formData: FormData,
): Promise<ActionResponse> {
  try {
    const nakesId = await requireNakesSession();
    const supabase = await getSupabaseServer();

    const { data, error } = validateFormData(formData, bukaEpisodeSchema);
    if (error || !data)
      return { success: false, error: error || "Validasi gagal." };

    const result = await bukaEpisode(supabase, data, nakesId);
    if (result.success) revalidatePath("/dashboard/episode-pengobatan");
    return result;
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Terjadi kesalahan.",
    };
  }
}

export async function tutupEpisodeAction(formData: FormData) {
  try {
    const nakesId = await requireNakesSession();
    const supabase = await getSupabaseServer();

    const { data, error } = validateFormData(formData, tutupEpisodeSchema);
    if (error || !data)
      return { success: false, error: error || "Validasi gagal." };

    const result = await tutupEpisode(supabase, data, nakesId);
    if (result.success) revalidatePath("/dashboard/episode-pengobatan");
    return result;
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Terjadi kesalahan.",
    };
  }
}

export async function editEpisodeAction(
  formData: FormData,
): Promise<ActionResponse> {
  try {
    const nakesId = await requireNakesSession();
    const supabase = await getSupabaseServer();

    const { data, error } = validateFormData(formData, editEpisodeSchema);
    if (error || !data)
      return { success: false, error: error || "Validasi gagal." };

    const result = await editEpisode(supabase, data, nakesId);

    if (result.success) revalidatePath("/dashboard/episode-pengobatan");
    return result;
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Terjadi kesalahan.",
    };
  }
}

export async function hapusEpisodeAction(
  id_episode: number,
): Promise<ActionResponse> {
  try {
    const nakesId = await requireNakesSession();
    const supabase = await getSupabaseServer();

    const result = await hapusEpisode(supabase, id_episode, nakesId);

    if (result.success) revalidatePath("/dashboard/episode-pengobatan");

    return result;
  } catch (error: unknown) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Terjadi kesalahan.",
    };
  }
}
