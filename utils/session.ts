import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { getServerSession } from "next-auth";

// Role yang dianggap sebagai "admin/pengelola" di sistem ini.
// DB live tidak punya tabel `nakes`; pengelola tunggal = super_admin.
// `nakes` tetap diizinkan untuk kompatibilitas bila suatu saat ada.
const ADMIN_ROLES = ["super_admin", "nakes"];

/**
 * Memastikan pemanggil adalah admin (super_admin / nakes) dan
 * mengembalikan id_user (UUID) miliknya.
 *
 * Nama fungsi dipertahankan agar import yang sudah ada tidak berubah,
 * namun cakupannya kini adalah seluruh admin, bukan hanya nakes.
 */
export async function requireNakesSession(): Promise<string> {
  const session = await getServerSession(authOptions);
  if (!session || !ADMIN_ROLES.includes(session.user.role)) {
    throw new Error("Akses ditolak: Hanya Admin yang diizinkan.");
  }
  return session.user.id;
}
