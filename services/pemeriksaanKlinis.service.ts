import { ActionResponse } from "@/types/action";
import {
  CreatePemeriksaanPayload,
  PasienPemeriksaanOverview,
  PemeriksaanKlinisData,
  UpdatePemeriksaanPayload,
} from "@/types/pemeriksaanKlinis";
import { verifySuperAdminAccess } from "@/utils/access";
import { handleServiceError } from "@/utils/error";
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
      id_pasien, nama_lengkap, usia, domisili,
      episode_pengobatan (
        id_episode, status_episode,
        pemeriksaan_klinis ( 
          id_periksa, id_episode, 
          tanggal_periksa, keluhan, tensi, suhu, 
          pernapasan, nadi, saturasi_o2, 
          tinggi_badan, berat_badan, 
          created_at 
        )
      )
    `,
      )
      .order("created_at", { ascending: false });

    if (pasienError) {
      return handleServiceError(
        pasienError?.message,
        "Gagal mengambil data pasien dari sistem.",
      );
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
          nama_lengkap: pasien.nama_lengkap,
          usia: pasien.usia,
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
    return handleServiceError(error);
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

    if (checkError || !episode) {
      return {
        success: false,
        error: "Akses ditolak: Pasien bukan milik Anda.",
      };
    }

    const { error: pemeriksaanError } = await supabase
      .from("pemeriksaan_klinis")
      .insert(payload);

    if (pemeriksaanError) {
      return handleServiceError(
        pemeriksaanError?.message,
        "Gagal menyimpan pemeriksaan klinis.",
      );
    }

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

    if (checkError || !periksa) {
      return {
        success: false,
        error: "Data tidak ditemukan atau akses ditolak.",
      };
    }

    const { id_periksa, ...updateData } = payload;
    const { error: pemeriksaanError } = await supabase
      .from("pemeriksaan_klinis")
      .update(updateData)
      .eq("id_periksa", id_periksa);

    if (pemeriksaanError)
      return { success: false, error: "Gagal memperbarui data." };
    return { success: true, message: "Data pemeriksaan berhasil diperbarui!" };
  } catch (error) {
    return handleServiceError(error);
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

    if (checkError || !periksa) {
      return {
        success: false,
        error: "Data tidak ditemukan atau akses ditolak.",
      };
    }

    const { error: pemeriksaanError } = await supabase
      .from("pemeriksaan_klinis")
      .delete()
      .eq("id_periksa", id_periksa);
    if (pemeriksaanError)
      return { success: false, error: "Gagal menghapus data pemeriksaan." };

    return { success: true, message: "Pemeriksaan berhasil dihapus." };
  } catch (error) {
    return handleServiceError(error);
  }
};
