import {
  PageShell,
  HeaderSkeleton,
  TableSkeleton,
} from "@/components/skeletons/Skeletons";

export default function PemeriksaanKlinisLoading() {
  return (
    <PageShell>
      <HeaderSkeleton withAction />
      <TableSkeleton rows={6} cols={5} />
    </PageShell>
  );
}
