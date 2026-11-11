import Link from "next/link";
import { PostCard } from "@/components/blog/PostCard";
import { NewsCard } from "@/components/ui/NewsCard";
import { Section, SectionTitle } from "@/components/ui/Section";
import { listPublished } from "@/lib/blog";
import { stagger } from "@/lib/motion";
import { NEWS_POSTS } from "@/lib/news";

/** Últimas 3 notícias do blog. Enquanto não houver post publicado, mostra exemplos do portal atual. */
export async function NewsPreview() {
  const { items } = await listPublished({ page: 1 });
  const latest = items.slice(0, 3);
  return (
    <Section labelledBy="news-titulo" tone="light">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <SectionTitle
          id="news-titulo"
          eyebrow="Portal De Quebrada News"
          title="Últimas notícias da região"
          lead="Ferraz, Poá, Suzano, Itaquá, Mogi, Arujá e região, num lugar só."
        />
        <Link href="/blog" className="btn btn-ghost mb-12 self-start sm:self-end md:mb-14">
          Ver todas as notícias
        </Link>
      </div>
      <ul className="grid gap-6 md:grid-cols-3">
        {latest.length > 0
          ? latest.map((post, i) => (
              <li key={post.id} data-reveal="" style={stagger(i, 120)}>
                <PostCard post={post} headingLevel={3} />
              </li>
            ))
          : NEWS_POSTS.slice(0, 3).map((post, i) => (
              <li key={post.title} data-reveal="" style={stagger(i, 120)}>
                <NewsCard post={post} />
              </li>
            ))}
      </ul>
    </Section>
  );
}
