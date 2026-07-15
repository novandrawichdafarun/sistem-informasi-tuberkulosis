import {
  CreatePemeriksaanPayload,
  PasienPemeriksaanOverview,
  PemeriksaanKlinisData,
  UpdatePemeriksaanPayload,
} from "@/types/pemeriksaanKlinis";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
);

export const getDaftarPemeriksaanByNakes = async (id_user_nakes: string) => {
  const { data: nakes } = await supabase
    .from("nakes")
    .select("id_nakes")
    .eq("id_user", id_user_nakes)
    .single();
  if (!nakes) return { success: false, message: "Otoritas Nakes tidak valid." };

  const { data: pasienData, error } = await supabase
    .from("pasien")
    .select(
      `
      id_pasien, no_rm, nama_lengkap, nik,
      episode_pengobatan (
        id_episode, status_episode,
        pemeriksaan_klinis ( * )
      )
    `,
    )
    .eq("id_nakes", nakes.id_nakes)
    .order("created_at", { ascending: false });

  if (error || !pasienData) {
    console.error("ERROR GET PEMERIKSAAN:", error);
    return {
      success: false,
      message: "Gagal mengambil data pemeriksaan pasien.",
    };
  }

  const formattedData: PasienPemeriksaanOverview[] = pasienData.map(
    (pasien) => {
      const rawEpisodes = pasien.episode_pengobatan || [];
      const episodeAktif =
        rawEpisodes.find((ep) => ep.status_episode === "aktif") || null;

      let riwayat: PemeriksaanKlinisData[] = [];
      rawEpisodes.forEach((ep) => {
        if (ep.pemeriksaan_klinis) {
          riwayat = [...riwayat, ...ep.pemeriksaan_klinis];
        }
      });

      riwayat.sort(
        (a, b) =>
          new Date(b.tanggal_periksa).getTime() -
          new Date(a.tanggal_periksa).getTime(),
      );

      return {
        id_pasien: pasien.id_pasien,
        no_rm: pasien.no_rm,
        nama_lengkap: pasien.nama_lengkap,
        nik: pasien.nik,
        episodeAktif: episodeAktif
          ? {
              id_episode: episodeAktif.id_episode,
              status_episode: episodeAktif.status_episode,
            }
          : null,
        riwayat_pemeriksaan: riwayat,
      };
    },
  );

  return { success: true, data: formattedData };
};

export const createPemeriksaanKlinis = async (
  payload: CreatePemeriksaanPayload,
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
  if (!pasien)
    return {
      success: false,
      message: "Akses ditolak: Pasien bukan milik Anda.",
    };

  const { error } = await supabase.from("pemeriksaan_klinis").insert({
    ...payload,
    id_nakes: nakes.id_nakes,
  });

  if (error) {
    console.error("ERROR CREATE PERIKSA:", error);
    return { success: false, message: "Gagal menyimpan pemeriksaan klinis." };
  }

  return { success: true, message: "Pemeriksaan klinis berhasil ditambahkan!" };
};

export const updatePemeriksaanKlinis = async (
  payload: UpdatePemeriksaanPayload,
  id_user_nakes: string,
) => {
  const { data: nakes } = await supabase
    .from("nakes")
    .select("id_nakes")
    .eq("id_user", id_user_nakes)
    .single();
  if (!nakes) return { success: false, message: "Otoritas tidak valid." };

  const { data: periksa } = await supabase
    .from("pemeriksaan_klinis")
    .select("id_episode")
    .eq("id_periksa", payload.id_periksa)
    .single();
  if (!periksa)
    return { success: false, message: "Data periksa tidak ditemukan." };

  const { data: episode } = await supabase
    .from("episode_pengobatan")
    .select("id_pasien")
    .eq("id_episode", periksa.id_episode)
    .single();
  const { data: pasien } = await supabase
    .from("pasien")
    .select("id_pasien")
    .eq("id_pasien", episode?.id_pasien)
    .eq("id_nakes", nakes.id_nakes)
    .single();
  if (!pasien) return { success: false, message: "Akses ditolak." };

  const { id_periksa, id_episode, ...updateData } = payload;
  const { error } = await supabase
    .from("pemeriksaan_klinis")
    .update(updateData)
    .eq("id_periksa", id_periksa);

  if (error) return { success: false, message: "Gagal memperbarui data." };
  return { success: true, message: "Data pemeriksaan berhasil diperbarui!" };
};

export const deletePemeriksaanKlinis = async (
  id_periksa: number,
  id_user_nakes: string,
) => {
  const { data: nakes } = await supabase
    .from("nakes")
    .select("id_nakes")
    .eq("id_user", id_user_nakes)
    .single();
  if (!nakes) return { success: false, message: "Otoritas tidak valid." };

  const { data: periksa } = await supabase
    .from("pemeriksaan_klinis")
    .select("id_episode")
    .eq("id_periksa", id_periksa)
    .single();
  if (!periksa) return { success: false, message: "Data tidak ditemukan." };

  const { data: episode } = await supabase
    .from("episode_pengobatan")
    .select("id_pasien")
    .eq("id_episode", periksa.id_episode)
    .single();
  const { data: pasien } = await supabase
    .from("pasien")
    .select("id_pasien")
    .eq("id_pasien", episode?.id_pasien)
    .eq("id_nakes", nakes.id_nakes)
    .single();
  if (!pasien) return { success: false, message: "Akses ditolak." };

  const { error } = await supabase
    .from("pemeriksaan_klinis")
    .delete()
    .eq("id_periksa", id_periksa);
  if (error)
    return { success: false, message: "Gagal menghapus data pemeriksaan." };

  return { success: true, message: "Pemeriksaan berhasil dihapus." };
};
