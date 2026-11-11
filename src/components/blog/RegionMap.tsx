"use client";

import Link from "next/link";
import { useId, useState } from "react";
import { WhatsAppButton } from "@/components/ui/WhatsAppButton";
import { CITY_SHAPES, CONTEXT_SHAPES, MAP_VIEWBOX } from "@/data/mapa-regiao";

export type MapCity = {
  id: string;
  name: string;
  href: string;
  count: number;
  /** Notícia publicada nas últimas 24 horas (calculado no servidor). */
  recent: boolean;
  latest: { title: string; href: string; coverUrl: string | null; coverAlt: string | null } | null;
};

const { width: W, height: H } = MAP_VIEWBOX;
const LABEL_FONT = 38;
const BADGE_R = 30;

type Box = { x: number; y: number; w: number; h: number };

/**
 * Posição do rótulo: tenta acima, abaixo, à direita e à esquerda da contagem e fica com a primeira
 * que cabe no quadro sem cobrir a contagem de outra cidade.
 */
function labelBox(name: string, x: number, y: number, others: [number, number][]): Box {
  const w = name.length * LABEL_FONT * 0.56 + 36;
  const h = LABEL_FONT + 22;
  const gap = 12;
  const candidates: Box[] = [
    { x: x - w / 2, y: y - BADGE_R - gap - h, w, h },
    { x: x - w / 2, y: y + BADGE_R + gap, w, h },
    { x: x + BADGE_R + gap, y: y - h / 2, w, h },
    { x: x - BADGE_R - gap - w, y: y - h / 2, w, h },
    { x: x - w / 2, y: y - BADGE_R - gap - h - 2 * BADGE_R - gap, w, h },
    { x: x - w / 2, y: y + 3 * BADGE_R + 2 * gap, w, h },
  ];
  const clamp = (b: Box): Box => ({
    ...b,
    x: Math.min(Math.max(b.x, 8), W - b.w - 8),
    y: Math.min(Math.max(b.y, 8), H - b.h - 8),
  });
  const hits = (b: Box) =>
    others.some(([ox, oy]) => {
      const cx = Math.max(b.x, Math.min(ox, b.x + b.w));
      const cy = Math.max(b.y, Math.min(oy, b.y + b.h));
      return Math.hypot(ox - cx, oy - cy) < BADGE_R + 6;
    });
  for (const c of candidates) {
    const b = clamp(c);
    if (!hits(b) && Math.hypot(b.x + b.w / 2 - x, b.y + b.h / 2 - y) < 260) {
      // Também não pode cobrir a própria contagem.
      if (!(x > b.x - BADGE_R && x < b.x + b.w + BADGE_R && y > b.y - BADGE_R && y < b.y + b.h + BADGE_R)) return b;
    }
  }
  return clamp(candidates[0]);
}

export function RegionMap({ cities, defaultId }: { cities: MapCity[]; defaultId: string }) {
  const [selectedId, setSelectedId] = useState(defaultId);
  const [hoverId, setHoverId] = useState<string | null>(null);
  const uid = useId().replace(/:/g, "");
  const selected = cities.find((c) => c.id === selectedId) ?? cities[0];
  // Um rótulo por vez: o da cidade sob o mouse/foco ou, sem isso, o da selecionada.
  const labelled = cities.find((c) => c.id === (hoverId ?? selectedId));

  const select = (id: string) => setSelectedId(id);
  const onKey = (e: React.KeyboardEvent, id: string) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      select(id);
    }
  };

  const spShape = CITY_SHAPES["sao-paulo"];

  return (
    <div data-hide-wa-float="" className="region-map w-full min-w-0">
      <svg
        viewBox={`0 0 ${W} ${H}`}
        className="mx-auto block h-auto w-full max-w-[460px]"
        role="group"
        aria-label="Mapa ilustrativo das cidades da região"
      >
        <defs>
          <linearGradient id={`fx-${uid}`} x1="0" x2="1" y1="0" y2="0">
            <stop offset="0" stopColor="#fff" stopOpacity="0" />
            <stop offset="0.07" stopColor="#fff" />
            <stop offset="0.93" stopColor="#fff" />
            <stop offset="1" stopColor="#fff" stopOpacity="0" />
          </linearGradient>
          <linearGradient id={`fy-${uid}`} x1="0" x2="0" y1="0" y2="1">
            <stop offset="0" stopColor="#fff" stopOpacity="0" />
            <stop offset="0.07" stopColor="#fff" />
            <stop offset="0.93" stopColor="#fff" />
            <stop offset="1" stopColor="#fff" stopOpacity="0" />
          </linearGradient>
          {/* Borda esmaecida: indica que os municípios continuam além do recorte. */}
          <mask id={`fadex-${uid}`} maskUnits="userSpaceOnUse" x="0" y="0" width={W} height={H}>
            <rect width={W} height={H} fill={`url(#fx-${uid})`} />
          </mask>
          <mask id={`fadey-${uid}`} maskUnits="userSpaceOnUse" x="0" y="0" width={W} height={H}>
            <rect width={W} height={H} fill={`url(#fy-${uid})`} />
          </mask>
          <filter id={`glow-${uid}`} x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="6" />
          </filter>
        </defs>

        <g mask={`url(#fadex-${uid})`}>
          <g mask={`url(#fadey-${uid})`}>
            {/* Vizinhas só de referência: sem clique, sem rótulo. */}
            {Object.entries(CONTEXT_SHAPES).map(([id, s]) => (
              <path key={id} d={s.d} className="rm-context" aria-hidden="true" />
            ))}

            {/* Área de toque ampliada (fica por baixo, só pega o entorno vazio). */}
            {cities.map((c) => (
              <path
                key={`hit-${c.id}`}
                d={CITY_SHAPES[c.id].d}
                className="rm-hit"
                aria-hidden="true"
                onClick={() => select(c.id)}
                onPointerEnter={() => setHoverId(c.id)}
                onPointerLeave={() => setHoverId(null)}
              />
            ))}

            {cities.map((c) => {
              const active = c.id === selected.id;
              return (
                <path
                  key={c.id}
                  d={CITY_SHAPES[c.id].d}
                  role="button"
                  tabIndex={0}
                  aria-label={`Ver notícias de ${c.name}`}
                  aria-pressed={active}
                  data-empty={c.count === 0 || undefined}
                  className="rm-city"
                  onClick={() => select(c.id)}
                  onKeyDown={(e) => onKey(e, c.id)}
                  onPointerEnter={() => setHoverId(c.id)}
                  onPointerLeave={() => setHoverId(null)}
                  onFocus={() => setHoverId(c.id)}
                  onBlur={() => setHoverId(null)}
                />
              );
            })}

            {/* Brilho só na borda da selecionada */}
            <path
              d={CITY_SHAPES[selected.id].d}
              className="rm-glow"
              filter={`url(#glow-${uid})`}
              aria-hidden="true"
            />
            <path d={CITY_SHAPES[selected.id].d} className="rm-selected-edge" aria-hidden="true" />
          </g>
        </g>

        {spShape && (
          <text x={14} y={Math.min(spShape.point[1] + 120, H - 20)} className="rm-edge-tag" aria-hidden="true">
            ← São Paulo
          </text>
        )}

        {/* Contagem por cidade (também seleciona a cidade) */}
        {cities.map((c) => {
          const [x, y] = CITY_SHAPES[c.id].point;
          const active = c.id === selected.id;
          return (
            <g
              key={`badge-${c.id}`}
              className="rm-badge"
              data-active={active || undefined}
              data-empty={c.count === 0 || undefined}
              transform={`translate(${x} ${y})`}
              onClick={() => select(c.id)}
              onPointerEnter={() => setHoverId(c.id)}
              onPointerLeave={() => setHoverId(null)}
              aria-hidden="true"
            >
              {c.recent && <circle r={BADGE_R} className="rm-pulse" />}
              <circle r={BADGE_R} />
              <text dy="0.35em">{c.count > 99 ? "99+" : c.count}</text>
            </g>
          );
        })}

        {labelled &&
          (() => {
            const [x, y] = CITY_SHAPES[labelled.id].point;
            const others = cities
              .filter((c) => c.id !== labelled.id)
              .map((c) => CITY_SHAPES[c.id].point as [number, number]);
            const b = labelBox(labelled.name, x, y, others);
            return (
              <g className="rm-label" data-active={labelled.id === selected.id || undefined} aria-hidden="true">
                <rect x={b.x} y={b.y} width={b.w} height={b.h} rx={b.h / 2} />
                <text x={b.x + b.w / 2} y={b.y + b.h / 2} dy="0.35em">
                  {labelled.name}
                </text>
              </g>
            );
          })()}
      </svg>

      <p className="mt-2 text-center text-sm text-muted">Mapa ilustrativo. Toque numa cidade.</p>

      <div role="group" aria-label="Escolher cidade" className="-mx-5 mt-3 overflow-x-auto px-5 pb-1 [scrollbar-width:thin]">
        <ul className="flex w-max gap-2">
          {cities.map((c) => {
            const active = c.id === selected.id;
            return (
              <li key={c.id}>
                <button
                  type="button"
                  aria-pressed={active}
                  onClick={() => select(c.id)}
                  className="flex min-h-11 items-center gap-2 whitespace-nowrap rounded-full border border-line px-4 text-sm font-semibold transition-colors hover:border-accent aria-pressed:border-accent aria-pressed:bg-accent aria-pressed:text-accent-ink"
                >
                  {c.name}
                  <span
                    className={`rounded-full px-1.5 text-xs ${active ? "bg-accent-ink/15" : "bg-surface-2 text-muted"}`}
                  >
                    {c.count}
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
      </div>

      <div aria-live="polite" className="mt-3 rounded-xl border border-line bg-surface p-4">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <p className="text-xs font-bold uppercase tracking-[0.14em] text-accent">Região</p>
            <p className="text-lg font-bold leading-tight">{selected.name}</p>
            <p className="text-sm text-muted">
              {selected.count === 0
                ? "Nenhuma notícia ainda"
                : `${selected.count} ${selected.count === 1 ? "notícia" : "notícias"}`}
            </p>
          </div>
          {selected.count > 0 && (
            <Link href={selected.href} className="btn btn-primary shrink-0 !min-h-11 !px-4 !text-sm">
              Ver notícias
            </Link>
          )}
        </div>

        {selected.latest ? (
          <Link href={selected.latest.href} className="group mt-3 flex items-center gap-3 border-t border-line pt-3">
            {selected.latest.coverUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={selected.latest.coverUrl}
                alt={selected.latest.coverAlt ?? ""}
                className="h-12 w-16 shrink-0 rounded-md object-cover"
              />
            ) : null}
            <span className="min-w-0">
              <span className="block text-xs text-muted">Mais recente</span>
              <span className="line-clamp-2 text-sm font-semibold group-hover:text-accent">
                {selected.latest.title}
              </span>
            </span>
          </Link>
        ) : (
          <div className="mt-3 border-t border-line pt-3 text-sm text-muted">
            <p>Ainda não temos notícias de {selected.name}. Quer sugerir uma pauta?</p>
            <WhatsAppButton
              message={`Oi! Vim pelo site do De Quebrada e quero sugerir uma pauta sobre ${selected.name}.`}
              source={`mapa-pauta-${selected.id}`}
              className="mt-2 inline-flex items-center gap-2 font-semibold text-accent underline-offset-4 hover:underline"
              showIcon={false}
            >
              Sugerir pauta pelo WhatsApp
            </WhatsAppButton>
          </div>
        )}
      </div>
    </div>
  );
}
