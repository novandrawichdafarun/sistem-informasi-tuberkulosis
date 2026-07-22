import Image from "next/image";

const sizeMap = {
  sm: 28,
  md: 40,
  lg: 64,
  xl: 80,
} as const;

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

  const mark = (
    <Image
      src="/logo.png"
      alt="Logo PantauTB"
      width={px}
      height={px}
      quality={100}
      priority
      className="shrink-0"
    />
  );

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      {badge ? (
        <div className="rounded-2xl bg-white p-3 shadow-lg shadow-brand-900/10 ring-1 ring-brand-100">
          {mark}
        </div>
      ) : (
        mark
      )}
      {withWordmark && (
        <span className="text-xl font-bold tracking-tight text-brand-800">
          Pantau<span className="text-brand-500">TB</span>
        </span>
      )}
    </div>
  );
}
