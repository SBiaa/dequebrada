import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { BlogIndex, parsePage, parseQuery } from "@/components/blog/BlogIndex";
import { PageHero } from "@/components/ui/PageHero";
import { allCategories, getCategory, listPublished } from "@/lib/blog";

export const revalidate = 300;

export async function generateMetadata({
  params,
  searchParams,
}: PageProps<"/blog/categoria/[categoria]">): Promise<Metadata> {
  const { categoria } = await params;
  const page = parsePage((await searchParams).pagina);
  const cat = await getCategory(categoria);
  if (!cat) return {};
  return {
    title: `${cat.name}: Notícias${page > 1 ? ` · Página ${page}` : ""}`,
    description: `Notícias de ${cat.name} no portal De Quebrada, de Ferraz de Vasconcelos e Alto Tietê.`,
    alternates: { canonical: `/blog/categoria/${cat.slug}${page > 1 ? `?pagina=${page}` : ""}` },
  };
}

export default async function CategoriaPage({ params, searchParams }: PageProps<"/blog/categoria/[categoria]">) {
  const { categoria } = await params;
  const sp = await searchParams;
  const cat = await getCategory(categoria);
  if (!cat) notFound();
  const page = parsePage(sp.pagina);
  const q = parseQuery(sp.q);
  const [{ items, pages }, categories] = await Promise.all([
    listPublished({ page, q, categorySlug: cat.slug }),
    allCategories(),
  ]);

  return (
    <>
      <PageHero
        eyebrow="Portal De Quebrada News"
        title={
          <>
            Notícias: <span className="text-accent">{cat.name}</span>
          </>
        }
      />
      <BlogIndex
        items={items}
        page={page}
        pages={pages}
        q={q}
        categories={categories}
        activeCategory={cat.slug}
        basePath={`/blog/categoria/${cat.slug}`}
      />
    </>
  );
}
