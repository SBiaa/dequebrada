import type { Metadata } from "next";
import { FinalCta } from "@/components/sections/FinalCta";
import { PageHero } from "@/components/ui/PageHero";
import { PhotoSlot } from "@/components/ui/PhotoSlot";
import { PriceCard } from "@/components/ui/PriceCard";
import { Section, SectionTitle } from "@/components/ui/Section";
import { Stats } from "@/components/ui/Stats";
import { Steps, type StepItem } from "@/components/ui/Steps";
import { WhatsAppButton } from "@/components/ui/WhatsAppButton";
import { stagger } from "@/lib/motion";
import { WHATSAPP_MESSAGES } from "@/lib/site";

export const metadata: Metadata = {
  title: "Podcast e Estúdio em Ferraz de Vasconcelos",
  description:
    "Participe do De Quebrada Podcast ou lance o seu programa no Estúdio de Quebrada, em Ferraz de Vasconcelos, Zona Leste de SP. Pacotes com edição e cortes.",
};

const STEPS: StepItem[] = [
  { icon: "chat", title: "Você chama no WhatsApp", text: "Conta seu perfil e seu objetivo." },
  { icon: "calendar", title: "Alinhamos com o Carlos", text: "Data, tema e formato da gravação." },
  { icon: "megaphone", title: "Divulgação prévia", text: "Chegamos com audiência aquecida." },
  { icon: "mic", title: "Gravação no estúdio", text: "Em Ferraz, a 5 minutos da CPTM." },
  { icon: "rocket", title: "Entrega em até 7 dias úteis", text: "Episódio, fotos e cortes prontos." },
];

const AVULSOS: [string, string][] = [
  ["Gravação 1h (avulsa)", "R$ 100"],
  ["Gravação 1h (pacote mensal de 4h por R$ 350)", "R$ 87/h"],
  ["Pack 3 cortes verticais (reels prontos)", "R$ 100"],
  ["Pack 8 cortes verticais", "R$ 240"],
  ["Vinheta de abertura/encerramento", "R$ 100"],
  ["Edição de episódio completo", "R$ 250/h"],
  ["Identidade visual completa", "R$ 650"],
  ["Gestão de redes sociais", "R$ 650/mês"],
];

export default function PodcastPage() {
  return (
    <>
      <PageHero
        eyebrow="De Quebrada Podcast · Estúdio de Quebrada"
        title={
          <>
            A vitrine que <span className="text-accent">amplifica sua voz</span>
          </>
        }
        lead="O podcast nº 1 da região, 4x premiado. Participe da entrevista ou lance o seu próprio programa, com estrutura profissional."
        actions={
          <>
            <WhatsAppButton message={WHATSAPP_MESSAGES.entrevista} source="podcast-hero-entrevista">
              Quero participar
            </WhatsAppButton>
            <a href="#proprio-podcast" className="btn btn-ghost">
              Quero meu podcast
            </a>
          </>
        }
        aside={<PhotoSlot label="FOTO DO ESTÚDIO AQUI" className="hidden aspect-[4/5] lg:block" />}
      />
      <Stats
        items={[
          { value: "600+", label: "episódios" },
          { value: "4x", label: "premiado" },
          { value: "20+", label: "podcasts produzidos" },
          { value: "Nº1", label: "do Alto Tietê" },
        ]}
        label="O De Quebrada Podcast em números"
      />

      <Section id="entrevista" labelledBy="entrevista-titulo">
        <SectionTitle
          id="entrevista-titulo"
          eyebrow="Caminho 1"
          title="Quero ser entrevistado"
          lead="A gente grava, extrai o melhor da sua história e entrega cortes prontos pras suas redes."
        />
        <div className="grid gap-8 md:grid-cols-2">
          <div data-reveal="">
            <PriceCard
              name="Aceleração"
              forWho="Pra começar a construir autoridade agora."
              items={[
                "Entrevista no De Quebrada Podcast",
                "Gravação ao vivo (YouTube, Instagram, Facebook)",
                "Flyer de divulgação e fotos dos bastidores",
                "3 cortes editados pra Reels/TikTok",
              ]}
              price="R$ 250"
            />
          </div>
          <div data-reveal="" style={stagger(1, 120)}>
            <PriceCard
              name="Alavancagem de Imagem"
              forWho="Pra dominar as redes de uma vez só."
              items={[
                "Tudo do pacote Aceleração",
                "8 cortes editados: conteúdo pra 2 semanas",
                "Legenda dinâmica e áudio tratado em todos",
                "Postagem em colab nas redes do podcast",
              ]}
              price="R$ 350"
              badge="Mais comprado"
            />
          </div>
        </div>
        <div className="mt-8 flex">
          <WhatsAppButton message={WHATSAPP_MESSAGES.entrevista} source="podcast-entrevista">
            Quero participar
          </WhatsAppButton>
        </div>
      </Section>

      <Section id="proprio-podcast" labelledBy="proprio-titulo" tone="light">
        <SectionTitle
          id="proprio-titulo"
          eyebrow="Caminho 2"
          title="Quero meu próprio podcast"
          lead="Gravação avulsa a R$ 100/h, sem contrato. No pacote mensal de 4h por R$ 350, cada hora sai por R$ 87."
        />

        <h3 className="mb-5 text-2xl font-bold tracking-tight">Pacotes mensais</h3>
        <div className="grid gap-8 md:grid-cols-2">
          <div data-reveal="">
            <PriceCard
              name="Visibilidade"
              forWho="Presença constante com o mínimo de esforço."
              items={[
                "1 episódio por semana (1h de gravação)",
                "12 cortes verticais por mês",
                "Legenda, color correction e áudio tratado",
                "Fotos dos bastidores",
              ]}
              price="R$ 750/mês"
              note="Avulso seria R$ 800."
              badge="Melhor custo-benefício"
            />
          </div>
          <div data-reveal="" style={stagger(1, 120)}>
            <PriceCard
              name="Lançamento"
              forWho="Conteúdo suficiente pra crescer de verdade."
              items={[
                "1 episódio por semana (1h de gravação)",
                "32 cortes verticais por mês",
                "Legenda, color correction e áudio em todos",
                "Conteúdo pra 2 meses de redes sociais",
              ]}
              price="R$ 1.200/mês"
              note="Avulso seria R$ 1.680."
            />
          </div>
        </div>

        <details className="group mt-10 rounded-xl border border-line bg-surface">
          <summary className="flex min-h-14 cursor-pointer list-none items-center justify-between gap-4 px-5 py-4 text-lg font-semibold [&::-webkit-details-marker]:hidden">
            Ver serviços avulsos
            <span
              aria-hidden="true"
              className="text-2xl font-light text-accent transition-transform group-open:rotate-45"
            >
              +
            </span>
          </summary>
          <table className="w-full border-collapse px-5 text-left">
            <caption className="sr-only">Tabela de serviços avulsos e preços</caption>
            <tbody>
              {AVULSOS.map(([name, price]) => (
                <tr key={name} className="border-t border-line">
                  <th scope="row" className="py-3 pl-5 pr-4 text-base font-normal text-muted">
                    {name}
                  </th>
                  <td className="whitespace-nowrap py-3 pr-5 text-right font-bold">{price}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </details>
        <div className="mt-8 flex">
          <WhatsAppButton message={WHATSAPP_MESSAGES.proprioPodcast} source="podcast-proprio">
            Quero meu podcast
          </WhatsAppButton>
        </div>
      </Section>

      <Section labelledBy="processo-podcast">
        <SectionTitle id="processo-podcast" eyebrow="Processo" title="Como funciona" />
        <Steps items={STEPS} />
      </Section>

      <FinalCta
        title="Sua história merece ser ouvida."
        text="Escolha seu caminho e dê o primeiro passo."
        button="Falar sobre o podcast"
        message={WHATSAPP_MESSAGES.entrevista}
        source="podcast-cta-final"
      />
    </>
  );
}
