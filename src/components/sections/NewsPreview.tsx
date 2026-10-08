import Link from "next/link";
import { NEWS_POSTS } from "@/lib/news";
import { stagger } from "@/lib/motion";
import { NewsCard } from "@/components/ui/NewsCard";
import { Section, SectionTitle } from "@/components/ui/Section";

export function NewsPreview() {
  return (
    <Section labelledBy="news-titulo" tone="light">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <SectionTitle
          id="news-titulo"
          eyebrow="Portal De Quebrada News"
          title="Últimas notícias da região"
          lead="Ferraz, Poá, Suzano, Itaquá, Mogi, Arujá e região, num lugar só."
        />
        <Link href="/news" className="btn btn-ghost mb-12 self-start sm:self-end md:mb-14">
          Ver todas as notícias
        </Link>
      </div>
      <ul className="grid gap-6 md:grid-cols-3">
        {NEWS_POSTS.slice(0, 3).map((post, i) => (
          <li key={post.title} data-reveal="" style={stagger(i, 120)}>
            <NewsCard post={post} />
          </li>
        ))}
      </ul>
    </Section>
  );
}
