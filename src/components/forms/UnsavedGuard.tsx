"use client";

import { useEffect, useRef } from "react";

/**
 * Coloque dentro de um <form>. Se algo for digitado e a pessoa tentar fechar
 * a aba ou recarregar sem salvar, o navegador pede confirmação.
 */
export function UnsavedGuard() {
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const form = ref.current?.closest("form");
    if (!form) return;
    let dirty = false;
    const markDirty = () => {
      dirty = true;
    };
    const clear = () => {
      dirty = false;
    };
    const onBeforeUnload = (e: BeforeUnloadEvent) => {
      if (!dirty) return;
      e.preventDefault();
      e.returnValue = "";
    };
    form.addEventListener("input", markDirty);
    form.addEventListener("change", markDirty);
    form.addEventListener("submit", clear);
    window.addEventListener("beforeunload", onBeforeUnload);
    return () => {
      form.removeEventListener("input", markDirty);
      form.removeEventListener("change", markDirty);
      form.removeEventListener("submit", clear);
      window.removeEventListener("beforeunload", onBeforeUnload);
    };
  }, []);

  return <span ref={ref} hidden />;
}
