import type { ResultSetHeader, RowDataPacket } from "mysql2/promise";

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
import { getMySQLPool } from "@/database/mysql-client";
import { mysqlTransaction } from "@/utils/mysql";

export const getDaftarResep = async (
  id_super_admin: string,
): Promise<ActionResponse<PasienResepOverview[]>> => {
  try {
    const { superAdmin, error } = await verifySuperAdminAccess(id_super_admin);
    if (error || !superAdmin)
      return { success: false, error: "Otoritas tidak valid." };

    const pool = getMySQLPool();

    const [pasienRows] = await pool.execute<RowDataPacket[]>({
      sql: `SELECT id_pasien, nama_lengkap, usia, jenis_kelamin
       FROM pasien ORDER BY created_at DESC`,
    });
    if (pasienRows.length === 0) {
      return { success: true, data: [] };
    }
    const pasienIds = pasienRows.map((p) => p.id_pasien as number);

    const pasienPlaceholders = pasienIds.map(() => "?").join(",");
    const [episodeRows] = await pool.execute<RowDataPacket[]>({
      sql: `SELECT id_episode, id_pasien, status_episode
       FROM episode_pengobatan
       WHERE id_pasien IN (${pasienPlaceholders})`,
      values: pasienIds,
    });
    const episodeIds = episodeRows.map((e) => e.id_episode as number);

    let resepRows: RowDataPacket[] = [];
    if (episodeIds.length > 0) {
      const epPh = episodeIds.map(() => "?").join(",");
      const [rows] = await pool.execute<RowDataPacket[]>({
        sql: `SELECT id_resep, id_episode, tanggal_resep, kategori_regimen,
                fase_pengobatan, tanggal_mulai_obat, durasi_hari
         FROM resep_pengobatan
         WHERE id_episode IN (${epPh})`,
        values: episodeIds,
      });
      resepRows = rows;
    }
    const resepIds = resepRows.map((r) => r.id_resep as number);

    let detailRows: RowDataPacket[] = [];
    if (resepIds.length > 0) {
      const rPh = resepIds.map(() => "?").join(",");
      const [rows] = await pool.execute<RowDataPacket[]>({
        sql: `SELECT d.id_detail_obat, d.id_resep, d.jumlah_obat_per_minum,
                d.frekuensi_minum, d.aturan_pakai,
                o.nama_obat, o.dosis
         FROM detail_obat d
         JOIN obat o ON d.id_obat = o.id_obat
         WHERE d.id_resep IN (${rPh})`,
        values: resepIds,
      });
      detailRows = rows;
    }

    let jadwalRows: RowDataPacket[] = [];
    if (resepIds.length > 0) {
      const rPh = resepIds.map(() => "?").join(",");
      const [rows] = await pool.execute<RowDataPacket[]>({
        sql: `SELECT j.id_jadwal, j.id_resep, j.id_detail_obat,
                j.tanggal_jadwal, j.jam_jadwal,
                m.status AS log_status
         FROM jadwal_minum_obat j
         LEFT JOIN medication_log m ON m.id_jadwal = j.id_jadwal
         WHERE j.id_resep IN (${rPh})`,
        values: resepIds,
      });
      jadwalRows = rows;
    }

    const detailByResep = new Map<number, DetailObatData[]>();
    detailRows.forEach((d) => {
      const arr = detailByResep.get(d.id_resep) ?? [];
      arr.push({
        id_detail_obat: d.id_detail_obat,
        jumlah_obat_per_minum: d.jumlah_obat_per_minum,
        frekuensi_minum: d.frekuensi_minum,
        aturan_pakai: d.aturan_pakai,
        obat: { nama_obat: d.nama_obat, dosis: d.dosis },
      } as unknown as DetailObatData);
      detailByResep.set(d.id_resep, arr);
    });

    const jadwalByResep = new Map<
      number,
      {
        id_jadwal: number;
        id_detail_obat: number;
        tanggal_jadwal: string;
        jam_jadwal: string;
        log_status: string | null;
      }[]
    >();
    jadwalRows.forEach((j) => {
      const arr = jadwalByResep.get(j.id_resep) ?? [];
      arr.push({
        id_jadwal: j.id_jadwal,
        id_detail_obat: j.id_detail_obat,
        tanggal_jadwal:
          j.tanggal_jadwal instanceof Date
            ? j.tanggal_jadwal.toISOString().slice(0, 10)
            : j.tanggal_jadwal,
        jam_jadwal: j.jam_jadwal,
        log_status: j.log_status,
      });
      jadwalByResep.set(j.id_resep, arr);
    });

    const resepByEpisode = new Map<number, RowDataPacket[]>();
    resepRows.forEach((r) => {
      const arr = resepByEpisode.get(r.id_episode) ?? [];
      arr.push(r);
      resepByEpisode.set(r.id_episode, arr);
    });

    const episodeByPasien = new Map<number, RowDataPacket[]>();
    episodeRows.forEach((e) => {
      const arr = episodeByPasien.get(e.id_pasien) ?? [];
      arr.push(e);
      episodeByPasien.set(e.id_pasien, arr);
    });

    const formatted: PasienResepOverview[] = pasienRows.map((p) => {
      const episodes = episodeByPasien.get(p.id_pasien) ?? [];
      const episodeAktif =
        episodes.find((e) => e.status_episode === "aktif") || null;

      const resepList: ResepData[] = [];
      episodes.forEach((ep) => {
        const resepArr = resepByEpisode.get(ep.id_episode) ?? [];
        resepArr.forEach((r) => {
          const jadwals = jadwalByResep.get(r.id_resep) ?? [];
          const jumlahDiminum = jadwals.filter(
            (j) => j.log_status === "diminum",
          ).length;

          resepList.push({
            id_resep: r.id_resep,
            id_episode: r.id_episode,
            tanggal_resep: r.tanggal_resep,
            kategori_regimen: r.kategori_regimen,
            fase_pengobatan: r.fase_pengobatan,
            tanggal_mulai_obat: r.tanggal_mulai_obat,
            durasi_hari: r.durasi_hari,
            detail_obat: detailByResep.get(r.id_resep) ?? [],
            jadwal_minum_obat: jadwals.map((j) => ({
              id_jadwal: j.id_jadwal,
              id_detail_obat: j.id_detail_obat,
              tanggal_jadwal: j.tanggal_jadwal,
              jam_jadwal: j.jam_jadwal,
            })),
            jumlahJadwal: jadwals.length,
            jumlahDiminum,
            statusEpisode: ep.status_episode,
          } as ResepData);
        });
      });

      resepList.sort((a, b) =>
        (b.tanggal_mulai_obat ?? "").localeCompare(a.tanggal_mulai_obat ?? ""),
      );

      return {
        id_pasien: p.id_pasien,
        nama_lengkap: p.nama_lengkap,
        usia: p.usia,
        jenis_kelamin: p.jenis_kelamin,
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
  payload: CreateResepPayload,
  id_super_admin: string,
): Promise<ActionResponse> => {
  try {
    const { superAdmin, error } = await verifySuperAdminAccess(id_super_admin);
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

    try {
      const result = await mysqlTransaction(async (conn) => {
        const [resepResult] = await conn.execute<ResultSetHeader>({
          sql: `INSERT INTO resep_pengobatan
             (id_episode, tanggal_resep, kategori_regimen, fase_pengobatan,
              tanggal_mulai_obat, durasi_hari)
           VALUES (?, ?, ?, ?, ?, ?)`,
          values: [
            payload.id_episode,
            todayISO(),
            payload.kategori_regimen,
            payload.fase_pengobatan,
            tanggalMulaiObat,
            durasiTotal,
          ],
        });
        const id_resep = resepResult.insertId;

        const detailPlaceholders = payload.obat_items
          .map(() => "(?, ?, ?, ?, ?, ?)")
          .join(", ");
        const detailValues = payload.obat_items.flatMap((item) => [
          id_resep,
          item.id_obat,
          item.jumlah_per_minum,
          item.frekuensi_minum,
          item.aturan_pakai || null,
          item.jumlah_total_diberikan,
        ]);

        const [detailResult] = await conn.execute<ResultSetHeader>({
          sql: `INSERT INTO detail_obat
             (id_resep, id_obat, jumlah_obat_per_minum, frekuensi_minum,
              aturan_pakai, jumlah_total_diberikan)
           VALUES ${detailPlaceholders}`,
          values: detailValues,
        });

        //! ASUMSI: innodb_autoinc_lock_mode=1 (default 8.0+)
        const firstDetailId = detailResult.insertId;
        const detailIds = payload.obat_items.map((_, i) => firstDetailId + i);

        const jadwalRows = payload.obat_items.flatMap((item, index) => {
          const detailId = detailIds[index];
          const days = diffDaysInclusive(
            item.tanggal_mulai_obat,
            item.tanggal_selesai_obat,
          );
          return Array.from({ length: days }, (_, dayIndex) => {
            const tanggal_jadwal = addDays(item.tanggal_mulai_obat, dayIndex);
            return item.jam_jadwal.map((jam) => ({
              id_resep,
              id_detail_obat: detailId,
              tanggal_jadwal,
              jam_jadwal: jam,
              status_pengingat: "terjadwal",
            }));
          }).flat();
        });

        if (jadwalRows.length > 0) {
          const jadwalPh = jadwalRows.map(() => "(?, ?, ?, ?, ?)").join(", ");
          const jadwalValues = jadwalRows.flatMap((j) => [
            j.id_resep,
            j.id_detail_obat,
            j.tanggal_jadwal,
            j.jam_jadwal,
            j.status_pengingat,
          ]);
          await conn.execute({
            sql: `INSERT INTO jadwal_minum_obat
               (id_resep, id_detail_obat, tanggal_jadwal, jam_jadwal, status_pengingat)
             VALUES ${jadwalPh}`,
            values: jadwalValues,
          });
        }

        return {
          obatCount: payload.obat_items.length,
          jadwalCount: jadwalRows.length,
        };
      });

      return {
        success: true,
        message: `Resep dibuat dengan ${result.obatCount} obat dan ${result.jadwalCount} jadwal minum.`,
      };
    } catch (err) {
      return handleServiceError(err, "Gagal membuat resep dengan jadwal.");
    }
  } catch (error) {
    return handleServiceError(error);
  }
};

export const deleteResep = async (
  id_resep: number,
  id_super_admin: string,
): Promise<ActionResponse> => {
  try {
    const { superAdmin, error } = await verifySuperAdminAccess(id_super_admin);
    if (error || !superAdmin)
      return { success: false, error: "Otoritas tidak valid." };

    const pool = getMySQLPool();

    await pool.execute({
      sql: "DELETE FROM resep_pengobatan WHERE id_resep = ?",
      values: [id_resep],
    });
    return { success: true, message: "Resep & jadwalnya berhasil dihapus." };
  } catch (error) {
    return handleServiceError(error);
  }
};
