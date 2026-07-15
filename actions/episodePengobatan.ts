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
import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";

export async function getDaftarEpisodeOverviewAction(): Promise<
  ActionResponse<PasienEpisodeOverview[]>
> {
  try {
    const nakesId = await requireNakesSession();
    const cookieStore = await cookies();
    const supabase = createClient(cookieStore);

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
    const cookieStore = await cookies();
    const supabase = createClient(cookieStore);

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
    const cookieStore = await cookies();
    const supabase = createClient(cookieStore);

    const rawData = Object.fromEntries(formData.entries());
    const validation = bukaEpisodeSchema.safeParse(rawData);

    if (!validation.success)
      return { success: false, error: validation.error.issues[0].message };

    const result = await bukaEpisode(supabase, validation.data, nakesId);
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
    const cookieStore = await cookies();
    const supabase = createClient(cookieStore);

    const rawData = Object.fromEntries(formData.entries());
    const validation = tutupEpisodeSchema.safeParse(rawData);

    if (!validation.success)
      return { success: false, error: validation.error.issues[0].message };

    const result = await tutupEpisode(supabase, validation.data, nakesId);
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
    const cookieStore = await cookies();
    const supabase = createClient(cookieStore);

    const rawData = Object.fromEntries(formData.entries());
    const validation = editEpisodeSchema.safeParse(rawData);

    if (!validation.success) {
      return { success: false, error: validation.error.issues[0].message };
    }

    const result = await editEpisode(supabase, validation.data, nakesId);

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
    const cookieStore = await cookies();
    const supabase = createClient(cookieStore);

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
