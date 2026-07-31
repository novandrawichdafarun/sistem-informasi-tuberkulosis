import { formatTanggalID } from "@/utils/date";
import { hitungBMI } from "@/utils/number";
import WeightChart, {
  buildWeightPoints,
} from "@/components/grafik/WeightChart";
import { getPemeriksaanKlinisByUserAction } from "@/actions/pemeriksaanKlinis";

export const metadata = { title: "Berat Badan | NU-TBCare" };

export default async function BeratBadanPage() {
  const vitalRes = await getPemeriksaanKlinisByUserAction();
  const klinis = vitalRes.success && vitalRes.data ? vitalRes.data : [];

  const points = buildWeightPoints(klinis);

  const beratAwal = points.length ? points[0].berat : null;
  const beratTerakhir = points.length ? points[points.length - 1].berat : null;
  const tinggi =
    klinis.find((v) => v.tinggi_badan != null)?.tinggi_badan ?? null;
  const bmiResult = hitungBMI(beratTerakhir, tinggi);
  const selisih =
    beratAwal != null && beratTerakhir != null
      ? beratTerakhir - beratAwal
      : null;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-brand-950">Berat Badan</h1>
        <p className="mt-1 text-sm text-slate-500">
          Pantau perkembangan berat badan Anda selama masa pengobatan TB.
        </p>
      </div>

      {/* Ringkasan */}
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
              {selisih >= 0 ? "▲" : "▼"} {Math.abs(selisih).toFixed(1)} kg dari
              awal
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
              <p className={`text-xs font-semibold ${bmiResult.colorClass}`}>
                {bmiResult.kategori}
              </p>
            </>
          ) : (
            <p className="mt-1 text-3xl font-bold text-slate-300">-</p>
          )}
        </div>
      </div>

      {/* Grafik */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6">
        <h2 className="text-base font-semibold text-brand-950">
          Grafik Perkembangan Berat Badan
        </h2>
        {points.length === 0 ? (
          <p className="mt-4 rounded-xl bg-slate-50 p-4 text-center text-sm text-slate-500">
            Belum ada data berat badan. Data akan muncul setelah Nakes mencatat
            pemeriksaan klinis.
          </p>
        ) : (
          <div className="mt-4 overflow-x-auto">
            <WeightChart points={points} />
          </div>
        )}
      </div>

      {/* Tabel riwayat */}
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
    </div>
  );
}
