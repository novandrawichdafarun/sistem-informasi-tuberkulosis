import bcrypt from "bcryptjs";
import { randomUUID } from "crypto";
import type { RowDataPacket } from "mysql2/promise";

import { ActionResponse } from "@/types/action";
import { CreateUserPayload, UpdateUserPayload, UserData } from "@/types/user";
import { verifySuperAdminAccess } from "@/utils/access";
import { handleServiceError } from "@/utils/error";
import { getMySQLPool } from "@/database/mysql-client";
import { isMySQLDuplicateError } from "@/utils/mysql";

export const getDaftarAdminUser = async (
  id_super_admin: string,
): Promise<ActionResponse<UserData[]>> => {
  try {
    const { superAdmin, error } = await verifySuperAdminAccess(id_super_admin);
    if (error || !superAdmin)
      return { success: false, error: "Otoritas tidak valid." };

    const pool = getMySQLPool();
    const [rows] = await pool.execute<RowDataPacket[]>({
      sql: `SELECT id_user, email, role, created_at FROM users
            WHERE role = 'super_admin' AND id_user != ?
            ORDER BY created_at DESC`,
      values: [id_super_admin],
    });

    return { success: true, data: rows as unknown as UserData[] };
  } catch (error) {
    return handleServiceError(
      error,
      "Terjadi kesalahan internal saat mengambil data.",
    );
  }
};

export const createUser = async (
  payload: CreateUserPayload,
  id_super_admin: string,
): Promise<ActionResponse> => {
  try {
    const { superAdmin, error } = await verifySuperAdminAccess(id_super_admin);
    if (error || !superAdmin)
      return { success: false, error: "Otoritas tidak valid." };

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(payload.password, salt);

    try {
      const pool = getMySQLPool();
      const id_user = randomUUID();
      await pool.execute({
        sql: `INSERT INTO users (id_user, email, password_hash, role)
              VALUES (?, ?, ?, 'super_admin')`,
        values: [id_user, payload.email, hashedPassword],
      });
      return { success: true, message: "Data User berhasil ditambahkan!" };
    } catch (err) {
      if (isMySQLDuplicateError(err)) {
        return { success: false, error: "Email sudah terdaftar di sistem!" };
      }
      return handleServiceError(err, "Gagal menyimpan data User");
    }
  } catch (error) {
    return handleServiceError(
      error,
      "Terjadi kesalahan internal saat menambah data.",
    );
  }
};

export const updateUser = async (
  payload: UpdateUserPayload,
  id_super_admin: string,
): Promise<ActionResponse> => {
  try {
    const { superAdmin, error } = await verifySuperAdminAccess(id_super_admin);
    if (error || !superAdmin)
      return { success: false, error: "Otoritas tidak valid." };

    try {
      const pool = getMySQLPool();

      const [checkRows] = await pool.execute<RowDataPacket[]>({
        sql: "SELECT id_user FROM users WHERE id_user = ? LIMIT 1",
        values: [payload.id_user],
      });
      if (checkRows.length === 0) {
        return { success: false, error: "User tidak ditemukan" };
      }

      if (payload.password) {
        const salt = await bcrypt.genSalt(10);
        const hashed = await bcrypt.hash(payload.password, salt);
        await pool.execute({
          sql: "UPDATE users SET email = ?, password_hash = ? WHERE id_user = ?",
          values: [payload.email, hashed, payload.id_user],
        });
      } else {
        await pool.execute({
          sql: "UPDATE users SET email = ? WHERE id_user = ?",
          values: [payload.email, payload.id_user],
        });
      }

      return { success: true, message: "Data User berhasil diperbarui!" };
    } catch (err) {
      if (isMySQLDuplicateError(err)) {
        return {
          success: false,
          error: "Gagal memperbarui kredensial (Email mungkin sudah dipakai).",
        };
      }
      return handleServiceError(err, "Gagal memperbarui kredensial.");
    }
  } catch (error) {
    return handleServiceError(
      error,
      "Terjadi kesalahan internal saat memperbarui data.",
    );
  }
};

export const deleteuser = async (
  id_user: string,
  id_super_admin: string,
): Promise<ActionResponse> => {
  try {
    const { superAdmin, error } = await verifySuperAdminAccess(id_super_admin);
    if (error || !superAdmin)
      return { success: false, error: "Otoritas tidak valid." };

    try {
      const pool = getMySQLPool();
      const [checkRows] = await pool.execute<RowDataPacket[]>({
        sql: "SELECT id_user FROM users WHERE id_user = ? LIMIT 1",
        values: [id_user],
      });
      if (checkRows.length === 0) {
        return { success: false, error: "User tidak ditemukan" };
      }
      await pool.execute({
        sql: "DELETE FROM users WHERE id_user = ?",
        values: [id_user],
      });
      return {
        success: true,
        message: "Data User berhasil dihapus permanen.",
      };
    } catch (err) {
      return handleServiceError(err, "Gagal menghapus data User.");
    }
  } catch (error) {
    return handleServiceError(
      error,
      "Terjadi kesalahan internal saat menghapus data.",
    );
  }
};
