import LineChart from "../grafik/LineChart";
import DistribusiBar from "../grafik/DistribusiBar";
import StatTile from "../grafik/StatTile";

type AdminOverviewProps = {
  pasienAktif: number;
  totalPasien: number;
  rataKepatuhanBulanIni: number;
  bulanIniLabel: string;
  pasienBaruBulanIni: number;
  trenKepatuhan: { label: string; value: number }[];
  distribusi: {
    totalDinilai: number;
    baik: number;
    cukup: number;
    rendah: number;
  };
  pasienBaruPerBulan: { label: string; value: number }[];
};

export default function AdminOverview(stat: AdminOverviewProps) {
  return (
    <>
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

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="rounded-2xl border border-brand-200 bg-white p-6 lg:col-span-2">
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

        <div className="rounded-2xl border border-brand-200 bg-white p-6">
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
                range="≥ 80%"
                count={stat.distribusi.baik}
                total={stat.distribusi.totalDinilai}
                color="bg-emerald-500"
              />
              <DistribusiBar
                label="Cukup (60–79%)"
                range="60–79%"
                count={stat.distribusi.cukup}
                total={stat.distribusi.totalDinilai}
                color="bg-amber-400"
              />
              <DistribusiBar
                label="Rendah (< 60%)"
                range="< 60%"
                count={stat.distribusi.rendah}
                total={stat.distribusi.totalDinilai}
                color="bg-red-500"
              />
            </div>
          )}
        </div>
      </div>

      <div className="rounded-2xl border border-brand-200 bg-white p-6">
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
  );
}
