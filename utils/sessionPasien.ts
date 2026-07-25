import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { getServerSession } from "next-auth";

/**
 * Memastikan pemanggil adalah user dengan role "pasien".
 * Mengembalikan id_user (UUID) milik pasien yang sedang login.
 *
 * File baru — tidak menyentuh utils/session.ts (khusus Nakes) yang sudah ada.
 */
export async function requirePasienSession(): Promise<string> {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "pasien") {
    throw new Error("Akses ditolak: Hanya Pasien yang diizinkan.");
  }
  return session.user.id;
}
