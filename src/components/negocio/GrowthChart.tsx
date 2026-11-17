"use client";

import { useState } from "react";

type Point = { day: string; value: number };

const W = 640;
const H = 240;
const PAD = { top: 16, right: 16, bottom: 28, left: 56 };

function niceTicks(min: number, max: number, count = 4) {
  if (min === max) {
    const pad = Math.max(1, Math.round(Math.abs(max) * 0.05));
    min -= pad;
    max += pad;
  }
  const raw = (max - min) / count;
  const mag = 10 ** Math.floor(Math.log10(raw));
  const step = [1, 2, 5, 10].map((m) => m * mag).find((s) => s >= raw) ?? raw;
  const lo = Math.floor(min / step) * step;
  const hi = Math.ceil(max / step) * step;
  const ticks: number[] = [];
  for (let v = lo; v <= hi + step / 2; v += step) ticks.push(v);
  return ticks;
}

const fmt = (n: number) => n.toLocaleString("pt-BR");
const short = (n: number) =>
  Math.abs(n) >= 1000 ? `${(n / 1000).toLocaleString("pt-BR", { maximumFractionDigits: 1 })} mil` : fmt(n);
const dayLabel = (d: string) => `${d.slice(8, 10)}/${d.slice(5, 7)}/${d.slice(2, 4)}`;

/** Linha única (ex.: seguidores ao longo do tempo), com dica ao passar o mouse ou tocar. */
export function GrowthChart({ points, label }: { points: Point[]; label: string }) {
  const [hover, setHover] = useState<number | null>(null);
  if (points.length === 0) return null;

  const times = points.map((p) => Date.parse(p.day));
  const t0 = times[0];
  const t1 = times[times.length - 1];
  const ticks = niceTicks(Math.min(...points.map((p) => p.value)), Math.max(...points.map((p) => p.value)));
  const yMin = ticks[0];
  const yMax = ticks[ticks.length - 1];
  const iw = W - PAD.left - PAD.right;
  const ih = H - PAD.top - PAD.bottom;
  const x = (t: number) => PAD.left + (t1 === t0 ? iw / 2 : ((t - t0) / (t1 - t0)) * iw);
  const y = (v: number) => PAD.top + ih - ((v - yMin) / (yMax - yMin)) * ih;
  const xs = times.map(x);
  const path = points.map((p, i) => `${i ? "L" : "M"}${xs[i].toFixed(1)},${y(p.value).toFixed(1)}`).join(" ");

  function onMove(e: React.PointerEvent<SVGRectElement>) {
    const box = e.currentTarget.ownerSVGElement!.getBoundingClientRect();
    const px = ((e.clientX - box.left) / box.width) * W;
    let best = 0;
    xs.forEach((v, i) => {
      if (Math.abs(v - px) < Math.abs(xs[best] - px)) best = i;
    });
    setHover(best);
  }

  const h = hover != null ? points[hover] : null;
  const prev = hover != null && hover > 0 ? points[hover - 1] : null;

  return (
    <figure className="relative">
      <svg viewBox={`0 0 ${W} ${H}`} className="block h-auto w-full" role="img" aria-label={`${label}: gráfico de ${points.length} registro(s)`}>
        {ticks.map((v) => (
          <g key={v}>
            <line x1={PAD.left} x2={W - PAD.right} y1={y(v)} y2={y(v)} stroke="var(--line)" strokeWidth={1} />
            <text x={PAD.left - 8} y={y(v)} dy="0.35em" textAnchor="end" fontSize={12} fill="var(--muted)">
              {short(v)}
            </text>
          </g>
        ))}
        <text x={xs[0]} y={H - 8} fontSize={12} fill="var(--muted)" textAnchor={points.length > 1 ? "start" : "middle"}>
          {dayLabel(points[0].day)}
        </text>
        {points.length > 1 && (
          <text x={xs[xs.length - 1]} y={H - 8} fontSize={12} fill="var(--muted)" textAnchor="end">
            {dayLabel(points[points.length - 1].day)}
          </text>
        )}
        {h && hover != null && (
          <line x1={xs[hover]} x2={xs[hover]} y1={PAD.top} y2={PAD.top + ih} stroke="var(--muted)" strokeWidth={1} strokeDasharray="3 3" />
        )}
        <path d={path} fill="none" stroke="var(--accent)" strokeWidth={2} strokeLinejoin="round" strokeLinecap="round" />
        {points.map((p, i) => (
          <circle
            key={p.day}
            cx={xs[i]}
            cy={y(p.value)}
            r={hover === i ? 6 : 4}
            fill="var(--accent)"
            stroke="var(--bg)"
            strokeWidth={2}
          />
        ))}
        <rect
          x={PAD.left - 10}
          y={0}
          width={iw + 20}
          height={H}
          fill="transparent"
          onPointerMove={onMove}
          onPointerDown={onMove}
          onPointerLeave={() => setHover(null)}
        />
      </svg>
      {h && hover != null && (
        <div
          className="pointer-events-none absolute top-0 rounded-lg border border-line bg-surface px-3 py-2 text-sm shadow-lg"
          style={{
            left: `${(xs[hover] / W) * 100}%`,
            transform: `translateX(${xs[hover] > W / 2 ? "calc(-100% - 12px)" : "12px"})`,
          }}
        >
          <p className="text-muted">{dayLabel(h.day)}</p>
          <p className="font-bold">
            {fmt(h.value)} {label.toLowerCase()}
          </p>
          {prev && (
            <p className="text-muted">
              {h.value - prev.value >= 0 ? "+" : ""}
              {fmt(h.value - prev.value)} desde {dayLabel(prev.day)}
            </p>
          )}
        </div>
      )}
    </figure>
  );
}
