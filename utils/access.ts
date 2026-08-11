import type { RowDataPacket } from "mysql2/promise";
import { getMySQLPool } from "@/database/mysql-client";

interface SuperAdminRow extends RowDataPacket {
  id_user: string;
  email: string;
  role: "super_admin";
}

interface PasienRow extends RowDataPacket {
  id_pasien: number;
  id_user: string;
}

/**
 * Verifikasi id_user adalah super_admin yang aktif.
 */
export async function verifySuperAdminAccess(id_user: string): Promise<{
  superAdmin: { id_user: string; email: string; role: string } | null;
  error: string | null;
}> {
  try {
    const pool = getMySQLPool();
    const [rows] = await pool.execute<SuperAdminRow[]>({
      sql: `SELECT id_user, email, role FROM users
            WHERE id_user = ? AND role = 'super_admin' LIMIT 1`,
      values: [id_user],
    });
    if (rows.length === 0) {
      return { superAdmin: null, error: "Bukan super admin" };
    }
    return { superAdmin: rows[0], error: null };
  } catch (err) {
    return { superAdmin: null, error: (err as Error).message };
  }
}

/**
 * Verifikasi id_user adalah pasien (role='pasien' + entri di tabel pasien).
 * Kritis: dulu di-handle otomatis oleh RLS "Pasien kelola log sendiri".
 * Sekarang wajib eksplisit.
 */
export async function verifyPasienAccess(id_user: string): Promise<{
  pasien: { id_pasien: number; id_user: string } | null;
  error: string | null;
}> {
  try {
    const pool = getMySQLPool();
    const [rows] = await pool.execute<PasienRow[]>({
      sql: `SELECT p.id_pasien, p.id_user
            FROM pasien p
            JOIN users u ON u.id_user = p.id_user
            WHERE p.id_user = ? AND u.role = 'pasien'
            LIMIT 1`,
      values: [id_user],
    });
    if (rows.length === 0) {
      return { pasien: null, error: "Bukan pasien" };
    }
    return { pasien: rows[0], error: null };
  } catch (err) {
    return { pasien: null, error: (err as Error).message };
  }
}
