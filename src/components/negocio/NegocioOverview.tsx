import Link from "next/link";
import { AccountForm, BusinessForm } from "@/components/negocio/Forms";
import { Delta, NetworkBadge, STALE_DAYS, Sparkline, daysSince, relDays } from "@/components/negocio/ui";
import { fmtInt, getBusiness, listAccountsWithLatest, type NegocioBase, networkLabel, NETWORKS } from "@/lib/negocio";

/** Diferença de seguidores entre o último registro e o registro mais próximo de 30 dias antes. */
function growth30(snaps: { day: string; followers: number }[]) {
  if (snaps.length < 2) return null;
  const last = snaps[snaps.length - 1];
  const limit = Date.parse(last.day) - 30 * 86400000;
  const base = [...snaps].reverse().find((s) => Date.parse(s.day) <= limit) ?? snaps[0];
  if (base === last) return null;
  return last.followers - base.followers;
}

const STEPS = [
  { t: "Cadastre o negócio", d: "Nome, ramo e cidade. Leva um minuto." },
  { t: "Adicione as redes", d: "Instagram, TikTok, YouTube… uma por vez." },
  { t: "Lance os números toda semana", d: "Seguidores e resultados dos posts, tirados dos insights do app." },
];

/** Negócio, redes e cadastro. Usado na área de membros e no painel do admin. */
export async function NegocioOverview({
  userId,
  base,
  eyebrow,
  back,
  intro,
}: {
  userId: string;
  base: NegocioBase;
  eyebrow: string;
  back?: { href: string; label: string };
  intro: string;
}) {
  const business = await getBusiness(userId);
  const accounts = business ? await listAccountsWithLatest(business.id) : [];

  if (!business) {
    return (
      <>
        {back && (
          <Link href={back.href} className="mb-6 block w-fit text-sm text-muted underline">
            ← {back.label}
          </Link>
        )}
        <p className="eyebrow">{eyebrow}</p>
        <h1 className="h2-section mt-3">Comece por aqui</h1>
        <p className="mt-3 max-w-2xl text-muted">{intro}</p>

        <div className="mt-10 grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.4fr)] lg:items-start">
          <ol className="grid gap-4">
            {STEPS.map((s, i) => (
              <li key={s.t} className="flex gap-4">
                <span
                  aria-hidden="true"
                  className={`display flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-2xl ${
                    i === 0 ? "bg-accent text-accent-ink" : "border border-line text-muted"
                  }`}
                >
                  {i + 1}
                </span>
                <div>
                  <p className="font-semibold">
                    <span className="sr-only">Passo {i + 1}: </span>
                    {s.t}
                  </p>
                  <p className="text-sm text-muted">{s.d}</p>
                </div>
              </li>
            ))}
          </ol>
          <section aria-labelledby="dados-titulo" className="rounded-xl border border-line bg-surface p-6">
            <h2 id="dados-titulo" className="mb-5 text-lg font-bold">
              Dados do negócio
            </h2>
            <BusinessForm values={null} />
          </section>
        </div>
      </>
    );
  }

  const withNumbers = accounts.filter((a) => a.snaps.length > 0);
  const totalFollowers = withNumbers.reduce((a, x) => a + (x.snaps.at(-1)?.followers ?? 0), 0);
  const empty = accounts.length - withNumbers.length;
  const stale = withNumbers.filter((a) => daysSince(a.snaps.at(-1)!.day) > STALE_DAYS).length;
  const plural = (n: number, one: string, many: string) => (n === 1 ? one : `${n} ${many}`);
  const notice = [
    empty > 0 && `${plural(empty, "1 rede ainda não tem", "redes ainda não têm")} números`,
    stale > 0 && `${plural(stale, "1 rede está", "redes estão")} sem atualizar há mais de ${STALE_DAYS} dias`,
  ].filter(Boolean);

  return (
    <>
      {back && (
        <Link href={back.href} className="mb-6 block w-fit text-sm text-muted underline">
          ← {back.label}
        </Link>
      )}
      <p className="eyebrow">{eyebrow}</p>
      <div className="mt-3 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="h2-section">{business.name}</h1>
          {(business.segment || business.city) && (
            <p className="mt-2 text-muted">{[business.segment, business.city].filter(Boolean).join(" · ")}</p>
          )}
        </div>
        {accounts.length > 0 && (
          <dl className="flex gap-6 text-right">
            <div>
              <dt className="text-sm text-muted">Seguidores somados</dt>
              <dd className="display text-4xl">{withNumbers.length ? fmtInt(totalFollowers) : "-"}</dd>
            </div>
            <div>
              <dt className="text-sm text-muted">Redes</dt>
              <dd className="display text-4xl">{accounts.length}</dd>
            </div>
          </dl>
        )}
      </div>

      {notice.length > 0 && (
        <p role="status" className="mt-6 rounded-lg border border-warn-line bg-warn-bg px-4 py-3 text-sm">
          <strong className="text-warn">{notice.join(" e ")}.</strong> Abra a rede e clique em &quot;Lançar
          números&quot;. Lançar toda semana deixa o gráfico de crescimento certinho.
        </p>
      )}

      <section aria-labelledby="redes-titulo" className="mt-10">
        <h2 id="redes-titulo" className="text-2xl font-bold">
          Redes sociais
        </h2>
        <ul className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {accounts.map((a) => {
            const last = a.snaps.at(-1);
            const g = growth30(a.snaps);
            const age = last ? daysSince(last.day) : null;
            const isStale = age == null || age > STALE_DAYS;
            return (
              <li key={a.id}>
                <Link
                  href={`${base}/${a.id}`}
                  className="flex h-full flex-col rounded-xl border border-line bg-surface p-5 transition hover:border-accent"
                >
                  <div className="flex items-center gap-3">
                    <NetworkBadge network={a.network} />
                    <div className="min-w-0">
                      <p className="text-sm text-muted">{networkLabel(a.network)}</p>
                      <p className="font-bold [overflow-wrap:anywhere]">@{a.handle}</p>
                    </div>
                  </div>
                  <p className="display mt-5 text-5xl">{last ? fmtInt(last.followers) : "-"}</p>
                  <p className="text-sm text-muted">seguidores</p>
                  <Sparkline values={a.snaps.slice(-12).map((s) => s.followers)} className="mt-3 h-10 w-full" />
                  <p className="mt-3 text-sm">
                    {!last ? (
                      <span className="text-muted">Abra para lançar os primeiros números</span>
                    ) : g == null ? (
                      <span className="text-muted">Lance mais registros pra ver o crescimento</span>
                    ) : (
                      <>
                        <Delta value={g} /> <span className="text-muted">em 30 dias</span>
                      </>
                    )}
                  </p>
                  <div className="mt-auto flex flex-wrap items-center justify-between gap-2 border-t border-line pt-3 text-sm">
                    <span className="text-muted">
                      {a.postCount} {a.postCount === 1 ? "post" : "posts"}
                    </span>
                    {isStale ? (
                      <span className="rounded-full bg-warn-bg px-2.5 py-0.5 font-semibold text-warn">
                        {age == null ? "Sem números ainda" : "Hora de atualizar"}
                      </span>
                    ) : (
                      <span className="text-muted">Atualizado {relDays(age)}</span>
                    )}
                  </div>
                </Link>
              </li>
            );
          })}
          <li>
            <div className="h-full rounded-xl border border-dashed border-line p-5">
              <h3 className="mb-4 font-bold">{accounts.length === 0 ? "Adicione a primeira rede" : "Adicionar rede"}</h3>
              <AccountForm networks={NETWORKS} base={base} />
            </div>
          </li>
        </ul>
      </section>

      <details className="mt-12 rounded-xl border border-line p-5">
        <summary className="cursor-pointer font-semibold">Editar dados do negócio</summary>
        <div className="mt-5">
          <BusinessForm values={business} />
        </div>
      </details>
    </>
  );
}
