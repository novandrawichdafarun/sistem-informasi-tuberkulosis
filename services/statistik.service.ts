import type { RowDataPacket } from "mysql2/promise";

import { ActionResponse } from "@/types/action";
import { handleServiceError } from "@/utils/error";
import { MonthlyPoint, StatistikAdmin } from "@/types/statistik";
import { buildMonths, toDateStr, todayISO, toMonthKey } from "@/utils/date";
import { verifySuperAdminAccess } from "@/utils/access";
import { getMySQLPool } from "@/database/mysql-client";

export const getStatistikAdmin = async (
  id_super_admin: string,
): Promise<ActionResponse<StatistikAdmin>> => {
  try {
    const { superAdmin, error } = await verifySuperAdminAccess(id_super_admin);
    if (error || !superAdmin)
      return { success: false, error: "Otoritas tidak valid." };

    const months = buildMonths(6);
    const today = todayISO();
    const windowStart = months[0].start;

    type PasienRaw = { id_pasien: number; created_at: string };
    type EpisodeRaw = {
      id_episode: number;
      id_pasien: number;
      status_episode: string;
      tanggal_mulai: string | null;
      tanggal_selesai: string | null;
    };
    type ResepRaw = { id_resep: number; id_episode: number };
    type JadwalRaw = {
      id_jadwal: number;
      id_resep: number;
      tanggal_jadwal: string;
    };
    type LogRaw = { id_jadwal: number; status: string };

    const pool = getMySQLPool();
    const [pasienRows, episodeRows, resepRows, jadwalRows] = await Promise.all([
      pool.execute<RowDataPacket[]>({
        sql: `SELECT id_pasien, created_at FROM pasien`,
      }),
      pool.execute<RowDataPacket[]>({
        sql: `SELECT id_episode, id_pasien, status_episode,
                    tanggal_mulai, tanggal_selesai
             FROM episode_pengobatan`,
      }),
      pool.execute<RowDataPacket[]>({
        sql: `SELECT id_resep, id_episode FROM resep_pengobatan`,
      }),
      pool.execute<RowDataPacket[]>({
        sql: `SELECT id_jadwal, id_resep, tanggal_jadwal
             FROM jadwal_minum_obat
             WHERE tanggal_jadwal >= ? AND tanggal_jadwal <= ?`,
        values: [windowStart, today],
      }),
    ]);

    const pasien: PasienRaw[] = pasienRows[0].map((p) => ({
      id_pasien: p.id_pasien,
      created_at: (p.created_at instanceof Date
        ? p.created_at.toISOString()
        : p.created_at) as string,
    }));
    const episodes: EpisodeRaw[] = episodeRows[0].map((e) => ({
      id_episode: e.id_episode,
      id_pasien: e.id_pasien,
      status_episode: e.status_episode,
      tanggal_mulai: toDateStr(e.tanggal_mulai),
      tanggal_selesai: toDateStr(e.tanggal_selesai),
    }));
    const resep: ResepRaw[] = resepRows[0].map((r) => ({
      id_resep: r.id_resep,
      id_episode: r.id_episode,
    }));
    const jadwal: JadwalRaw[] = jadwalRows[0].map((j) => ({
      id_jadwal: j.id_jadwal,
      id_resep: j.id_resep,
      tanggal_jadwal: toDateStr(j.tanggal_jadwal) ?? "",
    }));

    let logs: LogRaw[] = [];
    const jadwalIds = jadwal.map((j) => j.id_jadwal);
    if (jadwalIds.length > 0) {
      const jPh = jadwalIds.map(() => "?").join(",");
      const [logRows] = await pool.execute<RowDataPacket[]>({
        sql: `SELECT id_jadwal, status FROM medication_log
           WHERE id_jadwal IN (${jPh})`,
        values: jadwalIds,
      });
      logs = logRows.map((l) => ({
        id_jadwal: l.id_jadwal,
        status: l.status,
      }));
    }

    const resepEpisode = new Map<number, number>();
    resep.forEach((r) => resepEpisode.set(r.id_resep, r.id_episode));
    const episodePasien = new Map<number, number>();
    episodes.forEach((e) => episodePasien.set(e.id_episode, e.id_pasien));
    const logStatus = new Map<number, string>();
    logs.forEach((l) => logStatus.set(l.id_jadwal, l.status));

    const monthAgg = new Map<string, { total: number; diminum: number }>();
    const patientAgg = new Map<number, { total: number; diminum: number }>();
    months.forEach((m) => monthAgg.set(m.key, { total: 0, diminum: 0 }));

    for (const j of jadwal) {
      const monthKey = j.tanggal_jadwal.slice(0, 7);
      const idEpisode = resepEpisode.get(j.id_resep);
      const idPasien = idEpisode ? episodePasien.get(idEpisode) : undefined;
      const diminum = logStatus.get(j.id_jadwal) === "diminum";

      const ma = monthAgg.get(monthKey);
      if (ma) {
        ma.total += 1;
        if (diminum) ma.diminum += 1;
      }
      if (idPasien != null) {
        const pa = patientAgg.get(idPasien) ?? { total: 0, diminum: 0 };
        pa.total += 1;
        if (diminum) pa.diminum += 1;
        patientAgg.set(idPasien, pa);
      }
    }

    const activeSet = new Set<number>();
    episodes.forEach((e) => {
      if (e.status_episode === "aktif") activeSet.add(e.id_pasien);
    });

    let baik = 0,
      cukup = 0,
      rendah = 0,
      totalDinilai = 0;
    activeSet.forEach((idPasien) => {
      const pa = patientAgg.get(idPasien);
      if (!pa || pa.total === 0) return;
      const pct = (pa.diminum / pa.total) * 100;
      totalDinilai += 1;
      if (pct >= 80) baik += 1;
      else if (pct >= 60) cukup += 1;
      else rendah += 1;
    });

    const trenKepatuhan: MonthlyPoint[] = months.map((m) => {
      const ma = monthAgg.get(m.key)!;
      return {
        key: m.key,
        label: m.label,
        value: ma.total > 0 ? Math.round((ma.diminum / ma.total) * 100) : 0,
      };
    });

    const pasienBaruPerBulan: MonthlyPoint[] = months.map((m) => ({
      key: m.key,
      label: m.label,
      value: pasien.filter((p) => toMonthKey(p.created_at) === m.key).length,
    }));

    const pasienAktifPerBulan: MonthlyPoint[] = months.map((m) => {
      const set = new Set<number>();
      episodes.forEach((e) => {
        const mulai = e.tanggal_mulai;
        const selesai = e.tanggal_selesai;
        if (!mulai) return;
        const overlap = mulai <= m.end && (!selesai || selesai >= m.start);
        if (overlap) set.add(e.id_pasien);
      });
      return { key: m.key, label: m.label, value: set.size };
    });

    const now = new Date();
    const bulanIniLabel = now.toLocaleDateString("id-ID", {
      month: "long",
      year: "numeric",
    });

    const data: StatistikAdmin = {
      totalPasien: pasien.length,
      pasienAktif: activeSet.size,
      rataKepatuhanBulanIni:
        trenKepatuhan[trenKepatuhan.length - 1]?.value ?? 0,
      pasienBaruBulanIni:
        pasienBaruPerBulan[pasienBaruPerBulan.length - 1]?.value ?? 0,
      bulanIniLabel,
      distribusi: { baik, cukup, rendah, totalDinilai },
      trenKepatuhan,
      pasienBaruPerBulan,
      pasienAktifPerBulan,
    };

    return { success: true, data };
  } catch (error) {
    return handleServiceError(error, "Gagal memuat statistik.");
  }
};
