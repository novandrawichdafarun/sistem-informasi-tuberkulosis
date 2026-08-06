import { getStatistikAdminAction } from "@/actions/statistik";
import StatCard from "@/components/card/StatCard";
import DistribusiBar from "@/components/grafik/DistribusiBar";
import LineChart from "@/components/grafik/LineChart";
import ChartCard from "@/components/card/ChartCard";
import BarChart from "@/components/grafik/BarChart";

export const metadata = { title: "Statistik | NU-TBCare" };

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
      <div className="rounded-2xl border border-brand-200 bg-white p-6">
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
        subtitle="Persentase obat yang diminum dari total jadwal per bulan"
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
        <ChartCard
          title="Jumlah Pasien Aktif"
          subtitle="Per bulan (6 bulan terakhir)"
        >
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
