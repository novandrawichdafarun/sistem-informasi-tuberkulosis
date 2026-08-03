import { getServerSession } from "next-auth/next";
import { authOptions } from "../../api/auth/[...nextauth]/route";
import PasienLaporanMakanView from "@/components/Laporan/PasienLaporanMakanView";
import AdminLaporanMakanView from "@/components/Laporan/AdminLaporanMakanView";

export const metadata = { title: "Laporan Makanan | NU-TBCare" };

export default async function LaporanMakanPage() {
  const session = await getServerSession(authOptions);

  if (session?.user?.role === "pasien") {
    return <PasienLaporanMakanView />;
  }

  if (session?.user?.role === "super_admin") {
    return <AdminLaporanMakanView />;
  }

  return null;
}
