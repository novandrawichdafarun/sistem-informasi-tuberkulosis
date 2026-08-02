import { ActionResponse } from "@/types/action";
import {
  BukaEpisodePayload,
  EditEpisodePayload,
  EpisodePengobatanData,
  HasilAkhirData,
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
        id_pasien, nama_lengkap, usia, domisili, jenis_kelamin,
        episode_pengobatan (
          id_episode, id_pasien, tanggal_mulai, tanggal_selesai,
          tipe_pasien, status_episode, created_at,
          hasil_akhir (
            id_hasil, id_episode, tanggal_penetapan,
            status_akhir, catatan_akhir, created_at
          )
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
          | (EpisodePengobatanData & {
              hasil_akhir?: HasilAkhirData[] | null;
            })[]
          | undefined;

        const normalizedEpisodes: EpisodePengobatanData[] = (
          rawEpisodes || []
        ).map((episode) => ({
          ...episode,
          hasil_akhir: Array.isArray(episode.hasil_akhir)
            ? (episode.hasil_akhir[0] ?? null)
            : (episode.hasil_akhir ?? null),
        }));

        const episodeAktif =
          normalizedEpisodes.find((ep) => ep.status_episode === "aktif") ||
          null;
        const riwayat = [...normalizedEpisodes].sort(
          (a, b) =>
            new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
        );

        return {
          id_pasien: pasien.id_pasien,
          nama_lengkap: pasien.nama_lengkap,
          usia: pasien.usia,
          jenis_kelamin: pasien.jenis_kelamin,
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
      return handleServiceError(episodeError, "Episode aktif tidak ditemukan.");
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
      return {
        success: false,
        error: "Pasien masih memiliki episode pengobatan aktif.",
      };

    const { error: episodeError } = await supabase
      .from("episode_pengobatan")
      .insert({
        ...payload,
        status_episode: "aktif",
      });

    if (episodeError) {
      return handleServiceError(episodeError, "Episode gagal dibuka.");
    }

    return { success: true, message: "Episode pengobatan berhasil dibuka." };
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
      })
      .eq("id_episode", payload.id_episode);

    if (episodeError)
      return handleServiceError(
        episodeError,
        "Episode pengobatan gagal diselesaikan.",
      );

    const { error: hasilAkhirError } = await supabase
      .from("hasil_akhir")
      .insert({
        id_episode: payload.id_episode,
        tanggal_penetapan: payload.tanggal_penetapan,
        status_akhir: payload.status_akhir,
        catatan_akhir: payload.catatan_akhir || null,
      });

    if (hasilAkhirError) {
      await supabase
        .from("episode_pengobatan")
        .update({ status_episode: "aktif" })
        .eq("id_episode", payload.id_episode); //! Role back status episode
      return handleServiceError(
        hasilAkhirError?.message,
        "Hasil Akhir gagal di buat",
      );
    }

    return {
      success: true,
      message: "Episode pengobatan berhasil diselesaikan.",
    };
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

    //? Update Episode
    const { error: updateError } = await supabase
      .from("episode_pengobatan")
      .update({
        tanggal_mulai: payload.tanggal_mulai,
        tanggal_selesai: payload.tanggal_selesai,
        tipe_pasien: payload.tipe_pasien,
      })
      .eq("id_episode", payload.id_episode);

    if (updateError)
      return handleServiceError(
        updateError?.message,
        "Gagal memperbarui episode pengobatan.",
      );

    // ? Update Hasil AKhir
    if (payload.hasil_akhir) {
      const { data: existingHasil, error: hasilCheckError } = await supabase
        .from("hasil_akhir")
        .select("id_hasil")
        .eq("id_episode", payload.id_episode)
        .single();

      if (hasilCheckError)
        return handleServiceError(
          hasilCheckError?.message,
          "Gagal memeriksa data hasil akhir.",
        );

      if (existingHasil) {
        const { error: updateHasilError } = await supabase
          .from("hasil_akhir")
          .update({
            tanggal_penetapan: payload.hasil_akhir.tanggal_penetapan,
            status_akhir: payload.hasil_akhir.status_akhir,
            catatan_akhir: payload.hasil_akhir.catatan_akhir || null,
          })
          .eq("id_episode", payload.id_episode);

        if (updateHasilError)
          return handleServiceError(
            updateHasilError?.message,
            "Gagal memperbarui data hasil akhir.",
          );
      }
    }

    return {
      success: true,
      message: "Episode pengobatan berhasil diperbarui.",
    };
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

    const { data: existingHasil, error: hasilCheckError } = await supabase
      .from("hasil_akhir")
      .select("id_hasil")
      .eq("id_episode", id_episode)
      .maybeSingle();

    if (hasilCheckError)
      return handleServiceError(
        hasilCheckError?.message,
        "Gagal memeriksa data hasil akhir.",
      );

    if (existingHasil) {
      const { error: deleteHasilError } = await supabase
        .from("hasil_akhir")
        .delete()
        .eq("id_episode", id_episode);

      if (deleteHasilError)
        return handleServiceError(
          deleteHasilError?.message,
          "Gagal menghapus data hasil akhir",
        );
    }

    const { error: deleteEpisodeError } = await supabase
      .from("episode_pengobatan")
      .delete()
      .eq("id_episode", id_episode);

    if (deleteEpisodeError)
      return { success: false, error: "Gagal menghapus episode." };

    return { success: true, message: "Episode Pengobatan berhasil dihapus." };
  } catch (error) {
    return handleServiceError(
      error,
      "Terjadi kesalahan internal saat menghapus data.",
    );
  }
};
