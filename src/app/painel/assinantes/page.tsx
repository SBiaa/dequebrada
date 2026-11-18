import Link from "next/link";
import { desc, eq } from "drizzle-orm";
import { db, schema } from "@/db";
import { formatDate } from "@/lib/blog";
import { PENDING_DAYS, pendingSince, tempoRelativo } from "@/lib/painel";
import { setSubscriberAction } from "../membros-actions";

const { users } = schema;

type Kind = "esperando" | "ativo" | "gratis";

const TABS: { id: "" | Kind; label: string }[] = [
  { id: "", label: "Todas as contas" },
  { id: "esperando", label: "Esperando liberação" },
  { id: "ativo", label: "Assinantes ativos" },
  { id: "gratis", label: "Contas grátis" },
];

const BADGE: Record<Kind, { label: string; cls: string }> = {
  esperando: { label: "Esperando", cls: "bg-warn-bg text-warn border border-warn-line" },
  ativo: { label: "Assinante", cls: "bg-accent text-accent-ink" },
  gratis: { label: "Conta grátis", cls: "border border-line text-muted" },
};

function initials(name: string) {
  const p = name.trim().split(/\s+/);
  return ((p[0]?.[0] ?? "") + (p.length > 1 ? p[p.length - 1][0] : "")).toUpperCase();
}

export default async function AssinantesPage({ searchParams }: PageProps<"/painel/assinantes">) {
  const sp = await searchParams;
  const tab = TABS.some((t) => t.id === sp.f) ? (sp.f as "" | Kind) : "";
  const q = (typeof sp.q === "string" ? sp.q : "").trim().toLowerCase();

  const rows = await db
    .select({
      id: users.id,
      name: users.name,
      email: users.email,
      isSubscriber: users.isSubscriber,
      createdAt: users.createdAt,
    })
    .from(users)
    .where(eq(users.role, "member"))
    .orderBy(desc(users.createdAt));

  const limit = pendingSince().getTime();
  const kindOf = (u: (typeof rows)[number]): Kind =>
    u.isSubscriber ? "ativo" : u.createdAt.getTime() >= limit ? "esperando" : "gratis";
  const all = rows.map((u) => ({ ...u, kind: kindOf(u) }));
  const count = (k: "" | Kind) => (k ? all.filter((u) => u.kind === k).length : all.length);

  const order: Record<Kind, number> = { esperando: 0, ativo: 1, gratis: 2 };
  const list = all
    .filter((u) => !tab || u.kind === tab)
    .filter((u) => !q || u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q))
    .sort((a, b) => order[a.kind] - order[b.kind] || b.createdAt.getTime() - a.createdAt.getTime());

  const href = (f: string) => {
    const p = new URLSearchParams();
    if (f) p.set("f", f);
    if (q) p.set("q", q);
    const s = p.toString();
    return s ? `/painel/assinantes?${s}` : "/painel/assinantes";
  };

  return (
    <>
      <h1 className="h2-section">Assinantes</h1>
      <p className="mt-2 max-w-2xl text-muted">
        Quem pagou pelo WhatsApp: confira o pagamento e clique em <strong className="text-ink">Liberar acesso</strong>.
        Contas novas dos últimos {PENDING_DAYS} dias aparecem como &quot;Esperando&quot;.
      </p>

      <nav aria-label="Filtrar contas" className="mt-8 grid grid-cols-2 gap-2 md:grid-cols-4">
        {TABS.map((t) => {
          const active = tab === t.id;
          const n = count(t.id);
          return (
            <Link
              key={t.id || "todas"}
              href={href(t.id)}
              aria-current={active ? "page" : undefined}
              className={`rounded-xl border px-4 py-3 transition-colors ${
                active ? "border-accent bg-accent/10" : "border-line bg-surface hover:border-accent/60"
              }`}
            >
              <span className="block text-sm text-muted">{t.label}</span>
              <span className={`display text-3xl ${t.id === "esperando" && n > 0 ? "text-warn" : ""}`}>{n}</span>
            </Link>
          );
        })}
      </nav>

      <form role="search" className="mt-4 flex flex-wrap gap-2">
        {tab && <input type="hidden" name="f" value={tab} />}
        <label htmlFor="assin-q" className="sr-only">
          Buscar por nome ou e-mail
        </label>
        <input
          id="assin-q"
          name="q"
          type="search"
          defaultValue={q}
          placeholder="Buscar por nome ou e-mail"
          className="min-h-11 min-w-0 flex-1 basis-60 rounded-lg border border-line bg-bg px-4 text-base text-ink placeholder:text-muted/70 focus:border-accent focus:outline-none"
        />
        <button type="submit" className="btn btn-ghost !min-h-11 !px-5 !text-sm">
          Buscar
        </button>
        {q && (
          <Link href={href(tab)} className="btn btn-ghost !min-h-11 !px-4 !text-sm">
            Limpar
          </Link>
        )}
      </form>

      {list.length === 0 ? (
        <p className="mt-8 rounded-xl border border-line bg-surface p-6 text-muted">
          {all.length === 0 ? "Ninguém criou conta ainda." : "Nenhuma conta nesse filtro."}
        </p>
      ) : (
        <ul className="mt-6 divide-y divide-line rounded-xl border border-line bg-surface">
          {list.map((u) => {
            const b = BADGE[u.kind];
            return (
              <li key={u.id} className="flex flex-wrap items-center gap-4 p-4 sm:px-5">
                <span
                  aria-hidden="true"
                  className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-surface-2 font-bold text-accent"
                >
                  {initials(u.name)}
                </span>
                <div className="min-w-0 flex-1 basis-56">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="font-semibold [overflow-wrap:anywhere]">{u.name}</p>
                    <span className={`rounded-full px-2.5 py-0.5 text-xs font-bold uppercase tracking-wider ${b.cls}`}>
                      {b.label}
                    </span>
                  </div>
                  <p className="text-sm [overflow-wrap:anywhere]">
                    <a href={`mailto:${u.email}`} className="text-accent hover:underline">
                      {u.email}
                    </a>
                  </p>
                  <p className="text-sm text-muted">
                    Conta criada{" "}
                    <time dateTime={u.createdAt.toISOString()} title={formatDate(u.createdAt)}>
                      {tempoRelativo(u.createdAt)}
                    </time>
                  </p>
                </div>

                {u.isSubscriber ? (
                  <details className="relative">
                    <summary className="btn btn-ghost !min-h-10 cursor-pointer list-none !px-4 !text-sm [&::-webkit-details-marker]:hidden">
                      Retirar acesso<span className="sr-only"> de {u.name}</span>
                    </summary>
                    <div className="mt-2 rounded-lg border border-red-400/50 bg-surface p-3 sm:absolute sm:right-0 sm:z-10 sm:w-64 sm:shadow-lg">
                      <p className="text-sm text-muted">
                        {u.name.split(" ")[0]} deixa de ver os conteúdos exclusivos. Dá para liberar de novo depois.
                      </p>
                      <form action={setSubscriberAction} className="mt-3">
                        <input type="hidden" name="id" value={u.id} />
                        <input type="hidden" name="value" value="0" />
                        <button
                          type="submit"
                          className="btn !min-h-9 w-full border border-red-400/60 !text-sm text-red-200 hover:bg-red-500/10"
                        >
                          Sim, retirar acesso
                        </button>
                      </form>
                    </div>
                  </details>
                ) : (
                  <form action={setSubscriberAction}>
                    <input type="hidden" name="id" value={u.id} />
                    <input type="hidden" name="value" value="1" />
                    <button
                      type="submit"
                      className={`btn !min-h-10 !px-4 !text-sm ${
                        u.kind === "esperando" ? "bg-warn font-bold text-black" : "btn-ghost"
                      }`}
                    >
                      Liberar acesso<span className="sr-only"> de {u.name}</span>
                    </button>
                  </form>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </>
  );
}
