import type { RowDataPacket } from "mysql2/promise";

import { ActionResponse } from "@/types/action";
import {
  CreatePemeriksaanLabPayload,
  PasienPemeriksaanLabOverview,
  PemeriksaanLabData,
  UpdatePemeriksaanLabPayload,
} from "@/types/pemeriksaanLab";
import { verifyPasienAccess, verifySuperAdminAccess } from "@/utils/access";
import { handleServiceError } from "@/utils/error";
import { getPasienIdByUser } from "@/utils/Pasien";
import { getMySQLPool } from "@/database/mysql-client";
import { ensureArray } from "@/utils/mysql";

export const getDaftarPemeriksaanLab = async (
  id_super_admin: string,
): Promise<ActionResponse<PasienPemeriksaanLabOverview[]>> => {
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
            'pemeriksaan_lab', (
              SELECT COALESCE(JSON_ARRAYAGG(JSON_OBJECT(
                'id_tes', pl.id_tes,
                'id_episode', pl.id_episode,
                'jenis_tes', pl.jenis_tes,
                'tanggal_tes', pl.tanggal_tes,
                'periode_pemeriksaan', pl.periode_pemeriksaan,
                'jenis_sample', pl.jenis_sample,
                'kualitas_sample', pl.kualitas_sample,
                'dna_bakteri_tb', pl.dna_bakteri_tb,
                'status_resistensi', pl.status_resistensi,
                'hasil_tes', pl.hasil_tes,
                'hasil_bta', pl.hasil_bta,
                'berkas_pendukung_url', pl.berkas_pendukung_url,
                'created_at', pl.created_at
              )), JSON_ARRAY())
              FROM pemeriksaan_lab pl WHERE pl.id_episode = e.id_episode
            )
          )), JSON_ARRAY())
          FROM episode_pengobatan e WHERE e.id_pasien = p.id_pasien
        ) AS episode_pengobatan
      FROM pasien p
      ORDER BY p.created_at DESC`,
    });

    const formattedData: PasienPemeriksaanLabOverview[] = rows.map((pasien) => {
      const rawEpisodes = ensureArray<{
        id_episode: number;
        status_episode: string;
        pemeriksaan_lab: PemeriksaanLabData[] | null;
      }>(pasien.episode_pengobatan);

      const episodeAktif =
        rawEpisodes.find((ep) => ep.status_episode === "aktif") || null;

      let riwayat: PemeriksaanLabData[] = [];
      rawEpisodes.forEach((ep) => {
        const arr = ensureArray<PemeriksaanLabData>(ep.pemeriksaan_lab);
        riwayat = [...riwayat, ...arr];
      });

      riwayat.sort(
        (a, b) =>
          new Date(b.tanggal_tes).getTime() - new Date(a.tanggal_tes).getTime(),
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
        riwayat_pemeriksaan_lab: riwayat,
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

export const getPemeriksaanLabByUser = async (
  id_user_pasien: string,
): Promise<ActionResponse<PemeriksaanLabData[]>> => {
  try {
    const { pasien, error } = await verifyPasienAccess(id_user_pasien);
    if (error || !pasien)
      return { success: false, error: "Otoritas tidak valid." };

    const id_pasien = await getPasienIdByUser(id_user_pasien);
    if (!id_pasien) return { success: true, data: [] };

    const pool = getMySQLPool();
    const [rows] = await pool.execute<RowDataPacket[]>({
      sql: `SELECT pl.id_tes, pl.id_episode, pl.jenis_tes, pl.tanggal_tes,
              pl.periode_pemeriksaan, pl.jenis_sample, pl.kualitas_sample,
              pl.dna_bakteri_tb, pl.status_resistensi, pl.hasil_tes,
              pl.hasil_bta, pl.berkas_pendukung_url, pl.created_at
      FROM pemeriksaan_lab pl
      JOIN episode_pengobatan e ON pl.id_episode = e.id_episode
      WHERE e.id_pasien = ?
      ORDER BY pl.tanggal_tes DESC`,
      values: [id_pasien],
    });
    return { success: true, data: rows as unknown as PemeriksaanLabData[] };
  } catch (error) {
    return handleServiceError(
      error,
      "Terjadi kesalahan internal saat mengambil data.",
    );
  }
};

export const createPemeriksaanLab = async (
  payload: CreatePemeriksaanLabPayload,
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

    const columns = Object.keys(payload);
    const placeholders = columns.map(() => "?").join(", ");
    const values = columns.map(
      (c) => (payload as unknown as Record<string, unknown>)[c],
    );

    await pool.execute({
      sql: `INSERT INTO pemeriksaan_lab (${columns.join(", ")}) VALUES (${placeholders})`,
      values,
    });

    return {
      success: true,
      message: "Pemeriksaan lab berhasil ditambahkan!",
    };
  } catch (error) {
    return handleServiceError(error, "Gagal menambah data pemeriksaan lab.");
  }
};

export const updatePemeriksaanLab = async (
  payload: UpdatePemeriksaanLabPayload,
  id_super_admin: string,
): Promise<ActionResponse> => {
  try {
    const { superAdmin, error } = await verifySuperAdminAccess(id_super_admin);
    if (error || !superAdmin)
      return { success: false, error: "Otoritas tidak valid." };

    const pool = getMySQLPool();
    const [checkRows] = await pool.execute<RowDataPacket[]>({
      sql: "SELECT id_tes FROM pemeriksaan_lab WHERE id_tes = ? LIMIT 1",
      values: [payload.id_tes],
    });
    if (checkRows.length === 0) {
      return { success: false, error: "Data tidak ditemukan" };
    }

    const { id_tes, ...updateData } = payload;
    const columns = Object.keys(updateData);
    if (columns.length === 0) {
      return { success: true, message: "Tidak ada perubahan." };
    }
    const setClause = columns.map((c) => `${c} = ?`).join(", ");
    const values = columns.map(
      (c) => (updateData as Record<string, unknown>)[c],
    );

    await pool.execute({
      sql: `UPDATE pemeriksaan_lab SET ${setClause} WHERE id_tes = ?`,
      values: [...values, id_tes],
    });

    return {
      success: true,
      message: "Data pemeriksaan lab berhasil diperbarui!",
    };
  } catch (error) {
    return handleServiceError(error, "Gagal memperbarui data pemeriksaan lab.");
  }
};

export const deletePemeriksaanLab = async (
  id_tes: number,
  id_super_admin: string,
): Promise<ActionResponse> => {
  try {
    const { superAdmin, error } = await verifySuperAdminAccess(id_super_admin);
    if (error || !superAdmin)
      return { success: false, error: "Otoritas tidak valid." };

    const pool = getMySQLPool();
    const [checkRows] = await pool.execute<RowDataPacket[]>({
      sql: "SELECT id_tes FROM pemeriksaan_lab WHERE id_tes = ? LIMIT 1",
      values: [id_tes],
    });
    if (checkRows.length === 0) {
      return { success: false, error: "Data tidak ditemukan" };
    }
    await pool.execute({
      sql: "DELETE FROM pemeriksaan_lab WHERE id_tes = ?",
      values: [id_tes],
    });
    return { success: true, message: "Pemeriksaan lab berhasil dihapus." };
  } catch (error) {
    return handleServiceError(error, "Gagal menghapus data pemeriksaan lab.");
  }
};
