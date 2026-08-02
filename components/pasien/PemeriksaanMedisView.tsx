import { getLabResultsAction } from "@/actions/pasienPortal";
import { formatTanggalID } from "@/utils/date";

function hasilBadgeClass(hasil: string) {
  const v = hasil.toLowerCase();
  if (v.includes("positif")) return "bg-red-100 text-red-700";
  if (v.includes("negatif")) return "bg-green-100 text-green-700";
  return "bg-slate-100 text-slate-600";
}

export default async function PemeriksaanMedisView() {
  const res = await getLabResultsAction();
  const data = res.success && res.data ? res.data : [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-brand-950">Pemeriksaan Medis</h1>
        <p className="mt-1 text-sm text-slate-500">
          Hasil pemeriksaan laboratorium yang dicatat oleh Nakes selama
          pengobatan Anda.
        </p>
      </div>

      {res.success === false && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-600">
          {res.error}
        </div>
      )}

      {data.length === 0 ? (
        <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center text-sm text-slate-500">
          Belum ada data pemeriksaan lab.
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200 text-sm">
              <thead className="bg-slate-50 text-left text-xs font-semibold uppercase text-slate-500">
                <tr>
                  <th className="px-4 py-3">Tanggal Tes</th>
                  <th className="px-4 py-3">Jenis Tes</th>
                  <th className="px-4 py-3">Sample</th>
                  <th className="px-4 py-3">DNA / Resistensi</th>
                  <th className="px-4 py-3">Hasil Tes</th>
                  <th className="px-4 py-3">BTA</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-600">
                {data.map((lab) => (
                  <tr key={lab.id_tes} className="hover:bg-slate-50">
                    <td className="whitespace-nowrap px-4 py-3">
                      <div className="font-medium text-slate-800">
                        {formatTanggalID(lab.tanggal_tes)}
                      </div>
                      <div className="text-xs text-slate-400">
                        {lab.periode_pemeriksaan || "-"}
                      </div>
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 font-medium text-brand-700">
                      {lab.jenis_tes}
                    </td>
                    <td className="px-4 py-3 text-xs">
                      <div>Jenis: {lab.jenis_sample || "-"}</div>
                      <div>Kualitas: {lab.kualitas_sample || "-"}</div>
                    </td>
                    <td className="px-4 py-3 text-xs">
                      <div>
                        DNA:{" "}
                        <span className="font-medium text-slate-800">
                          {lab.dna_bakteri_tb || "-"}
                        </span>
                      </div>
                      <div>
                        Status:{" "}
                        <span
                          className={`font-semibold ${
                            lab.status_resistensi
                              ?.toLowerCase()
                              .includes("resisten")
                              ? "text-red-600"
                              : "text-green-600"
                          }`}
                        >
                          {lab.status_resistensi || "-"}
                        </span>
                      </div>
                    </td>
                    <td className="whitespace-nowrap px-4 py-3">
                      <span
                        className={`inline-flex rounded px-2 py-1 text-xs font-semibold ${hasilBadgeClass(
                          lab.hasil_tes,
                        )}`}
                      >
                        {lab.hasil_tes}
                      </span>
                    </td>
                    <td className="whitespace-nowrap px-4 py-3">
                      <span className="inline-flex rounded bg-slate-100 px-2 py-1 text-xs font-semibold text-slate-600">
                        {lab.hasil_bta || "-"}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
