import { desc, eq } from "drizzle-orm";
import { db, schema } from "@/db";
import { formatDate } from "@/lib/blog";
import { setSubscriberAction } from "../membros-actions";

const { users } = schema;

export default async function AssinantesPage() {
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

  const active = rows.filter((r) => r.isSubscriber).length;

  return (
    <>
      <h1 className="h2-section">Assinantes</h1>
      <p className="mt-3 text-muted">
        {rows.length} conta(s) · {active} com assinatura ativa. Depois de confirmar o pagamento, clique em
        &quot;Liberar acesso&quot;.
      </p>
      {rows.length === 0 ? (
        <p className="mt-10 text-lg text-muted">Ninguém criou conta ainda.</p>
      ) : (
        <ul className="mt-8 divide-y divide-line rounded-xl border border-line bg-surface">
          {rows.map((u) => (
            <li key={u.id} className="flex flex-col gap-3 p-5 sm:flex-row sm:items-center sm:justify-between">
              <div className="min-w-0">
                <p className="font-semibold">{u.name}</p>
                <p className="text-sm text-muted [overflow-wrap:anywhere]">{u.email}</p>
                <p className="text-sm text-muted">Conta criada em {formatDate(u.createdAt)}</p>
              </div>
              <form action={setSubscriberAction} className="flex shrink-0 items-center gap-3">
                <input type="hidden" name="id" value={u.id} />
                <input type="hidden" name="value" value={u.isSubscriber ? "0" : "1"} />
                <span
                  className={`rounded-full px-3 py-1 text-xs font-bold uppercase tracking-wider ${
                    u.isSubscriber ? "bg-accent text-accent-ink" : "border border-line text-muted"
                  }`}
                >
                  {u.isSubscriber ? "Ativo" : "Sem acesso"}
                </span>
                <button type="submit" className={`btn !min-h-10 !px-4 !text-sm ${u.isSubscriber ? "btn-ghost" : "btn-primary"}`}>
                  {u.isSubscriber ? "Retirar acesso" : "Liberar acesso"}
                  <span className="sr-only"> de {u.name}</span>
                </button>
              </form>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
