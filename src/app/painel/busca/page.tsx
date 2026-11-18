import Link from "next/link";
import { and, desc, eq, ilike, or } from "drizzle-orm";
import { db, schema } from "@/db";
import { tempoRelativo } from "@/lib/painel";

const { posts, leads, users } = schema;

export default async function BuscaPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const sp = await searchParams;
  const q = (typeof sp.q === "string" ? sp.q : "").trim().slice(0, 100);

  if (!q) {
    return (
      <>
        <h1 className="h2-section">Buscar</h1>
        <p className="mt-3 text-muted">Digite na caixa de busca acima: título de post, nome, e-mail ou WhatsApp.</p>
      </>
    );
  }

  // Escapa os curingas do LIKE para buscar o texto literal.
  const like = `%${q.replace(/[\\%_]/g, (c) => `\\${c}`)}%`;
  const [p, l, u] = await Promise.all([
    db
      .select({ id: posts.id, title: posts.title, status: posts.status, updatedAt: posts.updatedAt })
      .from(posts)
      .where(or(ilike(posts.title, like), ilike(posts.excerpt, like)))
      .orderBy(desc(posts.updatedAt))
      .limit(20),
    db
      .select({ id: leads.id, name: leads.name, quizTitle: leads.quizTitle, status: leads.status, createdAt: leads.createdAt })
      .from(leads)
      .where(or(ilike(leads.name, like), ilike(leads.email, like), ilike(leads.whatsapp, like)))
      .orderBy(desc(leads.createdAt))
      .limit(20),
    db
      .select({ id: users.id, name: users.name, email: users.email, isSubscriber: users.isSubscriber })
      .from(users)
      .where(and(eq(users.role, "member"), or(ilike(users.name, like), ilike(users.email, like))))
      .orderBy(desc(users.createdAt))
      .limit(20),
  ]);
  const total = p.length + l.length + u.length;

  const section = "mt-8 rounded-xl border border-line bg-surface";
  const head = "border-b border-line px-5 py-3 text-sm font-bold uppercase tracking-wider text-muted";
  const row = "flex flex-wrap items-center justify-between gap-2 px-5 py-3";

  return (
    <>
      <h1 className="h2-section">Busca: “{q}”</h1>
      <p className="mt-3 text-muted">
        {total === 0 ? "Nada encontrado." : `${total} resultado(s).`}
      </p>

      {p.length > 0 && (
        <section className={section}>
          <h2 className={head}>Posts</h2>
          <ul className="divide-y divide-line">
            {p.map((x) => (
              <li key={x.id} className={row}>
                <Link href={`/painel/posts/${x.id}`} className="font-semibold hover:text-accent">
                  {x.title}
                </Link>
                <span className="text-sm text-muted">
                  {x.status === "published" ? "Publicado" : "Rascunho"} · {tempoRelativo(x.updatedAt)}
                </span>
              </li>
            ))}
          </ul>
        </section>
      )}

      {l.length > 0 && (
        <section className={section}>
          <h2 className={head}>Leads</h2>
          <ul className="divide-y divide-line">
            {l.map((x) => (
              <li key={x.id} className={row}>
                <Link href="/painel/leads" className="font-semibold hover:text-accent">
                  {x.name}
                </Link>
                <span className="text-sm text-muted">
                  {x.quizTitle} · {x.status} · {tempoRelativo(x.createdAt)}
                </span>
              </li>
            ))}
          </ul>
        </section>
      )}

      {u.length > 0 && (
        <section className={section}>
          <h2 className={head}>Contas</h2>
          <ul className="divide-y divide-line">
            {u.map((x) => (
              <li key={x.id} className={row}>
                <Link href="/painel/assinantes" className="font-semibold hover:text-accent">
                  {x.name}
                </Link>
                <span className="text-sm text-muted [overflow-wrap:anywhere]">
                  {x.email} · {x.isSubscriber ? "Assinante" : "Sem assinatura"}
                </span>
              </li>
            ))}
          </ul>
        </section>
      )}
    </>
  );
}
