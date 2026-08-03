import { getPemeriksaanLabByUserAction } from "@/actions/pemeriksaanLab";
import { formatTanggalID } from "@/utils/date";
import { PemeriksaanLabIcon } from "@/components/asset/icons";

export default async function PemeriksaanMedisView() {
  const res = await getPemeriksaanLabByUserAction();
  const data = res.success && res.data ? res.data : [];

  return (
    <div className="space-y-6">
      <div className="flex items-start gap-3">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-brand-100 text-brand-700">
          <PemeriksaanLabIcon className="h-6 w-6" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-brand-950">
            Pemeriksaan Medis
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Hasil pemeriksaan laboratorium yang dicatat oleh Nakes selama
            pengobatan Anda.
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
          Belum ada data pemeriksaan lab.
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200 text-sm">
              <thead className="bg-slate-50 text-left text-xs font-semibold uppercase text-slate-500">
                <tr>
                  <th className="px-4 py-3">Periode Tes</th>
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
                        {lab.periode_pemeriksaan}
                      </div>
                      <div className="text-xs text-slate-400">
                        {formatTanggalID(lab.tanggal_tes)}
                      </div>
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 font-medium text-brand-700">
                      {lab.jenis_tes}
                    </td>
                    <td className="px-4 py-3 text-xs">
                      <div>Jenis: {lab.jenis_sample}</div>
                      <div>Kualitas: {lab.kualitas_sample}</div>
                    </td>
                    <td className="px-4 py-3 text-xs">
                      <div>
                        DNA:{" "}
                        <span className="font-medium text-slate-800">
                          {lab.dna_bakteri_tb}
                        </span>
                      </div>
                      <div>
                        Status:{" "}
                        <span
                          className={`font-semibold ${
                            lab.status_resistensi
                              .toLowerCase()
                              .includes("resisten")
                              ? "text-red-600"
                              : "text-green-600"
                          }`}
                        >
                          {lab.status_resistensi}
                        </span>
                      </div>
                    </td>
                    <td className="whitespace-nowrap px-4 py-3">
                      <span
                        className={`inline-flex rounded px-2 py-1 text-xs font-semibold ${
                          lab.hasil_tes === "N"
                            ? "bg-red-100 text-red-600"
                            : "bg-green-100 text-green-600"
                        }`}
                      >
                        {lab.hasil_tes === "N" ? "Negatif" : "Positif"}
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
