import type { Metadata } from "next";
import { BlogIndex, parsePage, parseQuery } from "@/components/blog/BlogIndex";
import { RegionMapSection, type MapPost } from "@/components/blog/RegionMap";
import { CITIES, CONTEXT_CITIES, DEFAULT_CITY_ID } from "@/data/regiao";
import { allCategories, formatDate, listPublished, statsByCategory, type CityPost } from "@/lib/blog";

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

function toMapPost(p: CityPost): MapPost {
  return {
    title: p.title,
    href: `/blog/${p.slug}`,
    coverUrl: p.coverUrl,
    coverAlt: p.coverAlt,
    date: p.publishedAt ? formatDate(new Date(p.publishedAt)) : "",
  };
}

export default async function BlogPage({ searchParams }: PageProps<"/blog">) {
  const sp = await searchParams;
  const page = parsePage(sp.pagina);
  const q = parseQuery(sp.q);
  const [{ items, pages }, categories, stats] = await Promise.all([
    listPublished({ page, q }),
    allCategories(),
    statsByCategory(CITIES.map((c) => c.slug)),
  ]);
  const categorySlugs = new Set(categories.map((c) => c.slug));
  const mapCities = CITIES.map((c) => {
    const st = stats[c.slug];
    return {
      id: c.id,
      name: c.name,
      short: c.short,
      count: st.count,
      recent: st.recent,
      // Categoria da cidade (criada pelo seed); se tiver sido apagada no painel, cai na busca.
      href: categorySlugs.has(c.slug) ? `/blog/categoria/${c.slug}` : `/blog?q=${encodeURIComponent(c.name)}`,
      latest: st.latest ? toMapPost(st.latest) : null,
      posts: st.top.map(toMapPost),
    };
  });
  // Para cidade sem notícia: as mais recentes da região (página 1, sem busca).
  const regionLatest = (page === 1 && !q ? items : (await listPublished({ page: 1 })).items)
    .slice(0, 3)
    .map((p) =>
      toMapPost({
        title: p.title,
        slug: p.slug,
        coverUrl: p.coverUrl,
        coverAlt: p.coverAlt,
        publishedAt: p.publishedAt?.toISOString() ?? null,
      }),
    );

  return (
    <>
      <RegionMapSection
        eyebrow="Portal De Quebrada News"
        title={
          <>
            Notícias da <span className="text-accent">região</span>
          </>
        }
        lead="Ferraz, Poá, Suzano, Itaquá, Mogi e São Paulo. Escolha a cidade no mapa ou busque abaixo."
        cities={mapCities}
        context={CONTEXT_CITIES.map(({ id, name }) => ({ id, name }))}
        defaultId={DEFAULT_CITY_ID}
        regionLatest={regionLatest}
      />
      <BlogIndex items={items} page={page} pages={pages} q={q} categories={categories} basePath="/blog" />
    </>
  );
}
