import Link from "next/link";
import { desc, eq } from "drizzle-orm";
import { db, schema } from "@/db";
import { formatDate } from "@/lib/blog";

const { posts, categories } = schema;

export default async function PostsPage({ searchParams }: PageProps<"/painel/posts">) {
  const sp = await searchParams;
  const rows = await db
    .select({
      id: posts.id,
      title: posts.title,
      slug: posts.slug,
      status: posts.status,
      updatedAt: posts.updatedAt,
      category: categories.name,
    })
    .from(posts)
    .leftJoin(categories, eq(posts.categoryId, categories.id))
    .orderBy(desc(posts.updatedAt));

  return (
    <>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <h1 className="h2-section">Posts do blog</h1>
        <Link href="/painel/posts/novo" className="btn btn-primary">
          Escrever novo post
        </Link>
      </div>
      {sp.excluido && (
        <p role="status" className="mt-6 rounded-lg border border-accent/50 bg-accent/10 px-4 py-3">
          Post excluído.
        </p>
      )}
      {rows.length === 0 ? (
        <p className="mt-10 text-lg text-muted">
          Nenhum post ainda. Clique em &quot;Escrever novo post&quot; para começar.
        </p>
      ) : (
        <ul className="mt-8 divide-y divide-line rounded-xl border border-line bg-surface">
          {rows.map((p) => (
            <li key={p.id} className="flex flex-col gap-2 p-5 sm:flex-row sm:items-center sm:justify-between">
              <div className="min-w-0">
                <Link href={`/painel/posts/${p.id}`} className="font-semibold hover:text-accent">
                  {p.title}
                </Link>
                <p className="mt-1 text-sm text-muted">
                  {p.category ?? "Sem categoria"} · editado em {formatDate(p.updatedAt)}
                </p>
              </div>
              <span
                className={`w-fit shrink-0 rounded-full px-3 py-1 text-xs font-bold uppercase tracking-wider ${
                  p.status === "published" ? "bg-accent text-accent-ink" : "border border-line text-muted"
                }`}
              >
                {p.status === "published" ? "Publicado" : "Rascunho"}
              </span>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
