import type { Metadata } from "next";
import { Faq } from "@/components/sections/Faq";
import { Proof } from "@/components/sections/Proof";
import { BuyButton } from "@/components/ui/BuyButton";
import { CardGrid } from "@/components/ui/CardGrid";
import { Icon } from "@/components/ui/Icon";
import { Marked } from "@/components/ui/Marked";
import { PageHero } from "@/components/ui/PageHero";
import { Section, SectionTitle } from "@/components/ui/Section";
import { Steps } from "@/components/ui/Steps";
import {
  DIFFERENT,
  FOR_WHO,
  FORMACAO,
  FORMACAO_FAQ,
  HOW_IT_WORKS,
  INCLUDED,
  MODULES,
  NOT_FOR_WHO,
  PAINS,
  TESTIMONIALS,
} from "@/data/formacao";
import { SITE, WHATSAPP_MESSAGES } from "@/lib/site";

export const metadata: Metadata = {
  title: "Da Quebrada ao Digital: Curso de Marketing Digital para Empreendedores",
  description:
    "Formação pelo celular pra empreendedor da quebrada criar conteúdo, se posicionar e vender no Instagram e TikTok. R$ 47, acesso vitalício e garantia de 7 dias.",
  alternates: { canonical: "/daquebradaaodigital" },
};

/** Link de checkout configurado na Vercel. Sem ele, os botões vão para o WhatsApp. */
const CHECKOUT = process.env.CHECKOUT_URL_DA_QUEBRADA_AO_DIGITAL;

function Buy({ source, children, full }: { source: string; children: React.ReactNode; full?: boolean }) {
  return (
    <BuyButton
      checkoutUrl={CHECKOUT}
      whatsappMessage={WHATSAPP_MESSAGES.formacao}
      source={source}
      className={full ? "btn w-full" : "btn"}
    >
      {children}
    </BuyButton>
  );
}

function CourseJsonLd() {
  const data = {
    "@context": "https://schema.org",
    "@type": "Course",
    name: "Da Quebrada ao Digital",
    description:
      "Formação pelo celular pra empreendedor criar conteúdo, se posicionar e vender online.",
    inLanguage: "pt-BR",
    provider: { "@type": "Organization", name: SITE.name },
    offers: { "@type": "Offer", price: "47.00", priceCurrency: "BRL", category: "Paid" },
  };
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, "\\u003c") }}
    />
  );
}

export default function FormacaoPage() {
  return (
    <>
      <CourseJsonLd />
      <PageHero
        eyebrow="De Quebrada · Formação contínua"
        title={
          <>
            Chega de ficar pra trás <span className="text-accent">no digital.</span>
          </>
        }
        lead="Aprenda a criar conteúdo, se posicionar e vender no Instagram e no TikTok, pelo celular, com método real e linguagem da quebrada."
        actions={
          <>
            <Buy source="formacao-hero">Quero entrar agora</Buy>
            <a href="#modulos" className="btn btn-ghost">
              Ver os módulos
            </a>
          </>
        }
        proof={["Garantia de 7 dias", "Acesso vitalício", "Aulas pelo celular"]}
        aside={
          <div className="rounded-2xl border border-line bg-surface p-8 text-center">
            <p className="text-sm text-muted">investimento único</p>
            <p className="display text-8xl text-accent">{FORMACAO.price}</p>
            <p className="mt-2 text-muted">{FORMACAO.priceNote}</p>
          </div>
        }
      />

      <Section labelledBy="dores-formacao">
        <SectionTitle id="dores-formacao" eyebrow="Você se identifica?" title="O que te trava hoje" />
        <CardGrid items={PAINS} columns="2" />
      </Section>

      <Section labelledBy="praquem-titulo" tone="panel">
        <SectionTitle id="praquem-titulo" eyebrow="Pra quem é" title="Essa formação é pra você se..." />
        <div className="grid gap-8 md:grid-cols-[1.4fr_1fr]">
          <ul className="space-y-4" data-reveal="">
            {FOR_WHO.map((item) => (
              <li key={item} className="flex gap-3 text-lg">
                <Icon name="check" className="mt-1 h-5 w-5 shrink-0 text-accent" />
                {item}
              </li>
            ))}
          </ul>
          <div data-reveal="" className="rounded-xl border border-line bg-bg p-6">
            <h3 className="text-lg font-bold">Não é pra você se...</h3>
            <ul className="mt-4 space-y-3 text-muted">
              {NOT_FOR_WHO.map((item) => (
                <li key={item} className="flex gap-3">
                  <span aria-hidden="true" className="font-bold text-accent">
                    ✗
                  </span>
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </Section>

      <Section id="modulos" labelledBy="modulos-titulo" tone="light">
        <SectionTitle
          id="modulos-titulo"
          eyebrow="O que você aprende"
          title="6 módulos, do zero ao digital"
          lead="Com aulas novas adicionadas conforme a turma pede e o mercado muda."
        />
        <CardGrid items={MODULES} />
      </Section>

      <Section labelledBy="funciona-titulo">
        <SectionTitle id="funciona-titulo" eyebrow="Como funciona" title="Do pagamento à primeira aula" />
        <Steps items={HOW_IT_WORKS} />
      </Section>

      <Section labelledBy="diferente-titulo" tone="panel">
        <SectionTitle id="diferente-titulo" eyebrow="Por que é diferente" title="Não é mais um cursinho" />
        <CardGrid items={DIFFERENT} columns="2" />
      </Section>

      <Proof
        items={TESTIMONIALS}
        title="Quem já fez a formação"
        lead="Depoimentos de alunos da Da Quebrada ao Digital."
      />

      <Section id="investimento" labelledBy="invest-titulo" tone="panel">
        <div data-reveal="" className="mx-auto max-w-2xl rounded-2xl border border-accent bg-bg p-8 md:p-12">
          <p className="eyebrow mb-4">O que está incluso</p>
          <h2 id="invest-titulo" className="h2-section">
            Da Quebrada ao Digital
          </h2>
          <p className="display mt-4 text-7xl text-accent">{FORMACAO.price}</p>
          <p className="text-muted">{FORMACAO.priceNote}</p>
          <p className="mt-1 text-sm text-muted">
            <Marked>{FORMACAO.installments}</Marked>
          </p>
          <ul className="mt-6 space-y-2">
            {INCLUDED.map((item) => (
              <li key={item} className="flex gap-3">
                <Icon name="check" className="mt-0.5 h-5 w-5 shrink-0 text-accent" />
                {item}
              </li>
            ))}
          </ul>
          <div className="mt-8">
            <Buy source="formacao-investimento" full>
              Quero entrar agora: {FORMACAO.price}
            </Buy>
          </div>
          <p className="mt-5 flex gap-3 rounded-lg border border-line bg-surface p-4 text-sm text-muted">
            <Icon name="shield" className="h-5 w-5 shrink-0 text-accent" />
            {FORMACAO.guarantee}
          </p>
        </div>
      </Section>

      <Faq items={FORMACAO_FAQ} />

      <Section labelledBy="cta-titulo" tone="panel">
        <div className="flex flex-col items-start justify-between gap-8 lg:flex-row lg:items-center">
          <div className="max-w-2xl">
            <p className="eyebrow mb-4">Bora?</p>
            <h2 id="cta-titulo" className="h2-section">
              Sua vez de virar o jogo.
            </h2>
            <p className="mt-4 text-lg text-muted">
              O digital está aberto pra quem aprender a jogar. Ficou com dúvida? Chama no WhatsApp.
            </p>
          </div>
          <Buy source="formacao-cta-final">Quero entrar agora</Buy>
        </div>
      </Section>
    </>
  );
}
