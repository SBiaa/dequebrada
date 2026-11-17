"use client";

import { useEffect, useMemo, useRef, useState, useSyncExternalStore } from "react";
import { marked } from "marked";

export type PreviewData = {
  title: string;
  excerpt: string;
  body: string;
  categoryName: string;
  authorName: string;
  coverUrl: string | null;
  coverAlt: string;
};

type Mode = "card" | "mobile" | "desktop";
const MODES: { id: Mode; label: string; width: number }[] = [
  { id: "card", label: "Card do blog", width: 380 },
  { id: "mobile", label: "Celular", width: 390 },
  { id: "desktop", label: "Computador", width: 1280 },
];

function esc(s: string) {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

function minutes(md: string) {
  return Math.max(1, Math.round(md.trim().split(/\s+/).filter(Boolean).length / 200));
}

const today = new Intl.DateTimeFormat("pt-BR", { day: "numeric", month: "long", year: "numeric", timeZone: "America/Sao_Paulo" });

/** Mesma marcação do PostCard e da página do post (src/app/blog/[slug]). */
function cardHtml(d: PreviewData, date: string) {
  const cover = d.coverUrl
    ? `<img src="${esc(d.coverUrl)}" alt="${esc(d.coverAlt)}" class="aspect-[16/9] w-full object-cover" />`
    : `<div class="aspect-[16/9] bg-surface-2 [background-image:linear-gradient(135deg,rgb(77_184_234/0.22),transparent_60%)]"></div>`;
  return `<div class="p-4"><article class="flex flex-col overflow-hidden rounded-xl border border-line bg-surface">${cover}
    <div class="flex flex-1 flex-col p-6">
      ${d.categoryName ? `<p class="eyebrow">${esc(d.categoryName)}</p>` : ""}
      <h2 class="mt-3 text-lg font-bold leading-snug tracking-tight">${esc(d.title || "Título da notícia")}</h2>
      <p class="mt-3 flex-1 text-muted">${esc(d.excerpt || "O resumo aparece aqui.")}</p>
      <p class="mt-5 text-sm text-muted">${date} · ${minutes(d.body)} min de leitura</p>
    </div></article></div>`;
}

function postHtml(d: PreviewData, date: string) {
  const body = marked.parse(d.body || "*O texto da notícia aparece aqui.*", { async: false, gfm: true, breaks: true }).replace(
    /<h1(\s|>)/g,
    "<h2$1",
  ).replace(/<\/h1>/g, "</h2>");
  return `<article class="px-5 pb-16 pt-12 md:pt-20">
    <div class="mx-auto max-w-3xl">
      <nav class="text-sm text-muted">Notícias${d.categoryName ? ` / ${esc(d.categoryName)}` : ""}</nav>
      <h1 class="mt-5 text-4xl font-bold leading-tight tracking-tight md:text-5xl">${esc(d.title || "Título da notícia")}</h1>
      <p class="mt-5 text-xl leading-relaxed text-muted">${esc(d.excerpt || "O resumo aparece aqui.")}</p>
      <p class="mt-6 text-sm text-muted">Por ${esc(d.authorName || "Autor")} · ${date} · ${minutes(d.body)} min de leitura</p>
    </div>
    ${
      d.coverUrl
        ? `<figure class="mx-auto mt-10 max-w-5xl"><img src="${esc(d.coverUrl)}" alt="${esc(d.coverAlt)}" class="aspect-[16/9] w-full rounded-2xl object-cover" /></figure>`
        : ""
    }
    <div class="prose-post mx-auto mt-10 max-w-3xl">${body}</div>
  </article>`;
}

// Folhas de estilo e classes de fonte da página atual, copiadas para o iframe (lidas uma vez).
let headCache = "";
function readHead() {
  if (!headCache) {
    const styles = [...document.querySelectorAll('link[rel="stylesheet"], style')].map((n) => n.outerHTML).join("");
    headCache = `${styles}<style>html,body{background:var(--bg)}a{pointer-events:none}</style>|${document.documentElement.className}`;
  }
  return headCache;
}
const noop = () => () => {};

/**
 * Prévia ao vivo do post, em iframe isolado (sem scripts) com o CSS do próprio site,
 * na largura real de cada tela e reduzida para caber no painel.
 */
export function PostPreview({ data }: { data: PreviewData }) {
  const [mode, setMode] = useState<Mode>("card");
  const [deferred, setDeferred] = useState(data);
  const boxRef = useRef<HTMLDivElement>(null);
  const frameRef = useRef<HTMLIFrameElement>(null);
  const [boxW, setBoxW] = useState(0);
  const [frameH, setFrameH] = useState(600);

  const head = useSyncExternalStore(noop, readHead, () => "");

  // Evita reprocessar o markdown a cada tecla.
  useEffect(() => {
    const t = setTimeout(() => setDeferred(data), 200);
    return () => clearTimeout(t);
  }, [data]);

  useEffect(() => {
    const el = boxRef.current;
    if (!el) return;
    const ro = new ResizeObserver(([e]) => setBoxW(e.contentRect.width));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const current = MODES.find((m) => m.id === mode)!;
  const scale = boxW ? Math.min(1, boxW / current.width) : 1;

  const srcDoc = useMemo(() => {
    if (!head) return "";
    const [styles, htmlClass] = head.split("|");
    const date = today.format(new Date());
    const content = mode === "card" ? cardHtml(deferred, date) : postHtml(deferred, date);
    return `<!doctype html><html lang="pt-BR" class="${htmlClass}"><head><meta charset="utf-8">${styles}</head><body>${content}</body></html>`;
  }, [head, deferred, mode]);

  // A altura muda quando o CSS e as imagens terminam de carregar: observa o corpo do iframe.
  const roRef = useRef<ResizeObserver | null>(null);
  function onFrameLoad() {
    const body = frameRef.current?.contentDocument?.body;
    roRef.current?.disconnect();
    if (!body) return;
    const update = () => setFrameH(Math.max(200, Math.ceil(body.getBoundingClientRect().height)));
    roRef.current = new ResizeObserver(update);
    roRef.current.observe(body);
    update();
  }
  useEffect(() => () => roRef.current?.disconnect(), []);

  return (
    <section aria-label="Prévia do post" className="rounded-xl border border-line bg-surface">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-line p-3">
        <p className="px-1 text-sm font-semibold">Prévia</p>
        <div role="tablist" aria-label="Formato da prévia" className="flex gap-1 rounded-lg bg-bg p-1">
          {MODES.map((m) => (
            <button
              key={m.id}
              type="button"
              role="tab"
              aria-selected={mode === m.id}
              onClick={() => setMode(m.id)}
              className={`rounded-md px-3 py-1.5 text-sm transition-colors ${
                mode === m.id ? "bg-accent font-semibold text-accent-ink" : "text-muted hover:text-ink"
              }`}
            >
              {m.label}
            </button>
          ))}
        </div>
      </div>
      <div ref={boxRef} className="max-h-[calc(100vh-11rem)] overflow-y-auto p-3">
        <div
          className={`mx-auto overflow-hidden ${mode === "mobile" ? "rounded-[1.75rem] border-4 border-line" : mode === "desktop" ? "rounded-lg border border-line" : ""}`}
          style={{ width: current.width * scale, height: frameH * scale }}
        >
          {srcDoc && (
            <iframe
              ref={frameRef}
              title={`Prévia: ${current.label}`}
              sandbox="allow-same-origin"
              srcDoc={srcDoc}
              onLoad={onFrameLoad}
              scrolling="no"
              style={{ width: current.width, height: frameH, transform: `scale(${scale})`, transformOrigin: "0 0", border: 0 }}
            />
          )}
        </div>
        <p className="mt-3 text-center text-xs text-muted">
          {mode === "card"
            ? "Como aparece na lista de notícias."
            : `Página do post em ${current.width}px${scale < 1 ? `, reduzida a ${Math.round(scale * 100)}%` : ""}. Data de hoje.`}
        </p>
      </div>
    </section>
  );
}
