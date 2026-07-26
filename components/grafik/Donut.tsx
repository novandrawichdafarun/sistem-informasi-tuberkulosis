export default function Donut({ percent }: { percent: number }) {
  const radius = 60;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference * (1 - percent / 100);
  return (
    <div className="relative h-40 w-40">
      <svg viewBox="0 0 144 144" className="h-40 w-40 -rotate-90">
        <circle cx="72" cy="72" r={radius} fill="none" stroke="#e2e8f0" strokeWidth="14" />
        <circle
          cx="72"
          cy="72"
          r={radius}
          fill="none"
          stroke="var(--brand-600)"
          strokeWidth="14"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-3xl font-bold text-brand-950">{percent}%</span>
        <span className="text-xs text-slate-500">Kepatuhan</span>
      </div>
    </div>
  );
}