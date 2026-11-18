import Link from "next/link";
import { and, count, desc, eq } from "drizzle-orm";
import { db, schema } from "@/db";
import { formatDate } from "@/lib/blog";

const { posts, users, leads } = schema;

export default async function PainelHome() {
  const [[novosLeads], [aguardando], [rascunhos], recentes] = await Promise.all([
    db.select({ n: count() }).from(leads).where(eq(leads.status, "novo")),
    db
      .select({ n: count() })
      .from(users)
      .where(and(eq(users.role, "member"), eq(users.isSubscriber, false))),
    db.select({ n: count() }).from(posts).where(eq(posts.status, "draft")),
    db
      .select({ id: posts.id, title: posts.title, status: posts.status, updatedAt: posts.updatedAt })
      .from(posts)
      .orderBy(desc(posts.updatedAt))
      .limit(5),
  ]);

  const cards = [
    {
      href: "/painel/leads",
      n: novosLeads.n,
      label: "leads novos",
      hint: "Pessoas que responderam um quiz e ainda não foram chamadas.",
    },
    {
      href: "/painel/assinantes",
      n: aguardando.n,
      label: "contas sem assinatura",
      hint: "Se alguém já pagou, clique em “Liberar acesso”.",
    },
    {
      href: "/painel/posts",
      n: rascunhos.n,
      label: "rascunhos",
      hint: "Posts começados que ainda não foram publicados.",
    },
  ];

  return (
    <>
      <h1 className="h2-section">O que precisa de atenção</h1>
      <ul className="mt-8 grid gap-4 sm:grid-cols-3">
        {cards.map((c) => (
          <li key={c.href}>
            <Link
              href={c.href}
              className="block h-full rounded-xl border border-line bg-surface p-5 transition hover:border-accent"
            >
              <span className="block text-4xl font-bold">{c.n}</span>
              <span className="mt-1 block font-semibold">{c.label}</span>
              <span className="mt-2 block text-sm text-muted">{c.hint}</span>
            </Link>
          </li>
        ))}
      </ul>

      <div className="mt-10 flex flex-wrap gap-3">
        <Link href="/painel/posts/novo" className="btn btn-primary">
          Escrever novo post
        </Link>
        <Link href="/painel/assinantes" className="btn btn-ghost">
          Liberar acesso
        </Link>
        <Link href="/painel/leads" className="btn btn-ghost">
          Ver leads
        </Link>
      </div>

      <h2 className="mt-12 text-xl font-bold">Editados por último</h2>
      {recentes.length === 0 ? (
        <p className="mt-4 text-muted">Nenhum post ainda.</p>
      ) : (
        <ul className="mt-4 divide-y divide-line rounded-xl border border-line bg-surface">
          {recentes.map((p) => (
            <li key={p.id} className="flex items-center justify-between gap-4 p-4">
              <div className="min-w-0">
                <Link href={`/painel/posts/${p.id}`} className="font-semibold hover:text-accent">
                  {p.title}
                </Link>
                <p className="text-sm text-muted">editado em {formatDate(p.updatedAt)}</p>
              </div>
              <span className="shrink-0 text-xs font-bold uppercase tracking-wider text-muted">
                {p.status === "published" ? "Publicado" : "Rascunho"}
              </span>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
