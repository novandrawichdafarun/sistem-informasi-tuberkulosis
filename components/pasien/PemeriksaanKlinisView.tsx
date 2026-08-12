import { formatTanggalID } from "@/utils/date";
import { hitungBMI, nilai } from "@/utils/number";
import VitalCharts from "@/components/grafik/VitalCharts";
import VitalBarChart from "@/components/grafik/VitalBarChart";
import { buildWeightPoints } from "@/components/grafik/WeightChart";
import VitalCard from "@/components/card/VitalCard";
import { getPemeriksaanKlinisByUserAction } from "@/actions/pemeriksaanKlinis";
import { PemeriksaanKlinisIcon } from "@/components/asset/icons";
import { TrendingUp, TrendingDown } from "lucide-react";

export default async function PemeriksaanKlinisView() {
  const res = await getPemeriksaanKlinisByUserAction();
  const data = res.success && res.data ? res.data : [];
  const terbaru = data[0];

  const points = buildWeightPoints(data);
  const beratAwal = points.length ? points[0].berat : null;
  const beratTerakhir = points.length ? points[points.length - 1].berat : null;
  const tinggi = data.find((v) => v.tinggi_badan != null)?.tinggi_badan ?? null;
  const bmiResult = hitungBMI(beratTerakhir, tinggi);
  const selisih =
    beratAwal != null && beratTerakhir != null
      ? beratTerakhir - beratAwal
      : null;

  // Agregasi bulanan: 1 pemeriksaan (terbaru) per bulan → perubahan per bulan.
  const ascBulan = [...data].sort(
    (a, b) =>
      new Date(a.tanggal_periksa).getTime() -
      new Date(b.tanggal_periksa).getTime(),
  );
  const perBulan = new Map<string, (typeof data)[number]>();
  ascBulan.forEach((v) => perBulan.set(v.tanggal_periksa.slice(0, 7), v));
  const bulan = [...perBulan.keys()].sort().map((k) => perBulan.get(k)!);
  const bulanLabels = bulan.map((d) =>
    formatTanggalID(d.tanggal_periksa, { month: "short", year: "numeric" }),
  );
  const tinggiValues = bulan.map((d) => d.tinggi_badan ?? null);
  const beratValues = bulan.map((d) => d.berat_badan ?? null);
  const adaTinggi = tinggiValues.some((v) => v != null);
  const adaBerat = beratValues.some((v) => v != null);

  return (
    <div className="space-y-6">
      <div className="flex items-start gap-3">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-brand-100 text-brand-700">
          <PemeriksaanKlinisIcon className="h-6 w-6" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-brand-950">
            Pemeriksaan Klinis
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Hasil pemeriksaan tanda vital dan berat badan yang dicatat oleh
            Nakes selama pengobatan Anda.
          </p>
        </div>
      </div>

      {res.success === false && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-600">
          {res.error}
        </div>
      )}

      {data.length === 0 ? (
        <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center text-sm text-slate-500">
          Belum ada data pemeriksaan klinis.
        </div>
      ) : (
        <>
          {/* Kartu ringkas pemeriksaan terbaru */}
          {terbaru && (
            <div>
              <p className="mb-3 text-sm text-slate-500">
                Pemeriksaan terbaru · {formatTanggalID(terbaru.tanggal_periksa)}
              </p>
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
                <VitalCard label="Tensi" value={nilai(terbaru.tensi)} />
                <VitalCard label="Suhu" value={nilai(terbaru.suhu, " °C")} />
                <VitalCard label="Nadi" value={nilai(terbaru.nadi, " bpm")} />
                <VitalCard
                  label="Napas"
                  value={nilai(terbaru.pernapasan, " /mnt")}
                />
                <VitalCard
                  label="SpO₂"
                  value={nilai(terbaru.saturasi_o2, " %")}
                />
                <VitalCard
                  label="Berat"
                  value={nilai(terbaru.berat_badan, " kg")}
                />
              </div>
            </div>
          )}

          {/* Grafik tren tanda vital (suhu ditampilkan sebagai grafik batang) */}
          <VitalCharts klinis={data} suhuChart="bar" />

          {/* Tabel riwayat tanda vital */}
          <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-slate-200 text-sm">
                <thead className="bg-slate-50 text-left text-xs font-semibold uppercase text-slate-500">
                  <tr>
                    <th className="px-4 py-3">Tanggal</th>
                    <th className="px-4 py-3">Tensi</th>
                    <th className="px-4 py-3">Suhu</th>
                    <th className="px-4 py-3">Nadi</th>
                    <th className="px-4 py-3">Napas</th>
                    <th className="px-4 py-3">SpO₂</th>
                    <th className="px-4 py-3">TB / BB</th>
                    <th className="px-4 py-3">Keluhan</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-600">
                  {data.map((r) => (
                    <tr key={r.id_periksa} className="hover:bg-slate-50">
                      <td className="whitespace-nowrap px-4 py-3 font-medium text-slate-800">
                        {formatTanggalID(r.tanggal_periksa)}
                      </td>
                      <td className="whitespace-nowrap px-4 py-3">
                        {nilai(r.tensi)}
                      </td>
                      <td className="whitespace-nowrap px-4 py-3">
                        {nilai(r.suhu, " °C")}
                      </td>
                      <td className="whitespace-nowrap px-4 py-3">
                        {nilai(r.nadi)}
                      </td>
                      <td className="whitespace-nowrap px-4 py-3">
                        {nilai(r.pernapasan)}
                      </td>
                      <td className="whitespace-nowrap px-4 py-3">
                        {nilai(r.saturasi_o2, " %")}
                      </td>
                      <td className="whitespace-nowrap px-4 py-3">
                        {nilai(r.tinggi_badan, " cm")} /{" "}
                        {nilai(r.berat_badan, " kg")}
                      </td>
                      <td className="max-w-[16rem] px-4 py-3">
                        {r.keluhan || "-"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Ringkasan berat badan */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-4">
            <div className="rounded-2xl border border-slate-200 bg-white p-6">
              <p className="text-sm text-slate-500">Berat awal</p>
              <p className="mt-1 text-3xl font-bold text-brand-950">
                {beratAwal != null ? `${beratAwal} kg` : "-"}
              </p>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-white p-6">
              <p className="text-sm text-slate-500">Berat terkini</p>
              <p className="mt-1 text-3xl font-bold text-brand-950">
                {beratTerakhir != null ? `${beratTerakhir} kg` : "-"}
              </p>
              {selisih != null && (
                <p
                  className={`mt-1 inline-flex items-center gap-1 text-xs ${selisih >= 0 ? "text-brand-700" : "text-red-600"}`}
                >
                  {selisih >= 0 ? (
                    <TrendingUp className="h-3.5 w-3.5" strokeWidth={2} />
                  ) : (
                    <TrendingDown className="h-3.5 w-3.5" strokeWidth={2} />
                  )}
                  {Math.abs(selisih).toFixed(1)} kg dari awal
                </p>
              )}
            </div>
            <div className="rounded-2xl border border-slate-200 bg-white p-6">
              <p className="text-sm text-slate-500">Tinggi badan</p>
              <p className="mt-1 text-3xl font-bold text-brand-950">
                {tinggi != null ? `${tinggi} cm` : "-"}
              </p>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-white p-6">
              <p className="text-sm text-slate-500">IMT (BMI)</p>
              {bmiResult ? (
                <>
                  <p className="mt-1 text-3xl font-bold text-brand-950">
                    {bmiResult.nilai}
                  </p>
                  <p
                    className={`text-xs font-semibold ${bmiResult.colorClass}`}
                  >
                    {bmiResult.kategori}
                  </p>
                </>
              ) : (
                <p className="mt-1 text-3xl font-bold text-slate-300">-</p>
              )}
            </div>
          </div>

          {/* Grafik tinggi & berat badan — 2 blok terpisah, per bulan */}
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            {/* Tinggi Badan */}
            <div className="rounded-2xl border border-slate-200 bg-white p-6">
              <h2 className="text-base font-semibold text-brand-950">
                Tinggi Badan
              </h2>
              <p className="mt-1 text-sm text-slate-500">
                Perubahan tinggi badan per bulan.
              </p>
              {!adaTinggi ? (
                <p className="mt-4 rounded-xl bg-slate-50 p-4 text-center text-sm text-slate-500">
                  Belum ada data tinggi badan. Data akan muncul setelah Nakes
                  mencatat pemeriksaan klinis.
                </p>
              ) : (
                <div className="mt-4 overflow-x-auto">
                  <VitalBarChart
                    labels={bulanLabels}
                    values={tinggiValues}
                    color="#3b82f6"
                    suffix=" cm"
                    name="Tinggi"
                  />
                </div>
              )}
            </div>

            {/* Berat Badan */}
            <div className="rounded-2xl border border-slate-200 bg-white p-6">
              <h2 className="text-base font-semibold text-brand-950">
                Berat Badan
              </h2>
              <p className="mt-1 text-sm text-slate-500">
                Perubahan berat badan per bulan.
              </p>
              {!adaBerat ? (
                <p className="mt-4 rounded-xl bg-slate-50 p-4 text-center text-sm text-slate-500">
                  Belum ada data berat badan. Data akan muncul setelah Nakes
                  mencatat pemeriksaan klinis.
                </p>
              ) : (
                <div className="mt-4 overflow-x-auto">
                  <VitalBarChart
                    labels={bulanLabels}
                    values={beratValues}
                    color="var(--brand-600)"
                    suffix=" kg"
                    name="Berat"
                  />
                </div>
              )}
            </div>
          </div>

          {/* Riwayat berat badan */}
          {points.length > 0 && (
            <div className="rounded-2xl border border-slate-200 bg-white p-6">
              <h2 className="text-base font-semibold text-brand-950">
                Riwayat Berat Badan
              </h2>
              <ul className="mt-4 divide-y divide-slate-100">
                {[...points].reverse().map((p, idx, arr) => {
                  const prev = arr[idx + 1];
                  const delta = prev ? p.berat - prev.berat : null;
                  return (
                    <li
                      key={p.tanggal}
                      className="flex items-center justify-between py-3"
                    >
                      <span className="text-sm font-medium text-slate-700">
                        {formatTanggalID(p.tanggal)}
                      </span>
                      <span className="flex items-center gap-3">
                        <span className="text-lg font-bold text-brand-950">
                          {p.berat} kg
                        </span>
                        {delta != null ? (
                          <span
                            className={`rounded-full px-2 py-0.5 text-xs font-semibold ${
                              delta >= 0
                                ? "bg-brand-50 text-brand-700"
                                : "bg-red-50 text-red-600"
                            }`}
                          >
                            {delta >= 0 ? "+" : ""}
                            {delta.toFixed(1)} kg
                          </span>
                        ) : (
                          <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs text-slate-400">
                            Awal
                          </span>
                        )}
                      </span>
                    </li>
                  );
                })}
              </ul>
            </div>
          )}
        </>
      )}
    </div>
  );
}
