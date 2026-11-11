import type { Metadata } from "next";
import { BlogIndex, parsePage, parseQuery } from "@/components/blog/BlogIndex";
import { PageHero } from "@/components/ui/PageHero";
import { allCategories, listPublished } from "@/lib/blog";

export const revalidate = 300;

export async function generateMetadata({ searchParams }: PageProps<"/blog">): Promise<Metadata> {
  const sp = await searchParams;
  const page = parsePage(sp.pagina);
  const q = parseQuery(sp.q);
  return {
    title: page > 1 ? `Notícias de Ferraz de Vasconcelos e Região · Página ${page}` : "Notícias de Ferraz de Vasconcelos e Região",
    description:
      "Notícias de Ferraz de Vasconcelos, Poá, Suzano, Itaquaquecetuba, Mogi das Cruzes e Alto Tietê, pelo portal De Quebrada.",
    alternates: { canonical: page > 1 ? `/blog?pagina=${page}` : "/blog", types: { "application/rss+xml": "/feed.xml" } },
    // Página de resultado de busca não deve ser indexada.
    ...(q ? { robots: { index: false, follow: true } } : {}),
  };
}

export default async function BlogPage({ searchParams }: PageProps<"/blog">) {
  const sp = await searchParams;
  const page = parsePage(sp.pagina);
  const q = parseQuery(sp.q);
  const [{ items, pages }, categories] = await Promise.all([listPublished({ page, q }), allCategories()]);

  return (
    <>
      <PageHero
        eyebrow="Portal De Quebrada News"
        title={
          <>
            Notícias da <span className="text-accent">região</span>
          </>
        }
        lead="Ferraz de Vasconcelos, Poá, Suzano, Itaquá, Mogi e mais. Busque ou filtre por categoria."
      />
      <BlogIndex items={items} page={page} pages={pages} q={q} categories={categories} basePath="/blog" />
    </>
  );
}
