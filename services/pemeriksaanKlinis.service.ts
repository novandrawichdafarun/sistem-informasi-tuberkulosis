import { ActionResponse } from "@/types/action";
import {
  CreatePemeriksaanPayload,
  PasienPemeriksaanOverview,
  PemeriksaanKlinisData,
  UpdatePemeriksaanPayload,
} from "@/types/pemeriksaanKlinis";
import { verifyPasienAccess, verifySuperAdminAccess } from "@/utils/access";
import { handleServiceError } from "@/utils/error";
import { getPasienIdByUser } from "@/utils/Pasien";
import { SupabaseClient } from "@supabase/supabase-js";

export const getDaftarPemeriksaan = async (
  supabase: SupabaseClient,
  id_super_admin: string,
): Promise<ActionResponse<PasienPemeriksaanOverview[]>> => {
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
        id_pasien, nama_lengkap, usia, jenis_kelamin, domisili,
        episode_pengobatan (
          id_episode, status_episode,
          pemeriksaan_klinis (
            id_periksa, id_episode, tanggal_periksa, keluhan, tensi,
            suhu, pernapasan, nadi, saturasi_o2, tinggi_badan,
            berat_badan, created_at
          )
        )
      `,
      )
      .order("created_at", { ascending: false });

    if (pasienError)
      return handleServiceError(pasienError?.message, "Pasien tidak ditemukan");

    const formattedData: PasienPemeriksaanOverview[] = (pasienData ?? []).map(
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
          nama_lengkap: pasien.nama_lengkap,
          usia: pasien.usia,
          jenis_kelamin: pasien.jenis_kelamin,
          domisili: pasien.domisili,
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
  } catch (error) {
    return handleServiceError(
      error,
      "Terjadi kesalahan internal saat mengambil data.",
    );
  }
};

export const getPemeriksaanKlinisByUser = async (
  supabase: SupabaseClient,
  id_user_pasien: string,
): Promise<ActionResponse<PemeriksaanKlinisData[]>> => {
  try {
    const { pasien, error } = await verifyPasienAccess(
      supabase,
      id_user_pasien,
    );

    if (error || !pasien)
      return { success: false, error: "Otoritas tidak valid." };

    const id_pasien = await getPasienIdByUser(supabase, id_user_pasien);

    const { data, error: dataError } = await supabase
      .from("episode_pengobatan")
      .select(
        `
        id_pasien,
        pemeriksaan_klinis (
          id_periksa, id_episode, tanggal_periksa, keluhan, tensi, suhu,
          pernapasan, nadi, saturasi_o2, tinggi_badan, berat_badan, created_at
        )
        `,
      )
      .eq("id_pasien", id_pasien)
      .order("created_at", { ascending: false });

    if (dataError)
      return handleServiceError(
        dataError?.message,
        "Gagal memuat tanda vital.",
      );

    // Flatkan struktur: extract pemeriksaan_klinis dari setiap episode
    const klinisList: PemeriksaanKlinisData[] = (data ?? []).flatMap(
      (episode) =>
        (episode.pemeriksaan_klinis ?? []).map(
          (klinis) =>
            ({
              id_periksa: klinis.id_periksa,
              id_episode: klinis.id_episode,
              tanggal_periksa: klinis.tanggal_periksa,
              keluhan: klinis.keluhan,
              tensi: klinis.tensi,
              suhu: klinis.suhu,
              pernapasan: klinis.pernapasan,
              nadi: klinis.nadi,
              saturasi_o2: klinis.saturasi_o2,
              tinggi_badan: klinis.tinggi_badan,
              berat_badan: klinis.berat_badan,
              created_at: klinis.created_at,
            }) as PemeriksaanKlinisData,
        ),
    );

    // Sort by tanggal_periksa descending
    klinisList.sort(
      (a, b) =>
        new Date(b.tanggal_periksa).getTime() -
        new Date(a.tanggal_periksa).getTime(),
    );

    return { success: true, data: klinisList };
  } catch (error) {
    return handleServiceError(
      error,
      "Terjadi kesalahan internal saat mengambil data.",
    );
  }
};

export const createPemeriksaanKlinis = async (
  supabase: SupabaseClient,
  payload: CreatePemeriksaanPayload,
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
      .from("pemeriksaan_klinis")
      .insert(payload);

    if (insertError)
      return handleServiceError(
        insertError?.message,
        "Gagal menyimpan pemeriksaan klinis.",
      );

    return {
      success: true,
      message: "Pemeriksaan klinis berhasil ditambahkan!",
    };
  } catch (error) {
    return handleServiceError(error);
  }
};

export const updatePemeriksaanKlinis = async (
  supabase: SupabaseClient,
  payload: UpdatePemeriksaanPayload,
  id_super_admin: string,
): Promise<ActionResponse> => {
  try {
    const { superAdmin, error } = await verifySuperAdminAccess(
      supabase,
      id_super_admin,
    );
    if (error || !superAdmin)
      return { success: false, error: "Otoritas tidak valid." };

    const { data: periksa, error: checkError } = await supabase
      .from("pemeriksaan_klinis")
      .select("id_periksa")
      .eq("id_periksa", payload.id_periksa)
      .single();

    if (checkError || !periksa)
      return handleServiceError(checkError?.message, "Data tidak ditemukan");

    const { id_periksa, ...updateData } = payload;
    const { error: updateError } = await supabase
      .from("pemeriksaan_klinis")
      .update(updateData)
      .eq("id_periksa", id_periksa);

    if (updateError)
      return handleServiceError(
        updateError?.message,
        "Gagal memeperbarui data.",
      );

    return { success: true, message: "Data pemeriksaan berhasil diperbarui!" };
  } catch (error) {
    return handleServiceError(
      error,
      "Terjadi kesalahan internal saat memperbarui data.",
    );
  }
};

export const deletePemeriksaanKlinis = async (
  supabase: SupabaseClient,
  id_periksa: number,
  id_super_admin: string,
): Promise<ActionResponse> => {
  try {
    const { superAdmin, error } = await verifySuperAdminAccess(
      supabase,
      id_super_admin,
    );
    if (error || !superAdmin)
      return { success: false, error: "Otoritas tidak valid." };

    const { data: periksa, error: checkError } = await supabase
      .from("pemeriksaan_klinis")
      .select("id_periksa")
      .eq("id_periksa", id_periksa)
      .single();

    if (checkError || !periksa)
      return handleServiceError(checkError?.message, "Data tidak ditemukan");

    const { error: deleteError } = await supabase
      .from("pemeriksaan_klinis")
      .delete()
      .eq("id_periksa", id_periksa);

    if (deleteError)
      return handleServiceError(deleteError?.message, "Gagal menghapus data");

    return { success: true, message: "Pemeriksaan berhasil dihapus." };
  } catch (error) {
    return handleServiceError(
      error,
      "Terjadi kesalahan internal saat menghapus data.",
    );
  }
};
