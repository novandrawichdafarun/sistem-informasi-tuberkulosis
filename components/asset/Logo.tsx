import Image from "next/image";

const sizeMap = {
  sm: 28,
  md: 40,
  lg: 64,
  xl: 88,
} as const;

// Dimensi asli file (public/logo.png) — dipakai sebagai rasio agar tidak gepeng.
const INTRINSIC_W = 543;
const INTRINSIC_H = 460;

export default function Logo({
  size = "md",
  withWordmark = false,
  badge = false,
  className = "",
}: {
  size?: keyof typeof sizeMap;
  withWordmark?: boolean;
  badge?: boolean;
  className?: string;
}) {
  const px = sizeMap[size];

  // Logo polos (mempertahankan rasio asli, PNG transparan).
  const mark = (
    <Image
      src="/logo.png"
      alt="Logo NU-TBCare"
      width={INTRINSIC_W}
      height={INTRINSIC_H}
      quality={100}
      priority
      className="shrink-0 object-contain"
      style={{ height: px, width: "auto" }}
    />
  );

  // Badge: logo memenuhi lingkaran putih (object-cover memangkas margin
  // transparan di sisi kanan/kiri). Sumber besar → tetap tajam saat mengecil.
  const badgeMark = (
    <div
      className="relative shrink-0 overflow-hidden rounded-full bg-white shadow-md ring-1 ring-black/5"
      style={{ width: px, height: px }}
    >
      <Image
        src="/logo.png"
        alt="Logo NU-TBCare"
        fill
        sizes={`${px * 2}px`}
        quality={100}
        priority
        className="object-cover"
      />
    </div>
  );

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      {badge ? badgeMark : mark}
      {withWordmark && (
        <span className="text-xl font-bold tracking-tight text-brand-800">
          NU-TB<span className="text-brand-500">Care</span>
        </span>
      )}
    </div>
  );
}
