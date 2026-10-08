import type { NewsPost } from "@/lib/news";

export function NewsCard({ post }: { post: NewsPost }) {
  return (
    <article className="lift group relative flex h-full flex-col overflow-hidden rounded-xl border border-line bg-surface">
      <div
        aria-hidden="true"
        className="h-24 bg-surface-2 [background-image:linear-gradient(135deg,rgb(77_184_234/0.22),transparent_60%)]"
      />
      <div className="flex flex-1 flex-col p-6">
        <p className="eyebrow">{post.city}</p>
        <h3 className="mt-3 text-lg font-bold leading-snug tracking-tight">
          <a
            href={post.href}
            target="_blank"
            rel="noopener noreferrer"
            className="after:absolute after:inset-0 group-hover:text-accent"
          >
            {post.title}
            <span className="sr-only"> (abre em nova aba)</span>
          </a>
        </h3>
        <p className="mt-3 flex-1 text-muted">{post.summary}</p>
        <p className="mt-5 text-sm text-muted">{post.readTime} de leitura</p>
      </div>
    </article>
  );
}
