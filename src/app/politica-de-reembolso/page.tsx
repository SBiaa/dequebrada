import type { Metadata } from "next";
import { LegalPage, type LegalSection } from "@/components/layout/LegalPage";

export const metadata: Metadata = {
  title: "Política de Reembolso",
  description:
    "Regras de cancelamento e reembolso dos serviços do De Quebrada (Business, Podcast e Estúdio e Da Quebrada ao Digital), em Ferraz de Vasconcelos, Zona Leste de SP.",
};

const SECTIONS: LegalSection[] = [
  {
    heading: "A quem se aplica",
    paragraphs: [
      "Esta política vale para os serviços de consultoria (De Quebrada Business), podcast e estúdio e para a formação Da Quebrada ao Digital contratados com o De Quebrada.",
    ],
  },
  {
    heading: "Garantia de 7 dias da formação",
    paragraphs: [
      "Na formação Da Quebrada ao Digital, se você entrar, assistir às aulas e achar que não valeu, devolvemos 100% do valor pago em até 7 dias. Sem pergunta e sem burocracia.",
    ],
  },
  {
    heading: "Direito de arrependimento",
    paragraphs: [
      "Quando a contratação é feita à distância (WhatsApp, telefone ou internet), a pessoa que contrata como consumidora pode desistir em até 7 dias corridos a partir da contratação, conforme o art. 49 do Código de Defesa do Consumidor, com devolução dos valores pagos. [A CONFIRMAR: enquadramento de clientes pessoa jurídica]",
    ],
  },
  {
    heading: "Serviços já iniciados",
    paragraphs: [
      "Se o trabalho já começou, o reembolso pode considerar a parte já executada. Regra de proporcionalidade: [A CONFIRMAR].",
    ],
  },
  {
    heading: "Como pedir",
    paragraphs: [
      "Envie o pedido pelo WhatsApp (11) 94217-1635 ou por [E-MAIL REAL AQUI], informando nome, serviço contratado e data da contratação.",
    ],
  },
  {
    heading: "Prazo e forma do reembolso",
    paragraphs: [
      "Prazo para devolução: [A CONFIRMAR]. O valor é devolvido pela mesma forma de pagamento usada na contratação, sempre que possível.",
    ],
  },
  {
    heading: "Cancelamento",
    paragraphs: [
      "Condições para cancelar um serviço em andamento, multas e avisos prévios: [A CONFIRMAR].",
    ],
  },
];

export default function ReembolsoPage() {
  return (
    <LegalPage
      title="Política de Reembolso"
      intro="Aqui você vê quando e como pedir cancelamento e reembolso."
      sections={SECTIONS}
    />
  );
}
