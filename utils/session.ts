import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { getServerSession } from "next-auth";

export async function requireSuperAdminSession(): Promise<string> {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "super_admin") {
    throw new Error("Akses ditolak: Hanya Super Admin yang diizinkan.");
  }
  return session.user.id;
}
