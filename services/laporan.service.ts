import type { RowDataPacket } from "mysql2/promise";

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
import { getMySQLPool } from "@/database/mysql-client";
import { ensureArray, isMySQLDuplicateError } from "@/utils/mysql";

export async function getJadwalByPasienId(
  id_user_pasien: string,
): Promise<ActionResponse<JadwalObatHariIni[]>> {
  try {
    const { pasien, error } = await verifyPasienAccess(id_user_pasien);
    if (error || !pasien)
      return { success: false, error: "Otoritas tidak valid." };

    const pasienId = await getPasienIdByUser(id_user_pasien);
    if (!pasienId) return { success: true, data: [] };

    const pool = getMySQLPool();
    const [rows] = await pool.execute<RowDataPacket[]>({
      sql: `SELECT
         j.id_jadwal, j.tanggal_jadwal, j.jam_jadwal,
         d.jumlah_obat_per_minum, d.aturan_pakai,
         o.nama_obat,
         m.id_log, m.status AS log_status, m.catatan_kepatuhan
       FROM jadwal_minum_obat j
       JOIN detail_obat d ON j.id_detail_obat = d.id_detail_obat
       JOIN obat o ON d.id_obat = o.id_obat
       JOIN resep_pengobatan r ON d.id_resep = r.id_resep
       JOIN episode_pengobatan e ON r.id_episode = e.id_episode
       LEFT JOIN medication_log m ON m.id_jadwal = j.id_jadwal
       WHERE j.tanggal_jadwal = ? AND e.id_pasien = ?
       ORDER BY j.jam_jadwal ASC`,
      values: [todayISO(), pasienId],
    });

    const formattedData: JadwalObatHariIni[] = rows.map((item) => ({
      id_jadwal: item.id_jadwal,
      tanggal_jadwal:
        item.tanggal_jadwal instanceof Date
          ? item.tanggal_jadwal.toISOString().slice(0, 10)
          : item.tanggal_jadwal,
      jam_jadwal: item.jam_jadwal,
      detail_obat: {
        jumlah_obat_per_minum: item.jumlah_obat_per_minum ?? 0,
        aturan_pakai: item.aturan_pakai ?? "",
        obat: { nama_obat: item.nama_obat ?? "" },
      },
      medication_log: item.id_log
        ? {
            id_log: item.id_log,
            status: item.log_status,
            catatan_kepatuhan: item.catatan_kepatuhan,
          }
        : null,
    }));

    return { success: true, data: formattedData };
  } catch (error) {
    return handleServiceError(error, "Gagal mengambil jadwal minum obat");
  }
}

/**
 * Helper internal: dipakai oleh getPasienDetail di pasien.service.ts
 */
export async function hitungKepatuhan(
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

  const pool = getMySQLPool();
  const epPh = episodeIds.map(() => "?").join(",");

  const [resepRows] = await pool.execute<RowDataPacket[]>({
    sql: `SELECT id_resep FROM resep_pengobatan WHERE id_episode IN (${epPh})`,
    values: episodeIds,
  });
  const resepIds = resepRows.map((r) => r.id_resep as number);
  if (resepIds.length === 0) return empty;

  const rPh = resepIds.map(() => "?").join(",");
  const [jadwalRows] = await pool.execute<RowDataPacket[]>({
    sql: `SELECT j.tanggal_jadwal, j.jam_jadwal,
            m.status AS log_status, m.reported_at
     FROM jadwal_minum_obat j
     LEFT JOIN medication_log m ON m.id_jadwal = j.id_jadwal
     WHERE j.id_resep IN (${rPh})
       AND j.tanggal_jadwal >= ? AND j.tanggal_jadwal <= ?
     ORDER BY j.tanggal_jadwal ASC`,
    values: [...resepIds, isoDaysAgo(29), todayISO()],
  });

  const days: KepatuhanHarian[] = jadwalRows.map((j) => ({
    tanggal:
      j.tanggal_jadwal instanceof Date
        ? j.tanggal_jadwal.toISOString().slice(0, 10)
        : j.tanggal_jadwal,
    jam_jadwal: j.jam_jadwal,
    status: (j.log_status as StatusLaporan) ?? null,
    reported_at:
      j.reported_at instanceof Date
        ? j.reported_at.toISOString()
        : (j.reported_at ?? null),
  }));

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
    const { pasien, error } = await verifyPasienAccess(id_user_pasien);
    if (error || !pasien)
      return { success: false, error: "Otoritas tidak valid." };

    const id_pasien = await getPasienIdByUser(id_user_pasien);
    if (!id_pasien) return { success: true, data: empty };

    const resepIds = await getResepIdsByPasien(id_pasien);
    if (resepIds.length === 0) return { success: true, data: empty };

    const pool = getMySQLPool();
    const rPh = resepIds.map(() => "?").join(",");
    const [rows] = await pool.execute<RowDataPacket[]>({
      sql: `SELECT j.id_jadwal, j.tanggal_jadwal, j.jam_jadwal,
              m.status AS log_status, m.reported_at
       FROM jadwal_minum_obat j
       LEFT JOIN medication_log m ON m.id_jadwal = j.id_jadwal
       WHERE j.id_resep IN (${rPh})
         AND j.tanggal_jadwal >= ? AND j.tanggal_jadwal <= ?
       ORDER BY j.tanggal_jadwal ASC`,
      values: [...resepIds, isoDaysAgo(days - 1), todayISO()],
    });

    const daysArr: KepatuhanHarian[] = rows.map((j) => ({
      tanggal:
        j.tanggal_jadwal instanceof Date
          ? j.tanggal_jadwal.toISOString().slice(0, 10)
          : j.tanggal_jadwal,
      jam_jadwal: j.jam_jadwal,
      status: (j.log_status as StatusLaporan) ?? null,
      reported_at:
        j.reported_at instanceof Date
          ? j.reported_at.toISOString()
          : (j.reported_at ?? null),
    }));

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
  payload: LaporanObatPayload,
  id_user_pasien: string,
): Promise<ActionResponse> {
  try {
    const { pasien, error } = await verifyPasienAccess(id_user_pasien);
    if (error || !pasien)
      return { success: false, error: "Otoritas tidak valid." };

    const pool = getMySQLPool();

    const [jadwalRows] = await pool.execute<RowDataPacket[]>({
      sql: `SELECT tanggal_jadwal, jam_jadwal FROM jadwal_minum_obat
       WHERE id_jadwal = ? LIMIT 1`,
      values: [payload.id_jadwal],
    });
    if (jadwalRows.length === 0) {
      return { success: false, error: "Jadwal minum obat tidak ditemukan" };
    }
    const jadwal = jadwalRows[0];
    const tanggalStr =
      jadwal.tanggal_jadwal instanceof Date
        ? jadwal.tanggal_jadwal.toISOString().slice(0, 10)
        : jadwal.tanggal_jadwal;

    const late = isReportLate(tanggalStr, jadwal.jam_jadwal, 1);
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

    //! verifikasi jadwal milik pasien yang login
    const [ownershipRows] = await pool.execute<RowDataPacket[]>({
      sql: `SELECT p.id_user FROM jadwal_minum_obat j
       JOIN resep_pengobatan r ON j.id_resep = r.id_resep
       JOIN episode_pengobatan e ON r.id_episode = e.id_episode
       JOIN pasien p ON e.id_pasien = p.id_pasien
       WHERE j.id_jadwal = ? LIMIT 1`,
      values: [payload.id_jadwal],
    });
    if (
      ownershipRows.length === 0 ||
      ownershipRows[0].id_user !== id_user_pasien
    ) {
      return {
        success: false,
        error: "Otoritas tidak valid: jadwal ini bukan milik Anda.",
      };
    }

    try {
      await pool.execute({
        sql: `INSERT INTO medication_log
           (id_jadwal, status, catatan_kepatuhan, reported_by)
         VALUES (?, ?, ?, ?)`,
        values: [
          payload.id_jadwal,
          finalStatus,
          payload.catatan_kepatuhan || null,
          payload.reported_by,
        ],
      });
      return { success: true, message: "Minum obat berhasil dilaporkan" };
    } catch (err) {
      if (isMySQLDuplicateError(err)) {
        return {
          success: false,
          error: "Obat untuk jadwal ini sudah pernah dilaporkan.",
        };
      }
      return handleServiceError(err, "Gagal menyimpan laporan");
    }
  } catch (error) {
    return handleServiceError(
      error,
      "Terjadi Kesalahan internal gagal melapor",
    );
  }
}

export async function laporMakan(
  payload: LaporanMakanPayload,
  id_user_pasien: string,
): Promise<ActionResponse> {
  try {
    const { pasien, error } = await verifyPasienAccess(id_user_pasien);
    if (error || !pasien)
      return { success: false, error: "Otoritas tidak valid." };

    const pool = getMySQLPool();

    const [epRows] = await pool.execute<RowDataPacket[]>({
      sql: `SELECT e.id_episode, p.id_user
       FROM episode_pengobatan e
       JOIN pasien p ON e.id_pasien = p.id_pasien
       WHERE e.id_episode = ? LIMIT 1`,
      values: [payload.id_episode],
    });
    if (epRows.length === 0) {
      return {
        success: false,
        error: "Episode pengobatan pasien tidak ada.",
      };
    }
    if (epRows[0].id_user !== id_user_pasien) {
      return {
        success: false,
        error: "Otoritas tidak valid: episode bukan milik Anda.",
      };
    }

    const hariIni = todayISO();
    const startOfDay = `${hariIni} 00:00:00`;
    const endOfDay = `${hariIni} 23:59:59`;
    const [countRows] = await pool.execute<RowDataPacket[]>({
      sql: `SELECT COUNT(id_laporan) AS cnt FROM laporan_makan
            WHERE id_episode = ? AND waktu_makan >= ? AND waktu_makan <= ?`,
      values: [payload.id_episode, startOfDay, endOfDay],
    });
    const count = countRows[0].cnt as number;
    if (count >= 3) {
      return {
        success: false,
        error:
          "Anda sudah mencapai batas maksimal pelaporan makan hari ini (3 kali).",
      };
    }

    await pool.execute({
      sql: `INSERT INTO laporan_makan
         (id_episode, waktu_makan, karbo, protein, serat, catatan)
       VALUES (?, NOW(), ?, ?, ?, ?)`,
      values: [
        payload.id_episode,
        payload.karbo,
        payload.protein,
        payload.serat,
        payload.catatan || null,
      ],
    });

    return { success: true, message: "Data Laporan makan berhasil disimpan" };
  } catch (error) {
    return handleServiceError(
      error,
      "Terjadi Kesalahan internal gagal melapor",
    );
  }
}

export async function getRiwayatMakanByUser(
  id_user_pasien: string,
): Promise<ActionResponse<LaporanMakanData[]>> {
  try {
    const { pasien, error } = await verifyPasienAccess(id_user_pasien);
    if (error || !pasien)
      return { success: false, error: "Otoritas tidak valid." };

    const id_pasien = await getPasienIdByUser(id_user_pasien);
    if (!id_pasien) return { success: true, data: [] };

    const pool = getMySQLPool();
    const [rows] = await pool.execute<RowDataPacket[]>({
      sql: `SELECT lm.id_laporan, lm.id_episode, lm.waktu_makan,
              lm.karbo, lm.protein, lm.serat, lm.catatan, lm.reported_at
       FROM laporan_makan lm
       JOIN episode_pengobatan e ON lm.id_episode = e.id_episode
       WHERE e.id_pasien = ?
       ORDER BY lm.waktu_makan DESC`,
      values: [id_pasien],
    });
    return { success: true, data: rows as unknown as LaporanMakanData[] };
  } catch (error) {
    return handleServiceError(
      error,
      "Terjadi kesalahan internal saat mengambil data.",
    );
  }
}

export const getDaftarLaporanMakan = async (
  id_super_admin: string,
): Promise<ActionResponse<LaporanMakanPasienOverview[]>> => {
  try {
    const { superAdmin, error } = await verifySuperAdminAccess(id_super_admin);
    if (error || !superAdmin)
      return { success: false, error: "Otoritas tidak valid." };

    const pool = getMySQLPool();
    const [rows] = await pool.execute<RowDataPacket[]>({
      sql: `SELECT
         p.id_pasien, p.nama_lengkap, p.jenis_kelamin,
         (
           SELECT COALESCE(JSON_ARRAYAGG(JSON_OBJECT(
             'id_episode', e.id_episode,
             'status_episode', e.status_episode,
             'laporan_makan', (
               SELECT COALESCE(JSON_ARRAYAGG(JSON_OBJECT(
                 'id_laporan', lm.id_laporan,
                 'id_episode', lm.id_episode,
                 'waktu_makan', lm.waktu_makan,
                 'karbo', lm.karbo,
                 'protein', lm.protein,
                 'serat', lm.serat,
                 'catatan', lm.catatan,
                 'reported_at', lm.reported_at
               )), JSON_ARRAY())
               FROM laporan_makan lm WHERE lm.id_episode = e.id_episode
             )
           )), JSON_ARRAY())
           FROM episode_pengobatan e WHERE e.id_pasien = p.id_pasien
         ) AS episode_pengobatan
       FROM pasien p
       ORDER BY p.created_at DESC`,
    });

    const formattedData: LaporanMakanPasienOverview[] = rows.map((pasien) => {
      const rawEpisodes = ensureArray<{
        id_episode: number;
        status_episode: string;
        laporan_makan: LaporanMakanData[] | null;
      }>(pasien.episode_pengobatan);

      const episodeAktif =
        rawEpisodes.find((ep) => ep.status_episode === "aktif") || null;

      let riwayat: LaporanMakanData[] = [];
      rawEpisodes.forEach((ep) => {
        const arr = ensureArray<LaporanMakanData>(ep.laporan_makan);
        riwayat = [...riwayat, ...arr];
      });

      riwayat.sort(
        (a, b) =>
          new Date(b.waktu_makan).getTime() - new Date(a.waktu_makan).getTime(),
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
        riwayat,
      };
    });

    return { success: true, data: formattedData };
  } catch (error) {
    return handleServiceError(error);
  }
};
