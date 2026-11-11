import type { Metadata } from "next";
import { FinalCta } from "@/components/sections/FinalCta";
import { Ph } from "@/components/ui/Marked";
import { PageHero } from "@/components/ui/PageHero";
import { Section, SectionTitle } from "@/components/ui/Section";
import { Stats } from "@/components/ui/Stats";
import { ChannelCards } from "@/components/sections/ChannelCards";
import { WHATSAPP_MESSAGES } from "@/lib/site";

export const metadata: Metadata = {
  title: "Presença Digital: Canais e Alcance",
  description:
    "Podcast, redes sociais, portal de notícias e plataformas de áudio do De Quebrada, em Ferraz de Vasconcelos e Zona Leste de SP. Mais de 1,3 milhão de views por mês.",
};

export default function PresencaDigitalPage() {
  return (
    <>
      <PageHero
        eyebrow="De Quebrada · Nossa presença digital"
        title={
          <>
            Onde o De Quebrada <span className="text-accent">aparece</span>
          </>
        }
        lead="Podcast, redes sociais, portal de notícias e plataformas de áudio. Mais de 1,3 milhão de views por mês, construídas de forma orgânica."
      />
      <Stats
        items={[
          { value: "22k+", label: "seguidores" },
          { value: "1,3M", label: "views por mês" },
          { value: "600+", label: "episódios" },
          { value: "8", label: "canais ativos" },
        ]}
        label="Presença digital em números"
      />

      <Section labelledBy="canais-titulo">
        <SectionTitle
          id="canais-titulo"
          eyebrow="Canais"
          title={
            <>
              Siga e <span className="text-accent">ouça</span>
            </>
          }
          lead={
            <>
              Números informados pelo De Quebrada, a atualizar antes de publicar:{" "}
              <Ph>[CONFERIR NÚMEROS]</Ph>
            </>
          }
        />
        <ChannelCards />
      </Section>

      <FinalCta
        title="Quer aparecer pra essa audiência?"
        text="Fale com a gente sobre anúncios, parcerias e participação no podcast e no portal."
        button="Falar no WhatsApp"
        message={WHATSAPP_MESSAGES.anunciar}
        source="presenca-cta-final"
      />
    </>
  );
}
