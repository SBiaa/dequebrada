import Link from "next/link";
import { asc, count } from "drizzle-orm";
import { db, schema } from "@/db";
import { parseSteps } from "@/lib/quiz";

export default async function QuizzesPage() {
  const [rows, counts] = await Promise.all([
    db.select().from(schema.quizzes).orderBy(asc(schema.quizzes.createdAt)),
    db.select({ slug: schema.leads.quizSlug, n: count() }).from(schema.leads).groupBy(schema.leads.quizSlug),
  ]);
  const leadsBySlug = new Map(counts.map((c) => [c.slug, c.n]));

  return (
    <>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="h2-section">Quizzes</h1>
          <p className="mt-3 text-muted">Funis passo a passo que captam contatos. Os leads aparecem em &quot;Leads&quot;.</p>
        </div>
        <Link href="/painel/quizzes/novo" className="btn btn-primary !min-h-10 !text-sm">
          Novo quiz
        </Link>
      </div>
      {rows.length === 0 ? (
        <p className="mt-10 text-lg text-muted">Nenhum quiz ainda.</p>
      ) : (
        <ul className="mt-8 divide-y divide-line rounded-xl border border-line bg-surface">
          {rows.map((q) => (
            <li key={q.id} className="flex flex-col gap-3 p-5 sm:flex-row sm:items-center sm:justify-between">
              <div className="min-w-0">
                <p className="font-semibold">{q.title}</p>
                <p className="text-sm text-muted">
                  /quiz/{q.slug} · {parseSteps(q.steps).length} passo(s) · {leadsBySlug.get(q.slug) ?? 0} lead(s)
                </p>
              </div>
              <div className="flex shrink-0 flex-wrap items-center gap-2">
                <span
                  className={`rounded-full px-3 py-1 text-xs font-bold uppercase tracking-wider ${
                    q.published ? "bg-accent text-accent-ink" : "border border-line text-muted"
                  }`}
                >
                  {q.published ? "No ar" : "Rascunho"}
                </span>
                {q.published && (
                  <Link href={`/quiz/${q.slug}`} target="_blank" className="btn btn-ghost !min-h-10 !px-4 !text-sm">
                    Abrir <span className="sr-only">{q.title} (nova aba)</span>
                  </Link>
                )}
                <Link href={`/painel/leads?quiz=${q.slug}`} className="btn btn-ghost !min-h-10 !px-4 !text-sm">
                  Leads
                </Link>
                <Link href={`/painel/quizzes/${q.id}`} className="btn btn-primary !min-h-10 !px-4 !text-sm">
                  Editar <span className="sr-only">{q.title}</span>
                </Link>
              </div>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
