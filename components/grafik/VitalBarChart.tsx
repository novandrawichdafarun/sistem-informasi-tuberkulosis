"use client";

import { fmt } from "@/utils/number";
// Grafik batang SVG reusable (satu seri) + tooltip hover.
// Baseline domain non-nol supaya variasi nilai fisiologis (berat/suhu) terlihat;
// sumbu-Y diberi label agar tetap jujur. Mendukung nilai null (batang kosong).

import { useRef, useState } from "react";

export default function VitalBarChart({
  labels,
  values,
  color = "var(--brand-600)",
  suffix = "",
  name,
}: {
  labels: string[];
  values: (number | null)[];
  color?: string;
  suffix?: string;
  name?: string;
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

  const valid = values.filter((v): v is number => v != null);
  let lo = valid.length ? Math.min(...valid) : 0;
  let hi = valid.length ? Math.max(...valid) : 1;
  const pad = Math.max(
    (hi - lo) * 0.2,
    hi === lo ? Math.abs(hi) * 0.1 || 1 : 0,
  );
  lo = Math.max(0, lo - pad);
  hi = hi + pad;
  if (hi <= lo) hi = lo + 1;

  const n = Math.max(labels.length, 1);
  const slot = innerW / n;
  const barW = Math.min(slot * 0.5, 44);
  const baseY = padT + innerH;
  const y = (v: number) => padT + innerH * (1 - (v - lo) / (hi - lo));
  const cx = (i: number) => padL + slot * i + slot / 2;

  const round = (v: number) => {
    const span = hi - lo;
    return span < 5 ? Math.round(v * 10) / 10 : Math.round(v);
  };
  const ticks = [0, 0.25, 0.5, 0.75, 1].map((t) => round(lo + (hi - lo) * t));
  const labelStep = Math.ceil(n / 8);

  const handleMove = (e: React.MouseEvent) => {
    const el = containerRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const vbX = ((e.clientX - rect.left) / rect.width) * W;
    let idx = Math.floor((vbX - padL) / slot);
    idx = Math.max(0, Math.min(n - 1, idx));
    setHover(idx);
  };

  const leftPct = hover != null ? (cx(hover) / W) * 100 : 0;
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

          {values.map((v, i) =>
            v == null ? null : (
              <rect
                key={i}
                x={cx(i) - barW / 2}
                y={y(v)}
                width={barW}
                height={Math.max(0, baseY - y(v))}
                rx="4"
                fill={color}
                opacity={hover == null || hover === i ? 1 : 0.4}
              />
            ),
          )}

          {labels.map((lab, i) =>
            i % labelStep === 0 || i === n - 1 ? (
              <text
                key={i}
                x={cx(i)}
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
        {hover != null && values[hover] != null && (
          <div
            className="pointer-events-none absolute top-1 z-10 whitespace-nowrap rounded-lg bg-slate-900/90 px-3 py-2 text-xs text-white shadow-lg"
            style={{ left: `${leftPct}%`, transform: `translateX(${tx})` }}
          >
            <p className="mb-1 font-semibold">{labels[hover] ?? ""}</p>
            <div className="flex items-center gap-1.5">
              <span
                className="h-2 w-2 rounded-full"
                style={{ background: color }}
              />
              <span>
                {name ? `${name}: ` : ""}
                {fmt(values[hover])}
                {suffix}
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
