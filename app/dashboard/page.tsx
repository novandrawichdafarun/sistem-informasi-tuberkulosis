import { getServerSession } from "next-auth/next";
import { authOptions } from "../api/auth/[...nextauth]/route";
import MedicationBanner from "@/components/banner/MedicationBanner";
import PatientOverview from "@/components/dashboard/PatientOverview";
import AdminOverview from "@/components/dashboard/AdminOverview";
import { getPasienProfileAction } from "@/actions/pasien";
import { getStatistikAdminAction } from "@/actions/statistik";
import {
  getJadwalByPasienIdAction,
  getKepatuhanAction,
} from "@/actions/laporan";
import { RingkasanKepatuhan } from "@/types/laporan";

const EMPTY_SUMMARY: RingkasanKepatuhan = {
  total: 0,
  diminum: 0,
  terlewat: 0,
  belum: 0,
  persentase: 0,
  days: [],
};

export const metadata = { title: "Beranda | NU-TBCare" };

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);
  const role = session?.user?.role;

  if (role === "pasien") {
    const [profileRes, jadwalRes, kepatuhanRes] = await Promise.all([
      getPasienProfileAction(),
      getJadwalByPasienIdAction(),
      getKepatuhanAction(7),
    ]);

    const profile = profileRes.success ? (profileRes.data ?? null) : null;
    const jadwalHariIni =
      jadwalRes.success && jadwalRes.data ? jadwalRes.data : [];
    const summary =
      kepatuhanRes.success && kepatuhanRes.data
        ? kepatuhanRes.data
        : EMPTY_SUMMARY;

    return (
      <>
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-brand-950">
            Halo, {profile?.nama_lengkap ?? "Pasien"} 👋
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            Selamat datang di NU-TBCare
            {profile?.domisili ? ` · ${profile.domisili}` : ""}
          </p>
        </div>
        <div className="space-y-4">
          <MedicationBanner jadwalList={jadwalHariIni} />
          <PatientOverview
            summary={summary}
            fase={profile?.episodeAktif?.tipe_pasien}
          />
        </div>
      </>
    );
  } else if (role === "super_admin") {
    const nama = session?.user?.name ?? session?.user?.email ?? "Admin";
    const statRes = await getStatistikAdminAction();
    const stat = statRes.success ? statRes.data : undefined;

    return (
      <div className="max-w-7xl mx-auto space-y-6 px-4 sm:px-6 lg:px-8 py-8">
        <div>
          <h2 className="text-2xl font-bold text-brand-950">
            Selamat datang, {nama} 👋
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            Ringkasan penanganan TB
            {stat?.bulanIniLabel ? ` · ${stat.bulanIniLabel}` : ""}
          </p>
        </div>

        {!stat ? (
          <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-600">
            {statRes.success ? "Data tidak tersedia." : statRes.error}
          </div>
        ) : (
          <AdminOverview {...stat} />
        )}
      </div>
    );
  }

  return null;
}
