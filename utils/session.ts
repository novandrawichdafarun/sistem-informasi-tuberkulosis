import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";

export async function requireSuperAdminSession(): Promise<string> {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "super_admin") {
    redirect("/errors/403");
  }
  return session.user.id;
}

export async function requirePasienSession(): Promise<string> {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "pasien") {
    throw new Error("Akses ditolak: Hanya Pasien yang diizinkan.");
  }
  return session.user.id;
}
