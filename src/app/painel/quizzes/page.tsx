import Link from "next/link";
import { asc, count, max, sql } from "drizzle-orm";
import { db, schema } from "@/db";
import { parseSteps } from "@/lib/quiz";
import { tempoRelativo } from "@/lib/painel";
import { CopyLink } from "./CopyLink";

const { quizzes, leads } = schema;

export default async function QuizzesPage() {
  const [rows, stats] = await Promise.all([
    db.select().from(quizzes).orderBy(asc(quizzes.createdAt)),
    db
      .select({
        slug: leads.quizSlug,
        total: count(),
        novos: sql<number>`count(*) filter (where ${leads.status} = 'novo')`.mapWith(Number),
        ultimo: max(leads.createdAt),
      })
      .from(leads)
      .groupBy(leads.quizSlug),
  ]);
  const bySlug = new Map(stats.map((s) => [s.slug, s]));
  const noAr = rows.filter((q) => q.published).length;

  return (
    <>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="h2-section">Quizzes</h1>
          <p className="mt-2 text-muted">
            Perguntas passo a passo que terminam pedindo o contato. Cada resposta vira um lead.
          </p>
        </div>
        <Link href="/painel/quizzes/novo" className="btn btn-primary">
          + Novo quiz
        </Link>
      </div>

      {rows.length === 0 ? (
        <div className="mt-10 rounded-xl border border-dashed border-line p-8 text-center">
          <p className="text-lg font-semibold">Nenhum quiz ainda</p>
          <p className="mx-auto mt-2 max-w-md text-muted">
            Faça 3 ou 4 perguntas sobre o negócio da pessoa e peça o WhatsApp no final. Ela chega aqui como lead, com
            as respostas.
          </p>
          <Link href="/painel/quizzes/novo" className="btn btn-primary mt-6">
            Criar o primeiro
          </Link>
        </div>
      ) : (
        <>
          <p className="mt-6 text-sm text-muted">
            {rows.length} {rows.length === 1 ? "quiz" : "quizzes"} · {noAr} no ar
          </p>
          <ul className="mt-3 grid gap-4 md:grid-cols-2">
            {rows.map((q) => {
              const s = bySlug.get(q.slug);
              const passos = parseSteps(q.steps).length;
              return (
                <li
                  key={q.id}
                  className={`flex flex-col rounded-xl border bg-surface p-5 ${
                    q.published ? "border-line" : "border-dashed border-line"
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <Link
                        href={`/painel/quizzes/${q.id}`}
                        className="text-lg font-bold leading-snug hover:text-accent [overflow-wrap:anywhere]"
                      >
                        {q.title}
                      </Link>
                      <p className="mt-0.5 text-sm text-muted [overflow-wrap:anywhere]">/quiz/{q.slug}</p>
                    </div>
                    <span
                      className={`shrink-0 rounded-full px-2.5 py-0.5 text-xs font-bold uppercase tracking-wider ${
                        q.published ? "bg-accent text-accent-ink" : "border border-line text-muted"
                      }`}
                    >
                      {q.published ? "No ar" : "Rascunho"}
                    </span>
                  </div>

                  <dl className="mt-4 grid grid-cols-3 gap-2 text-center">
                    <div className="rounded-lg bg-surface-2 px-2 py-2">
                      <dt className="text-xs text-muted">Leads</dt>
                      <dd className="text-xl font-bold tabular-nums">{s?.total ?? 0}</dd>
                    </div>
                    <div className={`rounded-lg px-2 py-2 ${s?.novos ? "bg-wa/15" : "bg-surface-2"}`}>
                      <dt className="text-xs text-muted">Novos</dt>
                      <dd className="text-xl font-bold tabular-nums">{s?.novos ?? 0}</dd>
                    </div>
                    <div className="rounded-lg bg-surface-2 px-2 py-2">
                      <dt className="text-xs text-muted">Passos</dt>
                      <dd className="text-xl font-bold tabular-nums">{passos}</dd>
                    </div>
                  </dl>
                  <p className="mt-2 text-xs text-muted">
                    {s?.ultimo ? `Último lead ${tempoRelativo(s.ultimo)}` : "Nenhum lead ainda"}
                  </p>

                  <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-line pt-4">
                    <Link href={`/painel/quizzes/${q.id}`} className="btn btn-primary !min-h-9 !px-4 !text-sm">
                      Editar <span className="sr-only">{q.title}</span>
                    </Link>
                    <Link href={`/painel/leads?quiz=${q.slug}`} className="btn btn-ghost !min-h-9 !px-3 !text-sm">
                      Ver leads <span className="sr-only">de {q.title}</span>
                    </Link>
                    {q.published && (
                      <>
                        <Link
                          href={`/quiz/${q.slug}`}
                          target="_blank"
                          className="btn btn-ghost !min-h-9 !px-3 !text-sm"
                        >
                          Abrir <span className="sr-only">{q.title} (nova aba)</span>
                        </Link>
                        <CopyLink path={`/quiz/${q.slug}`} label={`de ${q.title}`} />
                      </>
                    )}
                  </div>
                </li>
              );
            })}
          </ul>
        </>
      )}
    </>
  );
}
