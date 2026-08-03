import {
  PageShell,
  HeaderSkeleton,
  StatGridSkeleton,
  ChartCardSkeleton,
  CardSkeleton,
  Shimmer,
} from "@/components/skeletons/Skeletons";

export default function DashboardLoading() {
  return (
    <PageShell>
      <HeaderSkeleton />
      <StatGridSkeleton count={4} />
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <ChartCardSkeleton className="lg:col-span-2" />
        <CardSkeleton>
          <Shimmer className="h-5 w-40" />
          <div className="mt-5 space-y-4">
            <Shimmer className="h-4 w-full" />
            <Shimmer className="h-4 w-5/6" />
            <Shimmer className="h-4 w-2/3" />
          </div>
        </CardSkeleton>
      </div>
    </PageShell>
  );
}
