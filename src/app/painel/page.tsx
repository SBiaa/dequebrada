import Link from "next/link";
import { setSubscriberAction } from "./membros-actions";
import { setLeadStatusAction } from "./leads/actions";
import { PENDING_DAYS, leadWhatsAppLink, painelQueue, painelStats, tempoRelativo } from "@/lib/painel";

const FILTERS = [
  { id: "", label: "Tudo" },
  { id: "acesso", label: "Liberar acesso" },
  { id: "leads", label: "Leads" },
  { id: "rascunhos", label: "Rascunhos" },
] as const;
type Filter = (typeof FILTERS)[number]["id"];

const TAG = {
  acesso: { label: "Acesso", cls: "bg-warn-bg text-warn" },
  lead: { label: "Lead", cls: "bg-wa/15 text-ink" },
  rascunho: { label: "Rascunho", cls: "bg-surface-2 text-muted" },
} as const;

type Item =
  | { kind: "acesso"; id: string; at: Date; title: string; meta: string }
  | { kind: "lead"; id: string; at: Date; title: string; meta: string; wa: string }
  | { kind: "rascunho"; id: string; at: Date; title: string; meta: string };

export default async function PainelHome({ searchParams }: PageProps<"/painel">) {
  const sp = await searchParams;
  const f: Filter = FILTERS.some((x) => x.id === sp.f) ? (sp.f as Filter) : "";
  const [{ pendentes, leadsNovos, rascunhos }, stats] = await Promise.all([painelQueue(), painelStats()]);

  const counts: Record<Filter, number> = {
    "": pendentes.length + leadsNovos.length + rascunhos.length,
    acesso: pendentes.length,
    leads: leadsNovos.length,
    rascunhos: rascunhos.length,
  };

  const items: Item[] = [
    ...(f === "" || f === "acesso"
      ? pendentes.map((u) => ({
          kind: "acesso" as const,
          id: u.id,
          at: u.createdAt,
          title: `${u.name} criou conta`,
          meta: `${u.email} · ${tempoRelativo(u.createdAt)}`,
        }))
      : []),
    ...(f === "" || f === "leads"
      ? leadsNovos.map((l) => ({
          kind: "lead" as const,
          id: l.id,
          at: l.createdAt,
          title: `${l.name} respondeu o quiz`,
          meta: `${l.quizTitle} · ${tempoRelativo(l.createdAt)}`,
          wa: leadWhatsAppLink(l.whatsapp, l.name, l.quizTitle),
        }))
      : []),
    ...(f === "" || f === "rascunhos"
      ? rascunhos.map((p) => ({
          kind: "rascunho" as const,
          id: p.id,
          at: p.updatedAt,
          title: p.title,
          meta: `editado ${tempoRelativo(p.updatedAt)}`,
        }))
      : []),
  ];
  // Acesso e leads primeiro (alguém está esperando); rascunhos depois.
  const weight = { acesso: 0, lead: 1, rascunho: 2 };
  items.sort((a, b) => weight[a.kind] - weight[b.kind] || b.at.getTime() - a.at.getTime());

  return (
    <>
      <h1 className="h2-section">Fila de hoje</h1>
      <p className="mt-2 text-muted">
        {counts[""] === 0
          ? "Nada pendente. Bom momento para escrever um post."
          : `${counts[""]} ${counts[""] === 1 ? "tarefa" : "tarefas"}. Resolva direto daqui.`}
      </p>

      <nav aria-label="Filtrar fila" className="mt-6 flex flex-wrap gap-2">
        {FILTERS.map((x) => {
          const active = x.id === f;
          return (
            <Link
              key={x.id}
              href={x.id ? `/painel?f=${x.id}` : "/painel"}
              aria-current={active ? "page" : undefined}
              className={`inline-flex min-h-10 items-center rounded-full px-4 text-sm ${
                active ? "bg-ink font-bold text-bg" : "border border-line text-muted hover:text-ink"
              }`}
            >
              {x.label} · {counts[x.id]}
            </Link>
          );
        })}
      </nav>

      {items.length === 0 ? (
        <p className="mt-8 rounded-xl border border-line bg-surface p-6 text-muted">Nada aqui.</p>
      ) : (
        <ul className="mt-6 divide-y divide-line rounded-xl border border-line bg-surface">
          {items.map((it) => (
            <li key={`${it.kind}-${it.id}`} className="flex flex-wrap items-center gap-x-4 gap-y-3 p-4 sm:px-5">
              <span
                className={`w-24 shrink-0 rounded-md py-1 text-center text-[0.7rem] font-bold uppercase tracking-wider ${TAG[it.kind].cls}`}
              >
                {TAG[it.kind].label}
              </span>
              <div className="min-w-0 flex-1 basis-56">
                <p className="font-semibold [overflow-wrap:anywhere]">{it.title}</p>
                <p className="text-sm text-muted [overflow-wrap:anywhere]">{it.meta}</p>
              </div>
              {it.kind === "acesso" && (
                <form action={setSubscriberAction}>
                  <input type="hidden" name="id" value={it.id} />
                  <input type="hidden" name="value" value="1" />
                  <button type="submit" className="btn !min-h-10 !px-4 !text-sm bg-warn font-bold text-black">
                    Liberar acesso
                  </button>
                </form>
              )}
              {it.kind === "lead" && (
                <div className="flex flex-wrap gap-2">
                  <a
                    href={it.wa}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn !min-h-10 !px-4 !text-sm bg-wa font-bold text-black"
                  >
                    Chamar no WhatsApp <span className="sr-only">(abre em nova aba)</span>
                  </a>
                  <form action={setLeadStatusAction}>
                    <input type="hidden" name="id" value={it.id} />
                    <input type="hidden" name="status" value="contatado" />
                    <button type="submit" className="btn btn-ghost !min-h-10 !px-4 !text-sm">
                      Já chamei
                    </button>
                  </form>
                </div>
              )}
              {it.kind === "rascunho" && (
                <Link href={`/painel/posts/${it.id}`} className="btn btn-ghost !min-h-10 !px-4 !text-sm">
                  Continuar
                </Link>
              )}
            </li>
          ))}
        </ul>
      )}
      <p className="mt-3 text-sm text-muted">
        &quot;Liberar acesso&quot; mostra contas dos últimos {PENDING_DAYS} dias sem assinatura. As mais antigas
        ficam em <Link href="/painel/assinantes" className="text-accent hover:underline">Assinantes</Link>.
      </p>

      <h2 className="mt-12 text-lg font-bold">Em números</h2>
      <dl className="mt-4 grid gap-3 sm:grid-cols-3">
        {[
          { label: "Posts publicados no mês", n: stats.publicados },
          { label: "Assinantes ativos", n: stats.ativos },
          { label: "Leads no mês", n: stats.leadsMes },
        ].map((s) => (
          <div key={s.label} className="rounded-xl border border-line p-4">
            <dt className="text-sm text-muted">{s.label}</dt>
            <dd className="display text-4xl">{s.n}</dd>
          </div>
        ))}
      </dl>
    </>
  );
}
