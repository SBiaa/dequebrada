import Link from "next/link";
import { inputClass } from "@/components/forms/Field";
import { Section } from "@/components/ui/Section";
import type { Category } from "@/db/schema";
import type { PostListItem } from "@/lib/blog";
import { stagger } from "@/lib/motion";
import { PostCard } from "./PostCard";

type Props = {
  items: PostListItem[];
  page: number;
  pages: number;
  q?: string;
  categories: Category[];
  activeCategory?: string;
  /** Caminho base para a paginação: /blog ou /blog/categoria/x */
  basePath: string;
};

function pageHref(basePath: string, page: number, q?: string) {
  const sp = new URLSearchParams();
  if (q) sp.set("q", q);
  if (page > 1) sp.set("pagina", String(page));
  const s = sp.toString();
  return s ? `${basePath}?${s}` : basePath;
}

export function BlogIndex({ items, page, pages, q, categories, activeCategory, basePath }: Props) {
  return (
    <Section labelledBy="lista-posts" className="pt-0 md:pt-0">
      <h2 id="lista-posts" className="sr-only">
        Lista de notícias
      </h2>

      <form action={basePath} method="get" role="search" className="flex max-w-xl gap-2">
        <label htmlFor="busca" className="sr-only">
          Buscar notícias
        </label>
        <input
          id="busca"
          name="q"
          type="search"
          defaultValue={q}
          placeholder="Buscar notícias"
          className={`${inputClass} !mt-0`}
        />
        <button type="submit" className="btn btn-primary shrink-0">
          Buscar
        </button>
      </form>

      {categories.length > 0 && (
        <nav aria-label="Categorias" className="mt-6">
          <ul className="flex flex-wrap gap-2">
            <li>
              <Link
                href="/blog"
                aria-current={!activeCategory ? "page" : undefined}
                className="block rounded-full border border-line px-4 py-2 text-sm font-semibold hover:border-accent aria-[current=page]:border-accent aria-[current=page]:bg-accent aria-[current=page]:text-accent-ink"
              >
                Todas
              </Link>
            </li>
            {categories.map((c) => (
              <li key={c.id}>
                <Link
                  href={`/blog/categoria/${c.slug}`}
                  aria-current={activeCategory === c.slug ? "page" : undefined}
                  className="block rounded-full border border-line px-4 py-2 text-sm font-semibold hover:border-accent aria-[current=page]:border-accent aria-[current=page]:bg-accent aria-[current=page]:text-accent-ink"
                >
                  {c.name}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      )}

      {q && (
        <p className="mt-8 text-muted" role="status">
          {items.length === 0 ? "Nenhuma notícia encontrada para" : "Resultados para"} &quot;{q}&quot;.{" "}
          <Link href={basePath} className="text-accent underline-offset-4 hover:underline">
            Limpar busca
          </Link>
        </p>
      )}

      {items.length === 0 && !q ? (
        <p className="mt-10 text-lg text-muted">Nenhuma notícia publicada ainda.</p>
      ) : (
        <ul className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((post, i) => (
            <li key={post.id} data-reveal="" style={stagger(i % 3, 100)}>
              <PostCard post={post} headingLevel={3} />
            </li>
          ))}
        </ul>
      )}

      {pages > 1 && (
        <nav aria-label="Paginação" className="mt-12 flex items-center justify-between gap-4">
          {page > 1 ? (
            <Link href={pageHref(basePath, page - 1, q)} className="btn btn-ghost" rel="prev">
              ← Anteriores
            </Link>
          ) : (
            <span />
          )}
          <p className="text-sm text-muted">
            Página {page} de {pages}
          </p>
          {page < pages ? (
            <Link href={pageHref(basePath, page + 1, q)} className="btn btn-ghost" rel="next">
              Próximas →
            </Link>
          ) : (
            <span />
          )}
        </nav>
      )}
    </Section>
  );
}

export function parsePage(value: string | string[] | undefined): number {
  const n = Number(Array.isArray(value) ? value[0] : value);
  return Number.isInteger(n) && n > 0 ? n : 1;
}

export function parseQuery(value: string | string[] | undefined): string | undefined {
  const v = (Array.isArray(value) ? value[0] : value)?.trim();
  return v ? v.slice(0, 100) : undefined;
}
