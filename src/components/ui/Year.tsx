"use client";

import { useSyncExternalStore } from "react";

const subscribe = () => () => {};

/** Ano atual, calculado no navegador a cada visita (nunca fica fixo no código). */
export function Year() {
  const year = useSyncExternalStore(
    subscribe,
    () => String(new Date().getFullYear()),
    () => String(new Date().getFullYear()),
  );
  return <span suppressHydrationWarning>{year}</span>;
}
