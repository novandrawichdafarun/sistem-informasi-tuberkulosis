import { ActionResponse } from "@/types/action";
import {
  JadwalObatHariIni,
  KepatuhanHarian,
  LaporanMakanData,
  LaporanMakanPasienOverview,
  LaporanMakanPayload,
  LaporanObatPayload,
  RingkasanKepatuhan,
  StatusLaporan,
} from "@/types/laporan";
import { verifyPasienAccess, verifySuperAdminAccess } from "@/utils/access";
import { isoDaysAgo, isReportLate, todayISO } from "@/utils/date";
import { handleServiceError } from "@/utils/error";
import { getPasienIdByUser, getResepIdsByPasien } from "@/utils/Pasien";
import { SupabaseClient } from "@supabase/supabase-js";

export async function getJadwalByPasienId(
  supabase: SupabaseClient,
  id_user_pasien: string,
): Promise<ActionResponse<JadwalObatHariIni[]>> {
  try {
    const { pasien, error } = await verifyPasienAccess(
      supabase,
      id_user_pasien,
    );

    if (error || !pasien)
      return { success: false, error: "Otoritas tidak valid." };

    const pasienId = await getPasienIdByUser(supabase, id_user_pasien);

    const { data, error: dataError } = await supabase
      .from("jadwal_minum_obat")
      .select(
        `
        id_jadwal, tanggal_jadwal, jam_jadwal,
        detail_obat!inner (
          jumlah_obat_per_minum, aturan_pakai,
          obat!inner (
            nama_obat
          ),
          resep_pengobatan!inner (
            episode_pengobatan!inner (
              id_pasien
            )
          )
        ),
        medication_log (
          id_log, status,
          catatan_kepatuhan
        )
        `,
      )
      .eq("tanggal_jadwal", todayISO())
      .eq("detail_obat.resep_pengobatan.episode_pengobatan.id_pasien", pasienId)
      .order("jam_jadwal", { ascending: true });

    if (dataError)
      return handleServiceError(dataError?.message, "Gagal mengambil Data");

    const formattedData: JadwalObatHariIni[] = (data ?? []).map((item) => {
      const detailObat = Array.isArray(item.detail_obat)
        ? (item.detail_obat[0] ?? null)
        : (item.detail_obat ?? null);

      const obat = Array.isArray(detailObat?.obat)
        ? (detailObat.obat[0] ?? null)
        : (detailObat?.obat ?? null);

      return {
        id_jadwal: item.id_jadwal,
        tanggal_jadwal: item.tanggal_jadwal,
        jam_jadwal: item.jam_jadwal,
        detail_obat: {
          jumlah_obat_per_minum: detailObat?.jumlah_obat_per_minum ?? 0,
          aturan_pakai: detailObat?.aturan_pakai ?? "",
          obat: {
            nama_obat: obat?.nama_obat ?? "",
          },
        },
        medication_log: Array.isArray(item.medication_log)
          ? item.medication_log[0] || null
          : item.medication_log || null,
      };
    });

    return {
      success: true,
      data: formattedData,
    };
  } catch (error) {
    return handleServiceError(error, "Gagal mengambil jadwal minum obat");
  }
}

export async function hitungKepatuhan(
  supabase: SupabaseClient,
  episodeIds: number[],
): Promise<RingkasanKepatuhan> {
  const empty: RingkasanKepatuhan = {
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
    .select(
      "tanggal_jadwal, jam_jadwal, medication_log ( status, reported_at )",
    )
    .in("id_resep", resepIds)
    .gte("tanggal_jadwal", isoDaysAgo(29))
    .lte("tanggal_jadwal", todayISO())
    .order("tanggal_jadwal", { ascending: true });

  const days: KepatuhanHarian[] = (jadwal ?? []).map((j) => {
    const logArr =
      (j.medication_log as { status: string; reported_at: string }[]) ?? [];
    const log = Array.isArray(logArr) ? logArr[0] : logArr;
    return {
      tanggal: j.tanggal_jadwal,
      jam_jadwal: j.jam_jadwal,
      status: (log?.status as StatusLaporan) ?? null,
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

export const getKepatuhanByUser = async (
  supabase: SupabaseClient,
  id_user_pasien: string,
  days = 30,
): Promise<ActionResponse<RingkasanKepatuhan>> => {
  const empty: RingkasanKepatuhan = {
    total: 0,
    diminum: 0,
    terlewat: 0,
    belum: 0,
    persentase: 0,
    days: [],
  };

  try {
    const { pasien, error } = await verifyPasienAccess(
      supabase,
      id_user_pasien,
    );

    if (error || !pasien)
      return { success: false, error: "Otoritas tidak valid." };

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

    const daysArr: KepatuhanHarian[] = (jadwal ?? []).map((j) => {
      const logArr =
        (j.medication_log as { status: string; reported_at: string }[]) ?? [];
      const log = Array.isArray(logArr) ? logArr[0] : logArr;
      return {
        tanggal: j.tanggal_jadwal,
        jam_jadwal: j.jam_jadwal,
        status: (log?.status as StatusLaporan) ?? null,
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
    return handleServiceError(
      error,
      "Terjadi kesalahan internal saat mengambil data.",
    );
  }
};

export async function laporMinumObat(
  supabase: SupabaseClient,
  payload: LaporanObatPayload,
  id_user_pasien: string,
): Promise<ActionResponse> {
  try {
    const { pasien, error } = await verifyPasienAccess(
      supabase,
      id_user_pasien,
    );

    if (error || !pasien)
      return { success: false, error: "Otoritas tidak valid." };

    const { data: jadwal, error: fetchError } = await supabase
      .from("jadwal_minum_obat")
      .select("tanggal_jadwal, jam_jadwal")
      .eq("id_jadwal", payload.id_jadwal)
      .single();

    if (fetchError || !jadwal)
      return handleServiceError(
        fetchError?.message,
        "Jadwal minum obat tidak ditemukan",
      );

    const late = isReportLate(jadwal.tanggal_jadwal, jadwal.jam_jadwal, 1);

    if (late) {
      if (
        !payload.catatan_kepatuhan ||
        payload.catatan_kepatuhan.trim().length === 0
      ) {
        return {
          success: false,
          error: "Alasan wajib diisi jika laporan terlambat.",
        };
      }
    }

    const finalStatus: StatusLaporan = late ? "terlewat" : "diminum";

    const { error: insertError } = await supabase
      .from("medication_log")
      .insert({
        id_jadwal: payload.id_jadwal,
        status: finalStatus,
        catatan_kepatuhan: payload.catatan_kepatuhan || null,
        reported_by: payload.reported_by,
      });

    if (insertError) {
      if (insertError.code === "23505") {
        return handleServiceError(
          insertError?.code,
          "Obat untuk jadwal ini sudah pernah dilaporkan.",
        );
      }
      return handleServiceError(
        insertError?.message,
        "Gagal menyimpan laporan",
      );
    }

    return { success: true, message: "Minum obat berhasil dilaporkan" };
  } catch (error) {
    return handleServiceError(
      error,
      "Terjadi Kesalahan internal gagal melapor",
    );
  }
}

export async function laporMakan(
  supabase: SupabaseClient,
  payload: LaporanMakanPayload,
  id_user_pasien: string,
): Promise<ActionResponse> {
  try {
    const { pasien, error } = await verifyPasienAccess(
      supabase,
      id_user_pasien,
    );
    if (error || !pasien)
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

    const hariIni = todayISO();
    const startOfDay = new Date(`${hariIni}T00:00:00`).toISOString();
    const endOfDay = new Date(`${hariIni}T23:59:59.999`).toISOString();

    const { count, error: countError } = await supabase
      .from("laporan_makan")
      .select("id_laporan", { count: "exact", head: true })
      .eq("id_episode", payload.id_episode)
      .gte("waktu_makan", startOfDay)
      .lte("waktu_makan", endOfDay);

    if (countError)
      return handleServiceError(
        countError?.message,
        "Gagal memverifikasi data harian",
      );

    if (count !== null && count >= 3)
      return {
        success: false,
        error:
          "Anda sudah mencapai batas maksimal pelaporan makan hari ini (3 kali).",
      };

    const waktuSekarang = new Date().toISOString();

    const { error: insertError } = await supabase.from("laporan_makan").insert({
      id_episode: payload.id_episode,
      waktu_makan: waktuSekarang,
      karbo: payload.karbo,
      protein: payload.protein,
      serat: payload.serat,
      catatan: payload.catatan || null,
    });

    if (insertError)
      return handleServiceError(
        insertError?.message,
        "Gagal menyimpan laporan makan",
      );

    return { success: true, message: "Data Laporan makan berhasil disimpan" };
  } catch (error) {
    return handleServiceError(
      error,
      "Terjadi Kesalahan internal gagal melapor",
    );
  }
}

export async function getRiwayatMakanByUser(
  supabase: SupabaseClient,
  id_user_pasien: string,
): Promise<ActionResponse<LaporanMakanData[]>> {
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
        laporan_makan (
          id_laporan, id_episode, waktu_makan,
          karbo, protein, serat, catatan, reported_at
        )
        `,
      )
      .eq("id_pasien", id_pasien);

    if (dataError)
      return handleServiceError(
        dataError?.message,
        "Gagal mengambil riwayat laporan makan",
      );

    const formattedData: LaporanMakanData[] = (data ?? []).flatMap((episode) =>
      (episode.laporan_makan ?? []).map((makan) => ({
        id_laporan: makan.id_laporan,
        id_episode: makan.id_episode,
        waktu_makan: makan.waktu_makan,
        karbo: makan.karbo,
        protein: makan.protein,
        serat: makan.serat,
        catatan: makan.catatan,
        reported_at: makan.reported_at,
      })),
    );

    formattedData.sort(
      (a, b) =>
        new Date(b.waktu_makan).getTime() - new Date(a.waktu_makan).getTime(),
    );

    return { success: true, data: formattedData };
  } catch (error) {
    return handleServiceError(
      error,
      "Terjadi kesalahan internal saat mengambil data.",
    );
  }
}

export const getDaftarLaporanMakan = async (
  supabase: SupabaseClient,
  id_super_admin: string,
): Promise<ActionResponse<LaporanMakanPasienOverview[]>> => {
  try {
    const { superAdmin, error } = await verifySuperAdminAccess(
      supabase,
      id_super_admin,
    );
    if (error || !superAdmin)
      return { success: false, error: "Otoritas tidak valid." };

    const { data, error: dataError } = await supabase
      .from("pasien")
      .select(
        `
        id_pasien, nama_lengkap, jenis_kelamin,
        episode_pengobatan (
          id_episode, status_episode,
          laporan_makan (
            id_laporan, id_episode, waktu_makan,
            karbo, protein, serat, catatan, reported_at
          )
        )
        `,
      )
      .order("created_at", { ascending: false });

    if (dataError)
      return handleServiceError(
        dataError?.message,
        "Gagal memuat laporan makan.",
      );

    const formattedData: LaporanMakanPasienOverview[] = (data ?? []).map(
      (pasien) => {
        const rawEpisodes = pasien.episode_pengobatan || [];
        const episodeAktif =
          rawEpisodes.find((ep) => ep.status_episode === "aktif") || null;

        let riwayat: LaporanMakanData[] = [];
        rawEpisodes.forEach((ep) => {
          if (ep.laporan_makan) {
            riwayat = [...riwayat, ...ep.laporan_makan];
          }
        });

        riwayat.sort(
          (a, b) =>
            new Date(b.waktu_makan).getTime() -
            new Date(a.waktu_makan).getTime(),
        );

        return {
          id_pasien: pasien.id_pasien,
          nama_lengkap: pasien.nama_lengkap,
          jenis_kelamin: pasien.jenis_kelamin,
          total: riwayat.length,
          terakhir: riwayat[0]?.waktu_makan ?? null,
          episodeAktif: episodeAktif
            ? {
                id_episode: episodeAktif.id_episode,
                status_episode: episodeAktif.status_episode,
              }
            : null,
          riwayat: riwayat,
        };
      },
    );

    return { success: true, data: formattedData };
  } catch (error) {
    return handleServiceError(error);
  }
};
