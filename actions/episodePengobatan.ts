"use server";

import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import {
  bukaEpisode,
  getDaftarPasienDanEpisodeByNakes,
  getEpisodeAktifByPasienId,
  tutupEpisode,
} from "@/services/episodePengobatan.service";
import {
  BukaEpisodePayload,
  TutupEpisodePayload,
} from "@/types/episodePengobatan";
import { getServerSession } from "next-auth";
import { revalidatePath } from "next/cache";

export async function getDaftarEpisodeOverviewAction() {
  const session = await getServerSession(authOptions);

  if (!session || session.user.role !== "nakes") {
    return {
      success: false,
      message: "Akses ditolak: Hanya Nakes yang diizinkan.",
    };
  }

  return await getDaftarPasienDanEpisodeByNakes(session.user.id);
}

export async function getEpisodeAktifAction(id_pasien: number) {
  const session = await getServerSession(authOptions);

  if (!session || session.user.role !== "nakes") {
    return {
      success: false,
      message: "Akses ditolak: Hanya Nakes yang diizinkan.",
    };
  }

  return await getEpisodeAktifByPasienId(id_pasien, session.user.id);
}

export async function bukaEpisodeAction(formData: FormData) {
  const session = await getServerSession(authOptions);

  if (!session || session.user.role !== "nakes") {
    return { error: "Akses ditolak: Anda tidak memiliki wewenang." };
  }

  const payload: BukaEpisodePayload = {
    id_pasien: Number(formData.get("id_pasien")),
    tanggal_mulai: formData.get("tanggal_mulai") as string,
    tipe_pasien: formData.get("tipe_pasien") as string,
  };

  if (!payload.id_pasien || !payload.tanggal_mulai || !payload.tipe_pasien) {
    return { error: "Semua kolom wajib diisi!" };
  }

  const result = await bukaEpisode(payload, session.user.id);

  if (result.success) {
    //! Sesuaikan path ini dengan halaman fitur episode
    revalidatePath("/dashboard/episde-pengobatan");
    return { success: true, message: result.message };
  } else {
    return { error: result.message };
  }
}

export async function tutupEpisodeAction(formData: FormData) {
  const session = await getServerSession(authOptions);

  if (!session || session.user.role !== "nakes") {
    return { error: "Akses ditolak." };
  }

  const payload: TutupEpisodePayload = {
    id_episode: Number(formData.get("id_episode")),
    tanggal_selesai: formData.get("tanggal_selesai") as string,
    tipe_pasien: formData.get("tipe_pasien") as string,
  };

  if (!payload.id_episode || !payload.tanggal_selesai) {
    return { error: "Tanggal selesai wajib diisi!" };
  }

  const result = await tutupEpisode(payload, session.user.id);

  if (result.success) {
    //! Sesuaikan path ini dengan halaman fitur episode
    revalidatePath("/dashboard/episode-pengobatan");
    return { success: true, message: result.message };
  } else {
    return { error: result.message };
  }
}
