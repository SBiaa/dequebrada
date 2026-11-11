import Link from "next/link";
import { desc } from "drizzle-orm";
import { db, schema } from "@/db";
import { KIND_LABEL } from "@/lib/members";

const { memberContents } = schema;

export default async function ConteudosPage({ searchParams }: PageProps<"/painel/conteudos">) {
  const sp = await searchParams;
  const rows = await db
    .select({
      id: memberContents.id,
      title: memberContents.title,
      kind: memberContents.kind,
      published: memberContents.published,
    })
    .from(memberContents)
    .orderBy(desc(memberContents.createdAt));

  return (
    <>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <h1 className="h2-section">Conteúdos exclusivos</h1>
        <Link href="/painel/conteudos/novo" className="btn btn-primary">
          Novo conteúdo
        </Link>
      </div>
      <p className="mt-3 text-muted">Vídeos, aulas, PDFs e links que só assinantes veem em /membros.</p>
      {sp.excluido && (
        <p role="status" className="mt-6 rounded-lg border border-accent/50 bg-accent/10 px-4 py-3">
          Conteúdo excluído.
        </p>
      )}
      {rows.length === 0 ? (
        <p className="mt-10 text-lg text-muted">Nenhum conteúdo ainda.</p>
      ) : (
        <ul className="mt-8 divide-y divide-line rounded-xl border border-line bg-surface">
          {rows.map((c) => (
            <li key={c.id} className="flex flex-col gap-2 p-5 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <Link href={`/painel/conteudos/${c.id}`} className="font-semibold hover:text-accent">
                  {c.title}
                </Link>
                <p className="text-sm text-muted">{KIND_LABEL[c.kind]}</p>
              </div>
              <span
                className={`w-fit rounded-full px-3 py-1 text-xs font-bold uppercase tracking-wider ${
                  c.published ? "bg-accent text-accent-ink" : "border border-line text-muted"
                }`}
              >
                {c.published ? "Publicado" : "Rascunho"}
              </span>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
