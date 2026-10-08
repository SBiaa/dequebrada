import type { Metadata } from "next";
import { LegalPage, type LegalSection } from "@/components/layout/LegalPage";

export const metadata: Metadata = {
  title: "Acessibilidade",
  description:
    "Compromisso do De Quebrada, de Ferraz de Vasconcelos (Zona Leste de SP), com um site acessível, e como relatar problemas de acesso.",
};

const SECTIONS: LegalSection[] = [
  {
    heading: "Nosso compromisso",
    paragraphs: [
      "Queremos que qualquer pessoa consiga usar este site, com ou sem tecnologias assistivas. Tomamos como referência as diretrizes WCAG 2.1, nível AA, e a Lei Brasileira de Inclusão (Lei nº 13.146/2015).",
    ],
  },
  {
    heading: "O que já fazemos",
    list: [
      "Navegação completa por teclado, com indicador de foco visível.",
      "Link “Pular para o conteúdo” no início de cada página.",
      "Contraste de cores adequado entre texto e fundo.",
      "Uma estrutura de títulos clara, com um único título principal por página.",
      "Textos reais no lugar de imagens com texto, e descrições alternativas nas imagens.",
      "Respeito à preferência do sistema por menos animação.",
    ],
  },
  {
    heading: "Limitações conhecidas",
    paragraphs: [
      "Estamos sempre melhorando. Conteúdos de terceiros, como players de podcast e vídeos incorporados, podem ter limitações fora do nosso controle. [A CONFIRMAR: lista após auditoria]",
    ],
  },
  {
    heading: "Encontrou uma barreira?",
    paragraphs: [
      "Conte pra gente pelo WhatsApp (11) 94217-1635 ou por [E-MAIL REAL AQUI], dizendo qual página, o que aconteceu e qual tecnologia você usa. Vamos buscar uma solução.",
    ],
  },
];

export default function AcessibilidadePage() {
  return (
    <LegalPage
      title="Acessibilidade"
      intro="Este site foi pensado para ser fácil de usar por todo mundo."
      sections={SECTIONS}
    />
  );
}
