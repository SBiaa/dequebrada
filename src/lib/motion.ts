import type { CSSProperties } from "react";

/** Atraso escalonado (em ms) para entradas em sequência. */
export const stagger = (i: number, step = 90): CSSProperties =>
  ({ "--d": `${i * step}ms` }) as CSSProperties;
