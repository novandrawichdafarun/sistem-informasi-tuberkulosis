import Donut from "@/components/grafik/Donut";
import KepatuhanKosong from "@/components/grafik/KepatuhanKosong";
import KalenderKepatuhan from "@/components/grafik/KalenderKepatuhan";
import InfoStat from "@/components/card/InfoStat";
import { KepatuhanHarian } from "@/types/laporan";
import { getKepatuhanAction } from "@/actions/laporan";
import { isoDaysAgo, todayISO } from "@/utils/date";
import { hitungKepatuhanObat } from "@/utils/kepatuhan";
import {
  CheckIcon,
  ClockIcon,
  MinusIcon,
  TrendIcon,
} from "@/components/asset/icons";
import { kategori } from "@/utils/number";

export const metadata = { title: "Riwayat Kepatuhan | NU-TBCARE" };

export default async function RiwayatKepatuhanPage() {
  // Ambil rentang 1 tahun agar kalender bisa digeser antar-bulan.
  // (Action & argumen `days` sudah ada — tanpa perubahan backend.)
  const res = await getKepatuhanAction(365);
  const allDays: KepatuhanHarian[] =
    res.success && res.data ? [...res.data.days] : [];

  const today = todayISO();
  const batas30 = isoDaysAgo(29);

  // Ringkasan 30 hari terakhir — model "mulai 100%, berkurang tiap telat/belum lapor".
  const last30 = allDays.filter(
    (d) => d.tanggal >= batas30 && d.tanggal <= today,
  );
  const { persentase, diminum, terlewat, tidakMinum, dinilai } =
    hitungKepatuhanObat(last30, today);
  const kat = kategori(persentase);
  const hasData = allDays.length > 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start gap-3">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-brand-100 text-brand-700">
          <TrendIcon className="h-6 w-6" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-brand-950">
            Riwayat Kepatuhan
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Ringkasan kepatuhan minum obat Anda selama 30 hari terakhir.
          </p>
        </div>
      </div>

      {/* Ringkasan */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Kartu donut */}
        <div className="relative overflow-hidden rounded-2xl border border-brand-100 bg-linear-to-br from-brand-50 via-white to-white p-6">
          <div className="pointer-events-none absolute -right-10 -top-10 h-32 w-32 rounded-full bg-brand-100/60 blur-2xl" />
          <div className="relative flex flex-col items-center text-center">
            {dinilai === 0 ? (
              <KepatuhanKosong size="lg" />
            ) : (
              <>
                <Donut percent={persentase} />
                <span
                  className={`mt-4 inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${kat.className}`}
                >
                  {kat.label}
                </span>
              </>
            )}
            <p className="mt-3 text-xs text-slate-500">
              {dinilai > 0
                ? ` ${diminum} dari ${dinilai} obat yang diminum tepat waktu.`
                : " Belum ada jadwal minum obat yang jatuh tempo."}
            </p>
          </div>
        </div>

        {/* Kartu statistik */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3 lg:col-span-2 lg:content-start">
          <InfoStat
            icon={CheckIcon}
            tone="brand"
            label="Diminum"
            value={String(diminum)}
            sub="tepat waktu"
          />
          <InfoStat
            icon={ClockIcon}
            tone="red"
            label="Telat lapor"
            value={String(terlewat)}
            sub="> 1 jam dari jadwal"
          />
          <InfoStat
            icon={MinusIcon}
            tone="slate"
            label="Tidak lapor"
            value={String(tidakMinum)}
            sub="jatuh tempo, tak dilaporkan"
          />
        </div>
      </div>

      {/* Kalender (bisa digeser antar-bulan) */}
      {hasData ? (
        <KalenderKepatuhan days={allDays} today={today} />
      ) : (
        <div className="rounded-2xl border border-slate-200 bg-white p-6">
          <p className="rounded-xl bg-slate-50 p-4 text-center text-sm text-slate-500">
            Belum ada jadwal minum obat yang tercatat.
          </p>
        </div>
      )}
    </div>
  );
}
