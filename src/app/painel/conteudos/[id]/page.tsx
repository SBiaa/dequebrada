import Link from "next/link";
import { notFound } from "next/navigation";
import { eq } from "drizzle-orm";
import { db, schema } from "@/db";
import { deleteContentAction } from "../../membros-actions";
import { ContentForm } from "../ContentForm";

const { memberContents, memberFiles } = schema;
const UUID = /^[0-9a-f-]{36}$/i;

export default async function EditarConteudoPage({ params, searchParams }: PageProps<"/painel/conteudos/[id]">) {
  const { id } = await params;
  const sp = await searchParams;
  if (!UUID.test(id)) notFound();
  const [c] = await db
    .select({
      id: memberContents.id,
      title: memberContents.title,
      slug: memberContents.slug,
      description: memberContents.description,
      kind: memberContents.kind,
      youtubeId: memberContents.youtubeId,
      externalUrl: memberContents.externalUrl,
      published: memberContents.published,
      fileName: memberFiles.name,
    })
    .from(memberContents)
    .leftJoin(memberFiles, eq(memberContents.fileId, memberFiles.id))
    .where(eq(memberContents.id, id))
    .limit(1);
  if (!c) notFound();

  const notice =
    sp.salvo === "publicado" ? "Publicado para assinantes." : sp.salvo === "rascunho" ? "Rascunho salvo." : undefined;

  return (
    <>
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <h1 className="h2-section">Editar conteúdo</h1>
        {c.published && (
          <Link href={`/membros/conteudos/${c.slug}`} className="btn btn-ghost !min-h-10 !text-sm" target="_blank">
            Ver na área de membros <span className="sr-only">(abre em nova aba)</span>
          </Link>
        )}
      </div>
      <ContentForm
        notice={notice}
        values={{
          id: c.id,
          title: c.title,
          slug: c.slug,
          description: c.description,
          kind: c.kind,
          youtube: c.youtubeId ? `https://www.youtube.com/watch?v=${c.youtubeId}` : "",
          externalUrl: c.externalUrl ?? "",
          published: c.published,
          fileName: c.fileName,
        }}
      />
      <details className="mt-12 w-fit rounded-xl border border-red-400/40 p-4">
        <summary className="cursor-pointer font-semibold text-red-300">Excluir conteúdo</summary>
        <p className="mt-3 text-sm text-muted">Apaga o conteúdo e o PDF ligado a ele. Não dá para desfazer.</p>
        <form action={deleteContentAction} className="mt-3">
          <input type="hidden" name="id" value={c.id} />
          <button type="submit" className="btn border-red-400/60 text-red-200 hover:bg-red-500/10">
            Sim, excluir para sempre
          </button>
        </form>
      </details>
    </>
  );
}
