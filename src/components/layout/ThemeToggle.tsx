"use client";

import { useEffect, useState } from "react";

type Theme = "dark" | "light";

export function ThemeToggle({ className = "" }: { className?: string }) {
  const [theme, setTheme] = useState<Theme | null>(null);
  const [logged, setLogged] = useState(false);

  // Tema claro é só para quem está logado (membros e admin). Visitante vê sempre o escuro.
  useEffect(() => {
    let alive = true;
    fetch("/api/sessao", { cache: "no-store" })
      .then((r) => r.json())
      .then((d: { logged?: boolean }) => {
        if (!alive) return;
        if (d.logged) {
          setLogged(true);
          setTheme(document.documentElement.dataset.theme === "light" ? "light" : "dark");
        } else {
          delete document.documentElement.dataset.theme;
          setLogged(false);
        }
      })
      .catch(() => {});
    return () => {
      alive = false;
    };
  }, []);

  function toggle() {
    const next: Theme = theme === "light" ? "dark" : "light";
    document.documentElement.dataset.theme = next;
    try {
      localStorage.setItem("theme", next);
    } catch {}
    const meta = document.querySelector('meta[name="theme-color"]');
    meta?.setAttribute("content", next === "light" ? "#f6f3ec" : "#05080f");
    setTheme(next);
  }

  if (!logged) return null;
  const isLight = theme === "light";
  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={isLight ? "Mudar para tema escuro" : "Mudar para tema claro"}
      title={isLight ? "Tema escuro" : "Tema claro"}
      className={`flex h-11 w-11 items-center justify-center rounded-lg border border-line text-ink transition-colors hover:border-accent hover:text-accent ${className}`}
    >
      {isLight ? (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z" />
        </svg>
      ) : (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <circle cx="12" cy="12" r="4" />
          <path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
        </svg>
      )}
    </button>
  );
}
