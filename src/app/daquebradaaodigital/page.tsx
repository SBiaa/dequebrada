import type { Metadata } from "next";
import { FinalCta } from "@/components/sections/FinalCta";
import { CardGrid, type CardItem } from "@/components/ui/CardGrid";
import { Ph } from "@/components/ui/Marked";
import { PageHero } from "@/components/ui/PageHero";
import { Section, SectionTitle } from "@/components/ui/Section";
import { Steps } from "@/components/ui/Steps";
import { Icon } from "@/components/ui/Icon";
import { WhatsAppButton } from "@/components/ui/WhatsAppButton";
import { WHATSAPP_MESSAGES } from "@/lib/site";

export const metadata: Metadata = {
  title: "Da Quebrada ao Digital: Formação para Empreendedores",
  description:
    "Formação contínua para o empreendedor da quebrada criar conteúdo, se posicionar e vender online. Aulas pelo celular, a partir de R$ 47, com garantia de 7 dias.",
};

const PAINS: CardItem[] = [
  { icon: "route", title: "Não sabe por onde começar", text: "Todo mundo fala de Instagram e TikTok, mas você trava na hora de executar." },
  { icon: "eyeOff", title: "Posta no escuro", text: "Tem perfil, mas o alcance não vem." },
  { icon: "coins", title: "Seguidor não vira cliente", text: "O perfil cresce, o caixa não." },
  { icon: "camera", title: "Trava na frente da câmera", text: "Não sabe o que falar nem como se soltar." },
];

const MODULES: CardItem[] = [
  { icon: "brain", title: "Mentalidade de empreendedor digital", text: "Vencer o medo e construir consistência." },
  { icon: "pin", title: "Posicionamento digital", text: "Perfil, bio e mensagem que atraem o cliente certo." },
  { icon: "video", title: "Criação de conteúdo", text: "Gravar com o celular, pauta e roteiro." },
  { icon: "phone", title: "TikTok e Instagram", text: "Crescimento orgânico, sem dançar." },
  { icon: "megaphone", title: "Tráfego pago", text: "Impulsionar com pouco dinheiro, sem desperdício." },
  { icon: "coins", title: "Monetização", text: "Transformar seguidor em cliente." },
];

const DIFFERENT: CardItem[] = [
  { icon: "chat", title: "Linguagem da quebrada", text: "Sem papo de guru, sem teoria de livro." },
  { icon: "star", title: "Aulas sempre novas", text: "Você paga uma vez e o conteúdo continua crescendo." },
  { icon: "phone", title: "Pelo celular", text: "No ônibus, no intervalo, em casa." },
  { icon: "shield", title: "Garantia de 7 dias", text: "Não gostou? Devolvemos 100% do valor." },
];

export default function FormacaoPage() {
  return (
    <>
      <PageHero
        eyebrow="De Quebrada · Formação contínua"
        title={
          <>
            Chega de ficar pra trás <span className="text-accent">no digital.</span>
          </>
        }
        lead="Aprenda a criar conteúdo, se posicionar e vender online, com método real e linguagem da quebrada."
        actions={
          <>
            <WhatsAppButton message={WHATSAPP_MESSAGES.formacao} source="formacao-hero">
              Quero entrar agora
            </WhatsAppButton>
            <a href="#modulos" className="btn btn-ghost">
              Ver os módulos
            </a>
          </>
        }
        aside={
          <div className="rounded-2xl border border-line bg-surface p-8 text-center">
            <p className="text-sm text-muted">a partir de</p>
            <p className="display text-8xl text-accent">R$ 47</p>
            <p className="mt-2 text-muted">acesso imediato e vitalício</p>
          </div>
        }
      />

      <Section labelledBy="dores-formacao">
        <SectionTitle id="dores-formacao" eyebrow="Você se identifica?" title="O que te trava hoje" />
        <CardGrid items={PAINS} columns="2" />
      </Section>

      <Section id="modulos" labelledBy="modulos-titulo" tone="light">
        <SectionTitle
          id="modulos-titulo"
          eyebrow="Conteúdo"
          title="6 módulos, do zero ao digital"
          lead="Com aulas novas adicionadas conforme a turma pede e o mercado muda."
        />
        <CardGrid items={MODULES} />
      </Section>

      <Section labelledBy="diferente-titulo">
        <SectionTitle id="diferente-titulo" eyebrow="Por que é diferente" title="Não é mais um cursinho" />
        <Steps items={DIFFERENT} />
      </Section>

      <Section id="investimento" labelledBy="invest-titulo" tone="panel">
        <div data-reveal="" className="mx-auto max-w-2xl rounded-2xl border border-line bg-bg p-8 md:p-12">
          <p className="eyebrow mb-4">Investimento</p>
          <h2 id="invest-titulo" className="h2-section">
            Da Quebrada ao Digital
          </h2>
          <p className="display mt-4 text-7xl text-accent">R$ 47</p>
          <p className="text-muted">acesso imediato e vitalício</p>
          <ul className="mt-6 space-y-2">
            {[
              "6 módulos completos",
              "Aulas novas adicionadas continuamente",
              "Acesso pelo celular, suporte e comunidade",
              "Certificado de conclusão",
            ].map((item) => (
              <li key={item} className="flex gap-3">
                <Icon name="check" className="mt-0.5 h-5 w-5 shrink-0 text-accent" />
                {item}
              </li>
            ))}
          </ul>
          <div className="mt-8">
            <WhatsAppButton
              message={WHATSAPP_MESSAGES.formacao}
              source="formacao-investimento"
              className="btn btn-wa w-full"
            >
              Quero entrar agora: R$ 47
            </WhatsAppButton>
          </div>
          <p className="mt-4 text-sm text-muted">
            Garantia incondicional de 7 dias. Link de checkout: <Ph>[LINK DE CHECKOUT]</Ph>
          </p>
        </div>
      </Section>

      <FinalCta
        title="Sua vez de virar o jogo."
        text="O digital está aberto pra quem aprender a jogar."
        button="Quero entrar agora"
        message={WHATSAPP_MESSAGES.formacao}
        source="formacao-cta-final"
      />
    </>
  );
}
