import { getServerSession } from "next-auth/next";
import { authOptions } from "../api/auth/[...nextauth]/route";
import Link from "next/link";
import LogoutButton from "@/components/buttons/LogoutButton";

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navbar Atas */}
      <nav className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="shrink-0 flex items-center">
              <h1 className="text-xl font-bold text-blue-600">PantauTB</h1>
            </div>

            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600 hidden sm:block">
                {session?.user?.email}
              </span>
              {/* Memanggil komponen Logout */}
              <LogoutButton />
            </div>
          </div>
        </div>
      </nav>

      {/* Konten Utama */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900">Selamat Datang!</h2>
          <p className="text-gray-600 mt-1">
            Anda masuk sebagai:{" "}
            <span className="font-semibold capitalize text-blue-600">
              {(session?.user as any)?.role || "Pengguna"}
            </span>
          </p>
        </div>

        {/* --- TAMPILAN KHUSUS PASIEN --- */}
        {(session?.user as any)?.role === "pasien" && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <h3 className="text-lg font-semibold text-gray-800">
                Jadwal Minum Obat
              </h3>
              <p className="text-sm text-gray-500 mt-2">
                Sudahkah Anda meminum obat sesuai jadwal hari ini?
              </p>
              <button className="mt-4 w-full rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 transition-colors">
                Lapor Minum Obat
              </button>
            </div>
          </div>
        )}

        {/* --- TAMPILAN KHUSUS NAKES --- */}
        {(session?.user as any)?.role === "nakes" && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <h3 className="text-lg font-semibold text-gray-800">
                Daftar Pasien
              </h3>
              <p className="text-sm text-gray-500 mt-2">
                Kelola data registrasi pasien dan rujukan.
              </p>
              <Link
                href="#"
                className="mt-4 block text-center w-full rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 transition-colors"
              >
                Kelola Pasien
              </Link>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
