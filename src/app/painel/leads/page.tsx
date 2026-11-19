import Link from "next/link";
import { asc, desc, eq } from "drizzle-orm";
import { db, schema } from "@/db";
import { leadWhatsAppLink, tempoRelativo } from "@/lib/painel";
import { setLeadStatusAction } from "./actions";

const STATUS = [
  { id: "novo", label: "Novo", plural: "Novos", badge: "bg-accent text-accent-ink" },
  { id: "contatado", label: "Contatado", plural: "Contatados", badge: "bg-warn-bg text-warn border border-warn-line" },
  { id: "fechado", label: "Fechado", plural: "Fechados", badge: "bg-wa/15 text-ink border border-wa/40" },
  { id: "perdido", label: "Perdido", plural: "Perdidos", badge: "border border-line text-muted" },
] as const;
type StatusId = (typeof STATUS)[number]["id"];

/** 11999990000 → (11) 99999-0000 */
function fmtPhone(p: string) {
  const d = p.replace(/\D/g, "").replace(/^55(?=\d{10,11}$)/, "");
  if (d.length === 11) return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`;
  if (d.length === 10) return `(${d.slice(0, 2)}) ${d.slice(2, 6)}-${d.slice(6)}`;
  return p;
}

function initials(name: string) {
  const parts = name.trim().split(/\s+/);
  return ((parts[0]?.[0] ?? "") + (parts.length > 1 ? parts[parts.length - 1][0] : "")).toUpperCase();
}

export default async function LeadsPage({ searchParams }: PageProps<"/painel/leads">) {
  const sp = await searchParams;
  const quiz = typeof sp.quiz === "string" ? sp.quiz : "";
  const status: StatusId | "" = STATUS.some((s) => s.id === sp.status) ? (sp.status as StatusId) : "";

  const [all, quizzes] = await Promise.all([
    db
      .select()
      .from(schema.leads)
      .where(quiz ? eq(schema.leads.quizSlug, quiz) : undefined)
      .orderBy(desc(schema.leads.createdAt)),
    db
      .select({ slug: schema.quizzes.slug, title: schema.quizzes.title })
      .from(schema.quizzes)
      .orderBy(asc(schema.quizzes.createdAt)),
  ]);
  const count = (s: StatusId) => all.filter((r) => r.status === s).length;
  const rows = status ? all.filter((r) => r.status === status) : all;

  const href = (next: { quiz?: string; status?: string }) => {
    const q = new URLSearchParams();
    const qz = next.quiz ?? quiz;
    const st = next.status ?? status;
    if (qz) q.set("quiz", qz);
    if (st) q.set("status", st);
    const s = q.toString();
    return s ? `/painel/leads?${s}` : "/painel/leads";
  };

  return (
    <>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="h2-section">Leads</h1>
          <p className="mt-2 text-muted">Quem respondeu os quizzes. Chame no WhatsApp e marque o andamento.</p>
        </div>
        <a
          href={quiz ? `/painel/leads/exportar?quiz=${encodeURIComponent(quiz)}` : "/painel/leads/exportar"}
          download
          className="btn btn-ghost !min-h-10 !text-sm"
        >
          Baixar planilha (CSV)
        </a>
      </div>

      <nav aria-label="Filtrar por andamento" className="mt-8 grid grid-cols-2 gap-2 sm:grid-cols-5">
        {[{ id: "", plural: "Todos", n: all.length }, ...STATUS.map((s) => ({ id: s.id, plural: s.plural, n: count(s.id) }))].map(
          (s) => {
            const active = status === s.id;
            return (
              <Link
                key={s.id || "todos"}
                href={href({ status: s.id })}
                aria-current={active ? "page" : undefined}
                className={`rounded-xl border px-4 py-3 transition-colors ${
                  active ? "border-accent bg-accent/10" : "border-line bg-surface hover:border-accent/60"
                }`}
              >
                <span className="block text-sm text-muted">{s.plural}</span>
                <span className="display text-3xl">{s.n}</span>
              </Link>
            );
          },
        )}
      </nav>

      {quizzes.length > 1 && (
        <nav aria-label="Filtrar por quiz" className="mt-4 flex flex-wrap items-center gap-2 text-sm">
          <span className="text-muted">Quiz:</span>
          {[{ slug: "", title: "Todos" }, ...quizzes].map((q) => {
            const active = quiz === q.slug;
            return (
              <Link
                key={q.slug || "todos"}
                href={href({ quiz: q.slug })}
                aria-current={active ? "page" : undefined}
                className={`inline-flex min-h-9 items-center rounded-full px-3 ${
                  active ? "bg-ink font-semibold text-bg" : "border border-line text-muted hover:text-ink"
                }`}
              >
                {q.title}
              </Link>
            );
          })}
        </nav>
      )}

      {rows.length === 0 ? (
        <p className="mt-8 rounded-xl border border-line bg-surface p-6 text-muted">
          {all.length === 0 ? "Nenhum lead ainda. Eles aparecem aqui quando alguém responde um quiz." : "Nenhum lead nesse filtro."}
        </p>
      ) : (
        <ul className="mt-8 grid gap-3">
          {rows.map((l) => {
            const answers = Object.entries(JSON.parse(l.answers) as Record<string, string>);
            const st = STATUS.find((s) => s.id === l.status) ?? STATUS[0];
            return (
              <li key={l.id} className="rounded-xl border border-line bg-surface p-4 sm:p-5">
                <div className="flex flex-wrap items-start gap-4">
                  <span
                    aria-hidden="true"
                    className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-surface-2 font-bold text-accent"
                  >
                    {initials(l.name)}
                  </span>

                  <div className="min-w-0 flex-1 basis-64">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="text-lg font-bold [overflow-wrap:anywhere]">{l.name}</p>
                      <span className={`rounded-full px-2.5 py-0.5 text-xs font-bold uppercase tracking-wider ${st.badge}`}>
                        {st.label}
                      </span>
                    </div>
                    <p className="text-sm text-muted">
                      {l.quizTitle} ·{" "}
                      <time dateTime={l.createdAt.toISOString()}>{tempoRelativo(l.createdAt)}</time>
                    </p>
                    <ul className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-sm">
                      <li className="tabular-nums">{fmtPhone(l.whatsapp)}</li>
                      {l.email && (
                        <li className="[overflow-wrap:anywhere]">
                          <a href={`mailto:${l.email}`} className="text-accent hover:underline">
                            {l.email}
                          </a>
                        </li>
                      )}
                      {l.instagram && (
                        <li>
                          <a
                            href={`https://instagram.com/${l.instagram.replace(/^@/, "")}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-accent hover:underline"
                          >
                            @{l.instagram.replace(/^@/, "")}
                            <span className="sr-only"> (abre em nova aba)</span>
                          </a>
                        </li>
                      )}
                    </ul>
                  </div>

                  <a
                    href={leadWhatsAppLink(l.whatsapp, l.name, l.quizTitle)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn !min-h-11 !px-4 !text-sm bg-wa font-bold text-black"
                  >
                    Chamar no WhatsApp <span className="sr-only">(abre em nova aba)</span>
                  </a>
                </div>

                <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-line pt-4">
                  <form action={setLeadStatusAction} className="flex flex-wrap items-center gap-2">
                    <input type="hidden" name="id" value={l.id} />
                    <span className="text-sm text-muted" id={`st-${l.id}`}>
                      Marcar como:
                    </span>
                    <div role="group" aria-labelledby={`st-${l.id}`} className="flex flex-wrap gap-1.5">
                      {STATUS.map((s) => {
                        const on = s.id === l.status;
                        return (
                          <button
                            key={s.id}
                            type="submit"
                            name="status"
                            value={s.id}
                            aria-pressed={on}
                            disabled={on}
                            className={`min-h-9 rounded-lg px-3 text-sm ${
                              on ? "bg-surface-2 font-bold text-ink" : "border border-line text-muted hover:border-accent hover:text-ink"
                            }`}
                          >
                            {s.label}
                          </button>
                        );
                      })}
                    </div>
                  </form>

                  {answers.length > 0 && (
                    <details className="w-full sm:w-auto">
                      <summary className="cursor-pointer text-sm font-semibold text-accent">
                        Ver respostas ({answers.length})
                      </summary>
                      <dl className="mt-3 grid gap-3 rounded-lg bg-surface-2 p-4 text-sm sm:min-w-[28rem]">
                        {answers.map(([q, a]) => (
                          <div key={q}>
                            <dt className="text-muted">{q}</dt>
                            <dd className="font-semibold [overflow-wrap:anywhere]">{a}</dd>
                          </div>
                        ))}
                      </dl>
                    </details>
                  )}
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </>
  );
}
