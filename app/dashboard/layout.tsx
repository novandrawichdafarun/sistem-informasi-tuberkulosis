import { getServerSession } from "next-auth/next";
import { authOptions } from "../api/auth/[...nextauth]/route";
import PasienSidebar from "@/components/sidebar/PasienSidebar";
import AdminShell from "@/components/dashboard/AdminShell";

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

  // Nakes / super_admin get the management sidebar shell.
  const roleLabel =
    session?.user?.role === "super_admin" ? "Super Admin" : "Tenaga Kesehatan";

  return (
    <AdminShell
      user={{
        name: session?.user?.name ?? session?.user?.email ?? "Admin",
        roleLabel,
      }}
    >
      {children}
    </AdminShell>
  );
}
