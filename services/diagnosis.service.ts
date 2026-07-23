import { ActionResponse } from "@/types/action";
import {
  CreateDiagnosisPayload,
  DiagnosisData,
  PasienDiagnosisOverview,
  UpdateDaignosisPayload,
} from "@/types/diagnosis";
import { verifySuperAdminAccess } from "@/utils/access";
import { handleServiceError } from "@/utils/error";
import { SupabaseClient } from "@supabase/supabase-js";

export const getDaftarDiagnosis = async (
  supabase: SupabaseClient,
  id_super_admin: string,
): Promise<ActionResponse<PasienDiagnosisOverview[]>> => {
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
          diagnosis (
            id_diagnosis, id_episode, tanggal_diagnosis,
            kode_icd10, klasifikasi_anatomi, lokasi_anatomi,
            klasifikasi_resistensi, tipe_resistensi, 
            dasar_diagnosis, catatan_klinis, created_at
          )
        )
        `,
      )
      .order("created_at", { ascending: false });

    if (pasienError)
      return handleServiceError(pasienError?.message, "Pasien tidak ditemukan");

    const formattedData: PasienDiagnosisOverview[] = pasienData.map(
      (pasien) => {
        const rawEpisodes = pasien.episode_pengobatan || [];
        const episodeAktif =
          rawEpisodes.find((ep) => ep.status_episode === "aktif") || null;

        let riwayat: DiagnosisData[] = [];
        rawEpisodes.forEach((ep) => {
          if (ep.diagnosis) {
            riwayat = [...riwayat, ...ep.diagnosis];
          }
        });

        riwayat.sort(
          (a, b) =>
            new Date(b.tanggal_diagnosis).getTime() -
            new Date(a.tanggal_diagnosis).getTime(),
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
          riwayat_diagnosis: riwayat,
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

export const createDiagnosis = async (
  supabase: SupabaseClient,
  payload: CreateDiagnosisPayload,
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
      .from("diagnosis")
      .insert(payload);

    if (insertError)
      return handleServiceError(
        insertError?.message,
        "Gagal menyimpan diagnosis",
      );

    return { success: true, message: "Diagnosis pasien berhasil ditambahkan!" };
  } catch (error) {
    return handleServiceError(
      error,
      "Terjadi kesalahan internal server saat menambah data.",
    );
  }
};

export const updateDiagnosis = async (
  supabase: SupabaseClient,
  payload: UpdateDaignosisPayload,
  id_super_admin: string,
): Promise<ActionResponse> => {
  try {
    const { superAdmin, error } = await verifySuperAdminAccess(
      supabase,
      id_super_admin,
    );
    if (error || !superAdmin)
      return { success: false, error: "Otoritas tidak valid." };

    const { data: diagnosis, error: checkError } = await supabase
      .from("diagnosis")
      .select("id_diagnosis")
      .eq("id_tes", payload.id_diagnosis)
      .single();

    if (checkError || !diagnosis)
      return handleServiceError(checkError?.message, "Data tidak ditemukan");

    const { id_diagnosis, ...updateData } = payload;
    const { error: updateError } = await supabase
      .from("diagnosis")
      .update(updateData)
      .eq("id_diagnosis", id_diagnosis);

    if (updateError)
      return handleServiceError(
        updateError?.message,
        "Gagal memeperbarui data.",
      );

    return {
      success: true,
      message: "Data Diagnosis Pasien berhasil diperbarui!",
    };
  } catch (error) {
    return handleServiceError(
      error,
      "Terjadi kesalahan internal saat memperbarui data.",
    );
  }
};

export const deleteDiagnosis = async (
  supabase: SupabaseClient,
  id_diagnosis: number,
  id_super_admin: string,
): Promise<ActionResponse> => {
  try {
    const { superAdmin, error } = await verifySuperAdminAccess(
      supabase,
      id_super_admin,
    );
    if (error || !superAdmin)
      return { success: false, error: "Otoritas tidak valid." };

    const { data: diagnosis, error: checkError } = await supabase
      .from("diagnosis")
      .select("id_diagnosis")
      .eq("id_diagnosis", id_diagnosis)
      .single();

    if (checkError || !diagnosis)
      return handleServiceError(checkError?.message, "Data tidak ditemukan");

    const { error: deleteError } = await supabase
      .from("diagnosis")
      .delete()
      .eq("id_diagnosis", id_diagnosis);

    if (deleteError)
      return handleServiceError(deleteError?.message, "Gagal menghapus data");

    return { success: true, message: "Diagnosis Pasien berhasil dihapus." };
  } catch (error) {
    return handleServiceError(
      error,
      "Terjadi kesalahan internal saat menghapus data.",
    );
  }
};
