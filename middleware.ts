import { type NextRequest } from "next/server";
import { updateSession } from "./utils/supabase/middleware";

export async function middleware(request: NextRequest) {
  return await updateSession(request);
}

export const config = {
  matcher: [
    //? Masukkan route yang HANYA boleh diakses kalau sudah login
    "/dashboard/:path*",
    // "/rekam-medis/:path*", //! contoh lain
  ],
};
