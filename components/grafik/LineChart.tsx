"use client";

// Grafik garis SVG reusable + tooltip hover. Mendukung banyak seri,
// area fill opsional, dan nilai null (garis putus).

import { useRef, useState } from "react";

export type ChartSeries = {
  name?: string;
  color: string;
  values: (number | null)[];
  area?: boolean;
};

function fmt(v: number | null) {
  if (v == null) return "-";
  return Number.isInteger(v) ? String(v) : v.toFixed(1);
}

export default function LineChart({
  labels,
  series,
  min,
  max,
  suffix = "",
  showLegend = true,
}: {
  labels: string[];
  series: ChartSeries[];
  min?: number;
  max?: number;
  suffix?: string;
  showLegend?: boolean;
}) {
  const W = 680;
  const H = 240;
  const padL = 40;
  const padR = 16;
  const padT = 16;
  const padB = 28;
  const innerW = W - padL - padR;
  const innerH = H - padT - padB;

  const containerRef = useRef<HTMLDivElement>(null);
  const [hover, setHover] = useState<number | null>(null);

  const allValues = series
    .flatMap((s) => s.values)
    .filter((v): v is number => v != null);

  let lo = min ?? (allValues.length ? Math.min(...allValues) : 0);
  let hi = max ?? (allValues.length ? Math.max(...allValues) : 1);
  if (min === undefined && max === undefined && allValues.length) {
    const pad = Math.max((hi - lo) * 0.15, hi === lo ? Math.abs(hi) * 0.1 || 1 : 0);
    lo = lo - pad;
    hi = hi + pad;
  }
  if (hi <= lo) hi = lo + 1;

  const n = Math.max(labels.length, 1);
  const x = (i: number) =>
    n <= 1 ? padL + innerW / 2 : padL + (i / (n - 1)) * innerW;
  const y = (v: number) => padT + innerH * (1 - (v - lo) / (hi - lo));

  const round = (v: number) => {
    const span = hi - lo;
    if (span < 5) return Math.round(v * 10) / 10;
    return Math.round(v);
  };
  const ticks = [0, 0.25, 0.5, 0.75, 1].map((t) => round(lo + (hi - lo) * t));

  const segments = (values: (number | null)[]) => {
    const segs: { i: number; v: number }[][] = [];
    let cur: { i: number; v: number }[] = [];
    values.forEach((v, i) => {
      if (v == null) {
        if (cur.length) segs.push(cur);
        cur = [];
      } else {
        cur.push({ i, v });
      }
    });
    if (cur.length) segs.push(cur);
    return segs;
  };

  const labelStep = Math.ceil(n / 8);

  const handleMove = (e: React.MouseEvent) => {
    const el = containerRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const vbX = ((e.clientX - rect.left) / rect.width) * W;
    let idx = n <= 1 ? 0 : Math.round(((vbX - padL) / innerW) * (n - 1));
    idx = Math.max(0, Math.min(n - 1, idx));
    setHover(idx);
  };

  const leftPct = hover != null ? (x(hover) / W) * 100 : 0;
  const tx = leftPct < 20 ? "0%" : leftPct > 80 ? "-100%" : "-50%";

  return (
    <div>
      <div
        ref={containerRef}
        className="relative"
        onMouseMove={handleMove}
        onMouseLeave={() => setHover(null)}
      >
        <svg
          viewBox={`0 0 ${W} ${H}`}
          className="h-auto w-full"
          preserveAspectRatio="xMidYMid meet"
        >
          {ticks.map((t, i) => (
            <g key={i}>
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
                {suffix}
              </text>
            </g>
          ))}

          {/* Garis panduan hover */}
          {hover != null && (
            <line
              x1={x(hover)}
              x2={x(hover)}
              y1={padT}
              y2={padT + innerH}
              stroke="#94a3b8"
              strokeDasharray="4 3"
            />
          )}

          {series.map((s, si) => {
            const segs = segments(s.values);
            return (
              <g key={si}>
                {s.area &&
                  segs.map((seg, gi) => {
                    if (seg.length < 2) return null;
                    const line = seg
                      .map(
                        (p, k) =>
                          `${k === 0 ? "M" : "L"} ${x(p.i).toFixed(1)} ${y(p.v).toFixed(1)}`,
                      )
                      .join(" ");
                    const area = `${line} L ${x(seg[seg.length - 1].i).toFixed(1)} ${(padT + innerH).toFixed(1)} L ${x(seg[0].i).toFixed(1)} ${(padT + innerH).toFixed(1)} Z`;
                    return <path key={gi} d={area} fill={s.color} opacity="0.1" />;
                  })}
                {segs.map((seg, gi) => {
                  const line = seg
                    .map(
                      (p, k) =>
                        `${k === 0 ? "M" : "L"} ${x(p.i).toFixed(1)} ${y(p.v).toFixed(1)}`,
                    )
                    .join(" ");
                  return (
                    <path key={gi} d={line} fill="none" stroke={s.color} strokeWidth="2.5" />
                  );
                })}
                {s.values.map((v, i) =>
                  v == null ? null : (
                    <circle
                      key={i}
                      cx={x(i)}
                      cy={y(v)}
                      r={hover === i ? 5 : 3.5}
                      fill={hover === i ? s.color : "#fff"}
                      stroke={s.color}
                      strokeWidth="2"
                    />
                  ),
                )}
              </g>
            );
          })}

          {labels.map((lab, i) =>
            i % labelStep === 0 || i === n - 1 ? (
              <text
                key={i}
                x={x(i)}
                y={H - 8}
                fontSize="11"
                fill={hover === i ? "#0f172a" : "#64748b"}
                fontWeight={hover === i ? 600 : 400}
                textAnchor={i === 0 ? "start" : i === n - 1 ? "end" : "middle"}
              >
                {lab}
              </text>
            ) : null,
          )}
        </svg>

        {/* Tooltip */}
        {hover != null && (
          <div
            className="pointer-events-none absolute top-1 z-10 whitespace-nowrap rounded-lg bg-slate-900/90 px-3 py-2 text-xs text-white shadow-lg"
            style={{ left: `${leftPct}%`, transform: `translateX(${tx})` }}
          >
            <p className="mb-1 font-semibold">{labels[hover] ?? ""}</p>
            {series.map((s, si) => (
              <div key={si} className="flex items-center gap-1.5">
                <span
                  className="h-2 w-2 rounded-full"
                  style={{ background: s.color }}
                />
                <span>
                  {s.name ? `${s.name}: ` : ""}
                  {fmt(s.values[hover])}
                  {suffix}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {showLegend && series.some((s) => s.name) && (
        <div className="mt-2 flex flex-wrap justify-center gap-4">
          {series.map((s, i) =>
            s.name ? (
              <span key={i} className="flex items-center gap-1.5 text-xs text-slate-500">
                <span className="h-2.5 w-2.5 rounded-full" style={{ background: s.color }} />
                {s.name}
              </span>
            ) : null,
          )}
        </div>
      )}
    </div>
  );
}
