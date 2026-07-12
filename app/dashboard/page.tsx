import { getServerSession } from "next-auth/next";
import { authOptions } from "../api/auth/[...nextauth]/route";
import Link from "next/link";
import MedicationBanner from "@/components/dashboard/MedicationBanner";
import PatientOverview from "@/components/dashboard/PatientOverview";

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

  // --- TAMPILAN LAINNYA (NAKES, dll.) ---
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

      {role === "nakes" && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h3 className="text-lg font-semibold text-gray-800">
              Daftar Pasien
            </h3>
            <p className="text-sm text-gray-500 mt-2">
              Kelola data registrasi pasien dan rujukan.
            </p>
            <Link
              href="/dashboard/pasien"
              className="mt-4 block text-center w-full rounded-md bg-brand-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-700 transition-colors"
            >
              Kelola Pasien
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
