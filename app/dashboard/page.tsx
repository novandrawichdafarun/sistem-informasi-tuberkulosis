import { getServerSession } from "next-auth/next";
import { authOptions } from "../api/auth/[...nextauth]/route";
import MedicationBanner from "@/components/banner/MedicationBanner";
import PatientOverview from "@/components/dashboard/PatientOverview";
import SuperAdminDashboard from "@/components/dashboard/SuperAdmin";

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);
  const role = session?.user?.role;

  // --- TAMPILAN KHUSUS PASIEN --- (wrapped by PatientShell in layout.tsx)
  if (role === "pasien") {
    return (
      <>
        <MedicationBanner />
        <PatientOverview />
      </>
    );
  }

  if (role === "super_admin") {
    return <SuperAdminDashboard />;
  }

  // --- TAMPILAN LAINNYA ---
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900">Selamat Datang!</h2>
        <p className="text-gray-600 mt-1">
          Anda masuk sebagai:{" "}
          <span className="font-semibold capitalize text-brand-600">
            {role || "Pengguna"}
          </span>
        </p>
      </div>
    </div>
  );
}
