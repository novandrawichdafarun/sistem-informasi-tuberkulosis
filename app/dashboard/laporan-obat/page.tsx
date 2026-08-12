import MedicationBanner from "@/components/banner/MedicationBanner";
import {
  getJadwalByPasienIdAction,
  getKepatuhanAction,
} from "@/actions/laporan";
import {
  formatTanggalID,
  formatJam,
  formatWaktuID,
  todayISO,
} from "@/utils/date";
import StatusMinum from "@/components/Laporan/StatusMinum";
import InfoStat from "@/components/card/InfoStat";
import { hitungKepatuhanObat } from "@/utils/kepatuhan";
import { PillIcon, CheckIcon, CloseIcon } from "@/components/asset/icons";

export const metadata = { title: "Laporan Obat Harian | NU-TBCare" };

export default async function LaporanObatPage() {
  const [jadwalRes, kepatuhanRes] = await Promise.all([
    getJadwalByPasienIdAction(),
    getKepatuhanAction(14),
  ]);

  const jadwalHariIni =
    jadwalRes.success && jadwalRes.data ? jadwalRes.data : [];
  const ringkasan =
    kepatuhanRes.success && kepatuhanRes.data
      ? kepatuhanRes.data
      : {
          total: 0,
          diminum: 0,
          terlewat: 0,
          belum: 0,
          persentase: 0,
          days: [],
        };
  const today = todayISO();
  const yesterday = new Date(new Date(today).getTime() - 24 * 60 * 60 * 1000)
    .toISOString()
    .split("T")[0];

  // Filter: tampilkan jika sudah dilaporkan OR (belum dilaporkan tapi tanggal <= kemarin)
  const filteredDays = ringkasan.days
    .filter((d) => d.status !== null || d.tanggal <= yesterday)
    .reverse();

  // Kepatuhan 14 hari: model "mulai 100%, berkurang tiap telat/belum lapor".
  const k = hitungKepatuhanObat(ringkasan.days, todayISO());

  return (
    <div className="space-y-6">
      <div className="flex items-start gap-3">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-brand-100 text-brand-700">
          <PillIcon className="h-6 w-6" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-brand-950">
            Laporan Obat Harian
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Konfirmasi minum obat Anda setiap hari agar Nakes dapat memantau
            kepatuhan pengobatan.
          </p>
        </div>
      </div>

      <MedicationBanner jadwalList={jadwalHariIni} />

      {/* Ringkasan kepatuhan 14 hari */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <InfoStat
          icon={PillIcon}
          tone="brand"
          label="Kepatuhan 14 Hari"
          value={k.dinilai > 0 ? `${k.persentase}%` : "—"}
          sub={
            k.dinilai > 0
              ? `${k.diminum}/${k.dinilai} obat`
              : "belum jatuh tempo"
          }
        />
        <InfoStat
          icon={CheckIcon}
          tone="emerald"
          label="Diminum"
          value={String(k.diminum)}
          sub="minum tepat waktu"
        />
        <InfoStat
          icon={CloseIcon}
          tone="red"
          label="Terlewat / Tidak Lapor"
          value={String(k.terlewat + k.tidakMinum)}
          sub="telat / tidak minum"
        />
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-6">
        <h2 className="text-base font-semibold text-brand-950">
          Riwayat 14 Hari Terakhir
        </h2>

        {filteredDays.length === 0 ? (
          <p className="mt-4 rounded-xl bg-slate-50 p-4 text-center text-sm text-slate-500">
            Belum ada jadwal minum obat. Riwayat akan muncul setelah Nakes
            menetapkan resep pengobatan.
          </p>
        ) : (
          <ul className="mt-4 divide-y divide-slate-100">
            {filteredDays.map((d, i) => (
              <li
                key={`${d.tanggal}-${i}`}
                className="flex items-center justify-between py-3"
              >
                <div>
                  <p className="text-sm font-medium text-slate-800">
                    {formatTanggalID(d.tanggal)}
                  </p>
                  <p className="text-xs text-slate-400">
                    Jadwal pukul {formatJam(d.jam_jadwal)}
                    {d.reported_at
                      ? ` · dilaporkan ${formatWaktuID(d.reported_at)}`
                      : " . Tidak Dilaporkan / Tidak diminum"}
                  </p>
                </div>
                <StatusMinum status={d.status} />
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
