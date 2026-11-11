import type { Metadata } from "next";
import { BlogIndex, parsePage, parseQuery } from "@/components/blog/BlogIndex";
import { RegionMap } from "@/components/blog/RegionMap";
import { CITIES, DEFAULT_CITY_ID } from "@/data/regiao";
import { PageHero } from "@/components/ui/PageHero";
import { allCategories, listPublished, statsByCategory } from "@/lib/blog";

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
      count: st.count,
      recent: st.recent,
      // Categoria da cidade (criada pelo seed); se tiver sido apagada no painel, cai na busca.
      href: categorySlugs.has(c.slug) ? `/blog/categoria/${c.slug}` : `/blog?q=${encodeURIComponent(c.name)}`,
      latest: st.latest
        ? { title: st.latest.title, href: `/blog/${st.latest.slug}`, coverUrl: st.latest.coverUrl, coverAlt: st.latest.coverAlt }
        : null,
    };
  });

  return (
    <>
      <PageHero
        eyebrow="Portal De Quebrada News"
        title={
          <>
            Notícias da <span className="text-accent">região</span>
          </>
        }
        lead="Ferraz, Poá, Suzano, Itaquá, Mogi e São Paulo. Escolha a cidade no mapa ou busque abaixo."
        aside={<RegionMap cities={mapCities} defaultId={DEFAULT_CITY_ID} />}
        compact
      />
      <BlogIndex items={items} page={page} pages={pages} q={q} categories={categories} basePath="/blog" />
    </>
  );
}
