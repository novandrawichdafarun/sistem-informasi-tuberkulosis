import { Shimmer } from "@/components/skeletons/Skeletons";

/**
 * Skeleton loading untuk welcome page (root). Meniru layout asli:
 * background dekoratif, header (logo + nama), hero, dan grid kartu fitur.
 */
export default function WelcomeLoading() {
  return (
    <div
      aria-busy="true"
      className="relative flex min-h-screen flex-col overflow-hidden bg-linear-to-br from-brand-50 via-white to-mint-300/20"
    >
      {/* Background dekoratif (sama seperti halaman asli) */}
      <div
        aria-hidden
        className="pointer-events-none absolute -top-32 -left-24 h-80 w-80 rounded-full bg-brand-300/30 blur-3xl"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -bottom-40 -right-24 h-96 w-96 rounded-full bg-brand-600/20 blur-3xl"
      />

      {/* Header: logo + nama sistem */}
      <header className="relative z-10 mx-auto flex w-full max-w-6xl items-center gap-3 px-6 py-6">
        <Shimmer className="h-10 w-10 rounded-full" />
        <Shimmer className="h-6 w-32" />
      </header>

      {/* Hero */}
      <main className="relative z-10 flex flex-1 flex-col items-center justify-center px-6 py-12">
        {/* Judul (dua baris) */}
        <div className="flex w-full max-w-3xl flex-col items-center gap-3">
          <Shimmer className="h-10 w-4/5 sm:h-12" />
          <Shimmer className="h-10 w-3/4 sm:h-12" />
        </div>

        {/* Deskripsi */}
        <div className="mt-6 flex w-full max-w-2xl flex-col items-center gap-2.5">
          <Shimmer className="h-4 w-full" />
          <Shimmer className="h-4 w-11/12" />
          <Shimmer className="h-4 w-2/3" />
        </div>

        {/* Tombol */}
        <Shimmer className="mt-8 h-12 w-44 rounded-lg" />

        {/* Grid kartu fitur */}
        <div className="mt-16 grid w-full max-w-5xl grid-cols-1 gap-5 sm:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div
              key={i}
              className="rounded-2xl border border-brand-100 bg-white/80 p-6 shadow-sm shadow-brand-900/5 backdrop-blur-sm"
            >
              <Shimmer className="h-11 w-11 rounded-xl" />
              <Shimmer className="mt-4 h-5 w-40" />
              <div className="mt-2.5 space-y-2">
                <Shimmer className="h-3.5 w-full" />
                <Shimmer className="h-3.5 w-5/6" />
                <Shimmer className="h-3.5 w-2/3" />
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
