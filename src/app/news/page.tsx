import type { Metadata } from "next";
import { NewsList } from "@/components/sections/NewsList";
import { PageHero } from "@/components/ui/PageHero";
import { Section } from "@/components/ui/Section";

export const metadata: Metadata = {
  title: "Notícias de Ferraz de Vasconcelos e Alto Tietê",
  description:
    "De Quebrada News: notícias de Ferraz de Vasconcelos, Poá, Suzano, Itaquaquecetuba, Mogi das Cruzes e região da Zona Leste de SP.",
};

export default function NewsPage() {
  return (
    <>
      <PageHero
        eyebrow="Portal De Quebrada News"
        title={
          <>
            Notícias da <span className="text-accent">região</span>
          </>
        }
        lead="Ferraz de Vasconcelos, Poá, Suzano, Itaquá, Mogi e mais. Filtre pela sua cidade."
      />
      <Section labelledBy="lista-news" className="pt-0 md:pt-0">
        <h2 id="lista-news" className="sr-only">
          Lista de notícias
        </h2>
        <NewsList />
      </Section>
    </>
  );
}
