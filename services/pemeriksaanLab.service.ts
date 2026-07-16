import { ActionResponse } from "@/types/action";
import {
  CreatePemeriksaanLabPayload,
  PasienPemeriksaanLabOverview,
  PemeriksaanLabData,
  UpdatePemeriksaanLabPayload,
} from "@/types/pemeriksaanLab";
import { verifyNakesAccess } from "@/utils/access";
import { handleServiceError } from "@/utils/error";
import { SupabaseClient } from "@supabase/supabase-js";

export const getDaftarPemeriksaanLabByNakes = async (
  supabase: SupabaseClient,
  id_user_nakes: string,
): Promise<ActionResponse<PasienPemeriksaanLabOverview[]>> => {
  try {
    const { nakes, error } = await verifyNakesAccess(supabase, id_user_nakes);
    if (error || !nakes)
      return { success: false, error: "Otoritas Nakes tidak valid." };

    const { data: pasienData, error: pasienError } = await supabase
      .from("pasien")
      .select(
        `
        id_pasien, no_rm, nama_lengkap, nik,
        episode_pengobatan (
          id_episode, status_episode,
          pemeriksaan_lab ( 
            id_tes, id_episode, id_nakes, 
            jenis_tes, tanggal_tes, hasil_tes, 
            periode_bulanan, berkas_pendukung_url, 
            created_at 
          )
        )
      `,
      )
      .eq("id_nakes", nakes.id_nakes)
      .order("created_at", { ascending: false });

    if (pasienError) {
      console.error(
        "[DB ERROR] getDaftarPemeriksaanLabByNakes:",
        pasienError.message,
      );
      return {
        success: false,
        error: "Gagal mengambil data pasien dari sistem.",
      };
    }

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
          no_rm: pasien.no_rm,
          nama_lengkap: pasien.nama_lengkap,
          nik: pasien.nik,
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
    return handleServiceError(error, "Gagal mengambil data pemeriksaan lab.");
  }
};

export const createPemeriksaanLab = async (
  supabase: SupabaseClient,
  payload: CreatePemeriksaanLabPayload,
  id_user_nakes: string,
): Promise<ActionResponse> => {
  try {
    const { nakes, error } = await verifyNakesAccess(supabase, id_user_nakes);
    if (error || !nakes)
      return { success: false, error: "Otoritas Nakes tidak valid." };

    const { data: episode, error: checkError } = await supabase
      .from("episode_pengobatan")
      .select(`id_episode, pasien!inner (id_nakes)`)
      .eq("id_episode", payload.id_episode)
      .eq("pasien.id_nakes", nakes.id_nakes)
      .single();

    if (checkError || !episode) {
      return {
        success: false,
        error: "Akses ditolak: Pasien bukan milik Anda.",
      };
    }

    const { error: insertError } = await supabase
      .from("pemeriksaan_lab")
      .insert({
        ...payload,
        id_nakes: nakes.id_nakes,
      });

    if (insertError) {
      console.error("[DB ERROR] Insert Pemeriksaan Lab:", insertError.message);
      return { success: false, error: "Gagal menyimpan pemeriksaan lab." };
    }

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
  id_user_nakes: string,
): Promise<ActionResponse> => {
  try {
    const { nakes, error } = await verifyNakesAccess(supabase, id_user_nakes);
    if (error || !nakes)
      return { success: false, error: "Otoritas Nakes tidak valid." };

    const { data: tesLab, error: checkError } = await supabase
      .from("pemeriksaan_lab")
      .select(
        `
        id_tes,
        episode_pengobatan!inner (
          pasien!inner (
            id_nakes
          )
        )
      `,
      )
      .eq("id_tes", payload.id_tes)
      .eq("episode_pengobatan.pasien.id_nakes", nakes.id_nakes)
      .single();

    if (checkError || !tesLab) {
      return {
        success: false,
        error: "Data tidak ditemukan atau akses ditolak.",
      };
    }

    const { id_tes, ...updateData } = payload;
    const { error: updateError } = await supabase
      .from("pemeriksaan_lab")
      .update(updateData)
      .eq("id_tes", id_tes);

    if (updateError)
      return { success: false, error: "Gagal memperbarui data." };
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
  id_user_nakes: string,
): Promise<ActionResponse> => {
  try {
    const { nakes, error } = await verifyNakesAccess(supabase, id_user_nakes);
    if (error || !nakes)
      return { success: false, error: "Otoritas Nakes tidak valid." };

    const { data: tesLab, error: checkError } = await supabase
      .from("pemeriksaan_lab")
      .select(
        `
        id_tes,
        episode_pengobatan!inner (
          pasien!inner (
            id_nakes
          )
        )
      `,
      )
      .eq("id_tes", id_tes)
      .eq("episode_pengobatan.pasien.id_nakes", nakes.id_nakes)
      .single();

    if (checkError || !tesLab) {
      return {
        success: false,
        error: "Data tidak ditemukan atau akses ditolak.",
      };
    }

    const { error: deleteError } = await supabase
      .from("pemeriksaan_lab")
      .delete()
      .eq("id_tes", id_tes);

    if (deleteError)
      return { success: false, error: "Gagal menghapus data pemeriksaan lab." };

    return { success: true, message: "Pemeriksaan lab berhasil dihapus." };
  } catch (error) {
    return handleServiceError(
      error,
      "Terjadi kesalahan internal saat menghapus data.",
    );
  }
};
