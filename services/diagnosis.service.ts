import type { RowDataPacket } from "mysql2/promise";

import { ActionResponse } from "@/types/action";
import {
  CreateDiagnosisPayload,
  DiagnosisData,
  PasienDiagnosisOverview,
  UpdateDaignosisPayload,
} from "@/types/diagnosis";
import { verifySuperAdminAccess } from "@/utils/access";
import { handleServiceError } from "@/utils/error";
import { getMySQLPool } from "@/database/mysql-client";
import { ensureArray } from "@/utils/mysql";

export const getDaftarDiagnosis = async (
  id_super_admin: string,
): Promise<ActionResponse<PasienDiagnosisOverview[]>> => {
  try {
    const { superAdmin, error } = await verifySuperAdminAccess(id_super_admin);
    if (error || !superAdmin)
      return { success: false, error: "Otoritas tidak valid." };

    const pool = getMySQLPool();
    const [rows] = await pool.execute<RowDataPacket[]>({
      sql: `SELECT
          p.id_pasien, p.nama_lengkap, p.jenis_kelamin, p.usia, p.domisili,
          (
            SELECT COALESCE(JSON_ARRAYAGG(JSON_OBJECT(
              'id_episode', e.id_episode,
            'status_episode', e.status_episode,
            'diagnosis', (
              SELECT COALESCE(JSON_ARRAYAGG(JSON_OBJECT(
                'id_diagnosis', d.id_diagnosis,
                'id_episode', d.id_episode,
                'tanggal_diagnosis', d.tanggal_diagnosis,
                'klasifikasi_anatomi', d.klasifikasi_anatomi,
                'lokasi_anatomi', d.lokasi_anatomi,
                'dasar_diagnosis', d.dasar_diagnosis,
                'catatan_klinis', d.catatan_klinis,
                'created_at', d.created_at
              )), JSON_ARRAY())
              FROM diagnosis d WHERE d.id_episode = e.id_episode
            )
          )), JSON_ARRAY())
          FROM episode_pengobatan e WHERE e.id_pasien = p.id_pasien
        ) AS episode_pengobatan
      FROM pasien p
      ORDER BY p.created_at DESC`,
    });

    const formattedData: PasienDiagnosisOverview[] = rows.map((pasien) => {
      const rawEpisodes = ensureArray<{
        id_episode: number;
        status_episode: string;
        diagnosis: DiagnosisData[] | null;
      }>(pasien.episode_pengobatan);

      const episodeAktif =
        rawEpisodes.find((ep) => ep.status_episode === "aktif") || null;

      let riwayat: DiagnosisData[] = [];
      rawEpisodes.forEach((ep) => {
        const diagArr = ensureArray<DiagnosisData>(ep.diagnosis);
        riwayat = [...riwayat, ...diagArr];
      });

      riwayat.sort(
        (a, b) =>
          new Date(b.tanggal_diagnosis).getTime() -
          new Date(a.tanggal_diagnosis).getTime(),
      );

      return {
        id_pasien: pasien.id_pasien,
        nama_lengkap: pasien.nama_lengkap,
        jenis_kelamin: pasien.jenis_kelamin,
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
    });

    return { success: true, data: formattedData };
  } catch (error) {
    return handleServiceError(
      error,
      "Terjadi kesalahan internal saat mengambil data.",
    );
  }
};

export const createDiagnosis = async (
  payload: CreateDiagnosisPayload,
  id_super_admin: string,
): Promise<ActionResponse> => {
  try {
    const { superAdmin, error } = await verifySuperAdminAccess(id_super_admin);
    if (error || !superAdmin)
      return { success: false, error: "Otoritas tidak valid." };

    const pool = getMySQLPool();

    const [epRows] = await pool.execute<RowDataPacket[]>({
      sql: "SELECT id_episode FROM episode_pengobatan WHERE id_episode = ? LIMIT 1",
      values: [payload.id_episode],
    });
    if (epRows.length === 0) {
      return {
        success: false,
        error: "Episode pengobatan pasien tidak ada.",
      };
    }

    const [diagRows] = await pool.execute<RowDataPacket[]>({
      sql: "SELECT id_diagnosis FROM diagnosis WHERE id_episode = ? LIMIT 1",
      values: [payload.id_episode],
    });
    if (diagRows.length > 0) {
      return {
        success: false,
        error: "Gagal menyimpan karena diagnosis sudah ada pada episode ini",
      };
    }

    const payloadRecord = payload as unknown as Record<string, unknown>;
    const columns = Object.keys(payloadRecord);
    const placeholders = columns.map(() => "?").join(", ");
    const values = columns.map((c) => {
      const value = payloadRecord[c];
      return value === undefined ? null : value;
    });

    await pool.execute({
      sql: `INSERT INTO diagnosis (${columns.join(", ")}) VALUES (${placeholders})`,
      values,
    });

    return {
      success: true,
      message: "Diagnosis pasien berhasil ditambahkan!",
    };
  } catch (error) {
    return handleServiceError(
      error,
      "Terjadi kesalahan internal server saat menambah data.",
    );
  }
};

export const updateDiagnosis = async (
  payload: UpdateDaignosisPayload,
  id_super_admin: string,
): Promise<ActionResponse> => {
  try {
    const { superAdmin, error } = await verifySuperAdminAccess(id_super_admin);
    if (error || !superAdmin)
      return { success: false, error: "Otoritas tidak valid." };

    const pool = getMySQLPool();
    const [checkRows] = await pool.execute<RowDataPacket[]>({
      sql: "SELECT id_diagnosis FROM diagnosis WHERE id_diagnosis = ? LIMIT 1",
      values: [payload.id_diagnosis],
    });
    if (checkRows.length === 0) {
      return { success: false, error: "Data tidak ditemukan" };
    }

    const { id_diagnosis, ...updateData } = payload;
    const columns = Object.keys(updateData);
    if (columns.length === 0) {
      return { success: true, message: "Tidak ada perubahan." };
    }
    const setClause = columns.map((c) => `${c} = ?`).join(", ");
    const values = columns.map(
      (c) => (updateData as Record<string, unknown>)[c],
    );

    await pool.execute({
      sql: `UPDATE diagnosis SET ${setClause} WHERE id_diagnosis = ?`,
      values: [...values, id_diagnosis],
    });

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
  id_diagnosis: number,
  id_super_admin: string,
): Promise<ActionResponse> => {
  try {
    const { superAdmin, error } = await verifySuperAdminAccess(id_super_admin);
    if (error || !superAdmin)
      return { success: false, error: "Otoritas tidak valid." };

    const pool = getMySQLPool();
    const [checkRows] = await pool.execute<RowDataPacket[]>({
      sql: "SELECT id_diagnosis FROM diagnosis WHERE id_diagnosis = ? LIMIT 1",
      values: [id_diagnosis],
    });
    if (checkRows.length === 0) {
      return { success: false, error: "Data tidak ditemukan" };
    }
    await pool.execute({
      sql: "DELETE FROM diagnosis WHERE id_diagnosis = ?",
      values: [id_diagnosis],
    });
    return { success: true, message: "Diagnosis Pasien berhasil dihapus." };
  } catch (error) {
    return handleServiceError(
      error,
      "Terjadi kesalahan internal saat menghapus data.",
    );
  }
};
