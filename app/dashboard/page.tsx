import { getServerSession } from "next-auth/next";
import { authOptions } from "../api/auth/[...nextauth]/route";
import MedicationBanner from "@/components/banner/MedicationBanner";
import PatientOverview from "@/components/dashboard/PatientOverview";
import LineChart from "@/components/charts/LineChart";
import {
  getAdherenceAction,
  getPasienProfileAction,
  getTodayMedicationAction,
} from "@/actions/pasienPortal";
import { getStatistikAdminAction } from "@/actions/statistik";
import { AdherenceSummary } from "@/types/pasienPortal";

const EMPTY_SUMMARY: AdherenceSummary = {
  total: 0,
  diminum: 0,
  terlewat: 0,
  belum: 0,
  persentase: 0,
  days: [],
};

function StatTile({
  label,
  value,
  sub,
  accent = "brand",
}: {
  label: string;
  value: string;
  sub?: string;
  accent?: "brand" | "blue" | "amber" | "slate";
}) {
  const accents = {
    brand: "text-brand-700",
    blue: "text-blue-600",
    amber: "text-amber-600",
    slate: "text-slate-700",
  } as const;
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5">
      <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
        {label}
      </p>
      <p className={`mt-2 text-3xl font-bold ${accents[accent]}`}>{value}</p>
      {sub && <p className="mt-0.5 text-xs text-slate-400">{sub}</p>}
    </div>
  );
}

function DistribusiBar({
  label,
  count,
  total,
  color,
}: {
  label: string;
  count: number;
  total: number;
  color: string;
}) {
  const pct = total > 0 ? Math.round((count / total) * 100) : 0;
  return (
    <div>
      <div className="flex items-center justify-between text-sm">
        <span className="text-slate-600">{label}</span>
        <span className="font-semibold text-slate-800">{count}</span>
      </div>
      <div className="mt-1 h-2 w-full overflow-hidden rounded-full bg-slate-100">
        <div
          className={`h-full rounded-full ${color}`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);
  const role = session?.user?.role;

  // --- TAMPILAN KHUSUS PASIEN --- (wrapped by PatientShell in layout.tsx)
  if (role === "pasien") {
    const [profileRes, medRes, adherenceRes] = await Promise.all([
      getPasienProfileAction(),
      getTodayMedicationAction(),
      getAdherenceAction(7),
    ]);

    const profile = profileRes.success ? (profileRes.data ?? null) : null;
    const medication = medRes.success ? (medRes.data ?? null) : null;
    const summary =
      adherenceRes.success && adherenceRes.data
        ? adherenceRes.data
        : EMPTY_SUMMARY;

    return (
      <>
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-brand-950">
            Halo, {profile?.nama_lengkap ?? "Pasien"} 👋
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            Selamat datang di NU-TBCare
            {profile?.domisili ? ` · ${profile.domisili}` : ""}
          </p>
        </div>

        <MedicationBanner medication={medication} />
        <PatientOverview
          summary={summary}
          fase={profile?.episodeAktif?.tipe_pasien}
        />
      </>
    );
  }

  // --- TAMPILAN ADMIN (Super Admin): ringkasan + grafik ---
  const nama = session?.user?.name ?? session?.user?.email ?? "Admin";
  const statRes = await getStatistikAdminAction();
  const stat = statRes.success ? statRes.data : undefined;

  return (
    <div className="max-w-7xl mx-auto space-y-6 px-4 sm:px-6 lg:px-8 py-8">
      <div>
        <h2 className="text-2xl font-bold text-brand-950">
          Selamat datang, {nama} 👋
        </h2>
        <p className="mt-1 text-sm text-slate-500">
          Ringkasan penanganan TB
          {stat?.bulanIniLabel ? ` · ${stat.bulanIniLabel}` : ""}
        </p>
      </div>

      {!stat ? (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-600">
          {statRes.success ? "Data tidak tersedia." : statRes.error}
        </div>
      ) : (
        <>
          {/* Kartu statistik */}
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
            <StatTile
              label="Pasien Aktif"
              value={String(stat.pasienAktif)}
              sub={`dari ${stat.totalPasien} terdaftar`}
              accent="blue"
            />
            <StatTile
              label="Total Pasien"
              value={String(stat.totalPasien)}
              sub="seluruh pasien"
              accent="slate"
            />
            <StatTile
              label="Rata-rata Kepatuhan"
              value={`${stat.rataKepatuhanBulanIni}%`}
              sub={stat.bulanIniLabel}
              accent="brand"
            />
            <StatTile
              label="Pasien Baru"
              value={String(stat.pasienBaruBulanIni)}
              sub={stat.bulanIniLabel}
              accent="amber"
            />
          </div>

          {/* Grafik tren + distribusi */}
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            <div className="rounded-2xl border border-slate-200 bg-white p-6 lg:col-span-2">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-semibold text-brand-950">
                  Tren Kepatuhan 6 Bulan
                </h3>
                <span className="text-xs text-slate-400">Target ≥ 80%</span>
              </div>
              <div className="mt-4 overflow-x-auto">
                <LineChart
                  labels={stat.trenKepatuhan.map((p) => p.label)}
                  series={[
                    {
                      color: "var(--brand-600)",
                      values: stat.trenKepatuhan.map((p) => p.value),
                      area: true,
                    },
                  ]}
                  min={0}
                  max={100}
                  suffix="%"
                  showLegend={false}
                />
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-6">
              <h3 className="text-base font-semibold text-brand-950">
                Distribusi Kepatuhan
              </h3>
              {stat.distribusi.totalDinilai === 0 ? (
                <p className="mt-4 rounded-xl bg-slate-50 p-4 text-center text-xs text-slate-500">
                  Belum ada data kepatuhan yang bisa dinilai.
                </p>
              ) : (
                <div className="mt-4 space-y-4">
                  <DistribusiBar
                    label="Baik (≥ 80%)"
                    count={stat.distribusi.baik}
                    total={stat.distribusi.totalDinilai}
                    color="bg-emerald-500"
                  />
                  <DistribusiBar
                    label="Cukup (60–79%)"
                    count={stat.distribusi.cukup}
                    total={stat.distribusi.totalDinilai}
                    color="bg-amber-400"
                  />
                  <DistribusiBar
                    label="Rendah (< 60%)"
                    count={stat.distribusi.rendah}
                    total={stat.distribusi.totalDinilai}
                    color="bg-red-500"
                  />
                </div>
              )}
            </div>
          </div>

          {/* Pasien baru per bulan */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6">
            <h3 className="text-base font-semibold text-brand-950">
              Pasien Baru Per Bulan
            </h3>
            <div className="mt-4 overflow-x-auto">
              <LineChart
                labels={stat.pasienBaruPerBulan.map((p) => p.label)}
                series={[
                  {
                    color: "#3b82f6",
                    values: stat.pasienBaruPerBulan.map((p) => p.value),
                    area: true,
                  },
                ]}
                min={0}
                showLegend={false}
              />
            </div>
          </div>
        </>
      )}
    </div>
  );
}
