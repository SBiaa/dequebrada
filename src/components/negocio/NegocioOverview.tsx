import Link from "next/link";
import { AccountForm, BusinessForm } from "@/components/negocio/Forms";
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

  return (
    <>
      {back && (
        <Link href={back.href} className="mb-6 block w-fit text-sm text-muted underline">
          ← {back.label}
        </Link>
      )}
      <p className="eyebrow">{eyebrow}</p>
      <h1 className="h2-section mt-3">{business?.name ?? "Cadastre seu negócio"}</h1>
      {business && <p className="mt-2 text-muted">{[business.segment, business.city].filter(Boolean).join(" · ")}</p>}

      {business && (
        <section aria-labelledby="redes-titulo" className="mt-10">
          <h2 id="redes-titulo" className="text-2xl font-bold">
            Redes sociais
          </h2>
          {accounts.length === 0 ? (
            <p className="mt-4 text-muted">Nenhuma rede ainda. Adicione a primeira abaixo.</p>
          ) : (
            <ul className="mt-6 grid gap-4 sm:grid-cols-2">
              {accounts.map((a) => {
                const last = a.snaps[a.snaps.length - 1];
                const g = growth30(a.snaps);
                return (
                  <li key={a.id}>
                    <Link
                      href={`${base}/${a.id}`}
                      className="block rounded-xl border border-line bg-surface p-5 transition hover:border-accent"
                    >
                      <p className="text-sm text-muted">{networkLabel(a.network)}</p>
                      <p className="text-lg font-bold [overflow-wrap:anywhere]">@{a.handle}</p>
                      <p className="mt-4 text-3xl font-bold">{last ? fmtInt(last.followers) : "-"}</p>
                      <p className="text-sm text-muted">seguidores</p>
                      <p className="mt-3 text-sm">
                        {g == null ? (
                          <span className="text-muted">Lance mais registros pra ver o crescimento</span>
                        ) : (
                          <span className="font-semibold">
                            {g >= 0 ? "▲ +" : "▼ "}
                            {fmtInt(g)} em 30 dias
                          </span>
                        )}
                      </p>
                      <p className="mt-1 text-sm text-muted">{a.postCount} post(s) registrado(s)</p>
                    </Link>
                  </li>
                );
              })}
            </ul>
          )}
          <div className="mt-8 rounded-xl border border-line p-5">
            <h3 className="mb-4 text-lg font-bold">Adicionar rede</h3>
            <AccountForm networks={NETWORKS} base={base} />
          </div>
        </section>
      )}

      <section aria-labelledby="dados-titulo" className="mt-12">
        {business ? (
          <details className="rounded-xl border border-line p-5">
            <summary id="dados-titulo" className="cursor-pointer text-lg font-bold">
              Editar dados
            </summary>
            <div className="mt-5">
              <BusinessForm values={business} />
            </div>
          </details>
        ) : (
          <>
            <h2 id="dados-titulo" className="sr-only">
              Dados
            </h2>
            <p className="mb-6 text-muted">{intro}</p>
            <BusinessForm values={null} />
          </>
        )}
      </section>
    </>
  );
}
