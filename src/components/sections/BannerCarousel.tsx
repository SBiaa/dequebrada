"use client";

import { useCallback, useEffect, useState } from "react";

type Item = { id: string; imageUrl: string; imageAlt: string; linkUrl: string | null };

const INTERVAL_MS = 5000;

/** Banners em slide: troca sozinho, com setas, bolinhas e arrastar no celular. Pausa ao passar o mouse/focar. */
export function BannerCarousel({ items }: { items: Item[] }) {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const [touchX, setTouchX] = useState<number | null>(null);
  const total = items.length;

  const go = useCallback((i: number) => setIndex(((i % total) + total) % total), [total]);

  useEffect(() => {
    if (paused || total < 2) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const t = setInterval(() => setIndex((i) => (i + 1) % total), INTERVAL_MS);
    return () => clearInterval(t);
  }, [paused, total]);

  return (
    <div
      className="relative overflow-hidden rounded-xl border border-line bg-surface"
      role="region"
      aria-roledescription="carrossel"
      aria-label="Comunicados de parceiros"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={() => setPaused(false)}
      onTouchStart={(e) => setTouchX(e.touches[0].clientX)}
      onTouchEnd={(e) => {
        if (touchX === null) return;
        const dx = e.changedTouches[0].clientX - touchX;
        if (Math.abs(dx) > 40) go(index + (dx < 0 ? 1 : -1));
        setTouchX(null);
      }}
    >
      <ul
        className="flex transition-transform duration-500 ease-out motion-reduce:transition-none"
        style={{ transform: `translateX(-${index * 100}%)` }}
      >
        {items.map((b, i) => {
          const img = (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={b.imageUrl}
              alt={b.imageAlt}
              loading={i === 0 ? "eager" : "lazy"}
              className="aspect-[4/1] w-full object-cover"
            />
          );
          return (
            <li
              key={b.id}
              className="w-full shrink-0"
              aria-roledescription="slide"
              aria-label={`${i + 1} de ${total}`}
              aria-hidden={i !== index}
            >
              {b.linkUrl ? (
                <a
                  href={b.linkUrl}
                  target="_blank"
                  rel="noopener noreferrer sponsored"
                  tabIndex={i === index ? 0 : -1}
                  className="block"
                >
                  {img}
                  <span className="sr-only">(abre em nova aba)</span>
                </a>
              ) : (
                img
              )}
            </li>
          );
        })}
      </ul>

      {total > 1 && (
        <>
          <button
            type="button"
            onClick={() => go(index - 1)}
            aria-label="Banner anterior"
            className="absolute left-2 top-1/2 grid size-9 -translate-y-1/2 place-items-center rounded-full bg-black/40 text-xl text-white backdrop-blur transition hover:bg-black/60"
          >
            ‹
          </button>
          <button
            type="button"
            onClick={() => go(index + 1)}
            aria-label="Próximo banner"
            className="absolute right-2 top-1/2 grid size-9 -translate-y-1/2 place-items-center rounded-full bg-black/40 text-xl text-white backdrop-blur transition hover:bg-black/60"
          >
            ›
          </button>
          <div className="absolute bottom-2 left-1/2 flex -translate-x-1/2 gap-1.5">
            {items.map((b, i) => (
              <button
                key={b.id}
                type="button"
                onClick={() => go(i)}
                aria-label={`Ir para o banner ${i + 1}`}
                aria-current={i === index}
                className={`h-2 rounded-full bg-white transition-all ${i === index ? "w-6" : "w-2 opacity-60"}`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
