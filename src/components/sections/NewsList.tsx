"use client";

import { useState } from "react";
import { CITIES, NEWS_POSTS } from "@/lib/news";
import { NewsCard } from "@/components/ui/NewsCard";

export function NewsList() {
  const [city, setCity] = useState<string | null>(null);
  const posts = city ? NEWS_POSTS.filter((p) => p.city === city) : NEWS_POSTS;

  return (
    <div>
      <div role="group" aria-label="Filtrar por cidade" className="flex flex-wrap gap-2">
        {[null, ...CITIES].map((c) => (
          <button
            key={c ?? "todas"}
            type="button"
            aria-pressed={city === c}
            onClick={() => setCity(c)}
            className={`min-h-11 rounded-full border px-4 text-sm font-semibold transition-colors ${
              city === c
                ? "border-accent bg-accent text-accent-ink"
                : "border-line bg-surface text-muted hover:border-accent hover:text-ink"
            }`}
          >
            {c ?? "Todas"}
          </button>
        ))}
      </div>

      <p className="mt-6 text-sm text-muted" aria-live="polite">
        {posts.length} {posts.length === 1 ? "notícia" : "notícias"}
        {city ? ` em ${city}` : ""}
      </p>

      {posts.length > 0 ? (
        <ul className="mt-4 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {posts.map((post) => (
            <li key={post.title}>
              <NewsCard post={post} />
            </li>
          ))}
        </ul>
      ) : (
        <p className="mt-8 rounded-xl border border-dashed border-line p-8 text-center text-muted">
          Nenhuma notícia dessa cidade na amostra desta proposta.
        </p>
      )}
    </div>
  );
}
