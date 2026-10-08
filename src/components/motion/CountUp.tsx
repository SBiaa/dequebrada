"use client";

import { useEffect, useRef } from "react";

function parse(value: string) {
  const m = value.match(/^(\D*?)(\d[\d.,]*)(.*)$/);
  if (!m || m[1] !== "") return null;
  const decimals = m[2].includes(",") ? m[2].split(",")[1].length : 0;
  const n = parseFloat(m[2].replace(",", "."));
  return Number.isFinite(n) ? { n, decimals, suffix: m[3] } : null;
}

/**
 * Número que conta de 0 até o valor quando aparece na tela.
 * O HTML já nasce com o valor final (leitores de tela e sem JS veem o número certo).
 */
export function CountUp({ value, duration = 1500 }: { value: string; duration?: number }) {
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const el = ref.current;
    const parsed = parse(value);
    if (!el || !parsed) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const fmt = (v: number) =>
      v.toLocaleString("pt-BR", {
        minimumFractionDigits: parsed.decimals,
        maximumFractionDigits: parsed.decimals,
      }) + parsed.suffix;

    let raf = 0;
    el.textContent = fmt(0);

    const run = () => {
      const start = performance.now();
      const tick = (now: number) => {
        const p = Math.min((now - start) / duration, 1);
        el.textContent = fmt(parsed.n * (1 - Math.pow(1 - p, 3)));
        if (p < 1) raf = requestAnimationFrame(tick);
      };
      raf = requestAnimationFrame(tick);
    };

    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          io.disconnect();
          run();
        }
      },
      { threshold: 0.4 },
    );
    io.observe(el);

    return () => {
      io.disconnect();
      cancelAnimationFrame(raf);
      el.textContent = value;
    };
  }, [value, duration]);

  return (
    <>
      <span ref={ref} aria-hidden="true">
        {value}
      </span>
      <span className="sr-only">{value}</span>
    </>
  );
}
