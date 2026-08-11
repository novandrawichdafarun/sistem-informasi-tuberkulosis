import type { RowDataPacket } from "mysql2/promise";

import { ActionResponse } from "@/types/action";
import { CreateObatPayload, ObatData, UpdateObatPayload } from "@/types/obat";
import { verifySuperAdminAccess } from "@/utils/access";
import { handleServiceError } from "@/utils/error";
import { getMySQLPool } from "@/database/mysql-client";

export const getDaftarObat = async (
  id_super_admin: string,
): Promise<ActionResponse<ObatData[]>> => {
  try {
    const { superAdmin, error } = await verifySuperAdminAccess(id_super_admin);
    if (error || !superAdmin)
      return { success: false, error: "Otoritas tidak valid." };

    const pool = getMySQLPool();
    const [rows] = await pool.execute<RowDataPacket[]>({
      sql: `SELECT id_obat, nama_obat, jenis_obat, kategori_obat,
              deskripsi, dosis, is_active, created_at
       FROM obat ORDER BY created_at DESC`,
    });
    return { success: true, data: rows as unknown as ObatData[] };
  } catch (error) {
    return handleServiceError(
      error,
      "Terjadi kesalahan internal saat mengambil data.",
    );
  }
};

export const createObat = async (
  payload: CreateObatPayload,
  id_super_admin: string,
): Promise<ActionResponse> => {
  try {
    const { superAdmin, error } = await verifySuperAdminAccess(id_super_admin);
    if (error || !superAdmin)
      return { success: false, error: "Otoritas tidak valid." };

    const pool = getMySQLPool();
    const [existingRows] = await pool.execute<RowDataPacket[]>({
      sql: "SELECT id_obat FROM obat WHERE nama_obat = ? AND dosis = ? LIMIT 1",
      values: [payload.nama_obat, payload.dosis],
    });
    if (existingRows.length > 0) {
      return { success: false, error: "Obat sudah terdaftar di sistem!" };
    }

    await pool.execute({
      sql: `INSERT INTO obat (nama_obat, jenis_obat, kategori_obat, deskripsi, dosis, is_active)
          VALUES (?, ?, ?, ?, ?, ?)`,
      values: [
        payload.nama_obat,
        payload.jenis_obat,
        payload.kategori_obat,
        payload.deskripsi ?? null,
        payload.dosis ?? null,
        payload.is_active ?? true,
      ],
    });
    return { success: true, message: "Obat berhasil ditambahkan!" };
  } catch (error) {
    return handleServiceError(
      error,
      "Terjadi kesalahan internal server saat menambah data.",
    );
  }
};

export const updateObat = async (
  payload: UpdateObatPayload,
  id_super_admin: string,
): Promise<ActionResponse> => {
  try {
    const { superAdmin, error } = await verifySuperAdminAccess(id_super_admin);
    if (error || !superAdmin)
      return { success: false, error: "Otoritas tidak valid." };

    const pool = getMySQLPool();
    const [checkRows] = await pool.execute<RowDataPacket[]>({
      sql: "SELECT id_obat FROM obat WHERE id_obat = ? LIMIT 1",
      values: [payload.id_obat],
    });
    if (checkRows.length === 0) {
      return { success: false, error: "Data tidak ditemukan" };
    }

    const { id_obat, ...updateData } = payload;
    const columns = Object.keys(updateData);
    if (columns.length === 0) {
      return { success: true, message: "Tidak ada perubahan." };
    }
    const setClause = columns.map((c) => `${c} = ?`).join(", ");
    const values = columns.map(
      (c) => (updateData as Record<string, unknown>)[c],
    );

    await pool.execute({
      sql: `UPDATE obat SET ${setClause} WHERE id_obat = ?`,
      values: [...values, id_obat],
    });
    return {
      success: true,
      message: "Data Obat berhasil diperbarui!",
    };
  } catch (error) {
    return handleServiceError(
      error,
      "Terjadi kesalahan internal saat memperbarui data.",
    );
  }
};

export const toggleStatusObat = async (
  id_obat: number,
  status: boolean,
  id_super_admin: string,
): Promise<ActionResponse> => {
  try {
    const { superAdmin, error } = await verifySuperAdminAccess(id_super_admin);
    if (error || !superAdmin)
      return { success: false, error: "Otoritas tidak valid." };

    const pool = getMySQLPool();
    const [checkRows] = await pool.execute<RowDataPacket[]>({
      sql: "SELECT id_obat FROM obat WHERE id_obat = ? LIMIT 1",
      values: [id_obat],
    });
    if (checkRows.length === 0) {
      return { success: false, error: "Data tidak ditemukan" };
    }

    await pool.execute({
      sql: "UPDATE obat SET is_active = ? WHERE id_obat = ?",
      values: [status ? 1 : 0, id_obat],
    });
    return { success: true, message: "Status Obat berhasil diubah!" };
  } catch (error) {
    return handleServiceError(
      error,
      "Terjadi kesalahan internal saat mengubah status.",
    );
  }
};

export const deleteObat = async (
  id_obat: number,
  id_super_admin: string,
): Promise<ActionResponse> => {
  try {
    const { superAdmin, error } = await verifySuperAdminAccess(id_super_admin);
    if (error || !superAdmin)
      return { success: false, error: "Otoritas tidak valid." };

    const pool = getMySQLPool();
    const [checkRows] = await pool.execute<RowDataPacket[]>({
      sql: "SELECT id_obat FROM obat WHERE id_obat = ? LIMIT 1",
      values: [id_obat],
    });
    if (checkRows.length === 0) {
      return { success: false, error: "Data tidak ditemukan" };
    }

    try {
      await pool.execute({
        sql: "DELETE FROM obat WHERE id_obat = ?",
        values: [id_obat],
      });
      return { success: true, message: "Data Obat berhasil dihapus." };
    } catch (err) {
      return handleServiceError(
        err,
        "Gagal menghapus. Obat masih digunakan di resep pengobatan.",
      );
    }
  } catch (error) {
    return handleServiceError(
      error,
      "Terjadi kesalahan internal saat menghapus data.",
    );
  }
};
