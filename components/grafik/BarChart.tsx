import { MonthlyPoint } from "@/types/statistik";

export default function BarChart({
  points,
  fill = "#f59e0b",
}: {
  points: MonthlyPoint[];
  fill?: string;
}) {
  const W = 680,
    H = 240,
    padL = 40,
    padR = 16,
    padT = 16,
    padB = 28;
  const innerW = W - padL - padR;
  const innerH = H - padT - padB;
  const max = Math.max(...points.map((p) => p.value), 4);
  const n = points.length;
  const slot = innerW / n;
  const barW = Math.min(slot * 0.55, 48);

  const ticks = [0, 0.25, 0.5, 0.75, 1].map((t) => Math.round(max * t));
  const y = (v: number) => padT + innerH * (1 - v / max);

  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      className="h-auto w-full"
      preserveAspectRatio="xMidYMid meet"
    >
      {ticks.map((t) => (
        <g key={t}>
          <line
            x1={padL}
            x2={W - padR}
            y1={y(t)}
            y2={y(t)}
            stroke="#e2e8f0"
            strokeDasharray="3 3"
          />
          <text x={4} y={y(t) + 4} fontSize="10" fill="#94a3b8">
            {t}
          </text>
        </g>
      ))}
      {points.map((p, i) => {
        const cx = padL + slot * i + slot / 2;
        const h = innerH * (p.value / max);
        return (
          <g key={p.key}>
            <rect
              x={cx - barW / 2}
              y={padT + innerH - h}
              width={barW}
              height={h}
              rx="4"
              fill={fill}
            >
              <title>{`${p.label}: ${p.value} pasien`}</title>
            </rect>
            <text
              x={cx}
              y={H - 8}
              fontSize="11"
              fill="#64748b"
              textAnchor={i === n - 1 ? "end" : "middle"}
            >
              {p.label}
            </text>
          </g>
        );
      })}
    </svg>
  );
}
