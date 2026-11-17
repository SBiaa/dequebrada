import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { GrowthChart } from "@/components/negocio/GrowthChart";
import { PostForm, SnapshotForm } from "@/components/negocio/Forms";
import { canSeeExclusive, requireUser } from "@/lib/auth";
import {
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
import { deleteAccountAction, deletePostAction, deleteSnapshotAction } from "../actions";

export const metadata: Metadata = { title: "Minha rede", robots: { index: false, follow: false } };

const small = "btn btn-ghost !min-h-9 !px-3 !text-sm";
const s = (n: number | null) => (n == null ? "" : String(n));

function Stat({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <div className="rounded-xl border border-line bg-surface p-4">
      <p className="text-sm text-muted">{label}</p>
      <p className="mt-1 text-2xl font-bold">{value}</p>
      {sub && <p className="text-sm text-muted">{sub}</p>}
    </div>
  );
}

export default async function RedePage({ params, searchParams }: PageProps<"/membros/negocio/[id]">) {
  const { id } = await params;
  const sp = await searchParams;
  const user = await requireUser(`/membros/negocio/${id}`);
  if (!canSeeExclusive(user)) redirect("/membros/negocio");
  const account = await getOwnedAccount(user.id, id);
  if (!account) notFound();

  const [snaps, posts] = await Promise.all([listSnapshots(account.id), listPosts(account.id)]);
  const today = todayISO();
  const last = snaps[snaps.length - 1];
  const first = snaps[0];

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

  const top = [...posts]
    .filter((p) => p.reach)
    .sort((a, b) => (engagementRate(b) ?? 0) - (engagementRate(a) ?? 0))
    .slice(0, 3);

  return (
    <div className="px-5 py-10 md:py-14">
      <div className="mx-auto max-w-4xl">
        <Link href="/membros/negocio" className="block w-fit text-sm text-muted underline">
          ← Meu negócio
        </Link>
        <p className="eyebrow mt-6">{networkLabel(account.network)}</p>
        <h1 className="h2-section mt-3 [overflow-wrap:anywhere]">@{account.handle}</h1>
        {sp.novo && (
          <p role="status" className="mt-6 rounded-lg border border-accent p-3 font-semibold">
            Rede adicionada. Comece lançando quantos seguidores você tem hoje.
          </p>
        )}

        <div className="mt-8 grid grid-cols-2 gap-3 md:grid-cols-4">
          <Stat label="Seguidores" value={fmtInt(last?.followers)} sub={last ? `em ${fmtDay(last.day)}` : "sem registro"} />
          <Stat
            label="Crescimento total"
            value={first && last && first !== last ? `${last.followers - first.followers >= 0 ? "+" : ""}${fmtInt(last.followers - first.followers)}` : "-"}
            sub={first && first !== last ? `desde ${fmtDay(first.day)}` : undefined}
          />
          <Stat label="Posts em 30 dias" value={String(recent.length)} />
          <Stat label="Engajamento médio" value={fmtPct(avgRate)} sub={leads30 ? `${fmtInt(leads30)} contato(s) em 30 dias` : "posts dos últimos 30 dias"} />
        </div>

        <section aria-labelledby="cresc-titulo" className="mt-12">
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

          <details className="mt-6 rounded-xl border border-line p-5" open={snaps.length === 0}>
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
                      <th className="py-2"><span className="sr-only">Ações</span></th>
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
                        <td className="py-2">
                          <form action={deleteSnapshotAction}>
                            <input type="hidden" name="accountId" value={account.id} />
                            <input type="hidden" name="id" value={x.id} />
                            <button type="submit" className={small}>
                              Apagar<span className="sr-only"> registro de {fmtDay(x.day)}</span>
                            </button>
                          </form>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </details>
          )}
        </section>

        <section aria-labelledby="posts-titulo" className="mt-12">
          <h2 id="posts-titulo" className="text-2xl font-bold">
            Posts e resultados
          </h2>
          <p className="mt-2 text-sm text-muted">
            Engajamento = (curtidas + comentários + compartilhamentos + salvos) ÷ alcance.
          </p>

          <details className="mt-6 rounded-xl border border-line p-5" open={posts.length === 0 && snaps.length > 0}>
            <summary className="cursor-pointer text-lg font-bold">Registrar post</summary>
            <div className="mt-5">
              <PostForm accountId={account.id} today={today} formats={POST_FORMATS} />
            </div>
          </details>

          {byFormat.length > 0 && (
            <div className="mt-8">
              <h3 className="text-lg font-bold">O que funciona melhor</h3>
              <div className="mt-4 overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="text-muted">
                    <tr>
                      <th className="py-2 pr-4 font-semibold">Formato</th>
                      <th className="py-2 pr-4 text-right font-semibold">Posts</th>
                      <th className="py-2 pr-4 text-right font-semibold">Alcance médio</th>
                      <th className="py-2 pr-4 text-right font-semibold">Engajamento médio</th>
                      <th className="py-2 text-right font-semibold">Contatos/vendas</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-line">
                    {byFormat.map((f) => (
                      <tr key={f.format}>
                        <td className="py-2 pr-4">{f.format}</td>
                        <td className="py-2 pr-4 text-right tabular-nums">{f.count}</td>
                        <td className="py-2 pr-4 text-right tabular-nums">{fmtInt(f.avgReach)}</td>
                        <td className="py-2 pr-4 text-right tabular-nums">{fmtPct(f.avgRate)}</td>
                        <td className="py-2 text-right tabular-nums">{fmtInt(f.leads)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {top.length > 0 && (
            <div className="mt-8">
              <h3 className="text-lg font-bold">Seus melhores posts</h3>
              <ol className="mt-4 grid gap-3">
                {top.map((p, i) => (
                  <li key={p.id} className="rounded-xl border border-line bg-surface p-4">
                    <p className="font-semibold">
                      {i + 1}. {p.title}
                    </p>
                    <p className="text-sm text-muted">
                      {p.format} · {fmtDay(p.day)} · {fmtPct(engagementRate(p))} de engajamento · {fmtInt(p.reach)} de alcance
                    </p>
                  </li>
                ))}
              </ol>
            </div>
          )}

          {posts.length > 0 && (
            <div className="mt-8">
              <h3 className="text-lg font-bold">Todos os posts ({posts.length})</h3>
              <ul className="mt-4 divide-y divide-line rounded-xl border border-line">
                {posts.map((p) => (
                  <li key={p.id} className="p-4">
                    <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                      <div className="min-w-0">
                        <p className="font-semibold [overflow-wrap:anywhere]">
                          {p.url ? (
                            <a href={p.url} target="_blank" rel="noopener noreferrer" className="underline">
                              {p.title}
                            </a>
                          ) : (
                            p.title
                          )}
                        </p>
                        <p className="text-sm text-muted">
                          {fmtDay(p.day)} · {p.format}
                        </p>
                        <p className="mt-1 text-sm">
                          Alcance {fmtInt(p.reach)} · {fmtInt(interactions(p))} interações · engajamento{" "}
                          <strong>{fmtPct(engagementRate(p))}</strong>
                          {p.leads ? ` · ${fmtInt(p.leads)} contato(s)/venda(s)` : ""}
                        </p>
                        {p.note && <p className="mt-1 text-sm text-muted">{p.note}</p>}
                      </div>
                      <form action={deletePostAction} className="shrink-0">
                        <input type="hidden" name="accountId" value={account.id} />
                        <input type="hidden" name="id" value={p.id} />
                        <button type="submit" className={small}>
                          Apagar<span className="sr-only"> post {p.title}</span>
                        </button>
                      </form>
                    </div>
                    <details className="mt-3">
                      <summary className="cursor-pointer text-sm underline">Editar resultados</summary>
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

        <form action={deleteAccountAction} className="mt-14 border-t border-line pt-6">
          <input type="hidden" name="accountId" value={account.id} />
          <p className="text-sm text-muted">Remover esta rede apaga também todos os registros e posts dela.</p>
          <button type="submit" className="btn btn-ghost mt-3 !min-h-10 !text-sm">
            Remover rede
          </button>
        </form>
      </div>
    </div>
  );
}
