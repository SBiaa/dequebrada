import Link from "next/link";
import { notFound } from "next/navigation";
import { deleteAccountAction, deletePostAction, deleteSnapshotAction } from "@/app/membros/negocio/actions";
import { GrowthChart } from "@/components/negocio/GrowthChart";
import { PostForm, SnapshotForm } from "@/components/negocio/Forms";
import { ConfirmDelete, Delta, NetworkBadge, STALE_DAYS, daysSince, relDays } from "@/components/negocio/ui";
import {
  type NegocioBase,
  engagementRate,
  fmtDay,
  fmtInt,
  fmtPct,
  getOwnedAccount,
  interactions,
  listPosts,
  listSnapshots,
  networkLabel,
  POST_FORMATS,
  todayISO,
} from "@/lib/negocio";

const s = (n: number | null) => (n == null ? "" : String(n));

function Stat({ label, children, sub }: { label: string; children: React.ReactNode; sub?: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-line bg-surface p-4">
      <dt className="text-sm text-muted">{label}</dt>
      <dd className="display mt-1 text-4xl">{children}</dd>
      {sub && <dd className="text-sm text-muted">{sub}</dd>}
    </div>
  );
}

/** Página de uma rede: gráfico, números e posts. Usada na área de membros e no painel do admin. */
export async function RedeDetail({
  userId,
  accountId,
  base,
  novo,
  form,
}: {
  userId: string;
  accountId: string;
  base: NegocioBase;
  novo: boolean;
  /** Abre o formulário pedido pelos botões do topo: "numeros" ou "post". */
  form?: string;
}) {
  const account = await getOwnedAccount(userId, accountId);
  if (!account) notFound();

  const [snaps, posts] = await Promise.all([listSnapshots(account.id), listPosts(account.id)]);
  const today = todayISO();
  const last = snaps[snaps.length - 1];
  const first = snaps[0];
  const age = last ? daysSince(last.day) : null;
  const here = `${base}/${account.id}`;

  // Últimos 30 dias de posts.
  const since = new Date(Date.parse(today) - 30 * 86400000).toISOString().slice(0, 10);
  const recent = posts.filter((p) => p.day >= since);
  const rates = recent.map(engagementRate).filter((r): r is number => r != null);
  const avgRate = rates.length ? rates.reduce((a, b) => a + b, 0) / rates.length : null;
  const leads30 = recent.reduce((a, p) => a + (p.leads ?? 0), 0);

  // Média por formato (todos os posts com alcance).
  const byFormat = POST_FORMATS.map((f) => {
    const list = posts.filter((p) => p.format === f);
    const withReach = list.filter((p) => p.reach);
    return {
      format: f,
      count: list.length,
      avgReach: withReach.length ? Math.round(withReach.reduce((a, p) => a + (p.reach ?? 0), 0) / withReach.length) : null,
      avgRate: withReach.length
        ? withReach.reduce((a, p) => a + (engagementRate(p) ?? 0), 0) / withReach.length
        : null,
      leads: list.reduce((a, p) => a + (p.leads ?? 0), 0),
    };
  }).filter((f) => f.count > 0);
  const maxRate = Math.max(0, ...byFormat.map((f) => f.avgRate ?? 0)) || 1;

  const top = [...posts]
    .filter((p) => p.reach)
    .sort((a, b) => (engagementRate(b) ?? 0) - (engagementRate(a) ?? 0))
    .slice(0, 3);

  const openNumbers = form === "numeros" || (snaps.length === 0 && form !== "post");
  const openPost = form === "post" || (posts.length === 0 && snaps.length > 0 && form !== "numeros");

  return (
    <>
      <Link href={base} className="block w-fit text-sm text-muted underline">
        ← {base === "/painel/redes" ? "Minhas redes" : "Meu negócio"}
      </Link>

      <div className="mt-6 flex flex-wrap items-end justify-between gap-4">
        <div className="flex min-w-0 items-center gap-4">
          <NetworkBadge network={account.network} className="h-14 w-14 text-lg" />
          <div className="min-w-0">
            <p className="eyebrow">{networkLabel(account.network)}</p>
            <h1 className="h2-section mt-1 [overflow-wrap:anywhere]">@{account.handle}</h1>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link href={`${here}?form=numeros#lancar`} className="btn btn-primary !min-h-11 !text-sm">
            Lançar números
          </Link>
          <Link href={`${here}?form=post#registrar`} className="btn btn-ghost !min-h-11 !text-sm">
            Registrar post
          </Link>
        </div>
      </div>

      {novo && (
        <p role="status" className="mt-6 rounded-lg border border-accent bg-accent/10 p-3 font-semibold">
          Rede adicionada. Comece lançando quantos seguidores você tem hoje.
        </p>
      )}
      {!novo && age != null && age > STALE_DAYS && (
        <p role="status" className="mt-6 rounded-lg border border-warn-line bg-warn-bg px-4 py-3 text-sm">
          <strong className="text-warn">Último registro {relDays(age)}.</strong> Que tal lançar os números desta semana?
        </p>
      )}

      <dl className="mt-8 grid grid-cols-2 gap-3 md:grid-cols-4">
        <Stat label="Seguidores" sub={last ? `em ${fmtDay(last.day)}` : "sem registro"}>
          {fmtInt(last?.followers)}
        </Stat>
        <Stat label="Crescimento total" sub={first && first !== last ? `desde ${fmtDay(first.day)}` : "precisa de 2 registros"}>
          {first && last && first !== last ? <Delta value={last.followers - first.followers} /> : "-"}
        </Stat>
        <Stat label="Posts em 30 dias">{recent.length}</Stat>
        <Stat
          label="Engajamento médio"
          sub={leads30 ? `${fmtInt(leads30)} contato(s) em 30 dias` : "posts dos últimos 30 dias"}
        >
          {fmtPct(avgRate)}
        </Stat>
      </dl>

      <section aria-labelledby="cresc-titulo" className="mt-12 scroll-anchor" id="lancar">
        <h2 id="cresc-titulo" className="text-2xl font-bold">
          Seguidores
        </h2>
        {snaps.length === 0 ? (
          <p className="mt-4 text-muted">Lance o primeiro registro abaixo pra começar o gráfico.</p>
        ) : (
          <div className="mt-6 rounded-xl border border-line bg-surface p-4">
            <GrowthChart label="Seguidores" points={snaps.map((x) => ({ day: x.day, value: x.followers }))} />
            {snaps.length === 1 && (
              <p className="mt-2 text-sm text-muted">Com mais registros, a linha mostra o crescimento.</p>
            )}
          </div>
        )}

        <details className="mt-6 rounded-xl border border-line bg-surface p-5" open={openNumbers}>
          <summary className="cursor-pointer text-lg font-bold">Lançar números do perfil</summary>
          <p className="mt-3 text-sm text-muted">
            Dica: lance uma vez por semana, sempre no mesmo dia. Os números ficam nos insights do app (ex.: no
            Instagram, Painel profissional).
          </p>
          <div className="mt-5">
            <SnapshotForm accountId={account.id} today={today} />
          </div>
        </details>

        {snaps.length > 0 && (
          <details className="mt-4 rounded-xl border border-line p-5">
            <summary className="cursor-pointer font-bold">Ver todos os registros ({snaps.length})</summary>
            <div className="mt-4 overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="text-muted">
                  <tr>
                    <th className="py-2 pr-4 font-semibold">Data</th>
                    <th className="py-2 pr-4 text-right font-semibold">Seguidores</th>
                    <th className="py-2 pr-4 text-right font-semibold">Alcance</th>
                    <th className="py-2 pr-4 text-right font-semibold">Visitas</th>
                    <th className="py-2 pr-4 text-right font-semibold">Cliques</th>
                    <th className="py-2 pr-4 font-semibold">Obs.</th>
                    <th className="py-2">
                      <span className="sr-only">Ações</span>
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-line">
                  {[...snaps].reverse().map((x) => (
                    <tr key={x.id}>
                      <td className="py-2 pr-4">{fmtDay(x.day)}</td>
                      <td className="py-2 pr-4 text-right tabular-nums">{fmtInt(x.followers)}</td>
                      <td className="py-2 pr-4 text-right tabular-nums">{fmtInt(x.reach)}</td>
                      <td className="py-2 pr-4 text-right tabular-nums">{fmtInt(x.profileVisits)}</td>
                      <td className="py-2 pr-4 text-right tabular-nums">{fmtInt(x.linkClicks)}</td>
                      <td className="py-2 pr-4 text-muted">{x.note}</td>
                      <td className="py-2 text-right">
                        <ConfirmDelete
                          action={deleteSnapshotAction}
                          fields={{ accountId: account.id, id: x.id }}
                          label="Apagar"
                          srLabel={`registro de ${fmtDay(x.day)}`}
                          warning="Apagar este registro? Ele sai do gráfico."
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </details>
        )}
      </section>

      <section aria-labelledby="posts-titulo" className="mt-14 scroll-anchor" id="registrar">
        <h2 id="posts-titulo" className="text-2xl font-bold">
          Posts e resultados
        </h2>
        <p className="mt-2 text-sm text-muted">
          Engajamento = (curtidas + comentários + compartilhamentos + salvos) ÷ alcance.
        </p>

        <details className="mt-6 rounded-xl border border-line bg-surface p-5" open={openPost}>
          <summary className="cursor-pointer text-lg font-bold">Registrar post</summary>
          <div className="mt-5">
            <PostForm accountId={account.id} today={today} formats={POST_FORMATS} />
          </div>
        </details>

        {top.length > 0 && (
          <div className="mt-10">
            <h3 className="text-lg font-bold">Seus melhores posts</h3>
            <ol className="mt-4 grid gap-3 md:grid-cols-3">
              {top.map((p, i) => (
                <li key={p.id} className="flex flex-col rounded-xl border border-line bg-surface p-4">
                  <span className="display text-3xl text-accent">{i + 1}º</span>
                  <p className="mt-1 font-semibold [overflow-wrap:anywhere]">{p.title}</p>
                  <p className="mt-auto pt-3 text-sm text-muted">
                    <strong className="text-ink">{fmtPct(engagementRate(p))}</strong> de engajamento ·{" "}
                    {fmtInt(p.reach)} de alcance
                  </p>
                  <p className="text-xs text-muted">
                    {p.format} · {fmtDay(p.day)}
                  </p>
                </li>
              ))}
            </ol>
          </div>
        )}

        {byFormat.length > 0 && (
          <div className="mt-10">
            <h3 className="text-lg font-bold">O que funciona melhor</h3>
            <div className="mt-4 overflow-x-auto rounded-xl border border-line">
              <table className="w-full min-w-[560px] text-left text-sm">
                <thead className="bg-surface text-muted">
                  <tr>
                    <th className="px-4 py-2.5 font-semibold">Formato</th>
                    <th className="px-4 py-2.5 text-right font-semibold">Posts</th>
                    <th className="px-4 py-2.5 text-right font-semibold">Alcance médio</th>
                    <th className="w-[34%] px-4 py-2.5 font-semibold">Engajamento médio</th>
                    <th className="px-4 py-2.5 text-right font-semibold">Contatos/vendas</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-line">
                  {byFormat.map((f) => (
                    <tr key={f.format}>
                      <td className="px-4 py-2.5">{f.format}</td>
                      <td className="px-4 py-2.5 text-right tabular-nums">{f.count}</td>
                      <td className="px-4 py-2.5 text-right tabular-nums">{fmtInt(f.avgReach)}</td>
                      <td className="px-4 py-2.5">
                        <div className="flex items-center gap-3">
                          <span className="h-2 flex-1 overflow-hidden rounded-full bg-surface-2" aria-hidden="true">
                            <span
                              className="block h-full rounded-full bg-accent"
                              style={{ width: `${((f.avgRate ?? 0) / maxRate) * 100}%` }}
                            />
                          </span>
                          <span className="w-14 text-right tabular-nums">{fmtPct(f.avgRate)}</span>
                        </div>
                      </td>
                      <td className="px-4 py-2.5 text-right tabular-nums">{fmtInt(f.leads)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {posts.length > 0 && (
          <div className="mt-10">
            <h3 className="text-lg font-bold">Todos os posts ({posts.length})</h3>
            <ul className="mt-4 grid gap-3">
              {posts.map((p) => (
                <li key={p.id} className="rounded-xl border border-line bg-surface p-4 sm:p-5">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="min-w-0 flex-1 basis-60">
                      <p className="flex flex-wrap items-center gap-2 text-xs text-muted">
                        <span className="rounded-full border border-line px-2 py-0.5">{p.format}</span>
                        {fmtDay(p.day)}
                      </p>
                      <p className="mt-1.5 font-semibold [overflow-wrap:anywhere]">
                        {p.url ? (
                          <a href={p.url} target="_blank" rel="noopener noreferrer" className="hover:text-accent">
                            {p.title} <span aria-hidden="true">↗</span>
                            <span className="sr-only"> (abre em nova aba)</span>
                          </a>
                        ) : (
                          p.title
                        )}
                      </p>
                      {p.note && <p className="mt-1 text-sm text-muted">{p.note}</p>}
                    </div>
                    <ConfirmDelete
                      action={deletePostAction}
                      fields={{ accountId: account.id, id: p.id }}
                      label="Apagar"
                      srLabel={`post ${p.title}`}
                      warning="Apagar este post e os resultados dele?"
                    />
                  </div>
                  <dl className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4">
                    {[
                      { k: "Alcance", v: fmtInt(p.reach) },
                      { k: "Interações", v: fmtInt(interactions(p)) },
                      { k: "Engajamento", v: fmtPct(engagementRate(p)) },
                      { k: "Contatos/vendas", v: fmtInt(p.leads) },
                    ].map((m) => (
                      <div key={m.k} className="rounded-lg bg-surface-2 px-3 py-2">
                        <dt className="text-xs text-muted">{m.k}</dt>
                        <dd className="font-bold tabular-nums">{m.v}</dd>
                      </div>
                    ))}
                  </dl>
                  <details className="mt-3">
                    <summary className="cursor-pointer text-sm font-semibold text-accent">Editar resultados</summary>
                    <div className="mt-4">
                      <PostForm
                        accountId={account.id}
                        today={today}
                        formats={POST_FORMATS}
                        values={{
                          id: p.id,
                          day: p.day,
                          format: p.format,
                          title: p.title,
                          url: p.url ?? "",
                          reach: s(p.reach),
                          likes: s(p.likes),
                          comments: s(p.comments),
                          shares: s(p.shares),
                          saves: s(p.saves),
                          leads: s(p.leads),
                          note: p.note,
                        }}
                      />
                    </div>
                  </details>
                </li>
              ))}
            </ul>
          </div>
        )}
      </section>

      <section aria-labelledby="remover-titulo" className="mt-16 rounded-xl border border-red-400/40 p-5">
        <h2 id="remover-titulo" className="font-bold">
          Remover esta rede
        </h2>
        <p className="mt-1 text-sm text-muted">Apaga também todos os registros e posts dela. Não dá para desfazer.</p>
        <div className="mt-3 w-fit">
          <ConfirmDelete
            action={deleteAccountAction}
            fields={{ accountId: account.id, base }}
            label="Remover rede"
            warning={`Remover @${account.handle} e tudo o que foi lançado nela?`}
            confirmLabel="Sim, remover para sempre"
          />
        </div>
      </section>
    </>
  );
}
