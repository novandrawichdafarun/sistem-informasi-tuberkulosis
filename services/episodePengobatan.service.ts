import type { RowDataPacket } from "mysql2/promise";

import { ActionResponse } from "@/types/action";
import {
  BukaEpisodePayload,
  EditEpisodePayload,
  EpisodePengobatanData,
  HasilAkhirData,
  PasienEpisodeOverview,
  TutupEpisodePayload,
} from "@/types/episodePengobatan";
import { verifySuperAdminAccess } from "@/utils/access";
import { handleServiceError } from "@/utils/error";
import { getMySQLPool } from "@/database/mysql-client";
import { ensureArray, mysqlTransaction } from "@/utils/mysql";

export const getDaftarPasienDanEpisode = async (
  id_super_admin: string,
): Promise<ActionResponse<PasienEpisodeOverview[]>> => {
  try {
    const { superAdmin, error } = await verifySuperAdminAccess(id_super_admin);
    if (error || !superAdmin)
      return { success: false, error: "Otoritas tidak valid." };

    const pool = getMySQLPool();
    const [rows] = await pool.execute<RowDataPacket[]>({
      sql: `SELECT
            p.id_pasien, p.nama_lengkap, p.usia, p.domisili, p.jenis_kelamin,
            (
              SELECT COALESCE(JSON_ARRAYAGG(JSON_OBJECT(
                'id_episode', e.id_episode,
                'id_pasien', e.id_pasien,
                'tanggal_mulai', e.tanggal_mulai,
                'tanggal_selesai', e.tanggal_selesai,
                'tipe_pasien', e.tipe_pasien,
                'status_episode', e.status_episode,
                'created_at', e.created_at,
                'hasil_akhir', (
                  SELECT JSON_OBJECT(
                    'id_hasil', h.id_hasil,
                    'id_episode', h.id_episode,
                    'tanggal_penetapan', h.tanggal_penetapan,
                    'status_akhir', h.status_akhir,
                    'catatan_akhir', h.catatan_akhir,
                    'created_at', h.created_at
                  )
                  FROM hasil_akhir h WHERE h.id_episode = e.id_episode LIMIT 1
                )
              )), JSON_ARRAY())
              FROM episode_pengobatan e WHERE e.id_pasien = p.id_pasien
            ) AS episode_pengobatan
          FROM pasien p
          ORDER BY p.created_at DESC`,
    });

    const formattedData: PasienEpisodeOverview[] = rows.map((pasien) => {
      const rawEpisodes = ensureArray<
        EpisodePengobatanData & { hasil_akhir: HasilAkhirData | null }
      >(pasien.episode_pengobatan);

      const normalizedEpisodes: EpisodePengobatanData[] = rawEpisodes.map(
        (episode) => ({
          ...episode,
          hasil_akhir: episode.hasil_akhir ?? null,
        }),
      );

      const episodeAktif =
        normalizedEpisodes.find((ep) => ep.status_episode === "aktif") || null;
      const riwayat = [...normalizedEpisodes].sort(
        (a, b) =>
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
      );

      return {
        id_pasien: pasien.id_pasien,
        nama_lengkap: pasien.nama_lengkap,
        usia: pasien.usia,
        jenis_kelamin: pasien.jenis_kelamin,
        domisili: pasien.domisili,
        episodeAktif,
        riwayat_episode: riwayat,
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

export const getEpisodeAktifByPasienId = async (
  id_pasien: number,
  id_super_admin: string,
): Promise<ActionResponse<EpisodePengobatanData>> => {
  try {
    const { superAdmin, error } = await verifySuperAdminAccess(id_super_admin);
    if (error || !superAdmin)
      return { success: false, error: "Otoritas tidak valid." };

    const pool = getMySQLPool();
    const [rows] = await pool.execute<RowDataPacket[]>({
      sql: `SELECT
              id_episode,
              id_pasien,
              tanggal_mulai,
              tanggal_selesai,
              tipe_pasien,
              status_episode,
              created_at
            FROM episode_pengobatan
            WHERE id_pasien = ? AND status_episode = 'aktif' LIMIT 1`,
      values: [id_pasien],
    });
    if (rows.length === 0) {
      return { success: false, error: "Episode aktif tidak ditemukan." };
    }
    return {
      success: true,
      data: rows[0] as unknown as EpisodePengobatanData,
    };
  } catch (error) {
    return handleServiceError(
      error,
      "Terjadi kesalahan internal saat mengambil data.",
    );
  }
};

export const bukaEpisode = async (
  payload: BukaEpisodePayload,
  id_super_admin: string,
): Promise<ActionResponse> => {
  try {
    const { superAdmin, error } = await verifySuperAdminAccess(id_super_admin);
    if (error || !superAdmin)
      return { success: false, error: "Otoritas tidak valid." };

    const pool = getMySQLPool();

    const [activeRows] = await pool.execute<RowDataPacket[]>({
      sql: `SELECT id_episode FROM episode_pengobatan
       WHERE id_pasien = ? AND status_episode = 'aktif' LIMIT 1`,
      values: [payload.id_pasien],
    });
    if (activeRows.length > 0) {
      return {
        success: false,
        error: "Pasien masih memiliki episode pengobatan aktif.",
      };
    }

    const insertData = { ...payload, status_episode: "aktif" };
    const columns = Object.keys(insertData);
    const placeholders = columns.map(() => "?").join(", ");
    const values = columns.map(
      (c) => (insertData as Record<string, unknown>)[c],
    );

    await pool.execute({
      sql: `INSERT INTO episode_pengobatan (${columns.join(", ")}) VALUES (${placeholders})`,
      values,
    });

    return { success: true, message: "Episode pengobatan berhasil dibuka." };
  } catch (error) {
    return handleServiceError(
      error,
      "Terjadi kesalahan internal saat membuka data.",
    );
  }
};

export const tutupEpisode = async (
  payload: TutupEpisodePayload,
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

    try {
      await mysqlTransaction(async (conn) => {
        await conn.execute({
          sql: `UPDATE episode_pengobatan SET status_episode = 'selesai'
           WHERE id_episode = ?`,
          values: [payload.id_episode],
        });

        await conn.execute({
          sql: `INSERT INTO hasil_akhir
             (id_episode, tanggal_penetapan, status_akhir, catatan_akhir)
           VALUES (?, ?, ?, ?)`,
          values: [
            payload.id_episode,
            payload.tanggal_penetapan,
            payload.status_akhir,
            payload.catatan_akhir || null,
          ],
        });
      });
      return {
        success: true,
        message: "Episode pengobatan berhasil diselesaikan.",
      };
    } catch (err) {
      return handleServiceError(
        err,
        "Gagal menyelesaikan episode (transaction rolled back).",
      );
    }
  } catch (error) {
    return handleServiceError(
      error,
      "Terjadi kesalahan internal server saat menutup data.",
    );
  }
};

export const editEpisode = async (
  payload: EditEpisodePayload,
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

    try {
      await mysqlTransaction(async (conn) => {
        await conn.execute({
          sql: `UPDATE episode_pengobatan SET
             tanggal_mulai = ?, tanggal_selesai = ?, tipe_pasien = ?
           WHERE id_episode = ?`,
          values: [
            payload.tanggal_mulai,
            payload.tanggal_selesai,
            payload.tipe_pasien,
            payload.id_episode,
          ],
        });

        if (payload.hasil_akhir) {
          const [hasilRows] = await conn.execute<RowDataPacket[]>({
            sql: "SELECT id_hasil FROM hasil_akhir WHERE id_episode = ? LIMIT 1",
            values: [payload.id_episode],
          });
          if (hasilRows.length > 0) {
            await conn.execute({
              sql: `UPDATE hasil_akhir SET
                 tanggal_penetapan = ?, status_akhir = ?, catatan_akhir = ?
               WHERE id_episode = ?`,
              values: [
                payload.hasil_akhir.tanggal_penetapan,
                payload.hasil_akhir.status_akhir,
                payload.hasil_akhir.catatan_akhir || null,
                payload.id_episode,
              ],
            });
          }
        }
      });
      return {
        success: true,
        message: "Episode pengobatan berhasil diperbarui.",
      };
    } catch (err) {
      return handleServiceError(err, "Gagal memperbarui episode.");
    }
  } catch (error) {
    return handleServiceError(
      error,
      "Terjadi kesalahan internal saat memperbarui data.",
    );
  }
};

export const hapusEpisode = async (
  id_episode: number,
  id_super_admin: string,
): Promise<ActionResponse> => {
  try {
    const { superAdmin, error } = await verifySuperAdminAccess(id_super_admin);
    if (error || !superAdmin)
      return { success: false, error: "Otoritas tidak valid." };

    const pool = getMySQLPool();
    const [checkRows] = await pool.execute<RowDataPacket[]>({
      sql: "SELECT id_episode FROM episode_pengobatan WHERE id_episode = ? LIMIT 1",
      values: [id_episode],
    });
    if (checkRows.length === 0) {
      return {
        success: false,
        error: "Episode pengobatan pasien tidak ada.",
      };
    }

    await pool.execute({
      sql: "DELETE FROM episode_pengobatan WHERE id_episode = ?",
      values: [id_episode],
    });
    return { success: true, message: "Episode Pengobatan berhasil dihapus." };
  } catch (error) {
    return handleServiceError(
      error,
      "Terjadi kesalahan internal saat menghapus data.",
    );
  }
};
