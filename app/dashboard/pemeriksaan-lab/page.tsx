import { getServerSession } from "next-auth/next";
import { authOptions } from "../../api/auth/[...nextauth]/route";
import { getDaftarPemeriksaanLabAction } from "@/actions/pemeriksaanLab";
import PemeriksaanLabTableView from "@/components/pemeriksaanLab/PemeriksaanLabTableView";
import PemeriksaanMedisView from "@/components/pasien/PemeriksaanMedisView";

export async function generateMetadata() {
  const session = await getServerSession(authOptions);
  return {
    title:
      session?.user?.role === "pasien"
        ? "Pemeriksaan Medis | NU-TBCARE"
        : "Manajemen Pemeriksaan Lab | NU-TBCARE",
  };
}

export default async function PemeriksaanLabPage() {
  const session = await getServerSession(authOptions);

  if (session?.user?.role === "pasien") {
    return <PemeriksaanMedisView />;
  }

  const result = await getDaftarPemeriksaanLabAction();
  const daftarPasien = result.success && result.data ? result.data : [];

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-800">
          Manajemen Pemeriksaan Lab
        </h1>
        <p className="text-sm text-gray-500">
          Kelola data pemeriksaan laboratorium seluruh pasien.
        </p>
      </div>

      {result.success === false && (
        <div className="rounded bg-red-50 p-4 text-sm text-red-600 border border-red-200">
          {result.error || "Gagal memuat data episode pengobatan."}
        </div>
      )}

      <PemeriksaanLabTableView data={daftarPasien} />
    </div>
  );
}
