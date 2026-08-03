import {
  PageShell,
  HeaderSkeleton,
  CardSkeleton,
  ChartCardSkeleton,
  Shimmer,
} from "@/components/skeletons/Skeletons";

export default function PasienDetailLoading() {
  return (
    <PageShell>
      <HeaderSkeleton />
      {/* Data diri + kepatuhan */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <CardSkeleton className="lg:col-span-2">
          <Shimmer className="h-5 w-40" />
          <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="space-y-2">
                <Shimmer className="h-3 w-24" />
                <Shimmer className="h-4 w-40 max-w-full" />
              </div>
            ))}
          </div>
        </CardSkeleton>
        <CardSkeleton className="flex flex-col items-center justify-center">
          <Shimmer className="h-36 w-36 rounded-full" />
        </CardSkeleton>
      </div>
      {/* Grafik vital & berat */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <ChartCardSkeleton />
        <ChartCardSkeleton />
      </div>
    </PageShell>
  );
}
