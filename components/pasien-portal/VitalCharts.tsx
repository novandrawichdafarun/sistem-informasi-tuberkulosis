import LineChart from "@/components/charts/LineChart";
import { PemeriksaanKlinisData } from "@/types/pasienPortal";
import { formatTanggalID } from "@/utils/formatTanggal";

function parseTensi(t?: string | null): { sis: number | null; dia: number | null } {
  if (!t) return { sis: null, dia: null };
  const m = t.match(/(\d{2,3})\s*\/\s*(\d{2,3})/);
  if (!m) return { sis: null, dia: null };
  return { sis: Number(m[1]), dia: Number(m[2]) };
}

function ChartCard({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6">
      <h3 className="text-base font-semibold text-brand-950">{title}</h3>
      <div className="mt-4 overflow-x-auto">{children}</div>
    </div>
  );
}

export default function VitalCharts({
  vitals,
}: {
  vitals: PemeriksaanKlinisData[];
}) {
  // Representasi BULANAN: ambil 1 pemeriksaan (terbaru) per bulan.
  const asc = [...vitals].sort(
    (a, b) =>
      new Date(a.tanggal_periksa).getTime() -
      new Date(b.tanggal_periksa).getTime(),
  );
  const perBulan = new Map<string, PemeriksaanKlinisData>();
  asc.forEach((v) => perBulan.set(v.tanggal_periksa.slice(0, 7), v)); // asc → nilai terakhir = terbaru
  const data = [...perBulan.keys()].sort().map((k) => perBulan.get(k)!);

  const labels = data.map((d) =>
    formatTanggalID(d.tanggal_periksa, { month: "short", year: "numeric" }),
  );
  const tensi = data.map((d) => parseTensi(d.tensi));
  const sistolik = tensi.map((t) => t.sis);
  const diastolik = tensi.map((t) => t.dia);
  const nadi = data.map((d) => d.nadi ?? null);
  const napas = data.map((d) => d.pernapasan ?? null);
  const suhu = data.map((d) => (d.suhu != null ? Number(d.suhu) : null));

  return (
    <div className="space-y-6">
      <ChartCard title="Tren Tekanan Darah">
        <LineChart
          labels={labels}
          series={[
            { name: "Sistolik", color: "#ef4444", values: sistolik },
            { name: "Diastolik", color: "#3b82f6", values: diastolik },
          ]}
        />
      </ChartCard>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <ChartCard title="Nadi & Pernapasan">
          <LineChart
            labels={labels}
            series={[
              { name: "Nadi (bpm)", color: "#ec4899", values: nadi },
              { name: "Napas (x/mnt)", color: "#14b8a6", values: napas },
            ]}
          />
        </ChartCard>
        <ChartCard title="Suhu Tubuh">
          <LineChart
            labels={labels}
            series={[{ name: "Suhu (°C)", color: "#f59e0b", values: suhu, area: true }]}
            suffix="°"
          />
        </ChartCard>
      </div>
    </div>
  );
}
