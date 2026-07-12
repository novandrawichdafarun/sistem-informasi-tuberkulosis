import { getServerSession } from "next-auth/next";
import { authOptions } from "../api/auth/[...nextauth]/route";
import Logo from "@/components/Logo";
import LogoutButton from "@/components/buttons/LogoutButton";
import PatientShell from "@/components/dashboard/PatientShell";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);

  // Patients get the app-shell with a collapsible sidebar.
  if (session?.user?.role === "pasien") {
    return (
      <PatientShell
        user={{
          name: session.user.name ?? session.user.email ?? "Pasien",
          roleLabel: "Pasien",
          phase: "Fase Intensif",
        }}
      >
        {children}
      </PatientShell>
    );
  }

  // Everyone else (nakes, etc.) keeps the simple top navbar.
  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="sticky top-0 z-20 border-b border-brand-100 bg-white/90 shadow-sm backdrop-blur-sm">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <Logo size="sm" withWordmark />

          <div className="flex items-center space-x-4">
            <span className="hidden text-sm text-brand-900/60 sm:block">
              {session?.user?.email}
            </span>
            <LogoutButton />
          </div>
        </div>
      </nav>

      <main>{children}</main>
    </div>
  );
}
