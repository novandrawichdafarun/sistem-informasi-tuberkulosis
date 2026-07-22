import { getServerSession } from "next-auth/next";
import { authOptions } from "../api/auth/[...nextauth]/route";
import LogoutButton from "@/components/buttons/LogoutButton";
import PasienSidebar from "@/components/sidebar/PasienSidebar";
import SuperAdminSidebar from "@/components/sidebar/SuperAdminSidebar";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);

  //? Pasien
  if (session?.user?.role === "pasien") {
    return (
      <PasienSidebar
        user={{
          name: session.user.name ?? session.user.email ?? "Pasien",
          roleLabel: "Pasien",
          phase: "Fase Intensif",
        }}
      >
        {children}
      </PasienSidebar>
    );
  }

  //? Super Admin.
  return (
    <div className="flex min-h-screen bg-gray-50">
      <SuperAdminSidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <header className="sticky top-0 z-20 border-b border-gray-200 bg-white/95 shadow-sm backdrop-blur-sm">
          <div className="flex h-16 items-center justify-between px-6">
            <span className="text-sm font-semibold text-gray-800">
              Panel Super Admin
            </span>
            <div className="flex items-center space-x-4">
              <span className="hidden text-sm text-gray-600 sm:block">
                {session?.user?.email}
              </span>
              <LogoutButton />
            </div>
          </div>
        </header>
        <main className="flex-1 overflow-y-auto">{children}</main>
      </div>
    </div>
  );
}
