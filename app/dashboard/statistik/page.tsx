import { getStatistikAdminAction } from "@/actions/statistik";
import { MonthlyPoint } from "@/types/statistik";
import LineChart from "@/components/charts/LineChart";

export const metadata = { title: "Statistik | NU-TBCare" };

/* --------------------------------- Charts -------------------------------- */

function BarChart({
  points,
  fill = "#f59e0b",
}: {
  points: MonthlyPoint[];
  fill?: string;
}) {
  const W = 680,
    H = 240,
    padL = 40,
    padR = 16,
    padT = 16,
    padB = 28;
  const innerW = W - padL - padR;
  const innerH = H - padT - padB;
  const max = Math.max(...points.map((p) => p.value), 4);
  const n = points.length;
  const slot = innerW / n;
  const barW = Math.min(slot * 0.55, 48);

  const ticks = [0, 0.25, 0.5, 0.75, 1].map((t) => Math.round(max * t));
  const y = (v: number) => padT + innerH * (1 - v / max);

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="h-auto w-full" preserveAspectRatio="xMidYMid meet">
      {ticks.map((t) => (
        <g key={t}>
          <line x1={padL} x2={W - padR} y1={y(t)} y2={y(t)} stroke="#e2e8f0" strokeDasharray="3 3" />
          <text x={4} y={y(t) + 4} fontSize="10" fill="#94a3b8">
            {t}
          </text>
        </g>
      ))}
      {points.map((p, i) => {
        const cx = padL + slot * i + slot / 2;
        const h = innerH * (p.value / max);
        return (
          <g key={p.key}>
            <rect
              x={cx - barW / 2}
              y={padT + innerH - h}
              width={barW}
              height={h}
              rx="4"
              fill={fill}
            >
              <title>
                {p.label}: {p.value} pasien
              </title>
            </rect>
            <text x={cx} y={H - 8} fontSize="11" fill="#64748b" textAnchor="middle">
              {p.label}
            </text>
          </g>
        );
      })}
    </svg>
  );
}

/* --------------------------------- Page ---------------------------------- */

function StatCard({
  label,
  value,
  sub,
  tone = "brand",
}: {
  label: string;
  value: string;
  sub?: string;
  tone?: "brand" | "slate";
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6">
      <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
        {label}
      </p>
      <p
        className={`mt-2 text-4xl font-bold ${
          tone === "brand" ? "text-brand-700" : "text-brand-950"
        }`}
      >
        {value}
      </p>
      {sub && <p className="mt-1 text-sm text-slate-500">{sub}</p>}
    </div>
  );
}

function DistribusiBar({
  label,
  range,
  count,
  total,
  color,
}: {
  label: string;
  range: string;
  count: number;
  total: number;
  color: string;
}) {
  const pct = total > 0 ? Math.round((count / total) * 100) : 0;
  return (
    <div>
      <div className="flex items-center justify-between text-sm">
        <span className="font-medium text-slate-700">
          {label} <span className="text-slate-400">{range}</span>
        </span>
        <span className="font-semibold text-slate-800">{count} pasien</span>
      </div>
      <div className="mt-1.5 h-2.5 w-full overflow-hidden rounded-full bg-slate-100">
        <div className={`h-full rounded-full ${color}`} style={{ width: `${pct}%` }} />
      </div>
      <p className="mt-1 text-xs text-slate-400">{pct}% dari pasien dinilai</p>
    </div>
  );
}

function ChartCard({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6">
      <h2 className="text-base font-semibold text-brand-950">{title}</h2>
      {subtitle && <p className="mt-0.5 text-xs text-slate-400">{subtitle}</p>}
      <div className="mt-4 overflow-x-auto">{children}</div>
    </div>
  );
}

export default async function StatistikPage() {
  const res = await getStatistikAdminAction();

  if (!res.success || !res.data) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-600">
          {res.success ? "Data statistik tidak tersedia." : res.error}
        </div>
      </div>
    );
  }

  const s = res.data;

  return (
    <div className="max-w-7xl mx-auto space-y-6 px-4 sm:px-6 lg:px-8 py-8">
      <div>
        <h1 className="text-2xl font-bold text-brand-950">Statistik</h1>
        <p className="mt-1 text-sm text-slate-500">
          Ringkasan penanganan TB &middot; {s.bulanIniLabel}
        </p>
      </div>

      {/* Kartu ringkas */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
        <StatCard
          label="Pasien Aktif"
          value={String(s.pasienAktif)}
          sub={`dari ${s.totalPasien} pasien terdaftar`}
          tone="slate"
        />
        <StatCard
          label="Rata-rata Kepatuhan"
          value={`${s.rataKepatuhanBulanIni}%`}
          sub={`Bulan ${s.bulanIniLabel}`}
        />
        <StatCard
          label="Pasien Baru"
          value={String(s.pasienBaruBulanIni)}
          sub={`Bulan ${s.bulanIniLabel}`}
          tone="slate"
        />
      </div>

      {/* Distribusi kepatuhan */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6">
        <h2 className="text-base font-semibold text-brand-950">
          Distribusi Kepatuhan Pasien Aktif
        </h2>
        {s.distribusi.totalDinilai === 0 ? (
          <p className="mt-4 rounded-xl bg-slate-50 p-4 text-center text-sm text-slate-500">
            Belum ada data kepatuhan yang bisa dinilai (belum ada laporan minum
            obat).
          </p>
        ) : (
          <div className="mt-4 space-y-4">
            <DistribusiBar
              label="Kepatuhan Baik"
              range="(≥ 80%)"
              count={s.distribusi.baik}
              total={s.distribusi.totalDinilai}
              color="bg-emerald-500"
            />
            <DistribusiBar
              label="Kepatuhan Cukup"
              range="(60 – 79%)"
              count={s.distribusi.cukup}
              total={s.distribusi.totalDinilai}
              color="bg-amber-400"
            />
            <DistribusiBar
              label="Kepatuhan Rendah"
              range="(< 60%)"
              count={s.distribusi.rendah}
              total={s.distribusi.totalDinilai}
              color="bg-red-500"
            />
          </div>
        )}
      </div>

      {/* Tren kepatuhan */}
      <ChartCard
        title="Tren Kepatuhan 6 Bulan Terakhir"
        subtitle="Persentase dosis diminum dari total jadwal per bulan"
      >
        <LineChart
          labels={s.trenKepatuhan.map((p) => p.label)}
          series={[
            {
              color: "var(--brand-600)",
              values: s.trenKepatuhan.map((p) => p.value),
              area: true,
            },
          ]}
          min={0}
          max={100}
          suffix="%"
          showLegend={false}
        />
      </ChartCard>

      {/* Pasien aktif & pasien baru */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <ChartCard title="Jumlah Pasien Aktif" subtitle="Per bulan (6 bulan terakhir)">
          <LineChart
            labels={s.pasienAktifPerBulan.map((p) => p.label)}
            series={[
              {
                color: "#3b82f6",
                values: s.pasienAktifPerBulan.map((p) => p.value),
                area: true,
              },
            ]}
            min={0}
            showLegend={false}
          />
        </ChartCard>
        <ChartCard title="Pasien Baru Per Bulan" subtitle="6 bulan terakhir">
          <BarChart points={s.pasienBaruPerBulan} />
        </ChartCard>
      </div>
    </div>
  );
}
