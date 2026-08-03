import { formatTanggalID } from "@/utils/date";
import { hitungBMI } from "@/utils/number";
import VitalCharts from "@/components/grafik/VitalCharts";
import WeightChart, {
  buildWeightPoints,
} from "@/components/grafik/WeightChart";
import VitalCard from "@/components/card/VitalCard";
import { getPemeriksaanKlinisByUserAction } from "@/actions/pemeriksaanKlinis";

function nilai(v: number | string | null | undefined, unit = "") {
  if (v === null || v === undefined || v === "") return "-";
  return `${v}${unit}`;
}

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

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-brand-950">
          Pemeriksaan Klinis
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          Hasil pemeriksaan tanda vital dan berat badan yang dicatat oleh Nakes
          selama pengobatan Anda.
        </p>
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

          {/* Grafik tren tanda vital */}
          <VitalCharts klinis={data} />

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
                  className={`text-xs ${selisih >= 0 ? "text-brand-700" : "text-red-600"}`}
                >
                  {selisih >= 0 ? "▲" : "▼"} {Math.abs(selisih).toFixed(1)} kg
                  dari awal
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

          {/* Grafik perkembangan berat badan */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6">
            <h2 className="text-base font-semibold text-brand-950">
              Grafik Perkembangan Berat Badan
            </h2>
            {points.length === 0 ? (
              <p className="mt-4 rounded-xl bg-slate-50 p-4 text-center text-sm text-slate-500">
                Belum ada data berat badan. Data akan muncul setelah Nakes
                mencatat pemeriksaan klinis.
              </p>
            ) : (
              <div className="mt-4 overflow-x-auto">
                <WeightChart points={points} />
              </div>
            )}
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
