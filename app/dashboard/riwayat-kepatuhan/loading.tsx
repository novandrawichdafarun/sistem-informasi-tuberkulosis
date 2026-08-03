import {
  BareShell,
  HeaderSkeleton,
  SummaryDonutSkeleton,
  CalendarSkeleton,
} from "@/components/skeletons/Skeletons";

export default function RiwayatKepatuhanLoading() {
  return (
    <BareShell>
      <HeaderSkeleton />
      <SummaryDonutSkeleton />
      <CalendarSkeleton />
    </BareShell>
  );
}
