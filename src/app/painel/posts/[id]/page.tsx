import Link from "next/link";
import { notFound } from "next/navigation";
import { eq } from "drizzle-orm";
import { db, schema } from "@/db";
import { allCategories } from "@/lib/blog";
import { deletePostAction, unpublishPostAction } from "../../actions";
import { PostForm } from "../../PostForm";
import { scheduleLabel, toScheduleInput } from "@/lib/painel";

const UUID = /^[0-9a-f-]{36}$/i;

export default async function EditarPostPage({ params, searchParams }: PageProps<"/painel/posts/[id]">) {
  const { id } = await params;
  const sp = await searchParams;
  if (!UUID.test(id)) notFound();
  const [post] = await db.select().from(schema.posts).where(eq(schema.posts.id, id)).limit(1);
  if (!post) notFound();
  const categories = await allCategories();

  const notice =
    sp.salvo === "publicado"
      ? "Post publicado."
      : sp.salvo === "agendado"
        ? `Post agendado para ${scheduleLabel(post.publishedAt)}.`
        : sp.salvo === "rascunho"
          ? "Rascunho salvo."
          : undefined;
  const scheduled = post.publishedAt && post.publishedAt > new Date() ? post.publishedAt : null;

  return (
    <>
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <h1 className="h2-section">Editar post</h1>
        {scheduled && post.status === "published" && (
          <p className="rounded-md bg-warn-bg px-3 py-2 text-sm font-semibold text-warn">
            Agendado: entra no site em {scheduleLabel(scheduled)}
          </p>
        )}
        {post.status === "published" && !scheduled && (
          <Link href={`/blog/${post.slug}`} className="btn btn-ghost !min-h-10 !text-sm" target="_blank">
            Ver no site <span className="sr-only">(abre em nova aba)</span>
          </Link>
        )}
      </div>

      <PostForm
        notice={notice}
        categories={categories}
        values={{
          id: post.id,
          title: post.title,
          slug: post.slug,
          excerpt: post.excerpt,
          body: post.body,
          coverUrl: post.coverUrl,
          coverAlt: post.coverAlt ?? "",
          categoryId: post.categoryId,
          authorName: post.authorName,
          status: post.status,
          scheduleAt: scheduled ? toScheduleInput(scheduled) : "",
        }}
      />

      <div className="mt-12 flex flex-col gap-4 border-t border-line pt-8 sm:flex-row sm:items-start">
        {scheduled && post.status === "published" && (
          <p className="rounded-md bg-warn-bg px-3 py-2 text-sm font-semibold text-warn">
            Agendado: entra no site em {scheduleLabel(scheduled)}
          </p>
        )}
        {post.status === "published" && !scheduled && (
          <form action={unpublishPostAction}>
            <input type="hidden" name="id" value={post.id} />
            <button type="submit" className="btn btn-ghost">
              Tirar do ar (voltar para rascunho)
            </button>
          </form>
        )}
        <details className="rounded-xl border border-red-400/40 p-4">
          <summary className="cursor-pointer font-semibold text-red-300">Excluir post</summary>
          <p className="mt-3 text-sm text-muted">Isso apaga o post de vez. Não dá para desfazer.</p>
          <form action={deletePostAction} className="mt-3">
            <input type="hidden" name="id" value={post.id} />
            <button type="submit" className="btn border-red-400/60 text-red-200 hover:bg-red-500/10">
              Sim, excluir para sempre
            </button>
          </form>
        </details>
      </div>
    </>
  );
}
