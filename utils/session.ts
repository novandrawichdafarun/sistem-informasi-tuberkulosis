import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { getServerSession } from "next-auth";

export async function requireNakesSession(): Promise<string> {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "nakes") {
    throw new Error("Akses ditolak: Hanya Nakes yang diizinkan.");
  }
  return session.user.id;
}
