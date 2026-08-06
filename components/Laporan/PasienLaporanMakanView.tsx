import { formatWaktuID, todayISO, getDayCount, addDays } from "@/utils/date";
import LaporanMakanForm from "./LaporanMakanForm";
import { getRiwayatMakanAction } from "@/actions/laporan";
import { getPasienProfileAction } from "@/actions/pasien";
import InfoStat from "@/components/card/InfoStat";
import {
  MealIcon,
  ClipboardIcon,
  CalendarIcon,
} from "@/components/asset/icons";

const TARGET_PER_HARI = 3;

export default async function PasienLaporanMakanView() {
  const [res, profileRes] = await Promise.all([
    getRiwayatMakanAction(),
    getPasienProfileAction(),
  ]);
  const data = res.success && res.data ? res.data : [];
  const profile = profileRes.success ? (profileRes.data ?? null) : null;
  const episode = profile?.episodeAktif ?? null;
  const isEpisodeActive = episode?.status_episode === "aktif";

  const todayDate = todayISO();
  // waktu_makan tersimpan sebagai UTC → konversi ke tanggal lokal dulu agar
  // laporan hari ini terhitung dengan benar (bukan dibandingkan string UTC mentah).
  const tglLokal = (iso: string) => {
    const d = new Date(iso);
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(
      2,
      "0",
    )}-${String(d.getDate()).padStart(2, "0")}`;
  };
  const todaysReports = data.filter(
    (d) => tglLokal(d.waktu_makan) === todayDate,
  );

  // Kepatuhan makan per episode aktif: model "mulai 100%, berkurang tiap porsi
  // tidak dilaporkan". Target 3x/hari, hanya menilai hari yang sudah SELESAI
  // (hari ini diberi grace, ditampilkan terpisah) — samakan dengan minum obat.
  let persentase = 100;
  let laporanEpisode = 0;
  let hariBerjalan = 0;
  if (episode?.tanggal_mulai) {
    const mulai = episode.tanggal_mulai.slice(0, 10);
    const kemarin = addDays(todayDate, -1);
    hariBerjalan = getDayCount(mulai, todayDate);

    // Total laporan sepanjang episode (termasuk hari ini) untuk kartu ringkasan.
    laporanEpisode = data.filter(
      (d) => tglLokal(d.waktu_makan) >= mulai,
    ).length;

    // Penilaian hanya untuk hari yang sudah selesai (mulai s/d kemarin).
    if (mulai <= kemarin) {
      const hariSelesai = getDayCount(mulai, kemarin);
      const target = hariSelesai * TARGET_PER_HARI;
      const terlaporSelesai = data.filter((d) => {
        const tgl = tglLokal(d.waktu_makan);
        return tgl >= mulai && tgl <= kemarin;
      }).length;
      persentase =
        target > 0
          ? Math.min(100, Math.round((terlaporSelesai / target) * 100))
          : 100;
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-start gap-3">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-amber-100 text-amber-600">
          <MealIcon className="h-6 w-6" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-brand-950">Laporan Makanan</h1>
          <p className="mt-1 text-sm text-slate-500">
            Catat asupan makanan harian Anda selama masa pengobatan TB.
          </p>
        </div>
      </div>

      {res.success === false && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-600">
          {res.error}
        </div>
      )}

      {/* Ringkasan kepatuhan makan */}
      {episode ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <InfoStat
            icon={MealIcon}
            tone="amber"
            label="Kepatuhan Makan"
            value={`${persentase}%`}
            sub={`target ${TARGET_PER_HARI}x/hari`}
          />
          <InfoStat
            icon={CalendarIcon}
            tone="brand"
            label="Hari Ini"
            value={`${todaysReports.length}/${TARGET_PER_HARI}`}
            sub="porsi dilaporkan"
          />
          <InfoStat
            icon={ClipboardIcon}
            tone="blue"
            label="Total Laporan"
            value={String(laporanEpisode)}
            sub={`selama ${hariBerjalan} hari episode`}
          />
        </div>
      ) : (
        <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-500">
          Persentase kepatuhan makan akan muncul setelah Anda memiliki episode
          pengobatan aktif.
        </div>
      )}

      <LaporanMakanForm
        todaysReports={todaysReports}
        isEpisodeActive={isEpisodeActive}
        id_episode={episode?.id_episode}
      />

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
        <div className="border-b border-slate-100 px-6 py-4">
          <h2 className="text-base font-semibold text-brand-950">
            Riwayat Laporan Makan
          </h2>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200 text-sm">
            <thead className="bg-slate-50 text-left text-xs font-semibold uppercase text-slate-500">
              <tr>
                <th className="px-4 py-3">Waktu Makan</th>
                <th className="px-4 py-3">Karbohidrat</th>
                <th className="px-4 py-3">Protein</th>
                <th className="px-4 py-3">Serat</th>
                <th className="px-4 py-3">Catatan</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-600">
              {data.length === 0 ? (
                <tr>
                  <td
                    colSpan={5}
                    className="px-4 py-10 text-center text-slate-400"
                  >
                    Belum ada laporan makan. Mulai catat lewat form di atas.
                  </td>
                </tr>
              ) : (
                data.map((r) => (
                  <tr key={r.id_laporan} className="hover:bg-slate-50">
                    <td className="whitespace-nowrap px-4 py-3 font-medium text-slate-800">
                      {formatWaktuID(r.waktu_makan)}
                    </td>
                    <td className="px-4 py-3">{r.karbo}</td>
                    <td className="px-4 py-3">{r.protein}</td>
                    <td className="px-4 py-3">{r.serat}</td>
                    <td className="max-w-[16rem] px-4 py-3">
                      {r.catatan || "-"}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
