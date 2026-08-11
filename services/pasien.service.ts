import bcrypt from "bcryptjs";
import { randomUUID } from "crypto";
import type { RowDataPacket } from "mysql2/promise";

import {
  CreatePasienPayload,
  EpisodeRingkas,
  PasienData,
  PasienDetail,
  PasienProfile,
  UpdatePasienPayload,
} from "@/types/pasien";
import { ActionResponse } from "@/types/action";
import { verifyPasienAccess, verifySuperAdminAccess } from "@/utils/access";
import { handleServiceError } from "@/utils/error";
import { PemeriksaanKlinisData } from "@/types/pemeriksaanKlinis";
import { PemeriksaanLabData } from "@/types/pemeriksaanLab";
import { getMySQLPool } from "@/database/mysql-client";
import { isMySQLDuplicateError, mysqlTransaction } from "@/utils/mysql";
import { hitungKepatuhan } from "./laporan.service";
import { reshapePasienWithEmail } from "@/utils/Pasien";

export const getDaftarPasien = async (
  id_super_admin: string,
): Promise<ActionResponse<PasienData[]>> => {
  try {
    const { superAdmin, error } = await verifySuperAdminAccess(id_super_admin);
    if (error || !superAdmin)
      return { success: false, error: "Otoritas tidak valid." };

    const pool = getMySQLPool();
    const [rows] = await pool.execute<RowDataPacket[]>({
      sql: `SELECT p.id_pasien, p.id_user, p.nama_lengkap, p.usia, p.jenis_kelamin,
              p.domisili, p.no_telp, p.pendidikan, p.pekerjaan, p.pendapatan,
              p.created_at, u.email AS _user_email
       FROM pasien p
       JOIN users u ON p.id_user = u.id_user
       ORDER BY p.created_at DESC`,
    });
    return { success: true, data: rows.map(reshapePasienWithEmail) };
  } catch (error) {
    return handleServiceError(
      error,
      "Terjadi kesalahan internal saat mengambil data.",
    );
  }
};

export const getPasienDetail = async (
  id_pasien: number,
  id_super_admin: string,
): Promise<ActionResponse<PasienDetail>> => {
  try {
    const { superAdmin, error } = await verifySuperAdminAccess(id_super_admin);
    if (error || !superAdmin)
      return { success: false, error: "Otoritas tidak valid." };

    const pool = getMySQLPool();

    const [profilRows] = await pool.execute<RowDataPacket[]>({
      sql: `SELECT p.id_pasien, p.id_user, p.nama_lengkap, p.usia, p.jenis_kelamin,
              p.domisili, p.no_telp, p.pendidikan, p.pekerjaan, p.pendapatan,
              p.created_at, u.email AS _user_email
       FROM pasien p
       JOIN users u ON p.id_user = u.id_user
       WHERE p.id_pasien = ? LIMIT 1`,
      values: [id_pasien],
    });
    if (profilRows.length === 0) {
      return { success: false, error: "Pasien tidak ditemukan." };
    }
    const profil = reshapePasienWithEmail(profilRows[0]);

    const [episodeRows] = await pool.execute<RowDataPacket[]>({
      sql: `SELECT id_episode, tanggal_mulai, tanggal_selesai, tipe_pasien, status_episode
       FROM episode_pengobatan
       WHERE id_pasien = ?
       ORDER BY tanggal_mulai DESC`,
      values: [id_pasien],
    });
    const episodes = episodeRows as unknown as EpisodeRingkas[];
    const episodeIds = episodes.map((e) => e.id_episode);

    let klinis: PemeriksaanKlinisData[] = [];
    let lab: PemeriksaanLabData[] = [];
    if (episodeIds.length > 0) {
      const placeholders = episodeIds.map(() => "?").join(",");
      const [vRes, lRes] = await Promise.all([
        pool.execute<RowDataPacket[]>({
          sql: `SELECT id_periksa, id_episode, tanggal_periksa, keluhan, tensi, suhu,
                  pernapasan, nadi, saturasi_o2, tinggi_badan, berat_badan, created_at
           FROM pemeriksaan_klinis
           WHERE id_episode IN (${placeholders})
           ORDER BY tanggal_periksa DESC`,
          values: episodeIds,
        }),
        pool.execute<RowDataPacket[]>({
          sql: `SELECT id_tes, id_episode, jenis_tes, tanggal_tes, hasil_tes,
                  periode_pemeriksaan, berkas_pendukung_url, created_at
           FROM pemeriksaan_lab
           WHERE id_episode IN (${placeholders})
           ORDER BY tanggal_tes DESC`,
          values: episodeIds,
        }),
      ]);
      klinis = vRes[0] as unknown as PemeriksaanKlinisData[];
      lab = lRes[0] as unknown as PemeriksaanLabData[];
    }

    const kepatuhan = await hitungKepatuhan(episodeIds);

    return {
      success: true,
      data: { profil, episodes, klinis, lab, kepatuhan },
    };
  } catch (error) {
    return handleServiceError(error);
  }
};

export const getPasienProfileByUser = async (
  id_user_pasien: string,
): Promise<ActionResponse<PasienProfile>> => {
  try {
    const { pasien, error } = await verifyPasienAccess(id_user_pasien);
    if (error || !pasien)
      return { success: false, error: "Otoritas tidak valid." };

    const pool = getMySQLPool();

    const [profileRows] = await pool.execute<RowDataPacket[]>({
      sql: `SELECT id_pasien, id_user, nama_lengkap, usia, jenis_kelamin, domisili,
              no_telp, pendidikan, pekerjaan, pendapatan
       FROM pasien WHERE id_user = ? LIMIT 1`,
      values: [id_user_pasien],
    });
    if (profileRows.length === 0) {
      return { success: false, error: "Profil pasien tidak ditemukan." };
    }
    const p = profileRows[0];

    const [episodeRows] = await pool.execute<RowDataPacket[]>({
      sql: `SELECT id_episode, tanggal_mulai, tipe_pasien, status_episode
       FROM episode_pengobatan
       WHERE id_pasien = ? AND status_episode = 'aktif'
       ORDER BY tanggal_mulai DESC
       LIMIT 1`,
      values: [p.id_pasien],
    });
    const episodeAktif = episodeRows[0]
      ? {
          id_episode: episodeRows[0].id_episode,
          tanggal_mulai: episodeRows[0].tanggal_mulai,
          tipe_pasien: episodeRows[0].tipe_pasien,
          status_episode: episodeRows[0].status_episode,
        }
      : null;

    const profile: PasienProfile = {
      id_pasien: p.id_pasien,
      id_user: p.id_user,
      nama_lengkap: p.nama_lengkap,
      usia: p.usia,
      jenis_kelamin: p.jenis_kelamin,
      domisili: p.domisili,
      no_telp: p.no_telp,
      pendidikan: p.pendidikan,
      pekerjaan: p.pekerjaan,
      pendapatan: p.pendapatan,
      episodeAktif: episodeAktif as PasienProfile["episodeAktif"],
    };
    return { success: true, data: profile };
  } catch (error) {
    return handleServiceError(error);
  }
};

export const createPasien = async (
  payload: CreatePasienPayload,
  id_super_admin: string,
): Promise<ActionResponse> => {
  try {
    const { superAdmin, error } = await verifySuperAdminAccess(id_super_admin);
    if (error || !superAdmin)
      return { success: false, error: "Otoritas tidak valid." };

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(payload.password, salt);

    try {
      await mysqlTransaction(async (conn) => {
        const id_user = randomUUID();

        await conn.execute({
          sql: `INSERT INTO users (id_user, email, password_hash, role)
             VALUES (?, ?, ?, 'pasien')`,
          values: [id_user, payload.email, hashedPassword],
        });

        await conn.execute({
          sql: `INSERT INTO pasien (id_user, nama_lengkap, usia, jenis_kelamin,
                             domisili, no_telp, pendidikan, pekerjaan, pendapatan)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          values: [
            id_user,
            payload.nama_lengkap,
            payload.usia,
            payload.jenis_kelamin,
            payload.domisili ?? null,
            payload.no_telp ?? null,
            payload.pendidikan,
            payload.pekerjaan,
            payload.pendapatan,
          ],
        });
      });
      return { success: true, message: "Pasien berhasil didaftarkan!" };
    } catch (err) {
      if (isMySQLDuplicateError(err)) {
        return { success: false, error: "Email sudah terdaftar di sistem!" };
      }
      return handleServiceError(err, "Gagal mendaftarkan pasien.");
    }
  } catch (error) {
    return handleServiceError(
      error,
      "Terjadi kesalahan internal saat menambah data.",
    );
  }
};

export const updatePasien = async (
  payload: UpdatePasienPayload,
  id_super_admin: string,
): Promise<ActionResponse> => {
  try {
    const { superAdmin, error } = await verifySuperAdminAccess(id_super_admin);
    if (error || !superAdmin)
      return { success: false, error: "Otoritas tidak valid." };

    const pool = getMySQLPool();

    const [checkRows] = await pool.execute<RowDataPacket[]>({
      sql: "SELECT id_user FROM pasien WHERE id_pasien = ? LIMIT 1",
      values: [payload.id_pasien],
    });
    if (checkRows.length === 0) {
      return { success: false, error: "Pasien tidak ditemukan" };
    }

    try {
      await mysqlTransaction(async (conn) => {
        if (payload.password) {
          const salt = await bcrypt.genSalt(10);
          const hashed = await bcrypt.hash(payload.password, salt);
          await conn.execute({
            sql: "UPDATE users SET email = ?, password_hash = ? WHERE id_user = ?",
            values: [payload.email, hashed, payload.id_user],
          });
        } else {
          await conn.execute({
            sql: "UPDATE users SET email = ? WHERE id_user = ?",
            values: [payload.email, payload.id_user],
          });
        }

        await conn.execute({
          sql: `UPDATE pasien SET
             nama_lengkap = ?, usia = ?, jenis_kelamin = ?, domisili = ?,
             no_telp = ?, pendidikan = ?, pekerjaan = ?, pendapatan = ?
           WHERE id_pasien = ?`,
          values: [
            payload.nama_lengkap,
            payload.usia,
            payload.jenis_kelamin,
            payload.domisili ?? null,
            payload.no_telp ?? null,
            payload.pendidikan,
            payload.pekerjaan,
            payload.pendapatan,
            payload.id_pasien,
          ],
        });
      });
      return { success: true, message: "Data pasien berhasil diperbarui!" };
    } catch (err) {
      if (isMySQLDuplicateError(err)) {
        return {
          success: false,
          error: "Gagal memperbarui kredensial (Email mungkin sudah dipakai).",
        };
      }
      return handleServiceError(err, "Gagal memperbarui data pasien.");
    }
  } catch (error) {
    return handleServiceError(
      error,
      "Terjadi kesalahan internal saat memperbarui data.",
    );
  }
};

export const deletePasien = async (
  id_pasien: number,
  id_super_admin: string,
): Promise<ActionResponse> => {
  try {
    const { superAdmin, error } = await verifySuperAdminAccess(id_super_admin);
    if (error || !superAdmin)
      return { success: false, error: "Otoritas tidak valid." };

    const pool = getMySQLPool();
    const [checkRows] = await pool.execute<RowDataPacket[]>({
      sql: "SELECT id_user FROM pasien WHERE id_pasien = ? LIMIT 1",
      values: [id_pasien],
    });
    if (checkRows.length === 0) {
      return { success: false, error: "Pasien tidak ditemukan" };
    }
    const id_user = checkRows[0].id_user;

    //? Cukup DELETE users — pasien auto-CASCADE via FK
    await pool.execute({
      sql: "DELETE FROM users WHERE id_user = ?",
      values: [id_user],
    });
    return {
      success: true,
      message: "Pasien dan akunnya berhasil dihapus permanen.",
    };
  } catch (error) {
    return handleServiceError(
      error,
      "Terjadi kesalahan internal saat menghapus data.",
    );
  }
};
