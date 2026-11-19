import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { PostAd } from "@/components/blog/PostAd";
import { PostCard } from "@/components/blog/PostCard";
import { listLiveBanners } from "@/lib/banners";
import { Section } from "@/components/ui/Section";
import { formatDate, getPublishedPost, relatedPosts, renderMarkdown } from "@/lib/blog";
import { SITE } from "@/lib/site";
import { siteUrl } from "@/lib/url";

export const revalidate = 300;

export async function generateStaticParams() {
  // Páginas são geradas na primeira visita e ficam em cache (ISR).
  return [];
}

export async function generateMetadata({ params }: PageProps<"/blog/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPublishedPost(slug);
  if (!post) return {};
  const images = post.coverUrl ? [{ url: post.coverUrl, alt: post.coverAlt ?? post.title }] : undefined;
  return {
    title: post.title,
    description: post.excerpt,
    alternates: { canonical: `/blog/${post.slug}` },
    openGraph: {
      type: "article",
      title: post.title,
      description: post.excerpt,
      url: `/blog/${post.slug}`,
      siteName: SITE.name,
      locale: "pt_BR",
      publishedTime: post.publishedAt?.toISOString(),
      modifiedTime: post.updatedAt.toISOString(),
      authors: [post.authorName],
      section: post.categoryName ?? undefined,
      images,
    },
    twitter: { card: images ? "summary_large_image" : "summary", title: post.title, description: post.excerpt },
  };
}

export default async function PostPage({ params }: PageProps<"/blog/[slug]">) {
  const { slug } = await params;
  const post = await getPublishedPost(slug);
  if (!post) notFound();
  const related = await relatedPosts(post.id, post.categoryId);
  const base = siteUrl();
  const ads = await listLiveBanners("blog").catch((e) => {
    console.error("Não foi possível carregar os anúncios", e);
    return [];
  });
  // Divide o texto em dois e põe um anúncio no meio (e outro no fim, se houver mais de um).
  const html = renderMarkdown(post.body);
  const blocks = html.split(/(?<=<\/(?:p|ul|ol|blockquote|h2|h3)>)/);
  const mid = Math.ceil(blocks.length / 2);
  const firstHalf = ads.length && blocks.length > 3 ? blocks.slice(0, mid).join("") : html;
  const secondHalf = ads.length && blocks.length > 3 ? blocks.slice(mid).join("") : "";
  const midAd = ads.length ? ads[[...post.slug].reduce((n, c) => n + c.charCodeAt(0), 0) % ads.length] : null;
  const endAd = ads.length > 1 ? ads.find((a) => a.id !== midAd?.id) ?? null : null;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "NewsArticle",
    headline: post.title,
    description: post.excerpt,
    image: post.coverUrl ? [post.coverUrl] : undefined,
    datePublished: post.publishedAt?.toISOString(),
    dateModified: post.updatedAt.toISOString(),
    author: [{ "@type": "Person", name: post.authorName }],
    publisher: { "@type": "Organization", name: SITE.name },
    mainEntityOfPage: `${base}/blog/${post.slug}`,
    articleSection: post.categoryName ?? undefined,
    inLanguage: "pt-BR",
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }}
      />
      <article className="px-5 pb-16 pt-12 md:pt-20">
        <div className="mx-auto max-w-3xl">
          <nav aria-label="Trilha" className="text-sm text-muted">
            <Link href="/blog" className="hover:text-accent">
              Notícias
            </Link>
            {post.categorySlug && (
              <>
                {" / "}
                <Link href={`/blog/categoria/${post.categorySlug}`} className="hover:text-accent">
                  {post.categoryName}
                </Link>
              </>
            )}
          </nav>
          <h1 className="mt-5 text-4xl font-bold leading-tight tracking-tight md:text-5xl">{post.title}</h1>
          <p className="mt-5 text-xl leading-relaxed text-muted">{post.excerpt}</p>
          <p className="mt-6 text-sm text-muted">
            Por {post.authorName} ·{" "}
            <time dateTime={post.publishedAt?.toISOString()}>{formatDate(post.publishedAt)}</time> ·{" "}
            {post.readingMinutes} min de leitura
          </p>
        </div>
        {post.coverUrl && (
          <figure className="mx-auto mt-10 max-w-5xl">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={post.coverUrl}
              alt={post.coverAlt ?? ""}
              className="aspect-[16/9] w-full rounded-2xl object-cover"
            />
          </figure>
        )}
        <div className="prose-post mx-auto mt-10 max-w-3xl" dangerouslySetInnerHTML={{ __html: firstHalf }} />
        {midAd && <PostAd ad={midAd} />}
        {secondHalf && <div className="prose-post mx-auto max-w-3xl" dangerouslySetInnerHTML={{ __html: secondHalf }} />}
        {endAd && <PostAd ad={endAd} />}
      </article>

      {related.length > 0 && (
        <Section labelledBy="relacionados-titulo" tone="panel">
          <h2 id="relacionados-titulo" className="h2-section mb-10">
            Leia também
          </h2>
          <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {related.map((p) => (
              <li key={p.id}>
                <PostCard post={p} headingLevel={3} />
              </li>
            ))}
          </ul>
        </Section>
      )}
    </>
  );
}
