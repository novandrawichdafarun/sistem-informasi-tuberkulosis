// Placeholder donut saat kepatuhan belum bisa dinilai (dinilai === 0).
// Menggantikan angka "100%" yang menyesatkan dengan status "Belum ada data".
// Ukuran dibuat sepadan dengan KepatuhanDonut ("sm") & Donut ("lg").
export default function KepatuhanKosong({
  size = "sm",
}: {
  size?: "sm" | "lg";
}) {
  const lg = size === "lg";
  const box = lg ? 144 : 128;
  const radius = lg ? 60 : 54;
  const stroke = lg ? 14 : 12;
  const dim = lg ? "h-40 w-40" : "h-32 w-32";
  const center = box / 2;

  return (
    <div className={`relative ${dim}`}>
      <svg viewBox={`0 0 ${box} ${box}`} className={`${dim} -rotate-90`}>
        <circle
          cx={center}
          cy={center}
          r={radius}
          fill="none"
          stroke="#e2e8f0"
          strokeWidth={stroke}
          strokeDasharray="4 7"
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center px-4 text-center">
        <span
          className={`${lg ? "text-3xl" : "text-2xl"} font-bold text-slate-300`}
        >
          —
        </span>
        <span className="mt-0.5 text-xs text-slate-400">Belum ada data</span>
      </div>
    </div>
  );
}
