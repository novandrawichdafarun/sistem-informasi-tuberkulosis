import { SupabaseClient } from "@supabase/supabase-js";
import { ActionResponse } from "@/types/action";
import { handleServiceError } from "@/utils/error";
import { MonthlyPoint, StatistikAdmin } from "@/types/statistik";
import { buildMonths, todayISO } from "@/utils/date";
import { verifySuperAdminAccess } from "@/utils/access";

export const getStatistikAdmin = async (
  supabase: SupabaseClient,
  id_super_admin: string,
): Promise<ActionResponse<StatistikAdmin>> => {
  try {
    const { superAdmin, error } = await verifySuperAdminAccess(
      supabase,
      id_super_admin,
    );
    if (error || !superAdmin)
      return { success: false, error: "Otoritas tidak valid." };

    const months = buildMonths(6);
    const today = todayISO();
    const windowStart = months[0].start;

    // Ambil data mentah (tabel kecil → agregasi di JS).
    const [pasienRes, episodeRes, resepRes, jadwalRes] = await Promise.all([
      supabase.from("pasien").select("id_pasien, created_at"),
      supabase
        .from("episode_pengobatan")
        .select(
          "id_episode, id_pasien, status_episode, tanggal_mulai, tanggal_selesai",
        ),
      supabase.from("resep_pengobatan").select("id_resep, id_episode"),
      supabase
        .from("jadwal_minum_obat")
        .select("id_jadwal, id_resep, tanggal_jadwal")
        .gte("tanggal_jadwal", windowStart)
        .lte("tanggal_jadwal", today),
    ]);

    const pasien = pasienRes.data ?? [];
    const episodes = episodeRes.data ?? [];
    const resep = resepRes.data ?? [];
    const jadwal = jadwalRes.data ?? [];

    // Log hanya untuk jadwal di window.
    const jadwalIds = jadwal.map((j) => j.id_jadwal as number);
    let logs: { id_jadwal: number; status: string }[] = [];
    if (jadwalIds.length > 0) {
      const logRes = await supabase
        .from("medication_log")
        .select("id_jadwal, status")
        .in("id_jadwal", jadwalIds);
      logs = (logRes.data as typeof logs) ?? [];
    }

    // Peta relasi
    const resepEpisode = new Map<number, number>();
    resep.forEach((r) => resepEpisode.set(r.id_resep, r.id_episode));
    const episodePasien = new Map<number, number>();
    episodes.forEach((e) => episodePasien.set(e.id_episode, e.id_pasien));
    const logStatus = new Map<number, string>();
    logs.forEach((l) => logStatus.set(l.id_jadwal, l.status));

    // Agregasi kepatuhan per bulan & per pasien
    const monthAgg = new Map<string, { total: number; diminum: number }>();
    const patientAgg = new Map<number, { total: number; diminum: number }>();
    months.forEach((m) => monthAgg.set(m.key, { total: 0, diminum: 0 }));

    for (const j of jadwal) {
      const monthKey = (j.tanggal_jadwal as string).slice(0, 7);
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

    // Pasien aktif = punya episode berstatus 'aktif'
    const activeSet = new Set<number>();
    episodes.forEach((e) => {
      if (e.status_episode === "aktif") activeSet.add(e.id_pasien);
    });

    // Distribusi kepatuhan pasien aktif (yang punya data jadwal)
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

    // Tren kepatuhan per bulan
    const trenKepatuhan: MonthlyPoint[] = months.map((m) => {
      const ma = monthAgg.get(m.key)!;
      return {
        key: m.key,
        label: m.label,
        value: ma.total > 0 ? Math.round((ma.diminum / ma.total) * 100) : 0,
      };
    });

    // Pasien baru per bulan
    const pasienBaruPerBulan: MonthlyPoint[] = months.map((m) => ({
      key: m.key,
      label: m.label,
      value: pasien.filter(
        (p) => (p.created_at as string)?.slice(0, 7) === m.key,
      ).length,
    }));

    // Pasien aktif per bulan (episode overlap dengan bulan tsb)
    const pasienAktifPerBulan: MonthlyPoint[] = months.map((m) => {
      const set = new Set<number>();
      episodes.forEach((e) => {
        const mulai = e.tanggal_mulai as string | null;
        const selesai = e.tanggal_selesai as string | null;
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
