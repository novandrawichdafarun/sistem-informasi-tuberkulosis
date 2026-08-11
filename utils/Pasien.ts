import type { RowDataPacket } from "mysql2/promise";
import { getMySQLPool } from "@/database/mysql-client";
import { PasienData } from "@/types/pasien";

/**
 * Ambil id_pasien dari id_user (login).
 */
export async function getPasienIdByUser(
  id_user: string,
): Promise<number | null> {
  const pool = getMySQLPool();
  const [rows] = await pool.execute<RowDataPacket[]>({
    sql: "SELECT id_pasien FROM pasien WHERE id_user = ? LIMIT 1",
    values: [id_user],
  });
  return (rows[0]?.id_pasien as number) ?? null;
}

/**
 * Ambil semua id_resep milik seorang pasien
 * (melintasi semua episode pengobatannya).
 */
export async function getResepIdsByPasien(
  id_pasien: number,
): Promise<number[]> {
  const pool = getMySQLPool();
  const [rows] = await pool.execute<RowDataPacket[]>({
    sql: `SELECT r.id_resep
          FROM resep_pengobatan r
          JOIN episode_pengobatan e ON r.id_episode = e.id_episode
          WHERE e.id_pasien = ?`,
    values: [id_pasien],
  });
  return rows.map((r) => r.id_resep as number);
}

export function parseTensi(t?: string | null): {
  sis: number | null;
  dia: number | null;
} {
  if (!t) return { sis: null, dia: null };
  const m = t.match(/(\d{2,3})\s*\/\s*(\d{2,3})/);
  if (!m) return { sis: null, dia: null };
  return { sis: Number(m[1]), dia: Number(m[2]) };
}

/** Reshape row hasil JOIN dengan users(email) ke bentuk yang konsisten. */
export function reshapePasienWithEmail(r: RowDataPacket): PasienData {
  const { _user_email, ...rest } = r as RowDataPacket & { _user_email: string };
  return { ...rest, users: { email: _user_email } } as unknown as PasienData;
}
