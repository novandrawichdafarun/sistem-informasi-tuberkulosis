import { getServerSession } from "next-auth/next";
import { authOptions } from "../../api/auth/[...nextauth]/route";
import { getDaftarPemeriksaanAction } from "@/actions/pemeriksaanKlinis";
import PemeriksaanKlinisTableView from "@/components/pemeriksaanKlinis/PemeriksaanKlinisTableView";
import PemeriksaanKlinisView from "@/components/pasien/PemeriksaanKlinisView";

export async function generateMetadata() {
  const session = await getServerSession(authOptions);
  return {
    title:
      session?.user?.role === "pasien"
        ? "Pemeriksaan Klinis | NU-TBCARE"
        : "Manajemen Pemeriksaan Klinis | NU-TBCARE",
  };
}

export default async function PemeriksaanKlinisPage() {
  const session = await getServerSession(authOptions);

  if (session?.user?.role === "pasien") {
    return <PemeriksaanKlinisView />;
  }

  const res = await getDaftarPemeriksaanAction();
  const daftarPemeriksaan = res.success && res.data ? res.data : [];

  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">
          Manajemen Pemeriksaan Klinis
        </h1>
        <p className="text-sm text-gray-500">
          Kelola riwayat pemeriksaan fisik dan klinis seluruh pasien
          Tuberkulosis.
        </p>
      </div>

      {res.success === false && (
        <div className="rounded bg-red-50 p-4 text-sm text-red-600 border border-red-200">
          {res.error || "Gagal memuat data."}
        </div>
      )}

      <PemeriksaanKlinisTableView data={daftarPemeriksaan} />
    </div>
  );
}
