import type { Metadata } from "next";
import { Faq } from "@/components/sections/Faq";
import { FinalCta } from "@/components/sections/FinalCta";
import { CardGrid, type CardItem } from "@/components/ui/CardGrid";
import { PageHero } from "@/components/ui/PageHero";
import { PhotoSlot } from "@/components/ui/PhotoSlot";
import { PriceCard } from "@/components/ui/PriceCard";
import { Section, SectionTitle } from "@/components/ui/Section";
import { Stats } from "@/components/ui/Stats";
import { Steps, type StepItem } from "@/components/ui/Steps";
import { WhatsAppButton } from "@/components/ui/WhatsAppButton";
import {
  INTERVIEW_PACKAGES,
  MONTHLY_PACKAGES,
  STUDIO_FAQ,
  STUDIO_GALLERY,
  STUDIO_SERVICES,
} from "@/data/studio";
import { stagger } from "@/lib/motion";
import { WHATSAPP_MESSAGES } from "@/lib/site";

export const metadata: Metadata = {
  title: "Estúdio de Podcast em Ferraz de Vasconcelos",
  description:
    "Grave seu podcast, videoaula ou conteúdo no Estúdio de Quebrada, em Ferraz de Vasconcelos, Zona Leste de SP. Gravação a partir de R$ 100/h e entrevistas no De Quebrada Podcast.",
};

const OFFER: CardItem[] = [
  { icon: "mic", title: "Gravação de podcast", text: "Estrutura profissional de áudio e vídeo, hora avulsa ou pacote mensal." },
  { icon: "video", title: "Edição e cortes", text: "Episódio completo editado e cortes verticais prontos pra Reels e TikTok." },
  { icon: "camera", title: "Fotos e identidade", text: "Fotos de bastidores, vinhetas e identidade visual do seu programa." },
  { icon: "megaphone", title: "Entrevista no De Quebrada", text: "Conte sua história no podcast nº 1 do Alto Tietê, 4x premiado." },
];

const STEPS: StepItem[] = [
  { icon: "chat", title: "Você chama no WhatsApp", text: "Conta o que quer gravar e o seu objetivo." },
  { icon: "calendar", title: "Agendamos a data", text: "Tema, formato e horário da gravação." },
  { icon: "megaphone", title: "Divulgação prévia", text: "No podcast, chegamos com audiência aquecida." },
  { icon: "mic", title: "Gravação no estúdio", text: "Em Ferraz, a 5 minutos da CPTM." },
  { icon: "rocket", title: "Entrega em até 7 dias úteis", text: "Episódio, fotos e cortes prontos." },
];

export default function EstudioPage() {
  return (
    <>
      <PageHero
        eyebrow="Estúdio de Quebrada · De Quebrada Podcast"
        title={
          <>
            Um estúdio pra <span className="text-accent">sua voz ser ouvida</span>
          </>
        }
        lead="Grave seu podcast, videoaula ou conteúdo com estrutura profissional em Ferraz de Vasconcelos. Ou venha contar sua história no De Quebrada Podcast."
        actions={
          <>
            <WhatsAppButton message={WHATSAPP_MESSAGES.estudio} source="estudio-hero-agendar">
              Agendar gravação
            </WhatsAppButton>
            <a href="/quiz/estudio" className="btn btn-ghost">
              Monte sua gravação
            </a>
            <a href="/quiz/participe" className="btn btn-ghost">
              Quero ser entrevistado
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
        label="O estúdio em números"
      />

      <Section labelledBy="oferece-titulo">
        <SectionTitle
          id="oferece-titulo"
          eyebrow="Serviços"
          title="O que o estúdio oferece"
          lead="Da gravação ao corte pronto pra postar. Você só aparece e fala."
        />
        <CardGrid items={OFFER} columns="2" />
      </Section>

      <Section id="proprio-podcast" labelledBy="proprio-titulo" tone="light">
        <SectionTitle
          id="proprio-titulo"
          eyebrow="Seu podcast"
          title="Grave o seu próprio programa"
          lead="Gravação avulsa a R$ 100/h, sem contrato. No pacote mensal de 4h por R$ 350, cada hora sai por R$ 87."
        />
        <h3 className="mb-5 text-2xl font-bold tracking-tight">Pacotes mensais</h3>
        <div className="grid gap-8 md:grid-cols-2">
          {MONTHLY_PACKAGES.map((p, i) => (
            <div key={p.name} data-reveal="" style={stagger(i, 120)}>
              <PriceCard {...p} />
            </div>
          ))}
        </div>

        <h3 className="mb-5 mt-14 text-2xl font-bold tracking-tight">Serviços avulsos</h3>
        <div className="overflow-hidden rounded-xl border border-line bg-surface">
          <table className="w-full border-collapse text-left">
            <caption className="sr-only">Tabela de serviços avulsos e preços</caption>
            <tbody>
              {STUDIO_SERVICES.map(([name, price], i) => (
                <tr key={name} className={i > 0 ? "border-t border-line" : ""}>
                  <th scope="row" className="py-3 pl-5 pr-4 text-base font-normal text-muted">
                    {name}
                  </th>
                  <td className="whitespace-nowrap py-3 pr-5 text-right font-bold">{price}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="mt-8 flex">
          <WhatsAppButton message={WHATSAPP_MESSAGES.proprioPodcast} source="estudio-proprio">
            Quero meu podcast
          </WhatsAppButton>
        </div>
      </Section>

      <Section id="entrevista" labelledBy="entrevista-titulo">
        <SectionTitle
          id="entrevista-titulo"
          eyebrow="De Quebrada Podcast"
          title="Participe do De Quebrada Podcast"
          lead="A gente grava, extrai o melhor da sua história e entrega cortes prontos pras suas redes."
        />
        <div className="grid gap-8 md:grid-cols-2">
          {INTERVIEW_PACKAGES.map((p, i) => (
            <div key={p.name} data-reveal="" style={stagger(i, 120)}>
              <PriceCard {...p} />
            </div>
          ))}
        </div>
        <div className="mt-8 flex flex-wrap gap-3">
          <a href="/quiz/participe" className="btn btn-primary">
            Quero participar
          </a>
          <WhatsAppButton message={WHATSAPP_MESSAGES.entrevista} source="estudio-entrevista">
            Falar no WhatsApp
          </WhatsAppButton>
        </div>
      </Section>

      <Section labelledBy="processo-titulo" tone="panel">
        <SectionTitle id="processo-titulo" eyebrow="Processo" title="Como funciona" />
        <Steps items={STEPS} />
      </Section>

      <Section labelledBy="galeria-titulo">
        <SectionTitle id="galeria-titulo" eyebrow="Galeria" title="Conheça o espaço" />
        <ul className="grid gap-5 sm:grid-cols-2">
          {STUDIO_GALLERY.map((label, i) => (
            <li key={label} data-reveal="" style={stagger(i % 2, 100)}>
              <PhotoSlot label={label} className="aspect-[4/3]" />
            </li>
          ))}
        </ul>
      </Section>

      <Faq items={STUDIO_FAQ} />

      <FinalCta
        title="Sua história merece ser ouvida."
        text="Chama no WhatsApp e agende sua gravação no Estúdio de Quebrada."
        button="Agendar gravação"
        message={WHATSAPP_MESSAGES.estudio}
        source="estudio-cta-final"
      />
    </>
  );
}
