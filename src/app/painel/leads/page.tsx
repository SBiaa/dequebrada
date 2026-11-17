import Link from "next/link";
import { asc, desc, eq } from "drizzle-orm";
import { db, schema } from "@/db";
import { formatDate } from "@/lib/blog";
import { setLeadStatusAction } from "./actions";

const STATUS = ["novo", "contatado", "fechado", "perdido"] as const;

function waLink(phone: string, name: string, quizTitle: string) {
  const full = phone.length <= 11 ? `55${phone}` : phone;
  const msg = `Oi, ${name.split(" ")[0]}! Aqui é do De Quebrada, vi que você respondeu o nosso quiz "${quizTitle}".`;
  return `https://wa.me/${full}?text=${encodeURIComponent(msg)}`;
}

export default async function LeadsPage({ searchParams }: PageProps<"/painel/leads">) {
  const sp = await searchParams;
  const filter = typeof sp.quiz === "string" ? sp.quiz : "";
  const [rows, quizzes] = await Promise.all([
    db
      .select()
      .from(schema.leads)
      .where(filter ? eq(schema.leads.quizSlug, filter) : undefined)
      .orderBy(desc(schema.leads.createdAt)),
    db.select({ slug: schema.quizzes.slug, title: schema.quizzes.title }).from(schema.quizzes).orderBy(asc(schema.quizzes.createdAt)),
  ]);
  const novos = rows.filter((r) => r.status === "novo").length;
  const tab = (active: boolean) => `btn !min-h-9 !px-3 !text-sm ${active ? "btn-primary" : "btn-ghost"}`;

  return (
    <>
      <h1 className="h2-section">Leads</h1>
      <p className="mt-3 text-muted">
        {rows.length} lead(s) · {novos} novo(s).
      </p>
      <nav aria-label="Filtrar por quiz" className="mt-6 flex flex-wrap gap-2">
        <Link href="/painel/leads" className={tab(!filter)} aria-current={!filter ? "page" : undefined}>
          Todos
        </Link>
        {quizzes.map((q) => (
          <Link
            key={q.slug}
            href={`/painel/leads?quiz=${q.slug}`}
            className={tab(filter === q.slug)}
            aria-current={filter === q.slug ? "page" : undefined}
          >
            {q.title}
          </Link>
        ))}
      </nav>
      {rows.length === 0 ? (
        <p className="mt-10 text-lg text-muted">Nenhum lead ainda.</p>
      ) : (
        <ul className="mt-8 divide-y divide-line rounded-xl border border-line bg-surface">
          {rows.map((l) => {
            const answers = JSON.parse(l.answers) as Record<string, string>;
            return (
              <li key={l.id} className="grid gap-4 p-5 md:grid-cols-[1fr_auto]">
                <div className="min-w-0">
                  <p className="font-semibold">{l.name}</p>
                  <p className="text-sm text-muted [overflow-wrap:anywhere]">
                    {[l.whatsapp, l.email, l.instagram && `@${l.instagram}`].filter(Boolean).join(" · ")}
                  </p>
                  <p className="text-sm text-muted">
                    {l.quizTitle} · {formatDate(l.createdAt)}
                  </p>
                  <dl className="mt-3 grid gap-1 text-sm">
                    {Object.entries(answers).map(([q, a]) => (
                      <div key={q}>
                        <dt className="inline text-muted">{q} </dt>
                        <dd className="inline font-semibold [overflow-wrap:anywhere]">{a}</dd>
                      </div>
                    ))}
                  </dl>
                </div>
                <div className="flex flex-wrap items-start gap-2">
                  <a
                    href={waLink(l.whatsapp, l.name, l.quizTitle)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn btn-primary !min-h-10 !px-4 !text-sm"
                  >
                    Chamar no WhatsApp
                  </a>
                  <form action={setLeadStatusAction} className="flex gap-2">
                    <input type="hidden" name="id" value={l.id} />
                    <select
                      name="status"
                      defaultValue={l.status}
                      aria-label={`Status de ${l.name}`}
                      className="rounded-lg border border-line bg-surface px-3 text-sm"
                    >
                      {STATUS.map((s) => (
                        <option key={s} value={s}>
                          {s}
                        </option>
                      ))}
                    </select>
                    <button type="submit" className="btn btn-ghost !min-h-10 !px-4 !text-sm">
                      Salvar
                    </button>
                  </form>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </>
  );
}
