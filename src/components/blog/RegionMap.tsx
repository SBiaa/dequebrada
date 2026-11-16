"use client";

import Link from "next/link";
import { useId, useMemo, useRef, useState, useSyncExternalStore } from "react";
import { WhatsAppButton } from "@/components/ui/WhatsAppButton";
import { CITY_SHAPES, CONTEXT_SHAPES, MAP_VIEWBOX } from "@/data/mapa-regiao";

export type MapPost = { title: string; href: string; coverUrl: string | null; coverAlt: string | null; date: string };

export type MapCity = {
  id: string;
  name: string;
  /** Nome curto (abas do desktop). */
  short: string;
  href: string;
  count: number;
  /** Notícia publicada nas últimas 24 horas (calculado no servidor). */
  recent: boolean;
  latest: MapPost | null;
  /** Até 3 notícias mais recentes (painel do desktop). */
  posts: MapPost[];
};

export type ContextCity = { id: string; name: string };

const { width: W, height: H } = MAP_VIEWBOX;
const BADGE_R = 30;

/** Media query sem diferença entre servidor e navegador: no servidor vale o layout mobile. */
function useMedia(query: string): boolean {
  return useSyncExternalStore(
    (cb) => {
      const m = window.matchMedia(query);
      m.addEventListener("change", cb);
      return () => m.removeEventListener("change", cb);
    },
    () => window.matchMedia(query).matches,
    () => false,
  );
}

// ---------- Posicionamento de rótulos ----------

type Box = { x: number; y: number; w: number; h: number };

const overlaps = (a: Box, b: Box, pad = 4) =>
  a.x < b.x + b.w + pad && a.x + a.w + pad > b.x && a.y < b.y + b.h + pad && a.y + a.h + pad > b.y;

const clampBox = (b: Box): Box => ({
  ...b,
  x: Math.min(Math.max(b.x, 8), W - b.w - 8),
  y: Math.min(Math.max(b.y, 8), H - b.h - 8),
});

const badgeBox = (id: string): Box => {
  const [x, y] = CITY_SHAPES[id].point;
  return { x: x - BADGE_R, y: y - BADGE_R, w: 2 * BADGE_R, h: 2 * BADGE_R };
};

/** Caixas candidatas em volta de um ponto (centro, acima, abaixo, lados), presas ao quadro. */
function candidates(x: number, y: number, w: number, h: number, center: boolean): Box[] {
  const g = BADGE_R + 12;
  const list: Box[] = [
    { x: x - w / 2, y: y - g - h, w, h },
    { x: x - w / 2, y: y + g, w, h },
    { x: x + g, y: y - h / 2, w, h },
    { x: x - g - w, y: y - h / 2, w, h },
    { x: x - w / 2, y: y - 2 * g - h, w, h },
    { x: x - w / 2, y: y + 2 * g, w, h },
  ];
  if (center) list.unshift({ x: x - w / 2, y: y - h / 2, w, h });
  return list.map(clampBox);
}

/** Mobile: um rótulo só (selecionada ou sob o dedo/foco), sem cobrir contagens. */
function singleLabel(id: string, name: string, others: Box[]): Box {
  const [x, y] = CITY_SHAPES[id].point;
  const font = 38;
  const w = name.length * font * 0.56 + 36;
  const h = font + 22;
  const options = candidates(x, y, w, h, false);
  const self = badgeBox(id);
  return options.find((b) => !overlaps(b, self, 6) && !others.some((o) => overlaps(b, o, 6))) ?? options[0];
}

type DesktopLabel = { id: string; name: string; box: Box; kind: "selected" | "city" | "empty" | "context" };

/**
 * Desktop: rótulo em todas as cidades. Colocação gulosa (selecionada primeiro),
 * sem sobrepor outros rótulos nem as contagens; Guarulhos e Arujá por último.
 */
function desktopLabels(cities: MapCity[], selectedId: string, context: ContextCity[]): DesktopLabel[] {
  const placed: DesktopLabel[] = [];
  const badges = cities.filter((c) => c.count > 0).map((c) => badgeBox(c.id));
  const order = [...cities].sort((a, b) => (a.id === selectedId ? -1 : b.id === selectedId ? 1 : 0));

  const place = (id: string, name: string, kind: DesktopLabel["kind"], font: number, padX: number, padY: number) => {
    const [x, y] = (CITY_SHAPES[id] ?? CONTEXT_SHAPES[id]).point;
    const w = name.length * font * 0.56 + padX * 2;
    const h = font + padY * 2;
    const hasBadge = kind !== "context" && (cities.find((c) => c.id === id)?.count ?? 0) > 0;
    const options = candidates(x, y, w, h, !hasBadge);
    const free = options.find(
      (b) => !placed.some((p) => overlaps(b, p.box, 6)) && !badges.some((o) => overlaps(b, o, 4)),
    );
    if (free) placed.push({ id, name, kind, box: free });
    else if (kind !== "context") placed.push({ id, name, kind, box: options[0] });
  };

  for (const c of order) {
    const kind = c.id === selectedId ? "selected" : c.count === 0 ? "empty" : "city";
    if (kind === "selected") place(c.id, c.name, kind, 28, 18, 9);
    else place(c.id, c.name, kind, 24, 6, 4);
  }
  for (const c of context) place(c.id, c.name, "context", 20, 4, 3);
  return placed;
}

// ---------- Componente ----------

type Props = {
  cities: MapCity[];
  context: ContextCity[];
  defaultId: string;
  eyebrow: string;
  title: React.ReactNode;
  lead: string;
  /** Mais recentes da região, para o painel quando a cidade não tem notícia. */
  regionLatest: MapPost[];
};

/**
 * Topo do /blog: título + mapa da região + escolha de cidade + card.
 * Abaixo de 1024px: título, mapa, chips e card empilhados (layout mobile aprovado).
 * A partir de 1024px: mapa grande à esquerda; à direita título, abas das cidades e as 3 notícias
 * mais recentes da cidade escolhida.
 */
export function RegionMapSection({ cities, context, defaultId, eyebrow, title, lead, regionLatest }: Props) {
  const [selectedId, setSelectedId] = useState(defaultId);
  const [hoverId, setHoverId] = useState<string | null>(null);
  const [tip, setTip] = useState<{ id: string; left: number; top: number } | null>(null);
  const isDesktop = useMedia("(min-width: 1024px)");
  const canHover = useMedia("(hover: hover)");
  const wrapRef = useRef<HTMLDivElement>(null);
  const uid = useId().replace(/:/g, "");

  const selected = cities.find((c) => c.id === selectedId) ?? cities[0];
  const labels = useMemo(
    () => (isDesktop ? desktopLabels(cities, selected.id, context) : []),
    [isDesktop, cities, selected.id, context],
  );
  const mobileLabelled = cities.find((c) => c.id === (hoverId ?? selected.id));
  const tipCity = tip ? cities.find((c) => c.id === tip.id) : undefined;

  const select = (id: string) => setSelectedId(id);
  const onKey = (e: React.KeyboardEvent, id: string) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      select(id);
    }
  };

  /** Realce + tooltip (no desktop, posicionado no ponto da cidade, dentro do mapa). */
  const showTip = (id: string) => {
    setHoverId(id);
    const wrap = wrapRef.current;
    if (!isDesktop || !wrap) return;
    const box = wrap.getBoundingClientRect();
    const svg = wrap.querySelector("svg")!.getBoundingClientRect();
    const scale = Math.min(svg.width / W, svg.height / H);
    const offX = svg.left + (svg.width - W * scale) / 2 - box.left;
    const offY = svg.top + (svg.height - H * scale) / 2 - box.top;
    const [px, py] = CITY_SHAPES[id].point;
    // Tooltip de 256px: preso dentro do mapa.
    const left = Math.min(Math.max(offX + px * scale, 136), box.width - 136);
    setTip({ id, left, top: Math.max(offY + py * scale - 30, 110) });
  };
  const hideTip = () => {
    setHoverId(null);
    setTip(null);
  };
  // Tooltip só em aparelhos com mouse de verdade.
  const hoverProps = (id: string) => ({
    onPointerEnter: () => (canHover ? showTip(id) : setHoverId(id)),
    onPointerLeave: hideTip,
  });

  const spShape = CITY_SHAPES["sao-paulo"];

  return (
    <section
      data-hide-wa-float=""
      className="region-map relative overflow-hidden bg-bg px-5 pb-10 pt-8 md:pb-16 md:pt-14 lg:pb-8 lg:pt-8"
    >
      <div
        aria-hidden="true"
        className="drift pointer-events-none absolute inset-0 [background:radial-gradient(60rem_28rem_at_88%_-12%,rgb(77_184_234/0.14),transparent_65%)]"
      />
      <div className="relative mx-auto grid max-w-6xl lg:grid-cols-[minmax(0,0.56fr)_minmax(0,0.44fr)] lg:grid-rows-[auto_auto_1fr] lg:gap-x-10 xl:gap-x-14">
        {/* Título */}
        <div className="lg:col-start-2 lg:row-start-1">
          <p className="eyebrow hero-in mb-3">{eyebrow}</p>
          <h1
            className="h1 hero-in max-w-3xl !text-[clamp(2.5rem,8vw,6rem)] lg:!text-[4rem] xl:!text-[4.25rem]"
            style={{ "--d": "100ms" } as React.CSSProperties}
          >
            {title}
          </h1>
          <p
            className="hero-in mt-3 max-w-2xl text-base leading-relaxed text-muted md:text-xl lg:text-lg"
            style={{ "--d": "220ms" } as React.CSSProperties}
          >
            {lead}
          </p>
        </div>

        {/* Mapa */}
        <div
          className="hero-in mt-6 min-w-0 lg:col-start-1 lg:row-span-3 lg:row-start-1 lg:mt-0 lg:self-center"
          style={{ "--d": "300ms" } as React.CSSProperties}
        >
          <div ref={wrapRef} className="rm-frame relative">
            <svg
              viewBox={`0 0 ${W} ${H}`}
              className="mx-auto block h-auto w-full max-w-[460px] lg:max-h-[min(600px,calc(100vh-150px))] lg:max-w-none"
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
                <mask id={`fadex-${uid}`} maskUnits="userSpaceOnUse" x="0" y="0" width={W} height={H}>
                  <rect width={W} height={H} fill={`url(#fx-${uid})`} />
                </mask>
                <mask id={`fadey-${uid}`} maskUnits="userSpaceOnUse" x="0" y="0" width={W} height={H}>
                  <rect width={W} height={H} fill={`url(#fy-${uid})`} />
                </mask>
                <filter id={`glow-${uid}`} x="-50%" y="-50%" width="200%" height="200%">
                  <feGaussianBlur stdDeviation="6" />
                </filter>
              </defs>

              {/* Borda esmaecida: os municípios recortados continuam além do quadro. */}
              <g mask={`url(#fadex-${uid})`}>
                <g mask={`url(#fadey-${uid})`}>
                  {Object.entries(CONTEXT_SHAPES).map(([id, s]) => (
                    <g key={id} aria-hidden="true">
                      <path d={s.d} className="rm-context" />
                      <path d={s.outline} className="rm-context-line" />
                    </g>
                  ))}

                  {/* Área de toque ampliada (por baixo: só pega o entorno vazio). */}
                  {cities.map((c) => (
                    <path
                      key={`hit-${c.id}`}
                      d={CITY_SHAPES[c.id].d}
                      className="rm-hit"
                      aria-hidden="true"
                      onClick={() => select(c.id)}
                      {...hoverProps(c.id)}
                    />
                  ))}

                  {cities.map((c) => (
                    <path
                      key={c.id}
                      d={CITY_SHAPES[c.id].d}
                      role="button"
                      tabIndex={0}
                      aria-label={`Ver notícias de ${c.name}`}
                      aria-pressed={c.id === selected.id}
                      data-empty={c.count === 0 || undefined}
                      data-hover={hoverId === c.id || undefined}
                      className="rm-city"
                      onClick={() => select(c.id)}
                      onKeyDown={(e) => onKey(e, c.id)}
                      onFocus={() => showTip(c.id)}
                      onBlur={hideTip}
                      {...hoverProps(c.id)}
                    />
                  ))}

                  {/* Divisas reais (sem os trechos criados pelo recorte) */}
                  {cities.map((c) => (
                    <path
                      key={`line-${c.id}`}
                      d={CITY_SHAPES[c.id].outline}
                      className="rm-line"
                      data-hover={hoverId === c.id || undefined}
                      aria-hidden="true"
                    />
                  ))}

                  {/* Selecionada: brilho e borda só na divisa */}
                  <path
                    d={CITY_SHAPES[selected.id].outline}
                    className="rm-glow"
                    filter={`url(#glow-${uid})`}
                    aria-hidden="true"
                  />
                  <path d={CITY_SHAPES[selected.id].outline} className="rm-selected-edge" aria-hidden="true" />
                </g>
              </g>

              {spShape && (
                <text x={14} y={Math.min(spShape.point[1] + 120, H - 20)} className="rm-edge-tag" aria-hidden="true">
                  ← São Paulo
                </text>
              )}

              {/* Contagem (também seleciona a cidade) */}
              {cities.map((c) => {
                const [x, y] = CITY_SHAPES[c.id].point;
                return (
                  <g
                    key={`badge-${c.id}`}
                    className="rm-badge"
                    data-active={c.id === selected.id || undefined}
                    data-empty={c.count === 0 || undefined}
                    transform={`translate(${x} ${y})`}
                    onClick={() => select(c.id)}
                    {...hoverProps(c.id)}
                    aria-hidden="true"
                  >
                    {c.recent && <circle r={BADGE_R} className="rm-pulse" />}
                    <circle r={BADGE_R} />
                    <text dy="0.35em">{c.count > 99 ? "99+" : c.count}</text>
                  </g>
                );
              })}

              {/* Rótulos: desktop em todas as cidades; mobile só um */}
              {isDesktop
                ? labels.map((l) => (
                    <g key={`dl-${l.id}`} className="rm-dlabel" data-kind={l.kind} aria-hidden="true">
                      {l.kind === "selected" && (
                        <rect x={l.box.x} y={l.box.y} width={l.box.w} height={l.box.h} rx={l.box.h / 2} />
                      )}
                      <text x={l.box.x + l.box.w / 2} y={l.box.y + l.box.h / 2} dy="0.35em">
                        {l.name}
                      </text>
                    </g>
                  ))
                : mobileLabelled &&
                  (() => {
                    const b = singleLabel(
                      mobileLabelled.id,
                      mobileLabelled.name,
                      cities.filter((c) => c.id !== mobileLabelled.id).map((c) => badgeBox(c.id)),
                    );
                    return (
                      <g className="rm-label" data-active={mobileLabelled.id === selected.id || undefined} aria-hidden="true">
                        <rect x={b.x} y={b.y} width={b.w} height={b.h} rx={b.h / 2} />
                        <text x={b.x + b.w / 2} y={b.y + b.h / 2} dy="0.35em">
                          {mobileLabelled.name}
                        </text>
                      </g>
                    );
                  })()}
            </svg>

            {/* Tooltip (desktop: mouse ou foco de teclado) */}
            {isDesktop && tip && tipCity && (
              <div
                role="tooltip"
                className="pointer-events-none absolute z-10 w-64 -translate-x-1/2 -translate-y-full rounded-xl border border-line bg-bg/95 p-3 text-left shadow-xl backdrop-blur"
                style={{ left: tip.left, top: tip.top }}
              >
                <p className="font-bold">{tipCity.name}</p>
                <p className="text-sm text-muted">
                  {tipCity.count === 0
                    ? "Nenhuma notícia ainda"
                    : `${tipCity.count} ${tipCity.count === 1 ? "notícia" : "notícias"}`}
                </p>
                {tipCity.latest && <p className="mt-1 line-clamp-2 text-sm">{tipCity.latest.title}</p>}
              </div>
            )}
          </div>
          <p className="mt-2 text-center text-sm text-muted">Mapa ilustrativo. Toque numa cidade.</p>
        </div>

        {/* Chips (mobile) */}
        <div role="group" aria-label="Escolher cidade" className="scrollbar-none -mx-5 mt-3 overflow-x-auto px-5 pb-1 lg:hidden">
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
                    <span className={`rounded-full px-1.5 text-xs ${active ? "bg-accent-ink/15" : "bg-surface-2 text-muted"}`}>
                      {c.count}
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
        </div>

        {/* Abas das cidades (desktop) */}
        <div
          role="group"
          aria-label="Escolher cidade"
          className="scrollbar-none hidden overflow-x-auto lg:col-start-2 lg:row-start-2 lg:mt-5 lg:block"
        >
          <ul className="flex min-w-max gap-x-3 border-b border-line xl:gap-x-4">
            {cities.map((c) => {
              const active = c.id === selected.id;
              return (
                <li key={c.id}>
                  <button
                    type="button"
                    aria-pressed={active}
                    onClick={() => select(c.id)}
                    onPointerEnter={() => setHoverId(c.id)}
                    onPointerLeave={() => setHoverId(null)}
                    className={`-mb-px flex h-11 items-center gap-1.5 whitespace-nowrap border-b-2 text-sm font-semibold transition-colors ${
                      active ? "border-accent text-ink" : "border-transparent text-muted hover:text-ink"
                    }`}
                  >
                    <span aria-hidden="true">{c.short}</span>
                    <span className="sr-only">{c.name}</span>
                    <span className={`text-xs tabular-nums ${active ? "text-accent" : "text-muted"}`}>{c.count}</span>
                  </button>
                </li>
              );
            })}
          </ul>
        </div>

        {/* Notícias da cidade escolhida (desktop) */}
        <div aria-live="polite" className="hidden lg:col-start-2 lg:row-start-3 lg:mt-4 lg:block">
          {selected.posts.length > 0 ? (
            <>
              <ul className="divide-y divide-line">
                {selected.posts.map((p) => (
                  <li key={p.href}>
                    <Link href={p.href} className="group flex items-center gap-4 py-2.5">
                      {p.coverUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={p.coverUrl}
                          alt={p.coverAlt ?? ""}
                          className="h-14 w-20 shrink-0 rounded-lg object-cover"
                        />
                      ) : (
                        <span
                          aria-hidden="true"
                          className="h-14 w-20 shrink-0 rounded-lg bg-surface-2 [background-image:linear-gradient(135deg,rgb(77_184_234/0.25),transparent_65%)]"
                        />
                      )}
                      <span className="min-w-0">
                        <span className="line-clamp-2 font-semibold leading-snug group-hover:text-accent">
                          {p.title}
                        </span>
                        {p.date && <span className="mt-1 block text-sm text-muted">{p.date}</span>}
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
              <Link href={selected.href} className="btn btn-primary mt-3">
                Ver todas de {selected.name}
                <span aria-hidden="true">→</span>
              </Link>
            </>
          ) : (
            <div className="pt-1">
              <p className="text-lg font-semibold">Ainda não temos notícias de {selected.name}.</p>
              <WhatsAppButton
                message={`Oi! Vim pelo site do De Quebrada e quero sugerir uma pauta sobre ${selected.name}.`}
                source={`mapa-pauta-${selected.id}`}
                className="mt-1 inline-flex items-center gap-2 font-semibold text-accent underline-offset-4 hover:underline"
                showIcon={false}
              >
                Quer sugerir uma pauta? Fale no WhatsApp
              </WhatsAppButton>
              {regionLatest.length > 0 && (
                <>
                  <p className="mt-6 text-xs font-bold uppercase tracking-[0.14em] text-muted">
                    Mais recentes da região
                  </p>
                  <ul className="mt-1 divide-y divide-line">
                    {regionLatest.map((p) => (
                      <li key={p.href}>
                        <Link href={p.href} className="group flex items-baseline justify-between gap-4 py-2.5">
                          <span className="line-clamp-1 font-medium group-hover:text-accent">{p.title}</span>
                          <span className="shrink-0 text-sm text-muted">{p.date}</span>
                        </Link>
                      </li>
                    ))}
                  </ul>
                </>
              )}
            </div>
          )}
        </div>

        {/* Card da cidade selecionada */}
        <div
          aria-live="polite"
          className="mt-3 rounded-xl border border-line bg-surface p-4 lg:hidden"
        >
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
                <span className="line-clamp-2 text-sm font-semibold group-hover:text-accent">{selected.latest.title}</span>
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
    </section>
  );
}
