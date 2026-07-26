import Link from "next/link";
import { getPasienDetailAction } from "@/actions/pasienDetail";
import { formatTanggalID } from "@/utils/date";
import VitalCharts from "@/components/grafik/VitalCharts";
import WeightChart, {
  buildWeightPoints,
} from "@/components/grafik/WeightChart";
import Section from "@/components/molecules/Section";
import Info from "@/components/molecules/Info";
import Donut from "@/components/grafik/Donut";

export const metadata = { title: "Detail Pasien | NU-TBCare" };

export default async function PasienDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const idNum = Number(id);

  if (!Number.isFinite(idNum)) {
    return (
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <p className="text-sm text-red-600">ID pasien tidak valid.</p>
      </div>
    );
  }

  const res = await getPasienDetailAction(idNum);

  if (!res.success || !res.data) {
    return (
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Link
          href="/dashboard/pasien"
          className="text-sm text-brand-600 hover:underline"
        >
          ← Kembali ke daftar pasien
        </Link>
        <div className="mt-4 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-600">
          {res.success ? "Data pasien tidak ditemukan." : res.error}
        </div>
      </div>
    );
  }

  const { profil, episodes, vitals, lab, adherence } = res.data;
  const episodeAktif = episodes.find((e) => e.status_episode === "aktif");
  const weightPoints = buildWeightPoints(vitals);

  return (
    <div className="max-w-6xl mx-auto space-y-6 px-4 sm:px-6 lg:px-8 py-8">
      <div>
        <Link
          href="/dashboard/pasien"
          className="text-sm text-brand-600 hover:underline"
        >
          ← Kembali ke daftar pasien
        </Link>
        <div className="mt-2 flex items-center gap-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-brand-600 text-xl font-bold text-white">
            {profil.nama_lengkap.charAt(0).toUpperCase()}
          </div>
          <div>
            <h1 className="text-2xl font-bold text-brand-950">
              {profil.nama_lengkap}
            </h1>
            <p className="text-sm text-slate-500">
              {profil.jenis_kelamin === "L" ? "Laki-laki" : "Perempuan"} ·{" "}
              {profil.usia || "-"}
              {episodeAktif ? (
                <span className="ml-2 rounded-full bg-blue-50 px-2 py-0.5 text-xs font-medium text-blue-700">
                  Episode Aktif
                </span>
              ) : (
                <span className="ml-2 rounded-full bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-500">
                  Tidak Ada Episode Aktif
                </span>
              )}
            </p>
          </div>
        </div>
      </div>

      {/* Data diri */}
      <Section title="Data Diri">
        <dl className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          <Info label="Email Akun" value={profil.users?.email} />
          <Info label="No. Telepon" value={profil.no_telp} />
          <Info label="Domisili" value={profil.domisili} />
          <Info label="Kelompok Usia" value={profil.usia} />
          <Info label="Pendidikan" value={profil.pendidikan} />
          <Info label="Pekerjaan" value={profil.pekerjaan} />
          <Info label="Pendapatan" value={profil.pendapatan} />
          <Info label="Terdaftar" value={formatTanggalID(profil.created_at)} />
        </dl>
      </Section>

      {/* Riwayat kepatuhan */}
      <Section title="Riwayat Kepatuhan (30 hari)">
        {adherence.total === 0 ? (
          <p className="rounded-xl bg-slate-50 p-4 text-center text-sm text-slate-500">
            Belum ada jadwal/laporan minum obat.
          </p>
        ) : (
          <div className="flex flex-col items-center gap-6 sm:flex-row">
            <Donut percent={adherence.persentase} />
            <div className="grid flex-1 grid-cols-3 gap-3 text-center">
              <div className="rounded-xl bg-brand-50 p-4">
                <p className="text-2xl font-bold text-brand-700">
                  {adherence.diminum}
                </p>
                <p className="text-xs text-slate-500">Diminum</p>
              </div>
              <div className="rounded-xl bg-red-50 p-4">
                <p className="text-2xl font-bold text-red-600">
                  {adherence.terlewat}
                </p>
                <p className="text-xs text-slate-500">Terlewat</p>
              </div>
              <div className="rounded-xl bg-slate-50 p-4">
                <p className="text-2xl font-bold text-slate-500">
                  {adherence.belum}
                </p>
                <p className="text-xs text-slate-500">Belum lapor</p>
              </div>
            </div>
          </div>
        )}
      </Section>

      {/* Tanda vital */}
      {vitals.length === 0 ? (
        <Section title="Tanda Vital">
          <p className="rounded-xl bg-slate-50 p-4 text-center text-sm text-slate-500">
            Belum ada data pemeriksaan klinis.
          </p>
        </Section>
      ) : (
        <div>
          <h2 className="mb-3 text-base font-semibold text-brand-950">
            Tanda Vital
          </h2>
          <VitalCharts vitals={vitals} />
        </div>
      )}

      {/* Berat badan */}
      <Section title="Perkembangan Berat Badan">
        {weightPoints.length === 0 ? (
          <p className="rounded-xl bg-slate-50 p-4 text-center text-sm text-slate-500">
            Belum ada data berat badan.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <WeightChart points={weightPoints} />
          </div>
        )}
      </Section>

      {/* Hasil lab */}
      <Section title="Hasil Laboratorium">
        {lab.length === 0 ? (
          <p className="rounded-xl bg-slate-50 p-4 text-center text-sm text-slate-500">
            Belum ada hasil lab.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200 text-sm">
              <thead className="text-left text-xs font-semibold uppercase text-slate-500">
                <tr>
                  <th className="py-2 pr-4">Tanggal</th>
                  <th className="py-2 pr-4">Jenis</th>
                  <th className="py-2 pr-4">Hasil</th>
                  <th className="py-2 pr-4">Periode</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-600">
                {lab.map((l) => (
                  <tr key={l.id_tes}>
                    <td className="py-2 pr-4">
                      {formatTanggalID(l.tanggal_tes)}
                    </td>
                    <td className="py-2 pr-4 font-medium text-slate-800">
                      {l.jenis_tes}
                    </td>
                    <td className="py-2 pr-4">{l.hasil_tes}</td>
                    <td className="py-2 pr-4">
                      {l.periode_pemeriksaan || "-"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Section>

      {/* Riwayat episode */}
      <Section title="Riwayat Episode Pengobatan">
        {episodes.length === 0 ? (
          <p className="rounded-xl bg-slate-50 p-4 text-center text-sm text-slate-500">
            Belum ada episode pengobatan.
          </p>
        ) : (
          <ul className="divide-y divide-slate-100">
            {episodes.map((e) => (
              <li
                key={e.id_episode}
                className="flex items-center justify-between py-3 text-sm"
              >
                <div>
                  <p className="font-medium text-slate-800">
                    {e.tipe_pasien || "-"}
                  </p>
                  <p className="text-xs text-slate-400">
                    {formatTanggalID(e.tanggal_mulai)} —{" "}
                    {e.tanggal_selesai
                      ? formatTanggalID(e.tanggal_selesai)
                      : "sekarang"}
                  </p>
                </div>
                <span
                  className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${
                    e.status_episode === "aktif"
                      ? "bg-blue-50 text-blue-700"
                      : "bg-emerald-50 text-emerald-700"
                  }`}
                >
                  {e.status_episode}
                </span>
              </li>
            ))}
          </ul>
        )}
      </Section>
    </div>
  );
}
