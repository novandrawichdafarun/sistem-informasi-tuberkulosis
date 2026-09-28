/**
 * Kumpulan primitif & blok skeleton yang dipakai file `loading.tsx` tiap route.
 * Semua murni presentasional (tanpa backend), memakai palet slate + animate-pulse.
 */

export function Shimmer({ className = "" }: { className?: string }) {
  return (
    <div className={`animate-pulse rounded-md bg-slate-200/80 ${className}`} />
  );
}

/** Pembungkus halaman versi admin (main tanpa padding → butuh padding sendiri). */
export function PageShell({ children }: { children: React.ReactNode }) {
  return (
    <div
      aria-busy="true"
      className="mx-auto w-full max-w-7xl space-y-6 px-4 py-6 sm:px-6 lg:px-8"
    >
      {children}
    </div>
  );
}

/** Pembungkus halaman versi pasien (padding sudah dari sidebar main). */
export function BareShell({ children }: { children: React.ReactNode }) {
  return (
    <div aria-busy="true" className="space-y-6">
      {children}
    </div>
  );
}

export function HeaderSkeleton({ withAction = false }: { withAction?: boolean }) {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="space-y-2">
        <Shimmer className="h-7 w-52 max-w-[70vw]" />
        <Shimmer className="h-4 w-72 max-w-[85vw]" />
      </div>
      {withAction && <Shimmer className="h-10 w-full rounded-xl sm:w-36" />}
    </div>
  );
}

export function CardSkeleton({
  className = "",
  children,
}: {
  className?: string;
  children?: React.ReactNode;
}) {
  return (
    <div
      className={`rounded-2xl border border-slate-200 bg-white p-6 ${className}`}
    >
      {children}
    </div>
  );
}

export function StatTileSkeleton() {
  return (
    <CardSkeleton className="p-5">
      <Shimmer className="h-3 w-24" />
      <Shimmer className="mt-3 h-8 w-16" />
      <Shimmer className="mt-2 h-3 w-20" />
    </CardSkeleton>
  );
}

export function StatGridSkeleton({ count = 4 }: { count?: number }) {
  return (
    <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
      {Array.from({ length: count }).map((_, i) => (
        <StatTileSkeleton key={i} />
      ))}
    </div>
  );
}

export function ChartCardSkeleton({ className = "" }: { className?: string }) {
  return (
    <CardSkeleton className={className}>
      <div className="flex items-center justify-between">
        <Shimmer className="h-5 w-40" />
        <Shimmer className="h-4 w-16" />
      </div>
      <Shimmer className="mt-6 h-48 w-full rounded-xl" />
    </CardSkeleton>
  );
}

/** Skeleton tabel: header kartu + baris-baris tabel. */
export function TableSkeleton({
  rows = 6,
  cols = 5,
  withSearch = true,
}: {
  rows?: number;
  cols?: number;
  withSearch?: boolean;
}) {
  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
      {withSearch && (
        <div className="border-b border-slate-100 p-4">
          <Shimmer className="h-10 w-full rounded-xl sm:w-72" />
        </div>
      )}
      {/* Head */}
      <div
        className="hidden gap-4 border-b border-slate-100 bg-slate-50 px-4 py-3 sm:grid"
        style={{ gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))` }}
      >
        {Array.from({ length: cols }).map((_, i) => (
          <Shimmer key={i} className="h-3 w-20" />
        ))}
      </div>
      {/* Rows */}
      <div className="divide-y divide-slate-100">
        {Array.from({ length: rows }).map((_, r) => (
          <div
            key={r}
            className="grid grid-cols-2 gap-4 px-4 py-4 sm:gap-4"
            style={{
              gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))`,
            }}
          >
            {Array.from({ length: cols }).map((_, c) => (
              <Shimmer
                key={c}
                className="h-4"
                // Kolom terakhir (aksi) tampil lebih pendek.
              />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

/** Skeleton grid kalender (header hari + 5 minggu). */
export function CalendarSkeleton() {
  return (
    <CardSkeleton>
      <div className="flex items-center justify-between">
        <Shimmer className="h-5 w-40" />
        <Shimmer className="h-4 w-24" />
      </div>
      <div className="mt-5 grid grid-cols-7 gap-1.5 sm:gap-2">
        {Array.from({ length: 7 }).map((_, i) => (
          <Shimmer key={`h-${i}`} className="h-4 w-full" />
        ))}
        {Array.from({ length: 35 }).map((_, i) => (
          <Shimmer key={i} className="aspect-square w-full rounded-lg sm:rounded-xl" />
        ))}
      </div>
    </CardSkeleton>
  );
}

/** Baris ringkasan: donut + beberapa stat. */
export function SummaryDonutSkeleton() {
  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
      <CardSkeleton className="flex flex-col items-center justify-center">
        <Shimmer className="h-36 w-36 rounded-full" />
      </CardSkeleton>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3 lg:col-span-2 lg:grid-cols-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <StatTileSkeleton key={i} />
        ))}
      </div>
    </div>
  );
}
