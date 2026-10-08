import type { Metadata } from "next";
import { FinalCta } from "@/components/sections/FinalCta";
import { CardGrid, type CardItem } from "@/components/ui/CardGrid";
import { Ph } from "@/components/ui/Marked";
import { PageHero } from "@/components/ui/PageHero";
import { PhotoSlot } from "@/components/ui/PhotoSlot";
import { Section, SectionTitle } from "@/components/ui/Section";
import { Stats, BRAND_STATS } from "@/components/ui/Stats";
import { Steps, type StepItem } from "@/components/ui/Steps";
import { Icon } from "@/components/ui/Icon";
import { WhatsAppButton } from "@/components/ui/WhatsAppButton";
import { WHATSAPP_MESSAGES } from "@/lib/site";

export const metadata: Metadata = {
  title: "Business: Consultoria para Negócios em Ferraz de Vasconcelos",
  description:
    "Mentoria, consultoria digital, tráfego e social media para pequenos negócios de Ferraz de Vasconcelos e Zona Leste de SP. Comece por um diagnóstico gratuito.",
};

const PAINS: CardItem[] = [
  {
    icon: "wallet",
    title: "O dinheiro não fecha",
    text: "Você trabalha muito, mas no fim do mês sobra pouco.",
  },
  {
    icon: "eyeOff",
    title: "Ninguém te vê no digital",
    text: "Tem perfil, mas seguidores não viram clientes.",
  },
  {
    icon: "alert",
    title: "Decisões sozinho, que saíram caras",
    text: "Anúncio que não funcionou, parceria que não deu certo.",
  },
  {
    icon: "target",
    title: "Aprende muito, executa pouco",
    text: "Falta quem diga o passo certo na hora de agir.",
  },
];

const SERVICES: CardItem[] = [
  { icon: "compass", tag: "Mentoria", title: "Mentoria estratégica", text: "Individual ou em grupo, com plano de ação." },
  { icon: "chart", tag: "Consultoria", title: "Consultoria digital", text: "Posicionamento e presença online sob medida." },
  { icon: "megaphone", tag: "Tráfego", title: "Gestão de tráfego", text: "Campanhas que atraem o cliente certo." },
  { icon: "phone", tag: "Redes", title: "Social media", text: "Consistência pra sua marca ser lembrada." },
  { icon: "video", tag: "Conteúdo", title: "Criação de conteúdo", text: "Vídeo, texto e arte com identidade." },
  { icon: "presentation", tag: "Equipe", title: "Treinamentos e workshops", text: "Marketing digital e soft skills na prática." },
];

const STEPS: StepItem[] = [
  { icon: "chat", title: "Diagnóstico gratuito", text: "30 minutos pra entender onde você está e o que trava." },
  { icon: "clipboard", title: "Plano personalizado", text: "Só as entregas certas pro seu momento." },
  { icon: "rocket", title: "Execução com acompanhamento", text: "A gente coloca a mão na massa junto." },
  { icon: "chart", title: "Resultado medido", text: "Revisão a cada ciclo e próximo passo claro." },
];

export default function BusinessPage() {
  return (
    <>
      <PageHero
        eyebrow="De Quebrada Business · Consultoria"
        title={
          <>
            Seu negócio sozinho <span className="text-accent">nunca mais.</span>
          </>
        }
        lead="Chega de tentar no escuro. Com quem já saiu da quebrada e construiu do zero (podcast, estúdio, portal de notícias e espaço de eventos), você vai ter o direcionamento que faltava pra sua empresa decolar no digital."
        actions={
          <>
            <a href="#diagnostico" className="btn btn-primary">
              Quero sair do lugar
            </a>
            <WhatsAppButton message={WHATSAPP_MESSAGES.business} source="business-hero">
              Falar no WhatsApp
            </WhatsAppButton>
          </>
        }
      />
      <Stats items={BRAND_STATS} />

      <Section labelledBy="dores-titulo">
        <SectionTitle id="dores-titulo" eyebrow="Você se reconhece?" title="Isso é com você?" />
        <CardGrid items={PAINS} columns="2" />
      </Section>

      <Section id="solucao" labelledBy="solucao-titulo" tone="light">
        <SectionTitle
          id="solucao-titulo"
          eyebrow="A solução"
          title="Um produto. Todas as frentes."
          lead={
            <>
              O pacote é montado depois do diagnóstico. Valores a partir de R${" "}
              <Ph>[DEFINIR]</Ph>.
            </>
          }
        />
        <CardGrid items={SERVICES} />
      </Section>

      <Section labelledBy="processo-titulo">
        <SectionTitle id="processo-titulo" eyebrow="Processo" title="Como funciona" />
        <Steps items={STEPS} />
      </Section>

      <Section labelledBy="carlos-titulo" tone="panel">
        <div className="grid items-center gap-12 lg:grid-cols-[0.8fr_1.2fr]">
          <PhotoSlot label="FOTO DO CARLOS JUNIOR AQUI" className="aspect-[4/5] max-w-md" />
          <div data-reveal="">
            <p className="eyebrow mb-4">Quem está do seu lado</p>
            <h2 id="carlos-titulo" className="h2-section">
              Carlos Junior, de quebrada pro mercado
            </h2>
            <ul className="mt-6 space-y-3 text-lg text-muted">
              <li>8 anos numa multinacional, sem rede e sem capital, até abrir o próprio caminho.</li>
              <li>Podcast nº 1 de Ferraz e região, 600+ episódios e 4 premiações.</li>
              <li>Estúdio, portal de jornalismo e espaço de eventos.</li>
            </ul>
            <blockquote className="mt-8 border-l-2 border-accent pl-5 text-xl font-semibold leading-snug tracking-tight">
              “Não precisa de sorte. Precisa de direção, método e alguém que já abriu o caminho.”
            </blockquote>
          </div>
        </div>
      </Section>

      <Section id="diagnostico" labelledBy="diagnostico-titulo">
        <div
          data-reveal=""
          className="mx-auto max-w-3xl rounded-2xl border border-line bg-surface p-8 text-center md:p-12"
        >
          <p className="eyebrow mb-4">Primeiro passo</p>
          <h2 id="diagnostico-titulo" className="h2-section">
            Diagnóstico gratuito de 30 minutos
          </h2>
          <p className="mt-4 text-lg text-muted">
            Conversa franca por WhatsApp ou videochamada. Sem compromisso e sem pitch de venda.
          </p>
          <ul className="mx-auto mt-6 flex max-w-md flex-col gap-2 text-left">
            {[
              "Análise do momento do seu negócio",
              "Identificação dos maiores gargalos",
              "Indicação do próximo passo certo",
            ].map((item) => (
              <li key={item} className="flex gap-3">
                <Icon name="check" className="mt-0.5 h-5 w-5 shrink-0 text-accent" />
                {item}
              </li>
            ))}
          </ul>
          <div className="mt-8 flex justify-center">
            <WhatsAppButton message={WHATSAPP_MESSAGES.diagnostico} source="business-diagnostico">
              Quero meu diagnóstico gratuito
            </WhatsAppButton>
          </div>
        </div>
      </Section>

      <FinalCta
        title="Seu negócio pode ser muito maior."
        text="Continuar tentando sozinho ou chamar quem já andou esse caminho?"
        button="Agendar diagnóstico gratuito"
        message={WHATSAPP_MESSAGES.diagnostico}
        source="business-cta-final"
      />
    </>
  );
}
