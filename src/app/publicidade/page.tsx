import type { Metadata } from "next";
import { FinalCta } from "@/components/sections/FinalCta";
import { Marked } from "@/components/ui/Marked";
import { PageHero } from "@/components/ui/PageHero";
import { Section, SectionTitle } from "@/components/ui/Section";
import { Steps, type StepItem } from "@/components/ui/Steps";
import { WhatsAppButton } from "@/components/ui/WhatsAppButton";
import { AD_MENU, MEDIA_KIT } from "@/data/advertising";
import { stagger } from "@/lib/motion";
import { WHATSAPP_MESSAGES } from "@/lib/site";

export const metadata: Metadata = {
  title: "Publicidade no Podcast e Portal em Ferraz de Vasconcelos",
  description:
    "Anuncie no De Quebrada Podcast, nas redes e no portal de notícias de Ferraz de Vasconcelos e Alto Tietê. Veja o cardápio de formatos e fale com a gente.",
};

const STEPS: StepItem[] = [
  { icon: "chat", title: "Você chama no WhatsApp", text: "Conta sua marca, público e objetivo." },
  { icon: "clipboard", title: "Montamos a proposta", text: "Formatos e período que fazem sentido pra você." },
  { icon: "megaphone", title: "Sua marca no ar", text: "Publicação no podcast, nas redes ou no portal." },
  { icon: "chart", title: "Acompanhamento", text: "Combinamos como você acompanha os resultados." },
];

export default function PublicidadePage() {
  return (
    <>
      <PageHero
        eyebrow="De Quebrada · Publicidade"
        title={
          <>
            Sua marca na voz <span className="text-accent">da quebrada</span>
          </>
        }
        lead="Anuncie no podcast nº 1 do Alto Tietê, nas redes e no portal de notícias de Ferraz de Vasconcelos. Público local, que confia em quem fala a língua dele."
        actions={
          <>
            <WhatsAppButton message={WHATSAPP_MESSAGES.anunciar} source="publicidade-hero">
              Quero anunciar
            </WhatsAppButton>
            <a href="#cardapio" className="btn btn-ghost">
              Ver cardápio
            </a>
          </>
        }
      />

      <Section labelledBy="midia-titulo" tone="panel">
        <SectionTitle
          id="midia-titulo"
          eyebrow="Mídia kit"
          title="Quem você alcança"
          lead="Números informados no site atual do De Quebrada."
        />
        <dl className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {MEDIA_KIT.stats.map((s, i) => (
            <div
              key={s.label}
              data-reveal=""
              style={stagger(i, 90)}
              className="rounded-xl border border-line bg-bg p-6"
            >
              <dd className="display text-5xl">{s.value}</dd>
              <dt className="mt-2 text-sm text-muted">{s.label}</dt>
            </div>
          ))}
        </dl>
        <ul className="mt-8 space-y-2 text-lg text-muted">
          <li>
            Alcance mensal total: <Marked>{MEDIA_KIT.reach}</Marked>
          </li>
          <li>
            Público: <Marked>{MEDIA_KIT.audience}</Marked>
          </li>
        </ul>
      </Section>

      <Section id="cardapio" labelledBy="cardapio-titulo">
        <SectionTitle
          id="cardapio-titulo"
          eyebrow="Cardápio de serviços"
          title="Formatos de publicidade"
          lead="Escolha onde sua marca aparece. Dá pra combinar formatos num pacote."
        />
        <div className="space-y-14">
          {AD_MENU.map((cat) => (
            <section key={cat.id} aria-labelledby={`cat-${cat.id}`}>
              <h3 id={`cat-${cat.id}`} className="text-2xl font-bold tracking-tight">
                {cat.title}
              </h3>
              <p className="mt-2 text-muted">{cat.description}</p>
              <ul className="mt-6 grid gap-5 md:grid-cols-2">
                {cat.items.map((item, i) => (
                  <li key={item.name} data-reveal="" style={stagger(i, 100)}>
                    <article className="flex h-full flex-col rounded-xl border border-line bg-surface p-6">
                      <h4 className="text-lg font-bold leading-snug">
                        <Marked>{item.name}</Marked>
                      </h4>
                      <p className="mt-2 flex-1 text-muted">{item.description}</p>
                      <ul className="mt-4 flex flex-wrap gap-2" aria-label="Onde aparece">
                        {item.formats.map((f) => (
                          <li
                            key={f}
                            className="rounded-full border border-line px-3 py-1 text-sm text-muted"
                          >
                            {f}
                          </li>
                        ))}
                      </ul>
                      <p className="mt-5 border-t border-line pt-4 font-bold">
                        <Marked>{item.price}</Marked>
                      </p>
                    </article>
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>
      </Section>

      <Section labelledBy="processo-titulo" tone="light">
        <SectionTitle id="processo-titulo" eyebrow="Processo" title="Como funciona" />
        <Steps items={STEPS} />
      </Section>

      <FinalCta
        title="Bora colocar sua marca na quebrada?"
        text="Chama no WhatsApp e monte sua campanha com a gente."
        button="Quero anunciar"
        message={WHATSAPP_MESSAGES.anunciar}
        source="publicidade-cta-final"
      />
    </>
  );
}
