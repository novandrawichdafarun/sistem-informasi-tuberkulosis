import { SupabaseClient } from "@supabase/supabase-js";
import { ActionResponse } from "@/types/action";
import { handleServiceError } from "@/utils/error";
import { PasienData } from "@/types/pasien";
import { PemeriksaanKlinisData } from "@/types/pemeriksaanKlinis";
import { PemeriksaanLabData } from "@/types/pemeriksaanLab";
import { AdherenceDay, AdherenceSummary, MedicationStatus } from "@/types/pasienPortal";
import { EpisodeRingkas, PasienDetail } from "@/types/pasienDetail";

function todayISO(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(
    d.getDate(),
  ).padStart(2, "0")}`;
}
function isoDaysAgo(days: number): string {
  const d = new Date();
  d.setDate(d.getDate() - days);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(
    d.getDate(),
  ).padStart(2, "0")}`;
}

export const getPasienDetail = async (
  supabase: SupabaseClient,
  id_pasien: number,
): Promise<ActionResponse<PasienDetail>> => {
  try {
    // Profil + akun
    const { data: profil, error: profilError } = await supabase
      .from("pasien")
      .select(
        `id_pasien, id_user, nama_lengkap, usia, jenis_kelamin, domisili,
         no_telp, pendidikan, pekerjaan, pendapatan, created_at, users ( email )`,
      )
      .eq("id_pasien", id_pasien)
      .single();

    if (profilError || !profil) {
      return handleServiceError(profilError, "Pasien tidak ditemukan.");
    }

    // Episodes
    const { data: episodes } = await supabase
      .from("episode_pengobatan")
      .select("id_episode, tanggal_mulai, tanggal_selesai, tipe_pasien, status_episode")
      .eq("id_pasien", id_pasien)
      .order("tanggal_mulai", { ascending: false });

    const episodeIds = (episodes ?? []).map((e) => e.id_episode as number);

    // Vitals & Lab
    let vitals: PemeriksaanKlinisData[] = [];
    let lab: PemeriksaanLabData[] = [];
    if (episodeIds.length > 0) {
      const [vRes, lRes] = await Promise.all([
        supabase
          .from("pemeriksaan_klinis")
          .select(
            `id_periksa, id_episode, tanggal_periksa, keluhan, tensi, suhu,
             pernapasan, nadi, saturasi_o2, tinggi_badan, berat_badan, created_at`,
          )
          .in("id_episode", episodeIds)
          .order("tanggal_periksa", { ascending: false }),
        supabase
          .from("pemeriksaan_lab")
          .select(
            `id_tes, id_episode, jenis_tes, tanggal_tes, hasil_tes,
             periode_pemeriksaan, berkas_pendukung_url, created_at`,
          )
          .in("id_episode", episodeIds)
          .order("tanggal_tes", { ascending: false }),
      ]);
      vitals = (vRes.data as PemeriksaanKlinisData[]) ?? [];
      lab = (lRes.data as PemeriksaanLabData[]) ?? [];
    }

    // Kepatuhan 30 hari
    const adherence = await computeAdherence(supabase, episodeIds);

    return {
      success: true,
      data: {
        profil: profil as unknown as PasienData,
        episodes: (episodes as EpisodeRingkas[]) ?? [],
        vitals,
        lab,
        adherence,
      },
    };
  } catch (error) {
    return handleServiceError(error);
  }
};

async function computeAdherence(
  supabase: SupabaseClient,
  episodeIds: number[],
): Promise<AdherenceSummary> {
  const empty: AdherenceSummary = {
    total: 0,
    diminum: 0,
    terlewat: 0,
    belum: 0,
    persentase: 0,
    days: [],
  };
  if (episodeIds.length === 0) return empty;

  const { data: resep } = await supabase
    .from("resep_pengobatan")
    .select("id_resep")
    .in("id_episode", episodeIds);
  const resepIds = (resep ?? []).map((r) => r.id_resep as number);
  if (resepIds.length === 0) return empty;

  const { data: jadwal } = await supabase
    .from("jadwal_minum_obat")
    .select("tanggal_jadwal, jam_jadwal, medication_log ( status, reported_at )")
    .in("id_resep", resepIds)
    .gte("tanggal_jadwal", isoDaysAgo(29))
    .lte("tanggal_jadwal", todayISO())
    .order("tanggal_jadwal", { ascending: true });

  const days: AdherenceDay[] = (jadwal ?? []).map((j) => {
    const logArr = (j.medication_log as { status: string; reported_at: string }[]) ?? [];
    const log = Array.isArray(logArr) ? logArr[0] : logArr;
    return {
      tanggal: j.tanggal_jadwal,
      jam_jadwal: j.jam_jadwal,
      status: (log?.status as MedicationStatus) ?? null,
      reported_at: log?.reported_at ?? null,
    };
  });

  const diminum = days.filter((d) => d.status === "diminum").length;
  const terlewat = days.filter((d) => d.status === "terlewat").length;
  const total = days.length;
  return {
    total,
    diminum,
    terlewat,
    belum: total - diminum - terlewat,
    persentase: total > 0 ? Math.round((diminum / total) * 100) : 0,
    days,
  };
}
