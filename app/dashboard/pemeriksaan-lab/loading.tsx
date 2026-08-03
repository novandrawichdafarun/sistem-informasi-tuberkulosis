import {
  PageShell,
  HeaderSkeleton,
  TableSkeleton,
} from "@/components/skeletons/Skeletons";

export default function PemeriksaanLabLoading() {
  return (
    <PageShell>
      <HeaderSkeleton withAction />
      <TableSkeleton rows={6} cols={6} />
    </PageShell>
  );
}
