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
import { validateFormData } from "@/utils/validation";
import { revalidatePath } from "next/cache";

export async function getDaftarEpisodeOverviewAction(): Promise<
  ActionResponse<PasienEpisodeOverview[]>
> {
  try {
    const superAdminId = await requireSuperAdminSession();
    return await getDaftarPasienDanEpisode(superAdminId);
  } catch (error) {
    return handleActionError(error);
  }
}

export async function getEpisodeAktifAction(
  id_pasien: number,
): Promise<ActionResponse<EpisodePengobatanData>> {
  try {
    const superAdminId = await requireSuperAdminSession();
    return await getEpisodeAktifByPasienId(id_pasien, superAdminId);
  } catch (error) {
    return handleActionError(error);
  }
}

export async function bukaEpisodeAction(
  formData: FormData,
): Promise<ActionResponse> {
  try {
    const superAdminId = await requireSuperAdminSession();

    const { data, error } = validateFormData(formData, bukaEpisodeSchema);
    if (error || !data)
      return { success: false, error: error || "Validasi gagal." };

    const result = await bukaEpisode(data, superAdminId);
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

    const { data, error } = validateFormData(formData, tutupEpisodeSchema);
    if (error || !data)
      return { success: false, error: error || "Validasi gagal." };

    const result = await tutupEpisode(data, superAdminId);
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

    const { data, error } = validateFormData(formData, editEpisodeSchema);
    if (error || !data)
      return { success: false, error: error || "Validasi gagal." };

    const result = await editEpisode(data, superAdminId);

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

    const result = await hapusEpisode(id_episode, superAdminId);

    if (result.success) revalidatePath("/dashboard/episode-pengobatan");

    return result;
  } catch (error: unknown) {
    return handleActionError(error);
  }
}
