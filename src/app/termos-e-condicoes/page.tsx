import type { Metadata } from "next";
import { LegalPage, type LegalSection } from "@/components/layout/LegalPage";

export const metadata: Metadata = {
  title: "Termos e Condições",
  description:
    "Termos e condições de uso do site e de contratação dos serviços do De Quebrada (Business, Podcast e Estúdio e Da Quebrada ao Digital), em Ferraz de Vasconcelos e Zona Leste de SP.",
};

const SECTIONS: LegalSection[] = [
  {
    heading: "Aceitação",
    paragraphs: [
      "Ao usar este site ou contratar qualquer serviço do De Quebrada, você concorda com estes termos. Se não concordar, não utilize o site.",
    ],
  },
  {
    heading: "Quem somos",
    paragraphs: [
      "De Quebrada, [RAZÃO SOCIAL], CNPJ 59.814.997/0001-66, Avenida Santos Dumont, 1320, Tanquinho, Ferraz de Vasconcelos/SP, CEP 08531-100.",
    ],
  },
  {
    heading: "Serviços",
    paragraphs: [
      "O De Quebrada oferece consultoria (De Quebrada Business), serviços de podcast e estúdio (entrevistas, gravações, edição e cortes) e a formação online Da Quebrada ao Digital. O escopo, o prazo e o valor de cada contratação são combinados antes do início. [A CONFIRMAR]",
    ],
  },
  {
    heading: "Como contratar",
    paragraphs: [
      "A contratação começa por uma conversa no WhatsApp. Só há contrato depois que você aceitar a proposta enviada pelo De Quebrada.",
    ],
  },
  {
    heading: "Preços e pagamento",
    paragraphs: [
      "Os valores são informados na proposta. Formas e prazos de pagamento: [A CONFIRMAR]. Os valores exibidos no site são de referência e podem mudar sem aviso prévio.",
    ],
  },
  {
    heading: "Responsabilidades do cliente",
    list: [
      "Fornecer informações verdadeiras e materiais necessários para o trabalho.",
      "Ter os direitos de uso sobre marcas, textos e imagens que enviar.",
      "Responder dentro de prazos razoáveis para não atrasar a execução.",
    ],
  },
  {
    heading: "Resultados",
    paragraphs: [
      "Trabalhamos para melhorar a presença digital do seu negócio, mas não prometemos resultados específicos de vendas, seguidores ou faturamento, pois eles dependem de fatores fora do nosso controle.",
    ],
  },
  {
    heading: "Propriedade intelectual",
    paragraphs: [
      "Nome, logotipo, textos, vídeos e demais conteúdos do De Quebrada são protegidos por lei e não podem ser copiados ou reproduzidos sem autorização. Materiais produzidos para o cliente seguem o que for definido em contrato. [A CONFIRMAR]",
    ],
  },
  {
    heading: "Privacidade",
    paragraphs: [
      "O tratamento de dados pessoais está descrito na Política de Privacidade.",
    ],
  },
  {
    heading: "Alterações",
    paragraphs: [
      "Podemos atualizar estes termos. A versão vigente é sempre a publicada nesta página.",
    ],
  },
  {
    heading: "Foro",
    paragraphs: [
      "Fica eleito o foro da comarca de [A CONFIRMAR] para resolver eventuais conflitos, sem prejuízo dos direitos do consumidor previstos em lei.",
    ],
  },
  {
    heading: "Contato",
    paragraphs: ["WhatsApp (11) 94217-1635 ou [E-MAIL REAL AQUI]."],
  },
];

export default function TermosPage() {
  return (
    <LegalPage
      title="Termos e Condições"
      intro="Estas regras valem para o uso do site e para a contratação dos serviços do De Quebrada."
      sections={SECTIONS}
    />
  );
}
