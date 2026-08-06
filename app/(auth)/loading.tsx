import { Shimmer } from "@/components/skeletons/Skeletons";

/**
 * Skeleton loading untuk halaman di grup (auth) — login & lupa kata sandi.
 * Dirender di dalam AuthLayout (logo + wordmark sudah tampil), jadi cukup
 * meniru kartu form-nya saja.
 */
export default function AuthLoading() {
  return (
    <div
      aria-busy="true"
      className="w-full space-y-6 rounded-2xl border border-brand-100 bg-white/90 p-8 shadow-xl shadow-brand-900/5 backdrop-blur-sm"
    >
      {/* Judul + subjudul */}
      <div className="flex flex-col items-center gap-2">
        <Shimmer className="h-7 w-44" />
        <Shimmer className="h-4 w-64 max-w-[85%]" />
      </div>

      {/* Form */}
      <div className="space-y-4">
        {/* Field email */}
        <div className="space-y-1.5">
          <Shimmer className="h-4 w-24" />
          <Shimmer className="h-11 w-full rounded-lg" />
        </div>

        {/* Field kata sandi */}
        <div className="space-y-1.5">
          <Shimmer className="h-4 w-24" />
          <Shimmer className="h-11 w-full rounded-lg" />
        </div>

        {/* Ingat saya / lupa kata sandi */}
        <div className="flex items-center justify-between pt-1">
          <Shimmer className="h-4 w-28" />
          <Shimmer className="h-4 w-32" />
        </div>

        {/* Tombol masuk */}
        <Shimmer className="h-11 w-full rounded-lg" />
      </div>
    </div>
  );
}
