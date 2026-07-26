import { SupabaseClient } from "@supabase/supabase-js";
import { ActionResponse } from "@/types/action";
import { handleServiceError } from "@/utils/error";
import {
  CreateResepPayload,
  DetailObatData,
  PasienResepOverview,
  ResepData,
} from "@/types/resep";
import { verifySuperAdminAccess } from "@/utils/access";
import { addDays, todayISO } from "@/utils/date";

export const getDaftarResep = async (
  supabase: SupabaseClient,
  id_super_admin: string,
): Promise<ActionResponse<PasienResepOverview[]>> => {
  try {
    const { superAdmin, error } = await verifySuperAdminAccess(
      supabase,
      id_super_admin,
    );
    if (error || !superAdmin)
      return { success: false, error: "Otoritas tidak valid." };

    const { data, error: resepError } = await supabase
      .from("pasien")
      .select(
        `
        id_pasien, nama_lengkap, usia, jenis_kelamin,
        episode_pengobatan (
          id_episode, status_episode,
          resep_pengobatan (
            id_resep, id_episode, tanggal_resep, kategori_regimen,
            fase_pengobatan, tanggal_mulai_obat, durasi_hari,
            detail_obat (
              id_detail_obat, jumlah_obat_per_minum, frekuensi_minum,
              aturan_pakai, obat ( nama_obat, dosis )
            ),
            jadwal_minum_obat ( id_jadwal, medication_log ( status ) )
          )
        )
      `,
      )
      .order("created_at", { ascending: false });

    if (resepError) {
      return handleServiceError(
        resepError?.message,
        "Gagal memuat data resep.",
      );
    }

    const formatted: PasienResepOverview[] = (data ?? []).map((pasien) => {
      const episodes = pasien.episode_pengobatan || [];
      const episodeAktif =
        episodes.find((e) => e.status_episode === "aktif") || null;

      const resepList: ResepData[] = [];
      episodes.forEach((ep) => {
        (ep.resep_pengobatan || []).forEach((r) => {
          type JadwalLog = {
            medication_log: { status: string }[] | { status: string } | null;
          };
          const jadwal = (r.jadwal_minum_obat ?? []) as JadwalLog[];
          const jumlahDiminum = jadwal.filter((j) => {
            const log = Array.isArray(j.medication_log)
              ? j.medication_log[0]
              : j.medication_log;
            return log?.status === "diminum";
          }).length;

          resepList.push({
            id_resep: r.id_resep,
            id_episode: r.id_episode,
            tanggal_resep: r.tanggal_resep,
            kategori_regimen: r.kategori_regimen,
            fase_pengobatan: r.fase_pengobatan,
            tanggal_mulai_obat: r.tanggal_mulai_obat,
            durasi_hari: r.durasi_hari,
            detail_obat: (r.detail_obat as DetailObatData[]) || [],
            jumlahJadwal: jadwal.length,
            jumlahDiminum,
            statusEpisode: ep.status_episode,
          });
        });
      });

      resepList.sort((a, b) =>
        (b.tanggal_mulai_obat ?? "").localeCompare(a.tanggal_mulai_obat ?? ""),
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
        resepList,
      };
    });

    return { success: true, data: formatted };
  } catch (error) {
    return handleServiceError(error);
  }
};

export const createResepWithJadwal = async (
  supabase: SupabaseClient,
  payload: CreateResepPayload,
  id_super_admin: string,
): Promise<ActionResponse> => {
  try {
    const { superAdmin, error } = await verifySuperAdminAccess(
      supabase,
      id_super_admin,
    );
    if (error || !superAdmin)
      return { success: false, error: "Otoritas tidak valid." };

    // 1) Resep
    const { data: resep, error: resepError } = await supabase
      .from("resep_pengobatan")
      .insert({
        id_episode: payload.id_episode,
        tanggal_resep: todayISO(),
        kategori_regimen: payload.kategori_regimen,
        fase_pengobatan: payload.fase_pengobatan,
        tanggal_mulai_obat: payload.tanggal_mulai_obat,
        durasi_hari: payload.durasi_hari,
      })
      .select("id_resep")
      .single();

    if (resepError || !resep) {
      return handleServiceError(resepError?.message, "Gagal membuat resep.");
    }

    const cleanupResep = async () =>
      supabase.from("resep_pengobatan").delete().eq("id_resep", resep.id_resep);

    // 2) Detail obat
    const detailRows = payload.obat_ids.map((id_obat) => ({
      id_resep: resep.id_resep,
      id_obat,
      jumlah_obat_per_minum: payload.jumlah_per_minum,
      frekuensi_minum: "1x sehari",
      aturan_pakai: payload.aturan_pakai || null,
      jumlah_total_diberikan: Math.round(
        payload.durasi_hari * payload.jumlah_per_minum,
      ),
    }));

    const { data: details, error: detailError } = await supabase
      .from("detail_obat")
      .insert(detailRows)
      .select("id_detail_obat");

    if (detailError || !details || details.length === 0) {
      await cleanupResep();
      return handleServiceError(
        detailError?.message,
        "Gagal menyimpan detail obat.",
      );
    }

    // 3) Jadwal harian (1x/hari) selama durasi
    const firstDetailId = details[0].id_detail_obat;
    const jadwalRows = Array.from({ length: payload.durasi_hari }, (_, d) => ({
      id_resep: resep.id_resep,
      id_detail_obat: firstDetailId,
      tanggal_jadwal: addDays(payload.tanggal_mulai_obat, d),
      jam_jadwal: payload.jam_jadwal,
      status_pengingat: "terjadwal",
    }));

    const { error: jadwalError } = await supabase
      .from("jadwal_minum_obat")
      .insert(jadwalRows);

    if (jadwalError) {
      await supabase
        .from("detail_obat")
        .delete()
        .eq("id_resep", resep.id_resep);
      await cleanupResep();
      return handleServiceError(
        jadwalError?.message,
        "Gagal membuat jadwal minum obat.",
      );
    }

    return {
      success: true,
      message: `Resep dibuat dengan ${payload.durasi_hari} jadwal minum obat.`,
    };
  } catch (error) {
    return handleServiceError(error);
  }
};

export const deleteResep = async (
  supabase: SupabaseClient,
  id_resep: number,
  id_super_admin: string,
): Promise<ActionResponse> => {
  try {
    const { superAdmin, error } = await verifySuperAdminAccess(
      supabase,
      id_super_admin,
    );
    if (error || !superAdmin)
      return { success: false, error: "Otoritas tidak valid." };

    // Hapus berurutan: log → jadwal → detail → resep (aman tanpa andalkan cascade).
    const { data: jadwal } = await supabase
      .from("jadwal_minum_obat")
      .select("id_jadwal")
      .eq("id_resep", id_resep);

    const jadwalIds = (jadwal ?? []).map((j) => j.id_jadwal as number);
    if (jadwalIds.length > 0) {
      await supabase.from("medication_log").delete().in("id_jadwal", jadwalIds);
    }

    await supabase.from("jadwal_minum_obat").delete().eq("id_resep", id_resep);
    await supabase.from("detail_obat").delete().eq("id_resep", id_resep);

    const { error: deleteError } = await supabase
      .from("resep_pengobatan")
      .delete()
      .eq("id_resep", id_resep);

    if (deleteError)
      return handleServiceError(deleteError?.message, "Gagal menghapus resep.");

    return { success: true, message: "Resep & jadwalnya berhasil dihapus." };
  } catch (error) {
    return handleServiceError(error);
  }
};
