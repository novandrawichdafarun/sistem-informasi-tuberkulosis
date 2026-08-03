import {
  PageShell,
  HeaderSkeleton,
  StatTileSkeleton,
  ChartCardSkeleton,
  CardSkeleton,
  Shimmer,
} from "@/components/skeletons/Skeletons";

export default function StatistikLoading() {
  return (
    <PageShell>
      <HeaderSkeleton />
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
        <StatTileSkeleton />
        <StatTileSkeleton />
        <StatTileSkeleton />
      </div>
      <CardSkeleton>
        <Shimmer className="h-5 w-56" />
        <div className="mt-5 space-y-4">
          <Shimmer className="h-4 w-full" />
          <Shimmer className="h-4 w-full" />
          <Shimmer className="h-4 w-5/6" />
        </div>
      </CardSkeleton>
      <ChartCardSkeleton />
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <ChartCardSkeleton />
        <ChartCardSkeleton />
      </div>
    </PageShell>
  );
}
