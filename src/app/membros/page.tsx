import type { Metadata } from "next";
import { ComingSoon } from "@/components/ui/ComingSoon";

export const metadata: Metadata = {
  title: "Área de Membros",
  description: "Conteúdos exclusivos e episódios do De Quebrada Podcast para assinantes. Em breve.",
};

export default function MembrosPage() {
  return (
    <ComingSoon
      eyebrow="Área de membros · Em breve"
      title="Área de membros"
      lead="Conteúdos exclusivos e os episódios do De Quebrada Podcast pra assistir aqui no site. Em breve."
    />
  );
}
