import type { Metadata } from "next";
import Link from "next/link";
import { AccountForm, BusinessForm } from "@/components/negocio/Forms";
import { canSeeExclusive, requireUser } from "@/lib/auth";
import { fmtInt, getBusiness, listAccountsWithLatest, networkLabel, NETWORKS } from "@/lib/negocio";
import { WHATSAPP_MESSAGES } from "@/lib/site";
import { WhatsAppButton } from "@/components/ui/WhatsAppButton";

export const metadata: Metadata = { title: "Meu negócio", robots: { index: false, follow: false } };

/** Diferença de seguidores entre o último registro e o registro mais próximo de 30 dias antes. */
function growth30(snaps: { day: string; followers: number }[]) {
  if (snaps.length < 2) return null;
  const last = snaps[snaps.length - 1];
  const limit = Date.parse(last.day) - 30 * 86400000;
  const base = [...snaps].reverse().find((s) => Date.parse(s.day) <= limit) ?? snaps[0];
  if (base === last) return null;
  return last.followers - base.followers;
}

export default async function NegocioPage() {
  const user = await requireUser("/membros/negocio");

  if (!canSeeExclusive(user)) {
    return (
      <div className="px-5 py-14">
        <div className="mx-auto max-w-2xl">
          <p className="eyebrow">Área de membros</p>
          <h1 className="h2-section mt-3">Acompanhe o crescimento do seu negócio</h1>
          <p className="mt-4 text-lg text-muted">
            Assinantes cadastram o negócio e as redes sociais, lançam seguidores, insights e posts, e acompanham tudo em
            gráficos. Fale com a gente pra liberar sua assinatura.
          </p>
          <div className="mt-8">
            <WhatsAppButton message={WHATSAPP_MESSAGES.geral} source="membros-negocio-assinar">
              Quero assinar
            </WhatsAppButton>
          </div>
        </div>
      </div>
    );
  }

  const business = await getBusiness(user.id);
  const accounts = business ? await listAccountsWithLatest(business.id) : [];

  return (
    <div className="px-5 py-10 md:py-14">
      <div className="mx-auto max-w-4xl">
        <Link href="/membros" className="block w-fit text-sm text-muted underline">
          ← Área de membros
        </Link>
        <p className="eyebrow mt-6">Meu negócio</p>
        <h1 className="h2-section mt-3">{business?.name ?? "Cadastre seu negócio"}</h1>
        {business && (
          <p className="mt-2 text-muted">{[business.segment, business.city].filter(Boolean).join(" · ")}</p>
        )}

        {business && (
          <section aria-labelledby="redes-titulo" className="mt-10">
            <h2 id="redes-titulo" className="text-2xl font-bold">
              Suas redes
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
                        href={`/membros/negocio/${a.id}`}
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
              <AccountForm networks={NETWORKS} />
            </div>
          </section>
        )}

        <section aria-labelledby="dados-titulo" className="mt-12">
          {business ? (
            <details className="rounded-xl border border-line p-5">
              <summary id="dados-titulo" className="cursor-pointer text-lg font-bold">
                Editar dados do negócio
              </summary>
              <div className="mt-5">
                <BusinessForm values={business} />
              </div>
            </details>
          ) : (
            <>
              <h2 id="dados-titulo" className="sr-only">
                Dados do negócio
              </h2>
              <p className="mb-6 text-muted">
                Comece pelos dados do seu negócio. Depois você adiciona as redes sociais e lança os números.
              </p>
              <BusinessForm values={null} />
            </>
          )}
        </section>
      </div>
    </div>
  );
}
