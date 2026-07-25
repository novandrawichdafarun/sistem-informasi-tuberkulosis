import { getServerSession } from "next-auth/next";
import { authOptions } from "../api/auth/[...nextauth]/route";
import PatientShell from "@/components/dashboard/PatientShell";
import AdminShell from "@/components/dashboard/AdminShell";

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
