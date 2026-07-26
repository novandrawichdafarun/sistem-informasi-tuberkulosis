import { getVitalSignsAction } from "@/actions/pasienPortal";
import { formatTanggalID } from "@/utils/formatTanggal";
import VitalCharts from "@/components/pasien-portal/VitalCharts";

export const metadata = { title: "Tanda Vital | NU-TBCare" };

function nilai(v: number | string | null | undefined, unit = "") {
  if (v === null || v === undefined || v === "") return "-";
  return `${v}${unit}`;
}

export default async function TandaVitalPage() {
  const res = await getVitalSignsAction();
  const data = res.success && res.data ? res.data : [];
  const terbaru = data[0];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-brand-950">Tanda Vital</h1>
        <p className="mt-1 text-sm text-slate-500">
          Hasil pemeriksaan klinis yang dicatat oleh Nakes selama pengobatan
          Anda.
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
          <VitalCharts vitals={data} />

          {/* Tabel riwayat */}
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
        </>
      )}
    </div>
  );
}

function VitalCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4">
      <p className="text-xs text-slate-500">{label}</p>
      <p className="mt-1 text-lg font-bold text-brand-950">{value}</p>
    </div>
  );
}
