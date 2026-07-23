import { ActionResponse } from "@/types/action";
import {
  CreatePemeriksaanLabPayload,
  PasienPemeriksaanLabOverview,
  PemeriksaanLabData,
  UpdatePemeriksaanLabPayload,
} from "@/types/pemeriksaanLab";
import { verifySuperAdminAccess } from "@/utils/access";
import { handleServiceError } from "@/utils/error";
import { SupabaseClient } from "@supabase/supabase-js";

export const getDaftarPemeriksaanLab = async (
  supabase: SupabaseClient,
  id_super_admin: string,
): Promise<ActionResponse<PasienPemeriksaanLabOverview[]>> => {
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
          id_episode, status_episode,
          pemeriksaan_lab ( 
            id_tes, id_episode,
            jenis_tes, tanggal_tes, periode_pemeriksaan, 
            jenis_sample, kualitas_sample, dna_bakteri_tb, 
            status_resistensi, hasil_tes, hasil_bta,
            berkas_pendukung_url, created_at
          )
        )
      `,
      )
      .order("created_at", { ascending: false });

    if (pasienError)
      return handleServiceError(pasienError?.message, "Pasien tidak ditemukan");

    const formattedData: PasienPemeriksaanLabOverview[] = pasienData.map(
      (pasien) => {
        const rawEpisodes = pasien.episode_pengobatan || [];
        const episodeAktif =
          rawEpisodes.find((ep) => ep.status_episode === "aktif") || null;

        let riwayat: PemeriksaanLabData[] = [];
        rawEpisodes.forEach((ep) => {
          if (ep.pemeriksaan_lab) {
            riwayat = [...riwayat, ...ep.pemeriksaan_lab];
          }
        });

        riwayat.sort(
          (a, b) =>
            new Date(b.tanggal_tes).getTime() -
            new Date(a.tanggal_tes).getTime(),
        );

        return {
          id_pasien: pasien.id_pasien,
          nama_lengkap: pasien.nama_lengkap,
          usia: pasien.usia,
          domisili: pasien.domisili,
          episodeAktif: episodeAktif
            ? {
                id_episode: episodeAktif.id_episode,
                status_episode: episodeAktif.status_episode,
              }
            : null,
          riwayat_pemeriksaan_lab: riwayat,
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

export const createPemeriksaanLab = async (
  supabase: SupabaseClient,
  payload: CreatePemeriksaanLabPayload,
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

    const { error: insertError } = await supabase
      .from("pemeriksaan_lab")
      .insert(payload);

    if (insertError)
      return handleServiceError(
        insertError?.message,
        "Gagal menyimpan pemeriksaan lab",
      );

    return { success: true, message: "Pemeriksaan lab berhasil ditambahkan!" };
  } catch (error) {
    return handleServiceError(
      error,
      "Terjadi kesalahan internal server saat menambah data.",
    );
  }
};

export const updatePemeriksaanLab = async (
  supabase: SupabaseClient,
  payload: UpdatePemeriksaanLabPayload,
  id_super_admin: string,
): Promise<ActionResponse> => {
  try {
    const { superAdmin, error } = await verifySuperAdminAccess(
      supabase,
      id_super_admin,
    );
    if (error || !superAdmin)
      return { success: false, error: "Otoritas tidak valid." };

    const { data: tesLab, error: checkError } = await supabase
      .from("pemeriksaan_lab")
      .select("id_tes")
      .eq("id_tes", payload.id_tes)
      .single();

    if (checkError || !tesLab)
      return handleServiceError(checkError, "Data tidak ditemukan");

    const { id_tes, ...updateData } = payload;
    const { error: updateError } = await supabase
      .from("pemeriksaan_lab")
      .update(updateData)
      .eq("id_tes", id_tes);

    if (updateError)
      return handleServiceError(
        updateError?.message,
        "Gagal memeperbarui data.",
      );

    return {
      success: true,
      message: "Data pemeriksaan lab berhasil diperbarui!",
    };
  } catch (error) {
    return handleServiceError(
      error,
      "Terjadi kesalahan internal saat memperbarui data.",
    );
  }
};

export const deletePemeriksaanLab = async (
  supabase: SupabaseClient,
  id_tes: number,
  id_super_admin: string,
): Promise<ActionResponse> => {
  try {
    const { superAdmin, error } = await verifySuperAdminAccess(
      supabase,
      id_super_admin,
    );
    if (error || !superAdmin)
      return { success: false, error: "Otoritas tidak valid." };

    const { data: tesLab, error: checkError } = await supabase
      .from("pemeriksaan_lab")
      .select("id_tes")
      .eq("id_tes", id_tes)
      .single();

    if (checkError || !tesLab)
      return handleServiceError(checkError, "Data tidak ditemukan");

    const { error: deleteError } = await supabase
      .from("pemeriksaan_lab")
      .delete()
      .eq("id_tes", id_tes);

    if (deleteError)
      return handleServiceError(deleteError?.message, "Gagal menghapus data");

    return { success: true, message: "Pemeriksaan lab berhasil dihapus." };
  } catch (error) {
    return handleServiceError(
      error,
      "Terjadi kesalahan internal saat menghapus data.",
    );
  }
};
