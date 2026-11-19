import "server-only";
import { and, count, desc, eq, ilike, inArray, lte, ne, or, sql } from "drizzle-orm";
import { marked } from "marked";
import sanitizeHtml from "sanitize-html";
import { db, schema } from "@/db";

const { posts, categories } = schema;

export const PAGE_SIZE = 9;

/** "Notícia de Ferraz: Ônibus!" -> "noticia-de-ferraz-onibus" (sem acento). */
export function slugify(text: string): string {
  return text
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

/** Minutos de leitura (200 palavras por minuto). */
export function readingMinutes(markdown: string): number {
  const words = markdown.trim().split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(words / 200));
}

/** Markdown -> HTML seguro (sem script, sem atributos perigosos). */
export function renderMarkdown(markdown: string): string {
  const raw = marked.parse(markdown, { async: false, gfm: true, breaks: true });
  return sanitizeHtml(raw, {
    allowedTags: [
      "p", "br", "strong", "em", "a", "ul", "ol", "li", "blockquote",
      "h2", "h3", "h4", "img", "hr", "code", "pre", "figure", "figcaption",
    ],
    // target/rel são colocados pelo transformTags abaixo, não pelo autor.
    allowedAttributes: { a: ["href", "title", "target", "rel"], img: ["src", "alt", "title"] },
    allowedSchemes: ["https", "http", "mailto"],
    transformTags: {
      // O título do post é o único H1 da página.
      h1: "h2",
      a: (tagName, attribs) => {
        const href = attribs.href ?? "";
        const out: Record<string, string> = { href };
        if (attribs.title) out.title = attribs.title;
        if (/^https?:\/\//.test(href)) {
          out.target = "_blank";
          out.rel = "noopener noreferrer";
        }
        return { tagName, attribs: out };
      },
    },
    allowedSchemesAppliedToAttributes: ["href", "src"],
  });
}

export const postListFields = {
  id: posts.id,
  slug: posts.slug,
  title: posts.title,
  excerpt: posts.excerpt,
  coverUrl: posts.coverUrl,
  coverAlt: posts.coverAlt,
  readingMinutes: posts.readingMinutes,
  publishedAt: posts.publishedAt,
  authorName: posts.authorName,
  categoryName: categories.name,
  categorySlug: categories.slug,
};

export type PostListItem = {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  coverUrl: string | null;
  coverAlt: string | null;
  readingMinutes: number;
  publishedAt: Date | null;
  authorName: string;
  categoryName: string | null;
  categorySlug: string | null;
};

/** Publicado e com data já chegada (posts agendados só aparecem na hora marcada). */
const published = and(eq(posts.status, "published"), lte(posts.publishedAt, sql`now()`))!;

export async function listPublished(opts: {
  page?: number;
  q?: string;
  categorySlug?: string;
}): Promise<{ items: PostListItem[]; total: number; pages: number }> {
  const page = Math.max(1, opts.page ?? 1);
  const filters = [published];
  if (opts.categorySlug) filters.push(eq(categories.slug, opts.categorySlug));
  const q = opts.q?.trim().slice(0, 100);
  if (q) {
    const like = `%${q.replace(/[%_\\]/g, "\\$&")}%`;
    filters.push(or(ilike(posts.title, like), ilike(posts.excerpt, like), ilike(posts.body, like))!);
  }
  const where = and(...filters);

  const [items, [{ total }]] = await Promise.all([
    db
      .select(postListFields)
      .from(posts)
      .leftJoin(categories, eq(posts.categoryId, categories.id))
      .where(where)
      .orderBy(desc(posts.publishedAt))
      .limit(PAGE_SIZE)
      .offset((page - 1) * PAGE_SIZE),
    db
      .select({ total: count() })
      .from(posts)
      .leftJoin(categories, eq(posts.categoryId, categories.id))
      .where(where),
  ]);
  return { items, total, pages: Math.max(1, Math.ceil(total / PAGE_SIZE)) };
}

export async function getPublishedPost(slug: string) {
  const [row] = await db
    .select({ ...postListFields, body: posts.body, updatedAt: posts.updatedAt, categoryId: posts.categoryId })
    .from(posts)
    .leftJoin(categories, eq(posts.categoryId, categories.id))
    .where(and(published, eq(posts.slug, slug)))
    .limit(1);
  return row ?? null;
}

/** Mesma categoria primeiro, depois os mais recentes. */
export async function relatedPosts(postId: string, categoryId: number | null, limit = 3) {
  return db
    .select(postListFields)
    .from(posts)
    .leftJoin(categories, eq(posts.categoryId, categories.id))
    .where(and(published, ne(posts.id, postId)))
    .orderBy(
      categoryId ? sql`case when ${posts.categoryId} = ${categoryId} then 0 else 1 end` : sql`1`,
      desc(posts.publishedAt),
    )
    .limit(limit);
}

export async function allCategories() {
  return db.select().from(categories).orderBy(categories.name);
}

export type CityStats = {
  count: number;
  /** Data da notícia mais recente (ISO). */
  latestAt: string | null;
  /** Notícia publicada nas últimas 24 horas. */
  recent: boolean;
  latest: CityPost | null;
  /** Até 3 notícias mais recentes da cidade. */
  top: CityPost[];
};

export type CityPost = {
  title: string;
  slug: string;
  coverUrl: string | null;
  coverAlt: string | null;
  publishedAt: string | null;
};

/** Para cada slug de categoria: total de notícias publicadas e a manchete mais recente. */
export async function statsByCategory(slugs: string[]): Promise<Record<string, CityStats>> {
  const out: Record<string, CityStats> = Object.fromEntries(
    slugs.map((s) => [s, { count: 0, latestAt: null, recent: false, latest: null, top: [] }]),
  );
  if (slugs.length === 0) return out;
  const [counts, latest] = await Promise.all([
    db
      .select({ slug: categories.slug, total: count() })
      .from(posts)
      .innerJoin(categories, eq(posts.categoryId, categories.id))
      .where(and(published, inArray(categories.slug, slugs)))
      .groupBy(categories.slug),
    // As mais recentes por cidade; o corte em 3 por cidade é feito abaixo.
    db
      .select({
        catSlug: categories.slug,
        title: posts.title,
        slug: posts.slug,
        coverUrl: posts.coverUrl,
        coverAlt: posts.coverAlt,
        publishedAt: posts.publishedAt,
      })
      .from(posts)
      .innerJoin(categories, eq(posts.categoryId, categories.id))
      .where(and(published, inArray(categories.slug, slugs)))
      .orderBy(categories.slug, desc(posts.publishedAt))
      .limit(slugs.length * 40),
  ]);
  for (const c of counts) out[c.slug].count = c.total;
  for (const l of latest) {
    const city = out[l.catSlug];
    if (city.top.length >= 3) continue;
    const post: CityPost = {
      title: l.title,
      slug: l.slug,
      coverUrl: l.coverUrl,
      coverAlt: l.coverAlt,
      publishedAt: l.publishedAt?.toISOString() ?? null,
    };
    city.top.push(post);
    if (city.top.length === 1) {
      city.latest = post;
      city.latestAt = post.publishedAt;
      city.recent = !!l.publishedAt && Date.now() - l.publishedAt.getTime() < 24 * 3600 * 1000;
    }
  }
  return out;
}

export async function getCategory(slug: string) {
  const [row] = await db.select().from(categories).where(eq(categories.slug, slug)).limit(1);
  return row ?? null;
}

export async function allPublishedForFeed(limit = 1000) {
  return db
    .select({ ...postListFields, updatedAt: posts.updatedAt })
    .from(posts)
    .leftJoin(categories, eq(posts.categoryId, categories.id))
    .where(published)
    .orderBy(desc(posts.publishedAt))
    .limit(limit);
}

export function formatDate(date: Date | null): string {
  if (!date) return "";
  return new Intl.DateTimeFormat("pt-BR", { day: "numeric", month: "long", year: "numeric", timeZone: "America/Sao_Paulo" }).format(date);
}
