import { SupabaseClient } from "@supabase/supabase-js";
import { ActionResponse } from "@/types/action";
import { handleServiceError } from "@/utils/error";
import {
  AdherenceDay,
  AdherenceSummary,
  ChatMessage,
  MedicationStatus,
  MedicationToday,
  PasienPortalProfile,
  PemeriksaanKlinisData,
  PemeriksaanLabData,
} from "@/types/pasienPortal";
import { isoDaysAgo, todayISO } from "@/utils/date";
import { getPasienIdByUser, getResepIdsByPasien } from "@/utils/Pasien";
import { verifyPasienAccess } from "@/utils/access";

export const getPasienProfileByUser = async (
  supabase: SupabaseClient,
  id_user_pasien: string,
): Promise<ActionResponse<PasienPortalProfile>> => {
  try {
    const { pasien, error } = await verifyPasienAccess(
      supabase,
      id_user_pasien,
    );

    if (error || !pasien)
      return { success: false, error: "Otoritas tidak valid." };

    const { data, error: profileError } = await supabase
      .from("pasien")
      .select(
        `
        id_pasien, id_user, nama_lengkap, usia, jenis_kelamin, domisili,
        no_telp, pendidikan, pekerjaan, pendapatan,
        episode_pengobatan ( id_episode, tanggal_mulai, tipe_pasien, status_episode )
      `,
      )
      .eq("id_user", id_user_pasien)
      .single();

    if (profileError || !data) {
      return handleServiceError(error, "Profil pasien tidak ditemukan.");
    }

    const episodes =
      (data.episode_pengobatan as PasienPortalProfile["episodeAktif"][]) ?? [];
    const episodeAktif =
      episodes
        .filter((e) => e && e.status_episode === "aktif")
        .sort((a, b) =>
          (b!.tanggal_mulai ?? "").localeCompare(a!.tanggal_mulai ?? ""),
        )[0] ?? null;

    const profile: PasienPortalProfile = {
      id_pasien: data.id_pasien,
      id_user: data.id_user,
      nama_lengkap: data.nama_lengkap,
      usia: data.usia,
      jenis_kelamin: data.jenis_kelamin,
      domisili: data.domisili,
      no_telp: data.no_telp,
      pendidikan: data.pendidikan,
      pekerjaan: data.pekerjaan,
      pendapatan: data.pendapatan,
      episodeAktif,
    };

    return { success: true, data: profile };
  } catch (error) {
    return handleServiceError(error);
  }
};

export const getTodayMedicationByUser = async (
  supabase: SupabaseClient,
  id_user_pasien: string,
): Promise<ActionResponse<MedicationToday | null>> => {
  try {
    const { pasien, error } = await verifyPasienAccess(
      supabase,
      id_user_pasien,
    );
    if (error || !pasien)
      return { success: false, error: "Otoritas tidak valid." };

    const id_pasien = await getPasienIdByUser(supabase, id_user_pasien);
    if (!id_pasien) return { success: true, data: null };

    const resepIds = await getResepIdsByPasien(supabase, id_pasien);
    if (resepIds.length === 0) return { success: true, data: null };

    const { data: jadwalRows } = await supabase
      .from("jadwal_minum_obat")
      .select("id_jadwal, tanggal_jadwal, jam_jadwal, id_resep")
      .in("id_resep", resepIds)
      .eq("tanggal_jadwal", todayISO())
      .order("jam_jadwal", { ascending: true })
      .limit(1);

    const jadwal = jadwalRows?.[0];
    if (!jadwal) return { success: true, data: null };

    // Obat pada resep hari ini (detail_obat → master obat).
    const { data: detail } = await supabase
      .from("detail_obat")
      .select("obat ( nama_obat, dosis )")
      .eq("id_resep", jadwal.id_resep);

    const obat = (detail ?? [])
      .map((d) => d.obat as unknown as { nama_obat: string; dosis: string })
      .filter(Boolean);

    // Status laporan hari ini
    const { data: logRows } = await supabase
      .from("medication_log")
      .select("status, reported_at")
      .eq("id_jadwal", jadwal.id_jadwal)
      .limit(1);

    const log = logRows?.[0];

    const result: MedicationToday = {
      id_jadwal: jadwal.id_jadwal,
      tanggal_jadwal: jadwal.tanggal_jadwal,
      jam_jadwal: jadwal.jam_jadwal,
      status: (log?.status as MedicationStatus) ?? null,
      reported_at: log?.reported_at ?? null,
      obat,
    };

    return { success: true, data: result };
  } catch (error) {
    return handleServiceError(error);
  }
};

export const reportTodayMedicationByUser = async (
  supabase: SupabaseClient,
  id_user_pasien: string,
  status: MedicationStatus,
): Promise<ActionResponse> => {
  try {
    const { pasien, error } = await verifyPasienAccess(
      supabase,
      id_user_pasien,
    );
    if (error || !pasien)
      return { success: false, error: "Otoritas tidak valid." };

    const id_pasien = await getPasienIdByUser(supabase, id_user_pasien);
    if (!id_pasien)
      return { success: false, error: "Profil pasien tidak ditemukan." };

    const resepIds = await getResepIdsByPasien(supabase, id_pasien);
    if (resepIds.length === 0)
      return {
        success: false,
        error: "Belum ada resep & jadwal minum obat yang ditetapkan.",
      };

    const { data: jadwalRows } = await supabase
      .from("jadwal_minum_obat")
      .select("id_jadwal")
      .in("id_resep", resepIds)
      .eq("tanggal_jadwal", todayISO())
      .order("jam_jadwal", { ascending: true })
      .limit(1);

    const jadwal = jadwalRows?.[0];
    if (!jadwal)
      return {
        success: false,
        error: "Tidak ada jadwal minum obat untuk hari ini.",
      };

    // Cek log yang sudah ada (idempotent tanpa bergantung pada unique constraint).
    const { data: existing } = await supabase
      .from("medication_log")
      .select("id_log")
      .eq("id_jadwal", jadwal.id_jadwal)
      .limit(1);

    const payload = {
      status,
      reported_by: "pasien",
      reported_at: new Date().toISOString(),
    };

    const { error: writeError } = existing?.[0]
      ? await supabase
          .from("medication_log")
          .update(payload)
          .eq("id_log", existing[0].id_log)
      : await supabase
          .from("medication_log")
          .insert({ id_jadwal: jadwal.id_jadwal, ...payload });

    if (writeError) {
      return handleServiceError(writeError, "Gagal menyimpan laporan obat.");
    }

    return {
      success: true,
      message:
        status === "diminum"
          ? "Laporan minum obat tersimpan. Terima kasih!"
          : "Status terlewat tercatat.",
    };
  } catch (error) {
    return handleServiceError(error);
  }
};

/* -------------------------------------------------------------------------- */
/*  Riwayat kepatuhan                                                          */
/* -------------------------------------------------------------------------- */

export const getAdherenceByUser = async (
  supabase: SupabaseClient,
  id_user_pasien: string,
  days = 30,
): Promise<ActionResponse<AdherenceSummary>> => {
  const empty: AdherenceSummary = {
    total: 0,
    diminum: 0,
    terlewat: 0,
    belum: 0,
    persentase: 0,
    days: [],
  };

  try {
    const id_pasien = await getPasienIdByUser(supabase, id_user_pasien);
    if (!id_pasien) return { success: true, data: empty };

    const resepIds = await getResepIdsByPasien(supabase, id_pasien);
    if (resepIds.length === 0) return { success: true, data: empty };

    const { data: jadwal } = await supabase
      .from("jadwal_minum_obat")
      .select(
        "id_jadwal, tanggal_jadwal, jam_jadwal, medication_log ( status, reported_at )",
      )
      .in("id_resep", resepIds)
      .gte("tanggal_jadwal", isoDaysAgo(days - 1))
      .lte("tanggal_jadwal", todayISO())
      .order("tanggal_jadwal", { ascending: true });

    const daysArr: AdherenceDay[] = (jadwal ?? []).map((j) => {
      const logArr =
        (j.medication_log as { status: string; reported_at: string }[]) ?? [];
      const log = Array.isArray(logArr) ? logArr[0] : logArr;
      return {
        tanggal: j.tanggal_jadwal,
        jam_jadwal: j.jam_jadwal,
        status: (log?.status as MedicationStatus) ?? null,
        reported_at: log?.reported_at ?? null,
      };
    });

    const diminum = daysArr.filter((d) => d.status === "diminum").length;
    const terlewat = daysArr.filter((d) => d.status === "terlewat").length;
    const total = daysArr.length;
    const belum = total - diminum - terlewat;
    const persentase = total > 0 ? Math.round((diminum / total) * 100) : 0;

    return {
      success: true,
      data: { total, diminum, terlewat, belum, persentase, days: daysArr },
    };
  } catch (error) {
    return handleServiceError(error);
  }
};

export const getVitalSignsByUser = async (
  supabase: SupabaseClient,
  id_user_pasien: string,
): Promise<ActionResponse<PemeriksaanKlinisData[]>> => {
  try {
    const id_pasien = await getPasienIdByUser(supabase, id_user_pasien);
    if (!id_pasien) return { success: true, data: [] };

    const { data: episodes } = await supabase
      .from("episode_pengobatan")
      .select("id_episode")
      .eq("id_pasien", id_pasien);

    const episodeIds = (episodes ?? []).map((e) => e.id_episode as number);
    if (episodeIds.length === 0) return { success: true, data: [] };

    const { data, error } = await supabase
      .from("pemeriksaan_klinis")
      .select(
        `id_periksa, id_episode, tanggal_periksa, keluhan, tensi, suhu,
         pernapasan, nadi, saturasi_o2, tinggi_badan, berat_badan, created_at`,
      )
      .in("id_episode", episodeIds)
      .order("tanggal_periksa", { ascending: false });

    if (error) return handleServiceError(error, "Gagal memuat tanda vital.");

    return { success: true, data: (data as PemeriksaanKlinisData[]) ?? [] };
  } catch (error) {
    return handleServiceError(error);
  }
};

/* -------------------------------------------------------------------------- */
/*  Hasil laboratorium                                                         */
/* -------------------------------------------------------------------------- */

export const getLabResultsByUser = async (
  supabase: SupabaseClient,
  id_user_pasien: string,
): Promise<ActionResponse<PemeriksaanLabData[]>> => {
  try {
    const id_pasien = await getPasienIdByUser(supabase, id_user_pasien);
    if (!id_pasien) return { success: true, data: [] };

    const { data: episodes } = await supabase
      .from("episode_pengobatan")
      .select("id_episode")
      .eq("id_pasien", id_pasien);

    const episodeIds = (episodes ?? []).map((e) => e.id_episode as number);
    if (episodeIds.length === 0) return { success: true, data: [] };

    const { data, error } = await supabase
      .from("pemeriksaan_lab")
      .select(
        `id_tes, id_episode, jenis_tes, tanggal_tes, periode_pemeriksaan,
         jenis_sample, kualitas_sample, dna_bakteri_tb, status_resistensi,
         hasil_tes, hasil_bta, berkas_pendukung_url, created_at`,
      )
      .in("id_episode", episodeIds)
      .order("tanggal_tes", { ascending: false });

    if (error) return handleServiceError(error, "Gagal memuat hasil lab.");

    return { success: true, data: (data as PemeriksaanLabData[]) ?? [] };
  } catch (error) {
    return handleServiceError(error);
  }
};

/* -------------------------------------------------------------------------- */
/*  Chat (tabel pesan_chat belum tersedia di DB — placeholder)                 */
/* -------------------------------------------------------------------------- */

export const getChatByUser = async (): Promise<
  ActionResponse<ChatMessage[]>
> => {
  // Belum ada tabel pesan_chat di database live.
  return { success: true, data: [] };
};

export const sendChatByUser = async (): Promise<ActionResponse> => {
  return {
    success: false,
    error: "Fitur chat belum tersedia (tabel pesan_chat belum dibuat).",
  };
};
