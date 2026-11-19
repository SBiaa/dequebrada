import Link from "next/link";
import { desc, eq } from "drizzle-orm";
import { db, schema } from "@/db";
import { KIND_LABEL } from "@/lib/members";
import { Icon, type IconName } from "@/components/ui/Icon";

const { memberContents, memberFiles } = schema;

const KIND_ICON: Record<keyof typeof KIND_LABEL, IconName> = {
  video: "video",
  aula: "presentation",
  pdf: "doc",
  link: "route",
};

const TABS = [
  { id: "", label: "Todos" },
  { id: "publicados", label: "Publicados" },
  { id: "rascunhos", label: "Rascunhos" },
] as const;

export default async function ConteudosPage({ searchParams }: PageProps<"/painel/conteudos">) {
  const sp = await searchParams;
  const f = TABS.some((t) => t.id === sp.f) ? (sp.f as (typeof TABS)[number]["id"]) : "";
  const all = await db
    .select({
      id: memberContents.id,
      title: memberContents.title,
      slug: memberContents.slug,
      description: memberContents.description,
      kind: memberContents.kind,
      youtubeId: memberContents.youtubeId,
      externalUrl: memberContents.externalUrl,
      published: memberContents.published,
      createdAt: memberContents.createdAt,
      fileName: memberFiles.name,
    })
    .from(memberContents)
    .leftJoin(memberFiles, eq(memberContents.fileId, memberFiles.id))
    .orderBy(desc(memberContents.createdAt));

  const counts = {
    "": all.length,
    publicados: all.filter((c) => c.published).length,
    rascunhos: all.filter((c) => !c.published).length,
  };
  const rows = all.filter((c) => (f === "publicados" ? c.published : f === "rascunhos" ? !c.published : true));

  return (
    <>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="h2-section">Conteúdos exclusivos</h1>
          <p className="mt-2 text-muted">Vídeos, aulas, PDFs e links que só assinantes veem na área de membros.</p>
        </div>
        <Link href="/painel/conteudos/novo" className="btn btn-primary">
          + Novo conteúdo
        </Link>
      </div>

      {sp.excluido && (
        <p role="status" className="mt-6 rounded-lg border border-accent/50 bg-accent/10 px-4 py-3">
          Conteúdo excluído.
        </p>
      )}

      {all.length > 0 && (
        <nav aria-label="Filtrar conteúdos" className="mt-8 flex flex-wrap gap-2">
          {TABS.map((t) => {
            const active = f === t.id;
            return (
              <Link
                key={t.id || "todos"}
                href={t.id ? `/painel/conteudos?f=${t.id}` : "/painel/conteudos"}
                aria-current={active ? "page" : undefined}
                className={`inline-flex min-h-10 items-center rounded-full px-4 text-sm ${
                  active ? "bg-ink font-bold text-bg" : "border border-line text-muted hover:text-ink"
                }`}
              >
                {t.label} · {counts[t.id]}
              </Link>
            );
          })}
        </nav>
      )}

      {all.length === 0 ? (
        <div className="mt-10 rounded-xl border border-dashed border-line p-8 text-center">
          <p className="text-lg font-semibold">Nenhum conteúdo ainda</p>
          <p className="mx-auto mt-2 max-w-md text-muted">
            Suba uma aula no YouTube como &quot;não listado&quot;, um PDF ou um link, e só quem assina vai ver.
          </p>
          <Link href="/painel/conteudos/novo" className="btn btn-primary mt-6">
            Criar o primeiro
          </Link>
        </div>
      ) : rows.length === 0 ? (
        <p className="mt-8 rounded-xl border border-line bg-surface p-6 text-muted">Nada nesse filtro.</p>
      ) : (
        <ul className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {rows.map((c) => {
            const parts = [c.youtubeId && "Vídeo", c.fileName && "PDF", c.externalUrl && "Link"].filter(Boolean);
            return (
              <li key={c.id}>
                <Link
                  href={`/painel/conteudos/${c.id}`}
                  className="group flex h-full flex-col overflow-hidden rounded-xl border border-line bg-surface transition hover:border-accent"
                >
                  <div className="relative aspect-video bg-surface-2">
                    {c.youtubeId ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={`https://i.ytimg.com/vi/${c.youtubeId}/hqdefault.jpg`}
                        alt=""
                        loading="lazy"
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <span className="flex h-full items-center justify-center text-accent">
                        <Icon name={KIND_ICON[c.kind]} className="h-12 w-12" />
                      </span>
                    )}
                    <span
                      className={`absolute left-3 top-3 rounded-full px-2.5 py-0.5 text-xs font-bold uppercase tracking-wider ${
                        c.published ? "bg-accent text-accent-ink" : "bg-bg/90 text-muted"
                      }`}
                    >
                      {c.published ? "Publicado" : "Rascunho"}
                    </span>
                  </div>
                  <div className="flex flex-1 flex-col p-4">
                    <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-muted">
                      <Icon name={KIND_ICON[c.kind]} className="h-4 w-4" />
                      {KIND_LABEL[c.kind]}
                    </p>
                    <p className="mt-1.5 font-bold group-hover:text-accent [overflow-wrap:anywhere]">{c.title}</p>
                    <p className="mt-1 line-clamp-2 text-sm text-muted">{c.description}</p>
                    <p className="mt-auto pt-3 text-xs text-muted">
                      {parts.length ? parts.join(" + ") : "Sem vídeo, PDF ou link"} · criado em{" "}
                      {c.createdAt.toLocaleDateString("pt-BR", { timeZone: "America/Sao_Paulo" })}
                    </p>
                  </div>
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </>
  );
}
