import LineChart from "@/components/grafik/LineChart";
import { formatTanggalID } from "@/utils/date";
import { parseTensi } from "@/utils/Pasien";
import ChartCard from "../card/ChartCard";
import { PemeriksaanKlinisData } from "@/types/pemeriksaanKlinis";

export default function KlinisCharts({
  klinis,
}: {
  klinis: PemeriksaanKlinisData[];
}) {
  // Representasi BULANAN: ambil 1 pemeriksaan (terbaru) per bulan.
  const asc = [...klinis].sort(
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
            series={[
              { name: "Suhu (°C)", color: "#f59e0b", values: suhu, area: true },
            ]}
            suffix="°"
          />
        </ChartCard>
      </div>
    </div>
  );
}
