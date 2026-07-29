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
import { addDays, diffDaysInclusive, todayISO } from "@/utils/date";

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
            jadwal_minum_obat (
              id_jadwal, id_detail_obat, tanggal_jadwal, jam_jadwal,
              medication_log ( status )
            )
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
          type JadwalMinumObatRow = {
            id_jadwal: number;
            id_detail_obat: number;
            tanggal_jadwal: string;
            jam_jadwal: string;
            medication_log: { status: string }[] | { status: string } | null;
          };
          const jadwalRows = (r.jadwal_minum_obat ??
            []) as JadwalMinumObatRow[];
          const jumlahDiminum = jadwalRows.filter((j) => {
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
            jadwal_minum_obat: jadwalRows.map((j) => ({
              id_jadwal: j.id_jadwal,
              id_detail_obat: j.id_detail_obat,
              tanggal_jadwal: j.tanggal_jadwal,
              jam_jadwal: j.jam_jadwal,
            })),
            jumlahJadwal: jadwalRows.length,
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

    const semuaMulai = payload.obat_items
      .map((item) => item.tanggal_mulai_obat)
      .sort();
    const semuaSelesai = payload.obat_items
      .map((item) => item.tanggal_selesai_obat)
      .sort();

    const tanggalMulaiObat = semuaMulai[0];
    const tanggalAkhirObat = semuaSelesai[semuaSelesai.length - 1];
    const durasiTotal = diffDaysInclusive(tanggalMulaiObat, tanggalAkhirObat);

    const { data: resep, error: resepError } = await supabase
      .from("resep_pengobatan")
      .insert({
        id_episode: payload.id_episode,
        tanggal_resep: todayISO(),
        kategori_regimen: payload.kategori_regimen,
        fase_pengobatan: payload.fase_pengobatan,
        tanggal_mulai_obat: tanggalMulaiObat,
        durasi_hari: durasiTotal,
      })
      .select("id_resep")
      .single();

    if (resepError || !resep) {
      return handleServiceError(resepError?.message, "Gagal membuat resep.");
    }

    const cleanupResep = async () =>
      supabase.from("resep_pengobatan").delete().eq("id_resep", resep.id_resep);

    const detailRows = payload.obat_items.map((item) => ({
      id_resep: resep.id_resep,
      id_obat: item.id_obat,
      jumlah_obat_per_minum: item.jumlah_per_minum,
      frekuensi_minum: item.frekuensi_minum,
      aturan_pakai: item.aturan_pakai || null,
      jumlah_total_diberikan: item.jumlah_total_diberikan,
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

    const jadwalRows = payload.obat_items.flatMap((item, index) => {
      const detailId = details[index].id_detail_obat;
      const days = diffDaysInclusive(
        item.tanggal_mulai_obat,
        item.tanggal_selesai_obat,
      );

      return Array.from({ length: days }, (_, dayIndex) => {
        const tanggal_jadwal = addDays(item.tanggal_mulai_obat, dayIndex);
        return item.jam_jadwal.map((jam) => ({
          id_resep: resep.id_resep,
          id_detail_obat: detailId,
          tanggal_jadwal,
          jam_jadwal: jam,
          status_pengingat: "terjadwal",
        }));
      }).flat();
    });

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
      message: `Resep dibuat dengan ${payload.obat_items.length} obat dan ${jadwalRows.length} jadwal minum.`,
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
