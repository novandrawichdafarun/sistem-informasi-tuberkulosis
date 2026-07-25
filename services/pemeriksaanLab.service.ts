import { ActionResponse } from "@/types/action";
import {
  CreatePemeriksaanLabPayload,
  PasienPemeriksaanLabOverview,
  PemeriksaanLabData,
  UpdatePemeriksaanLabPayload,
} from "@/types/pemeriksaanLab";
import { handleServiceError } from "@/utils/error";
import { SupabaseClient } from "@supabase/supabase-js";

const LAB_COLUMNS = `
  id_tes, id_episode, jenis_tes, tanggal_tes, hasil_tes,
  periode_pemeriksaan, berkas_pendukung_url, created_at
`;

// Admin melihat SELURUH pasien — tanpa scoping nakes.
export const getDaftarPemeriksaanLab = async (
  supabase: SupabaseClient,
): Promise<ActionResponse<PasienPemeriksaanLabOverview[]>> => {
  try {
    const { data: pasienData, error: pasienError } = await supabase
      .from("pasien")
      .select(
        `
        id_pasien, nama_lengkap, usia, jenis_kelamin,
        episode_pengobatan (
          id_episode, status_episode,
          pemeriksaan_lab ( ${LAB_COLUMNS} )
        )
      `,
      )
      .order("created_at", { ascending: false });

    if (pasienError) {
      console.error("[DB ERROR] getDaftarPemeriksaanLab:", pasienError.message);
      return {
        success: false,
        error: "Gagal mengambil data pasien dari sistem.",
      };
    }

    const formattedData: PasienPemeriksaanLabOverview[] = (pasienData ?? []).map(
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
          jenis_kelamin: pasien.jenis_kelamin,
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
): Promise<ActionResponse> => {
  try {
    const { error: insertError } = await supabase
      .from("pemeriksaan_lab")
      .insert({ ...payload });

    if (insertError) {
      console.error("[DB ERROR] Insert Pemeriksaan Lab:", insertError.message);
      return { success: false, error: "Gagal menyimpan pemeriksaan lab." };
    }

    return { success: true, message: "Pemeriksaan lab berhasil ditambahkan!" };
  } catch (error) {
    return handleServiceError(error, "Gagal menambah data pemeriksaan lab.");
  }
};

export const updatePemeriksaanLab = async (
  supabase: SupabaseClient,
  payload: UpdatePemeriksaanLabPayload,
): Promise<ActionResponse> => {
  try {
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
    return handleServiceError(error, "Gagal memperbarui data pemeriksaan lab.");
  }
};

export const deletePemeriksaanLab = async (
  supabase: SupabaseClient,
  id_tes: number,
): Promise<ActionResponse> => {
  try {
    const { error: deleteError } = await supabase
      .from("pemeriksaan_lab")
      .delete()
      .eq("id_tes", id_tes);

    if (deleteError)
      return { success: false, error: "Gagal menghapus data pemeriksaan lab." };

    return { success: true, message: "Pemeriksaan lab berhasil dihapus." };
  } catch (error) {
    return handleServiceError(error, "Gagal menghapus data pemeriksaan lab.");
  }
};
