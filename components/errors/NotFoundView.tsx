import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { getServerSession } from "next-auth";
import Link from "next/link";

export default async function NotFoundView() {
  const session = await getServerSession(authOptions);

  const targetUrl = session ? "/dashboard" : "/login";
  const buttonText = session ? "Kembali ke Beranda" : "Kembali ke Login";

  return (
    <main className="min-h-screen place-items-center items-center justify-center bg-white px-6 py-24 sm:py-32 lg:px-8 ">
      <div className="text-center">
        <p className="text-2xl font-semibold text-red-600">404</p>
        <h1 className="mt-4 text-5xl font-semibold tracking-tight text-balance text-gray-900 sm:text-7xl">
          Page not found
        </h1>
        <p className="mt-6 text-lg font-medium text-pretty text-gray-500 sm:text-xl/8">
          Maaf, halaman yang Anda cari mungkin telah dihapus, diubah namanya,
          atau tidak pernah ada.
        </p>
        <div className="mt-10 flex items-center justify-center gap-x-6">
          <Link
            href={targetUrl}
            className="rounded-md bg-brand-600 px-3.5 py-2.5 text-sm font-semibold text-white shadow-xs hover:bg-brand-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-600"
          >
            {buttonText}
          </Link>
        </div>
      </div>
    </main>
  );
}
