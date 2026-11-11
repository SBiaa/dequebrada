import Link from "next/link";
import type { PostListItem } from "@/lib/blog";
import { formatDate } from "@/lib/blog";

export function PostCard({ post, headingLevel = 2 }: { post: PostListItem; headingLevel?: 2 | 3 }) {
  const H = headingLevel === 2 ? "h2" : "h3";
  return (
    <article className="lift group relative flex h-full flex-col overflow-hidden rounded-xl border border-line bg-surface">
      {post.coverUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={post.coverUrl}
          alt={post.coverAlt ?? ""}
          loading="lazy"
          className="aspect-[16/9] w-full object-cover"
        />
      ) : (
        <div
          aria-hidden="true"
          className="aspect-[16/9] bg-surface-2 [background-image:linear-gradient(135deg,rgb(77_184_234/0.22),transparent_60%)]"
        />
      )}
      <div className="flex flex-1 flex-col p-6">
        {post.categoryName && <p className="eyebrow">{post.categoryName}</p>}
        <H className="mt-3 text-lg font-bold leading-snug tracking-tight">
          <Link href={`/blog/${post.slug}`} className="after:absolute after:inset-0 group-hover:text-accent">
            {post.title}
          </Link>
        </H>
        <p className="mt-3 flex-1 text-muted">{post.excerpt}</p>
        <p className="mt-5 text-sm text-muted">
          <time dateTime={post.publishedAt?.toISOString()}>{formatDate(post.publishedAt)}</time> ·{" "}
          {post.readingMinutes} min de leitura
        </p>
      </div>
    </article>
  );
}
