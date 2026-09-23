import { ExportFilters, ComprehensiveExportData } from "@/types/eksport";
import { verifySuperAdminAccess } from "@/utils/access";
import { handleServiceError } from "@/utils/error";
import { getMySQLPool } from "@/database/mysql-client";
import { ActionResponse } from "@/types/action";
import { RowDataPacket } from "mysql2";

export const getExportData = async (
  id_super_admin: string,
  payload: ExportFilters,
): Promise<ActionResponse<ComprehensiveExportData>> => {
  try {
    const { superAdmin, error } = await verifySuperAdminAccess(id_super_admin);
    if (error || !superAdmin)
      return { success: false, error: "Otoritas tidak valid." };

    const pool = getMySQLPool();
    const { startDate, endDate, selectedModules, pasienIds } = payload;

    let pasienFilterStr = "";
    let queryValues: (string | number)[] = [startDate, endDate];

    if (pasienIds && pasienIds.length > 0) {
      const placeholders = pasienIds.map(() => "?").join(", ");
      pasienFilterStr = `AND p.id_pasien IN (${placeholders})`;
      queryValues = [...queryValues, ...pasienIds];
    }

    const result: Partial<ComprehensiveExportData> = {};

    if (selectedModules.pasienEpisode) {
      const [rows] = await pool.execute<RowDataPacket[]>({
        sql: `SELECT p.nama_lengkap AS nama_pasien, p.id_pasien, p.usia, p.jenis_kelamin, 
              e.id_episode, e.tanggal_mulai, e.tanggal_selesai, h.status_akhir 
              FROM pasien p 
              LEFT JOIN episode_pengobatan e ON p.id_pasien = e.id_pasien 
              LEFT JOIN hasil_akhir h ON e.id_episode = h.id_episode 
              WHERE e.tanggal_mulai BETWEEN ? AND ? ${pasienFilterStr}`,
        values: queryValues,
      });
      result.pasienEpisode =
        rows as unknown as ComprehensiveExportData["pasienEpisode"];
    }

    if (selectedModules.klinis) {
      const [rows] = await pool.execute<RowDataPacket[]>({
        sql: `SELECT p.nama_lengkap AS nama_pasien, k.id_periksa, k.id_episode, 
              k.tanggal_periksa, k.keluhan, k.tensi, k.berat_badan 
              FROM pemeriksaan_klinis k 
              JOIN episode_pengobatan e ON k.id_episode = e.id_episode 
              JOIN pasien p ON e.id_pasien = p.id_pasien 
              WHERE e.tanggal_mulai BETWEEN ? AND ? ${pasienFilterStr}`,
        values: queryValues,
      });
      result.klinis = rows as unknown as ComprehensiveExportData["klinis"];
    }

    if (selectedModules.lab) {
      const [rows] = await pool.execute<RowDataPacket[]>({
        sql: `SELECT p.nama_lengkap AS nama_pasien, l.id_tes, l.id_episode, 
              l.jenis_tes, l.tanggal_tes, l.hasil_tes, l.hasil_bta 
              FROM pemeriksaan_lab l 
              JOIN episode_pengobatan e ON l.id_episode = e.id_episode 
              JOIN pasien p ON e.id_pasien = p.id_pasien 
              WHERE e.tanggal_mulai BETWEEN ? AND ? ${pasienFilterStr}`,
        values: queryValues,
      });
      result.lab = rows as unknown as ComprehensiveExportData["lab"];
    }

    if (selectedModules.diagnosis) {
      const [rows] = await pool.execute<RowDataPacket[]>({
        sql: `SELECT p.nama_lengkap AS nama_pasien, d.id_diagnosis, d.id_episode, 
              d.tanggal_diagnosis, d.klasifikasi_anatomi, d.lokasi_anatomi 
              FROM diagnosis d 
              JOIN episode_pengobatan e ON d.id_episode = e.id_episode 
              JOIN pasien p ON e.id_pasien = p.id_pasien 
              WHERE e.tanggal_mulai BETWEEN ? AND ? ${pasienFilterStr}`,
        values: queryValues,
      });
      result.diagnosis =
        rows as unknown as ComprehensiveExportData["diagnosis"];
    }

    if (selectedModules.makan) {
      const [rows] = await pool.execute<RowDataPacket[]>({
        sql: `SELECT p.nama_lengkap AS nama_pasien, m.id_laporan, m.id_episode, 
              m.waktu_makan, m.karbo, m.protein, m.serat 
              FROM laporan_makan m 
              JOIN episode_pengobatan e ON m.id_episode = e.id_episode 
              JOIN pasien p ON e.id_pasien = p.id_pasien 
              WHERE e.tanggal_mulai BETWEEN ? AND ? ${pasienFilterStr}`,
        values: queryValues,
      });
      result.makan = rows as unknown as ComprehensiveExportData["makan"];
    }

    if (selectedModules.obat) {
      const [rows] = await pool.execute<RowDataPacket[]>({
        sql: `SELECT p.nama_lengkap AS nama_pasien, j.id_jadwal, j.tanggal_jadwal, 
              j.jam_jadwal, o.nama_obat, d.aturan_pakai, l.status AS status_kepatuhan 
              FROM jadwal_minum_obat j 
              JOIN detail_obat d ON j.id_detail_obat = d.id_detail_obat 
              JOIN obat o ON d.id_obat = o.id_obat 
              JOIN resep_pengobatan r ON j.id_resep = r.id_resep 
              JOIN episode_pengobatan e ON r.id_episode = e.id_episode 
              JOIN pasien p ON e.id_pasien = p.id_pasien 
              LEFT JOIN medication_log l ON j.id_jadwal = l.id_jadwal 
              WHERE e.tanggal_mulai BETWEEN ? AND ? ${pasienFilterStr}`,
        values: queryValues,
      });
      result.obat = rows as unknown as ComprehensiveExportData["obat"];
    }

    return { success: true, data: result as ComprehensiveExportData };
  } catch (error) {
    return handleServiceError(
      error,
      "Terjadi kesalahan internal saat mengambil data ekspor.",
    );
  }
};
