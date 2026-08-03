import {
  BareShell,
  HeaderSkeleton,
  CardSkeleton,
  Shimmer,
} from "@/components/skeletons/Skeletons";

export default function LaporanObatLoading() {
  return (
    <BareShell>
      <HeaderSkeleton />
      {/* Banner obat hari ini */}
      <Shimmer className="h-24 w-full rounded-2xl" />
      {/* Riwayat 14 hari */}
      <CardSkeleton>
        <Shimmer className="h-5 w-48" />
        <div className="mt-4 divide-y divide-slate-100">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="flex items-center justify-between py-3">
              <div className="space-y-2">
                <Shimmer className="h-4 w-40" />
                <Shimmer className="h-3 w-28" />
              </div>
              <Shimmer className="h-7 w-24 rounded-full" />
            </div>
          ))}
        </div>
      </CardSkeleton>
    </BareShell>
  );
}
