import LineChart from "@/components/charts/LineChart";
import { PemeriksaanKlinisData } from "@/types/pasienPortal";
import { formatTanggalID } from "@/utils/formatTanggal";

export type WeightPoint = { label: string; berat: number; tanggal: string };

// Titik berat badan BULANAN: 1 pengukuran (terbaru) per bulan.
export function buildWeightPoints(
  vitals: PemeriksaanKlinisData[],
): WeightPoint[] {
  const asc = [...vitals]
    .filter((v) => v.berat_badan != null)
    .sort(
      (a, b) =>
        new Date(a.tanggal_periksa).getTime() -
        new Date(b.tanggal_periksa).getTime(),
    );

  const perBulan = new Map<string, PemeriksaanKlinisData>();
  asc.forEach((v) => perBulan.set(v.tanggal_periksa.slice(0, 7), v));

  return [...perBulan.keys()].sort().map((k) => {
    const v = perBulan.get(k)!;
    return {
      tanggal: v.tanggal_periksa,
      label: formatTanggalID(v.tanggal_periksa, {
        month: "short",
        year: "numeric",
      }),
      berat: Number(v.berat_badan),
    };
  });
}

export default function WeightChart({ points }: { points: WeightPoint[] }) {
  return (
    <LineChart
      labels={points.map((p) => p.label)}
      series={[
        { name: "Berat (kg)", color: "var(--brand-600)", values: points.map((p) => p.berat), area: true },
      ]}
      showLegend={false}
    />
  );
}
