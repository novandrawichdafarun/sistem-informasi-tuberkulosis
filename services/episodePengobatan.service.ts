import { ActionResponse } from "@/types/action";
import {
  BukaEpisodePayload,
  EditEpisodePayload,
  EpisodePengobatanData,
  PasienEpisodeOverview,
  TutupEpisodePayload,
} from "@/types/episodePengobatan";
import { verifyNakesAccess } from "@/utils/access";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
);

export const getDaftarPasienDanEpisodeByNakes = async (
  id_user_nakes: string,
): Promise<ActionResponse<PasienEpisodeOverview[]>> => {
  try {
    const { nakes, error } = await verifyNakesAccess(id_user_nakes);
    if (error || !nakes)
      return { success: false, error: "Otoritas Nakes tidak valid." };

    const { data: pasienData, error: pasienError } = await supabase
      .from("pasien")
      .select(
        `
        id_pasien, no_rm, nama_lengkap, nik,
        episode_pengobatan (
          id_episode, id_pasien, tanggal_mulai, tanggal_selesai,
          tipe_pasien, status_episode, created_at
        )
      `,
      )
      .eq("id_nakes", nakes.id_nakes)
      .order("created_at", { ascending: false });

    if (pasienError) {
      console.error("[DB ERROR] getPasienByNakesId:", pasienError.message);
      return {
        success: false,
        error: "Gagal mengambil data pasien dari sistem.",
      };
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
          no_rm: pasien.no_rm,
          nama_lengkap: pasien.nama_lengkap,
          nik: pasien.nik,
          episodeAktif,
          riwayat_episode: riwayat,
        };
      },
    );

    return { success: true, data: formattedData };
  } catch (error) {
    console.error("[SYSTEM ERROR] getDaftarPasienDanEpisode:", error);
    return { success: false, error: "Gagal mengambil data episode." };
  }
};

export const getEpisodeAktifByPasienId = async (
  id_pasien: number,
  id_user_nakes: string,
): Promise<ActionResponse<EpisodePengobatanData>> => {
  try {
    const { nakes, error } = await verifyNakesAccess(id_user_nakes);
    if (error || !nakes)
      return { success: false, error: "Otoritas Nakes tidak valid." };

    const { data: episode_pengobatan, error: episodeError } = await supabase
      .from("episode_pengobatan")
      .select("*")
      .eq("id_pasien", id_pasien)
      .eq("status_episode", "aktif")
      .single();

    if (episodeError) {
      console.error(
        "[DB ERROR] getEpisodeAktifByPasienId:",
        episodeError.message,
      );
      return { success: false, error: "Episode aktif tidak ditemukan." };
    }

    return { success: true, data: episode_pengobatan };
  } catch (error) {
    console.error("[SYSTEM ERROR] getEpisodeAktifByPasienId:", error);
    return { success: false, error: "Gagal mengambil data." };
  }
};

export const bukaEpisode = async (
  payload: BukaEpisodePayload,
  id_user_nakes: string,
): Promise<ActionResponse> => {
  try {
    const { nakes, error } = await verifyNakesAccess(id_user_nakes);
    if (error || !nakes)
      return { success: false, error: "Otoritas Nakes tidak valid." };

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
      console.error("[DB ERROR] bukaEpisode:", episodeError.message);
      return { success: false, error: "Episode gagal dibuka." };
    }

    return { success: true, message: "Episode berhasil dibuka." };
  } catch (error) {
    console.error("[DB ERROR] bukaEpisode:", error);
    return { success: false, error: "Gagal membuka episode." };
  }
};

export const tutupEpisode = async (
  payload: TutupEpisodePayload,
  id_user_nakes: string,
) => {
  try {
    const { nakes, error } = await verifyNakesAccess(id_user_nakes);
    if (error || !nakes)
      return { success: false, error: "Otoritas Nakes tidak valid." };

    const { data: episode } = await supabase
      .from("episode_pengobatan")
      .select("id_pasien")
      .eq("id_episode", payload.id_episode)
      .single();

    if (!episode) return { success: false, error: "Episode tidak ditemukan." };

    const { data: pasien } = await supabase
      .from("pasien")
      .select("id_pasien")
      .eq("id_pasien", episode.id_pasien)
      .eq("id_nakes", (await verifyNakesAccess(id_user_nakes)).nakes?.id_nakes)
      .single();

    if (!pasien) return { success: false, error: "Akses ditolak." };

    const { error: episodeError } = await supabase
      .from("episode_pengobatan")
      .update({
        status_episode: "selesai",
        tanggal_selesai: payload.tanggal_selesai,
        tipe_pasien: payload.tipe_pasien,
      })
      .eq("id_episode", payload.id_episode);

    if (episodeError) {
      console.error("[DB ERROR] tutupEpisode:", episodeError.message);
      return { success: false, error: "Episode aktif tidak ditemukan." };
    }

    return { success: true, message: "Episode berhasil diselesaikan." };
  } catch (error) {
    console.error("[DB ERROR] tutupEpisode:", error);
    return { success: false, error: "Gagal menyelesaikan episode." };
  }
};

export const editEpisode = async (
  payload: EditEpisodePayload,
  id_user_nakes: string,
): Promise<ActionResponse> => {
  try {
    const { nakes, error } = await verifyNakesAccess(id_user_nakes);
    if (error || !nakes)
      return { success: false, error: "Otoritas Nakes tidak valid." };

    const { data: episode, error: checkError } = await supabase
      .from("episode_pengobatan")
      .select("id_pasien")
      .eq("id_episode", payload.id_episode)
      .single();

    if (checkError || !episode)
      return { success: false, error: "Episode tidak ditemukan." };

    const { data: pasien } = await supabase
      .from("pasien")
      .select("id_pasien")
      .eq("id_pasien", episode.id_pasien)
      .eq("id_nakes", nakes?.id_nakes)
      .single();

    if (!pasien)
      return {
        success: false,
        error: "Akses ditolak: Anda tidak memiliki akses ke pasien ini.",
      };

    // Update
    const { error: episodeError } = await supabase
      .from("episode_pengobatan")
      .update({
        tanggal_mulai: payload.tanggal_mulai,
        tanggal_selesai: payload.tanggal_selesai,
        tipe_pasien: payload.tipe_pasien,
      })
      .eq("id_episode", payload.id_episode);

    if (episodeError) {
      console.error("[DB ERROR] editEpisode:", episodeError.message);
      return { success: false, error: "Episode aktif tidak ditemukan." };
    }
    return { success: true, message: "Episode berhasil diperbarui." };
  } catch (error) {
    console.error("[DB ERROR] editEpisode:", error);
    return { success: false, error: "Gagal memperbarui episode." };
  }
};

export const hapusEpisode = async (
  id_episode: number,
  id_user_nakes: string,
): Promise<ActionResponse> => {
  try {
    const { nakes, error } = await verifyNakesAccess(id_user_nakes);
    if (error || !nakes)
      return { success: false, error: "Otoritas Nakes tidak valid." };

    const { data: episode } = await supabase
      .from("episode_pengobatan")
      .select("id_pasien")
      .eq("id_episode", id_episode)
      .single();

    if (!episode) return { success: false, error: "Episode tidak ditemukan." };

    const { data: pasien } = await supabase
      .from("pasien")
      .select("id_pasien")
      .eq("id_pasien", episode.id_pasien)
      .eq("id_nakes", nakes?.id_nakes)
      .single();

    if (!pasien) return { success: false, error: "Akses ditolak." };

    const { error: episodeError } = await supabase
      .from("episode_pengobatan")
      .delete()
      .eq("id_episode", id_episode);

    if (episodeError) {
      console.error("[DB ERROR] editEpisode:", episodeError.message);
      return { success: false, error: "Episode aktif tidak ditemukan." };
    }

    return { success: true, message: "Episode berhasil dihapus." };
  } catch (error) {
    console.error("[DB ERROR] hapusEpisode:", error);
    return { success: false, error: "Gagal menghapus episode." };
  }
};
