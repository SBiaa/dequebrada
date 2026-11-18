import type { Metadata } from "next";
import { LocalBusinessJsonLd } from "@/components/layout/JsonLd";
import { AboutTeaser } from "@/components/sections/AboutTeaser";
import { Banners } from "@/components/sections/Banners";
import { ChannelsStrip } from "@/components/sections/ChannelsStrip";
import { Faq } from "@/components/sections/Faq";
import { FinalCta } from "@/components/sections/FinalCta";
import { HomeHero } from "@/components/sections/HomeHero";
import { NewsPreview } from "@/components/sections/NewsPreview";
import { Products } from "@/components/sections/Products";
import { Proof } from "@/components/sections/Proof";
import { RaioX } from "@/components/sections/RaioX";
import { BRAND_STATS, Stats } from "@/components/ui/Stats";

/** Atualiza as últimas notícias da home a cada 5 minutos. */
export const revalidate = 300;

export const metadata: Metadata = {
  title: {
    absolute: "Podcast, Notícias e Consultoria em Ferraz de Vasconcelos | De Quebrada",
  },
  description:
    "De Quebrada: podcast nº 1 do Alto Tietê, portal de notícias, estúdio profissional e consultoria para negócios em Ferraz de Vasconcelos e Zona Leste de SP.",
};

export default function Home() {
  return (
    <>
      <LocalBusinessJsonLd />
      <HomeHero />
      <Stats items={BRAND_STATS} />
      <Banners />
      <NewsPreview />
      <Products />
      <RaioX />
      <AboutTeaser />
      <ChannelsStrip />
      <Proof />
      <Faq />
      <FinalCta />
    </>
  );
}
