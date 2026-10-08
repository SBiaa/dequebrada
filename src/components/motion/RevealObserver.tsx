"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";

/**
 * Revela com fade/slide os elementos marcados com data-reveal="" quando entram na tela.
 * Sem JS ou com "reduzir movimento" ativado, tudo fica visível normalmente.
 */
export function RevealObserver() {
  const pathname = usePathname();

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          (entry.target as HTMLElement).dataset.reveal = "shown";
          io.unobserve(entry.target);
        }
      },
      { rootMargin: "0px 0px -8% 0px" },
    );

    document
      .querySelectorAll<HTMLElement>('[data-reveal=""], [data-reveal="hidden"]')
      .forEach((el) => {
        if (el.dataset.reveal === "") {
          const rect = el.getBoundingClientRect();
          if (rect.top < window.innerHeight * 0.92) {
            el.dataset.reveal = "shown";
            return;
          }
          el.dataset.reveal = "hidden";
        }
        io.observe(el);
      });

    return () => io.disconnect();
  }, [pathname]);

  return null;
}
