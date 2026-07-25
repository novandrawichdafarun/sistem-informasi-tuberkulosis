import { ActionResponse } from "@/types/action";
import {
  BukaEpisodePayload,
  EditEpisodePayload,
  EpisodePengobatanData,
  PasienEpisodeOverview,
  TutupEpisodePayload,
} from "@/types/episodePengobatan";
import { handleServiceError } from "@/utils/error";
import { SupabaseClient } from "@supabase/supabase-js";

// Admin (super_admin) melihat SELURUH pasien — tidak ada scoping nakes.
export const getDaftarPasienDanEpisode = async (
  supabase: SupabaseClient,
): Promise<ActionResponse<PasienEpisodeOverview[]>> => {
  try {
    const { data: pasienData, error: pasienError } = await supabase
      .from("pasien")
      .select(
        `
        id_pasien, nama_lengkap, usia, jenis_kelamin,
        episode_pengobatan (
          id_episode, id_pasien, tanggal_mulai, tanggal_selesai,
          tipe_pasien, status_episode, created_at
        )
      `,
      )
      .order("created_at", { ascending: false });

    if (pasienError) {
      return handleServiceError(pasienError, "Pasien tidak ditemukan.");
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
          jenis_kelamin: pasien.jenis_kelamin,
          episodeAktif,
          riwayat_episode: riwayat,
        };
      },
    );

    return { success: true, data: formattedData };
  } catch (error) {
    return handleServiceError(error);
  }
};

export const getEpisodeAktifByPasienId = async (
  supabase: SupabaseClient,
  id_pasien: number,
): Promise<ActionResponse<EpisodePengobatanData>> => {
  try {
    const { data: episode_pengobatan, error: episodeError } = await supabase
      .from("episode_pengobatan")
      .select("*")
      .eq("id_pasien", id_pasien)
      .eq("status_episode", "aktif")
      .single();

    if (episodeError) {
      return handleServiceError(episodeError, "Episode aktif tidak ditemukan.");
    }

    return { success: true, data: episode_pengobatan };
  } catch (error) {
    return handleServiceError(error);
  }
};

export const bukaEpisode = async (
  supabase: SupabaseClient,
  payload: BukaEpisodePayload,
): Promise<ActionResponse> => {
  try {
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
      return handleServiceError(episodeError, "Episode gagal dibuka.");
    }

    return { success: true, message: "Episode berhasil dibuka." };
  } catch (error) {
    return handleServiceError(error);
  }
};

export const tutupEpisode = async (
  supabase: SupabaseClient,
  payload: TutupEpisodePayload,
): Promise<ActionResponse> => {
  try {
    const { error: episodeError } = await supabase
      .from("episode_pengobatan")
      .update({
        status_episode: "selesai",
        tanggal_selesai: payload.tanggal_selesai,
        tipe_pasien: payload.tipe_pasien,
      })
      .eq("id_episode", payload.id_episode);

    if (episodeError) {
      return handleServiceError(episodeError, "Episode gagal diselesaikan.");
    }

    return { success: true, message: "Episode berhasil diselesaikan." };
  } catch (error) {
    return handleServiceError(error);
  }
};

export const editEpisode = async (
  supabase: SupabaseClient,
  payload: EditEpisodePayload,
): Promise<ActionResponse> => {
  try {
    const { error: episodeError } = await supabase
      .from("episode_pengobatan")
      .update({
        tanggal_mulai: payload.tanggal_mulai,
        tanggal_selesai: payload.tanggal_selesai,
        tipe_pasien: payload.tipe_pasien,
      })
      .eq("id_episode", payload.id_episode);

    if (episodeError) {
      return handleServiceError(episodeError, "Gagal memperbarui episode.");
    }
    return { success: true, message: "Episode berhasil diperbarui." };
  } catch (error) {
    return handleServiceError(error);
  }
};

export const hapusEpisode = async (
  supabase: SupabaseClient,
  id_episode: number,
): Promise<ActionResponse> => {
  try {
    const { error: episodeError } = await supabase
      .from("episode_pengobatan")
      .delete()
      .eq("id_episode", id_episode);

    if (episodeError) {
      return handleServiceError(episodeError, "Gagal menghapus episode.");
    }

    return { success: true, message: "Episode berhasil dihapus." };
  } catch (error) {
    return handleServiceError(error);
  }
};
