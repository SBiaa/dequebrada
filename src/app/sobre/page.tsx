import type { Metadata } from "next";
import { FinalCta } from "@/components/sections/FinalCta";
import { Ph } from "@/components/ui/Marked";
import { PageHero } from "@/components/ui/PageHero";
import { PhotoSlot } from "@/components/ui/PhotoSlot";
import { Section } from "@/components/ui/Section";
import { Stats, BRAND_STATS } from "@/components/ui/Stats";

export const metadata: Metadata = {
  title: "Sobre Carlos Junior, Criador do Podcast",
  description:
    "Carlos Junior, o Juninho de Ferraz: empreendedor digital, mentor e criador do podcast De Quebrada, em Ferraz de Vasconcelos, Zona Leste de SP.",
};

const INTRO = [
  "Carlos Junior, o Juninho de Ferraz, é empreendedor digital, mentor, palestrante e especialista em comunicação estratégica, marketing e posicionamento. Criador do premiado Podcast De Quebrada, ele transforma a vivência na periferia e a experiência em multinacional em ferramentas reais pra formar empreendedores.",
  "Dirige mais de 10 podcasts e lidera um estúdio completo de gravação de podcasts, videoaulas e conteúdo pras redes.",
];

const MORE = [
  "Ele é fundador da AUVED, a Universidade do Empreendedor Digital, plataforma de ensino continuado pra criadores, empreendedores e líderes.",
  "Criou a Liga dos Empreendedores, comunidade de networking e negócios que conecta empreendedores da quebrada e de toda a região.",
  "Ministra workshops, treinamentos corporativos, consultorias e palestras sobre liderança, soft skills, marketing digital e criação de conteúdo.",
];

export default function SobrePage() {
  return (
    <>
      <PageHero
        eyebrow="Sobre"
        title={
          <>
            Da quebrada pro topo, com <span className="text-accent">visão, voz e atitude.</span>
          </>
        }
        aside={<PhotoSlot label="FOTO DO CARLOS JUNIOR AQUI" className="hidden aspect-[4/5] lg:block" />}
      />
      <Stats items={BRAND_STATS} />

      <Section labelledBy="bio-titulo" tone="light">
        <h2 id="bio-titulo" className="sr-only">
          Biografia
        </h2>
        <div data-reveal="" className="max-w-3xl space-y-5 text-lg leading-relaxed text-muted">
          {INTRO.map((p) => (
            <p key={p.slice(0, 30)}>{p}</p>
          ))}
          <details className="group">
            <summary className="cursor-pointer list-none font-semibold text-accent [&::-webkit-details-marker]:hidden">
              <span className="group-open:hidden">Ler mais →</span>
              <span className="hidden group-open:inline">Mostrar menos</span>
            </summary>
            <div className="mt-5 space-y-5">
              {MORE.map((p) => (
                <p key={p.slice(0, 30)}>{p}</p>
              ))}
            </div>
          </details>
          <p className="font-semibold text-ink">
            Ponte entre o mundo das ideias e o mundo dos negócios. Entre a quebrada e o topo.
          </p>
        </div>

        <h2 className="mt-16 text-2xl font-bold tracking-tight">Realizações</h2>
        <p className="mt-3 text-lg text-muted">
          <Ph>[LISTA DE PRÊMIOS E REALIZAÇÕES]</Ph> Hoje fica só em imagem no site atual; precisa
          ser enviada em texto.
        </p>
      </Section>

      <FinalCta />
    </>
  );
}
