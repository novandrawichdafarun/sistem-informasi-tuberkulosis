import {
  BukaEpisodePayload,
  EditEpisodePayload,
  EpisodePengobatanData,
  PasienEpisodeOverview,
  TutupEpisodePayload,
} from "@/types/episodePengobatan";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
);

export const getDaftarPasienDanEpisodeByNakes = async (
  id_user_nakes: string,
) => {
  const { data: nakes, error: nakesError } = await supabase
    .from("nakes")
    .select("id_nakes")
    .eq("id_user", id_user_nakes)
    .single();

  if (nakesError || !nakes) {
    return {
      success: false,
      message: "Data Tenaga Kesehatan tidak ditemukan.",
    };
  }

  const { data: pasienData, error: pasienError } = await supabase
    .from("pasien")
    .select(
      `
      id_pasien,
      no_rm,
      nama_lengkap,
      nik,
      episode_pengobatan (
        id_episode,
        id_pasien,
        tanggal_mulai,
        tanggal_selesai,
        tipe_pasien,
        status_episode,
        created_at
      )
    `,
    )
    .eq("id_nakes", nakes.id_nakes)
    .order("created_at", { ascending: false });

  if (pasienError || !pasienData) {
    console.error("ERROR GET PASIEN EPISODE:", pasienError);
    return { success: false, message: "Gagal mengambil data episode pasien." };
  }

  const formattedData: PasienEpisodeOverview[] = pasienData.map((pasien) => {
    const rawEpisodes = pasien.episode_pengobatan as
      | EpisodePengobatanData[]
      | undefined;
    const episodeAktif =
      rawEpisodes?.find((ep) => ep.status_episode === "aktif") || null;

    const riwayat = rawEpisodes
      ? [...rawEpisodes].sort((a, b) => {
          return (
            new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
          );
        })
      : [];

    return {
      id_pasien: pasien.id_pasien,
      no_rm: pasien.no_rm,
      nama_lengkap: pasien.nama_lengkap,
      nik: pasien.nik,
      episodeAktif: episodeAktif,
      riwayat_episode: riwayat,
    };
  });

  return { success: true, data: formattedData };
};

export const getEpisodeAktifByPasienId = async (
  id_pasien: number,
  id_user_nakes: string,
) => {
  const { data: nakes, error: nakesError } = await supabase
    .from("nakes")
    .select("id_nakes")
    .eq("id_user", id_user_nakes)
    .single();

  if (nakesError || !nakes) {
    return {
      success: false,
      message: "Data Tenaga Kesehatan tidak ditemukan.",
    };
  }

  const { data: pasien, error: pasienError } = await supabase
    .from("pasien")
    .select("id_pasien")
    .eq("id_pasien", id_pasien)
    .eq("id_nakes", nakes.id_nakes)
    .single();

  if (pasienError || !pasien) {
    return {
      success: false,
      message:
        "Akses ditolak: Pasien ini tidak berada di bawah penanganan Anda.",
    };
  }

  const { data, error } = await supabase
    .from("episode_pengobatan")
    .select("*")
    .eq("id_pasien", id_pasien)
    .eq("status_episode", "aktif")
    .single();

  if (error) {
    if (error.code === "PGRST116") {
      return { success: true, data: null };
    }
    return { success: false, message: "Gagal mengambil data episode aktif." };
  }

  return { success: true, data: data as EpisodePengobatanData };
};

export const bukaEpisode = async (
  payload: BukaEpisodePayload,
  id_user_nakes: string,
) => {
  const cekEpisode = await getEpisodeAktifByPasienId(
    payload.id_pasien,
    id_user_nakes,
  );
  if (!cekEpisode.success) {
    return { success: false, message: cekEpisode.message };
  }
  if (cekEpisode.data) {
    return {
      success: false,
      message: "Pasien masih memiliki episode pengobatan aktif.",
    };
  }

  const { data, error } = await supabase
    .from("episode_pengobatan")
    .insert({
      id_pasien: payload.id_pasien,
      tanggal_mulai: payload.tanggal_mulai,
      tipe_pasien: payload.tipe_pasien,
      status_episode: "aktif",
    })
    .select()
    .single();

  if (error) {
    console.error("ERROR BUKA EPISODE:", error);
    return { success: false, message: "Gagal membuka episode pengobatan." };
  }

  return {
    success: true,
    message: "Episode pengobatan berhasil dibuka!",
    data: data as EpisodePengobatanData,
  };
};

export const tutupEpisode = async (
  payload: TutupEpisodePayload,
  id_user_nakes: string,
) => {
  const { data: nakes, error: nakesError } = await supabase
    .from("nakes")
    .select("id_nakes")
    .eq("id_user", id_user_nakes)
    .single();

  if (nakesError || !nakes) {
    return {
      success: false,
      message: "Data Tenaga Kesehatan tidak ditemukan.",
    };
  }

  const { data: episode, error: episodeError } = await supabase
    .from("episode_pengobatan")
    .select("id_pasien")
    .eq("id_episode", payload.id_episode)
    .single();

  if (episodeError || !episode) {
    return { success: false, message: "Episode pengobatan tidak ditemukan." };
  }

  const { data: pasien, error: pasienError } = await supabase
    .from("pasien")
    .select("id_pasien")
    .eq("id_pasien", episode.id_pasien)
    .eq("id_nakes", nakes.id_nakes)
    .single();

  if (pasienError || !pasien) {
    return {
      success: false,
      message:
        "Akses ditolak: Anda tidak berwenang menyelesaikan episode pasien ini.",
    };
  }

  const { error } = await supabase
    .from("episode_pengobatan")
    .update({
      status_episode: "selesai",
      tanggal_selesai: payload.tanggal_selesai,
      tipe_pasien: payload.tipe_pasien,
    })
    .eq("id_episode", payload.id_episode);

  if (error) {
    console.error("ERROR TUTUP EPISODE:", error);
    return {
      success: false,
      message: "Gagal menyelesaikan episode pengobatan.",
    };
  }

  return {
    success: true,
    message: "Episode pengobatan berhasil diselesaikan!",
  };
};

export const editEpisode = async (
  payload: EditEpisodePayload,
  id_user_nakes: string,
) => {
  const { data: nakes } = await supabase
    .from("nakes")
    .select("id_nakes")
    .eq("id_user", id_user_nakes)
    .single();
  if (!nakes) return { success: false, message: "Otoritas tidak valid." };

  const { data: episode } = await supabase
    .from("episode_pengobatan")
    .select("id_pasien")
    .eq("id_episode", payload.id_episode)
    .single();
  if (!episode) return { success: false, message: "Episode tidak ditemukan." };

  const { data: pasien } = await supabase
    .from("pasien")
    .select("id_pasien")
    .eq("id_pasien", episode.id_pasien)
    .eq("id_nakes", nakes.id_nakes)
    .single();
  if (!pasien) return { success: false, message: "Akses ditolak." };

  const { error } = await supabase
    .from("episode_pengobatan")
    .update({
      tanggal_mulai: payload.tanggal_mulai,
      tanggal_selesai: payload.tanggal_selesai || null,
      tipe_pasien: payload.tipe_pasien,
    })
    .eq("id_episode", payload.id_episode);

  if (error) return { success: false, message: "Gagal memperbarui episode." };
  return { success: true, message: "Data episode berhasil diperbarui!" };
};

export const hapusEpisode = async (
  id_episode: number,
  id_user_nakes: string,
) => {
  const { data: nakes } = await supabase
    .from("nakes")
    .select("id_nakes")
    .eq("id_user", id_user_nakes)
    .single();
  if (!nakes) return { success: false, message: "Otoritas tidak valid." };

  const { data: episode } = await supabase
    .from("episode_pengobatan")
    .select("id_pasien")
    .eq("id_episode", id_episode)
    .single();
  if (!episode) return { success: false, message: "Episode tidak ditemukan." };

  const { data: pasien } = await supabase
    .from("pasien")
    .select("id_pasien")
    .eq("id_pasien", episode.id_pasien)
    .eq("id_nakes", nakes.id_nakes)
    .single();
  if (!pasien) return { success: false, message: "Akses ditolak." };

  const { error } = await supabase
    .from("episode_pengobatan")
    .delete()
    .eq("id_episode", id_episode);

  if (error)
    return { success: false, message: "Gagal menghapus episode pengobatan." };
  return { success: true, message: "Episode pengobatan berhasil dihapus." };
};
