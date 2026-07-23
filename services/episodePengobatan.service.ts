import { ActionResponse } from "@/types/action";
import {
  BukaEpisodePayload,
  EditEpisodePayload,
  EpisodePengobatanData,
  PasienEpisodeOverview,
  TutupEpisodePayload,
} from "@/types/episodePengobatan";
import { verifySuperAdminAccess } from "@/utils/access";
import { handleServiceError } from "@/utils/error";
import { SupabaseClient } from "@supabase/supabase-js";

export const getDaftarPasienDanEpisode = async (
  supabase: SupabaseClient,
  id_super_admin: string,
): Promise<ActionResponse<PasienEpisodeOverview[]>> => {
  try {
    const { superAdmin, error } = await verifySuperAdminAccess(
      supabase,
      id_super_admin,
    );
    if (error || !superAdmin)
      return { success: false, error: "Otoritas tidak valid." };

    const { data: pasienData, error: pasienError } = await supabase
      .from("pasien")
      .select(
        `
        id_pasien, nama_lengkap, usia, domisili,
        episode_pengobatan (
          id_episode, id_pasien, tanggal_mulai, tanggal_selesai,
          tipe_pasien, status_episode, created_at
        )
      `,
      )
      .order("created_at", { ascending: false });

    if (pasienError) {
      return handleServiceError(
        pasienError?.message,
        "Pasien tidak ditemukan.",
      );
    }

    const formattedData: PasienEpisodeOverview[] = (pasienData || []).map(
      (pasien) => {
        const rawEpisodes = pasien.episode_pengobatan as
          | EpisodePengobatanData[]
          | undefined;
        const episodeAktif =
          rawEpisodes?.find((ep) => ep.status_episode === "aktif") || null;
        const riwayat = rawEpisodes
          ? [...rawEpisodes].sort(
              (a, b) =>
                new Date(b.created_at).getTime() -
                new Date(a.created_at).getTime(),
            )
          : [];

        return {
          id_pasien: pasien.id_pasien,
          nama_lengkap: pasien.nama_lengkap,
          usia: pasien.usia,
          domisili: pasien.domisili,
          episodeAktif,
          riwayat_episode: riwayat,
        };
      },
    );

    return { success: true, data: formattedData };
  } catch (error) {
    return handleServiceError(
      error,
      "Terjadi kesalahan internal saat mengambil data.",
    );
  }
};

export const getEpisodeAktifByPasienId = async (
  supabase: SupabaseClient,
  id_pasien: number,
  id_super_admin: string,
): Promise<ActionResponse<EpisodePengobatanData>> => {
  try {
    const { superAdmin, error } = await verifySuperAdminAccess(
      supabase,
      id_super_admin,
    );
    if (error || !superAdmin)
      return { success: false, error: "Otoritas tidak valid." };

    const { data: episode_pengobatan, error: episodeError } = await supabase
      .from("episode_pengobatan")
      .select("*")
      .eq("id_pasien", id_pasien)
      .eq("status_episode", "aktif")
      .single();

    if (episodeError) {
      return handleServiceError(
        episodeError?.message,
        "Episode aktif tidak ditemukan.",
      );
    }

    return { success: true, data: episode_pengobatan };
  } catch (error) {
    return handleServiceError(
      error,
      "Terjadi kesalahan internal saat mengambil data.",
    );
  }
};

export const bukaEpisode = async (
  supabase: SupabaseClient,
  payload: BukaEpisodePayload,
  id_super_admin: string,
): Promise<ActionResponse> => {
  try {
    const { superAdmin, error } = await verifySuperAdminAccess(
      supabase,
      id_super_admin,
    );
    if (error || !superAdmin)
      return { success: false, error: "Otoritas tidak valid." };

    const { data: active } = await supabase
      .from("episode_pengobatan")
      .select("id_episode")
      .eq("id_pasien", payload.id_pasien)
      .eq("status_episode", "aktif")
      .single();

    if (active)
      return { success: false, error: "Pasien masih memiliki episode aktif." };

    const { error: episodeError } = await supabase
      .from("episode_pengobatan")
      .insert({
        ...payload,
        status_episode: "aktif",
      });

    if (episodeError) {
      return handleServiceError(episodeError?.message, "Episode gagal dibuka.");
    }

    return { success: true, message: "Episode berhasil dibuka." };
  } catch (error) {
    return handleServiceError(
      error,
      "Terjadi kesalahan internal saat membuka data.",
    );
  }
};

export const tutupEpisode = async (
  supabase: SupabaseClient,
  payload: TutupEpisodePayload,
  id_super_admin: string,
): Promise<ActionResponse> => {
  try {
    const { superAdmin, error } = await verifySuperAdminAccess(
      supabase,
      id_super_admin,
    );
    if (error || !superAdmin)
      return { success: false, error: "Otoritas tidak valid." };

    const { data: episode, error: checkError } = await supabase
      .from("episode_pengobatan")
      .select("id_episode")
      .eq("id_episode", payload.id_episode)
      .single();

    if (checkError || !episode)
      return handleServiceError(
        checkError?.message,
        "Episode pengobatan pasien tidak ada.",
      );

    const { error: episodeError } = await supabase
      .from("episode_pengobatan")
      .update({
        status_episode: "selesai",
        tanggal_selesai: payload.tanggal_selesai,
        tipe_pasien: payload.tipe_pasien,
      })
      .eq("id_episode", payload.id_episode);

    if (episodeError) {
      return handleServiceError(
        episodeError?.message,
        "Episode gagal diselesiakan.",
      );
    }

    return { success: true, message: "Episode berhasil diselesaikan." };
  } catch (error) {
    return handleServiceError(
      error,
      "Terjadi kesalahan internal server saat menutup data.",
    );
  }
};

export const editEpisode = async (
  supabase: SupabaseClient,
  payload: EditEpisodePayload,
  id_super_admin: string,
): Promise<ActionResponse> => {
  try {
    const { superAdmin, error } = await verifySuperAdminAccess(
      supabase,
      id_super_admin,
    );
    if (error || !superAdmin)
      return { success: false, error: "Otoritas tidak valid." };

    const { data: episode, error: checkError } = await supabase
      .from("episode_pengobatan")
      .select("id_episode")
      .eq("id_episode", payload.id_episode)
      .single();

    if (checkError || !episode)
      return handleServiceError(
        checkError?.message,
        "Episode pengobatan pasien tidak ada.",
      );

    // Update
    const { error: updateError } = await supabase
      .from("episode_pengobatan")
      .update({
        tanggal_mulai: payload.tanggal_mulai,
        tanggal_selesai: payload.tanggal_selesai,
        tipe_pasien: payload.tipe_pasien,
      })
      .eq("id_episode", payload.id_episode);

    if (updateError) {
      return handleServiceError(
        updateError?.message,
        "Gagal memperbarui data.",
      );
    }
    return { success: true, message: "Episode berhasil diperbarui." };
  } catch (error) {
    return handleServiceError(
      error,
      "Terjadi kesalahan internal saat memperbarui data.",
    );
  }
};

export const hapusEpisode = async (
  supabase: SupabaseClient,
  id_episode: number,
  id_super_admin: string,
): Promise<ActionResponse> => {
  try {
    const { superAdmin, error } = await verifySuperAdminAccess(
      supabase,
      id_super_admin,
    );
    if (error || !superAdmin)
      return { success: false, error: "Otoritas tidak valid." };

    const { data: episode, error: checkError } = await supabase
      .from("episode_pengobatan")
      .select("id_episode")
      .eq("id_episode", id_episode)
      .single();

    if (checkError || !episode)
      return handleServiceError(
        checkError?.message,
        "Episode pengobatan pasien tidak ada.",
      );

    const { error: deleteError } = await supabase
      .from("episode_pengobatan")
      .delete()
      .eq("id_episode", id_episode);

    if (deleteError) {
      return handleServiceError(deleteError?.message, "Gagal menghapus data");
    }

    return { success: true, message: "Episode berhasil dihapus." };
  } catch (error) {
    return handleServiceError(
      error,
      "Terjadi kesalahan internal saat menghapus data.",
    );
  }
};
