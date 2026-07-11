import { type NextRequest } from "next/server";
import { updateSession } from "./utils/supabase/middleware";
export { default } from "next-auth/middleware";

export const config = {
  matcher: [
    //? Masukkan route yang HANYA boleh diakses kalau sudah login
    "/dashboard/:path*",
    // "/rekam-medis/:path*", //! contoh lain
  ],
};
