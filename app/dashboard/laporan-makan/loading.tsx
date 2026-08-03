import {
  PageShell,
  HeaderSkeleton,
  CardSkeleton,
  TableSkeleton,
  Shimmer,
} from "@/components/skeletons/Skeletons";

export default function LaporanMakanLoading() {
  return (
    <PageShell>
      <HeaderSkeleton />
      {/* Form / ringkasan input (khusus pasien) */}
      <CardSkeleton>
        <Shimmer className="h-5 w-44" />
        <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="space-y-2">
              <Shimmer className="h-3 w-24" />
              <Shimmer className="h-10 w-full rounded-xl" />
            </div>
          ))}
        </div>
        <Shimmer className="mt-4 h-10 w-full rounded-xl sm:w-40" />
      </CardSkeleton>
      <TableSkeleton rows={6} cols={5} withSearch={false} />
    </PageShell>
  );
}
