import type { RowDataPacket } from "mysql2/promise";

import { ActionResponse } from "@/types/action";
import {
  CreatePemeriksaanPayload,
  PasienPemeriksaanOverview,
  PemeriksaanKlinisData,
  UpdatePemeriksaanPayload,
} from "@/types/pemeriksaanKlinis";
import { verifyPasienAccess, verifySuperAdminAccess } from "@/utils/access";
import { handleServiceError } from "@/utils/error";
import { getPasienIdByUser } from "@/utils/Pasien";
import { getMySQLPool } from "@/database/mysql-client";
import { ensureArray } from "@/utils/mysql";

export const getDaftarPemeriksaan = async (
  id_super_admin: string,
): Promise<ActionResponse<PasienPemeriksaanOverview[]>> => {
  try {
    const { superAdmin, error } = await verifySuperAdminAccess(id_super_admin);
    if (error || !superAdmin)
      return { success: false, error: "Otoritas tidak valid." };

    const pool = getMySQLPool();
    const [rows] = await pool.execute<RowDataPacket[]>({
      sql: `SELECT
        p.id_pasien, p.nama_lengkap, p.usia, p.jenis_kelamin, p.domisili,
        (
          SELECT COALESCE(JSON_ARRAYAGG(JSON_OBJECT(
            'id_episode', e.id_episode,
            'status_episode', e.status_episode,
            'pemeriksaan_klinis', (
              SELECT COALESCE(JSON_ARRAYAGG(JSON_OBJECT(
                'id_periksa', pk.id_periksa,
                'id_episode', pk.id_episode,
                'tanggal_periksa', pk.tanggal_periksa,
                'keluhan', pk.keluhan,
                'tensi', pk.tensi,
                'suhu', pk.suhu,
                'pernapasan', pk.pernapasan,
                'nadi', pk.nadi,
                'saturasi_o2', pk.saturasi_o2,
                'tinggi_badan', pk.tinggi_badan,
                'berat_badan', pk.berat_badan,
                'created_at', pk.created_at
              )), JSON_ARRAY())
              FROM pemeriksaan_klinis pk WHERE pk.id_episode = e.id_episode
            )
          )), JSON_ARRAY())
          FROM episode_pengobatan e WHERE e.id_pasien = p.id_pasien
        ) AS episode_pengobatan
      FROM pasien p
      ORDER BY p.created_at DESC`,
    });

    const formattedData: PasienPemeriksaanOverview[] = rows.map((pasien) => {
      const rawEpisodes = ensureArray<{
        id_episode: number;
        status_episode: string;
        pemeriksaan_klinis: PemeriksaanKlinisData[] | null;
      }>(pasien.episode_pengobatan);

      const episodeAktif =
        rawEpisodes.find((ep) => ep.status_episode === "aktif") || null;

      let riwayat: PemeriksaanKlinisData[] = [];
      rawEpisodes.forEach((ep) => {
        const arr = ensureArray<PemeriksaanKlinisData>(ep.pemeriksaan_klinis);
        riwayat = [...riwayat, ...arr];
      });

      riwayat.sort(
        (a, b) =>
          new Date(b.tanggal_periksa).getTime() -
          new Date(a.tanggal_periksa).getTime(),
      );

      return {
        id_pasien: pasien.id_pasien,
        nama_lengkap: pasien.nama_lengkap,
        usia: pasien.usia,
        jenis_kelamin: pasien.jenis_kelamin,
        domisili: pasien.domisili,
        episodeAktif: episodeAktif
          ? {
              id_episode: episodeAktif.id_episode,
              status_episode: episodeAktif.status_episode,
            }
          : null,
        riwayat_pemeriksaan: riwayat,
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

export const getPemeriksaanKlinisByUser = async (
  id_user_pasien: string,
): Promise<ActionResponse<PemeriksaanKlinisData[]>> => {
  try {
    const { pasien, error } = await verifyPasienAccess(id_user_pasien);
    if (error || !pasien)
      return { success: false, error: "Otoritas tidak valid." };

    const id_pasien = await getPasienIdByUser(id_user_pasien);
    if (!id_pasien) return { success: true, data: [] };

    const pool = getMySQLPool();
    const [rows] = await pool.execute<RowDataPacket[]>({
      sql: `SELECT pk.id_periksa, pk.id_episode, pk.tanggal_periksa,
              pk.keluhan, pk.tensi, pk.suhu, pk.pernapasan, pk.nadi,
              pk.saturasi_o2, pk.tinggi_badan, pk.berat_badan, pk.created_at
       FROM pemeriksaan_klinis pk
       JOIN episode_pengobatan e ON pk.id_episode = e.id_episode
       WHERE e.id_pasien = ?
       ORDER BY pk.tanggal_periksa DESC`,
      values: [id_pasien],
    });
    return {
      success: true,
      data: rows as unknown as PemeriksaanKlinisData[],
    };
  } catch (error) {
    return handleServiceError(
      error,
      "Terjadi kesalahan internal saat mengambil data.",
    );
  }
};

export const createPemeriksaanKlinis = async (
  payload: CreatePemeriksaanPayload,
  id_super_admin: string,
): Promise<ActionResponse> => {
  try {
    const { superAdmin, error } = await verifySuperAdminAccess(id_super_admin);
    if (error || !superAdmin)
      return { success: false, error: "Otoritas tidak valid." };

    const pool = getMySQLPool();
    const [checkRows] = await pool.execute<RowDataPacket[]>({
      sql: "SELECT id_episode FROM episode_pengobatan WHERE id_episode = ? LIMIT 1",
      values: [payload.id_episode],
    });
    if (checkRows.length === 0) {
      return {
        success: false,
        error: "Episode pengobatan pasien tidak ada.",
      };
    }

    const payloadRecord = payload as unknown as Record<string, unknown>;
    const columns = Object.keys(payloadRecord);
    const placeholders = columns.map(() => "?").join(", ");
    const values = columns.map((c) => {
      const value = (payloadRecord as Record<string, unknown>)[c];
      return value === undefined ? null : value;
    });

    await pool.execute({
      sql: `INSERT INTO pemeriksaan_klinis (${columns.join(", ")}) VALUES (${placeholders})`,
      values,
    });

    return {
      success: true,
      message: "Pemeriksaan klinis berhasil ditambahkan!",
    };
  } catch (error) {
    return handleServiceError(error);
  }
};

export const updatePemeriksaanKlinis = async (
  payload: UpdatePemeriksaanPayload,
  id_super_admin: string,
): Promise<ActionResponse> => {
  try {
    const { superAdmin, error } = await verifySuperAdminAccess(id_super_admin);
    if (error || !superAdmin)
      return { success: false, error: "Otoritas tidak valid." };

    const pool = getMySQLPool();
    const [checkRows] = await pool.execute<RowDataPacket[]>({
      sql: "SELECT id_periksa FROM pemeriksaan_klinis WHERE id_periksa = ? LIMIT 1",
      values: [payload.id_periksa],
    });
    if (checkRows.length === 0) {
      return { success: false, error: "Data tidak ditemukan" };
    }
    const { id_periksa, ...updateData } = payload;
    const columns = Object.keys(updateData);
    const updateDataRecord = updateData as unknown as Record<string, unknown>;
    const setClause = columns.map((c) => `${c} = ?`).join(", ");
    const values = columns.map((c) => updateDataRecord[c]);

    await pool.execute({
      sql: `UPDATE pemeriksaan_klinis SET ${setClause} WHERE id_periksa = ?`,
      values: [...values, id_periksa],
    });

    return {
      success: true,
      message: "Data pemeriksaan berhasil diperbarui!",
    };
  } catch (error) {
    return handleServiceError(
      error,
      "Terjadi kesalahan internal saat memperbarui data.",
    );
  }
};

export const deletePemeriksaanKlinis = async (
  id_periksa: number,
  id_super_admin: string,
): Promise<ActionResponse> => {
  try {
    const { superAdmin, error } = await verifySuperAdminAccess(id_super_admin);
    if (error || !superAdmin)
      return { success: false, error: "Otoritas tidak valid." };

    const pool = getMySQLPool();
    const [checkRows] = await pool.execute<RowDataPacket[]>({
      sql: "SELECT id_periksa FROM pemeriksaan_klinis WHERE id_periksa = ? LIMIT 1",
      values: [id_periksa],
    });
    if (checkRows.length === 0) {
      return { success: false, error: "Data tidak ditemukan" };
    }
    await pool.execute({
      sql: "DELETE FROM pemeriksaan_klinis WHERE id_periksa = ?",
      values: [id_periksa],
    });
    return { success: true, message: "Pemeriksaan berhasil dihapus." };
  } catch (error) {
    return handleServiceError(
      error,
      "Terjadi kesalahan internal saat menghapus data.",
    );
  }
};
