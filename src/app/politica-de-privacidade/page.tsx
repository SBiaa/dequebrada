import type { Metadata } from "next";
import { LegalPage, type LegalSection } from "@/components/layout/LegalPage";

export const metadata: Metadata = {
  title: "Política de Privacidade",
  description:
    "Como o De Quebrada, de Ferraz de Vasconcelos (Zona Leste de SP), coleta, usa e protege os dados de quem visita o site e fala com a gente pelo WhatsApp.",
};

const SECTIONS: LegalSection[] = [
  {
    heading: "Quem somos",
    paragraphs: [
      "O De Quebrada, [RAZÃO SOCIAL], CNPJ 59.814.997/0001-66, com sede na Avenida Santos Dumont, 1320, Tanquinho, Ferraz de Vasconcelos/SP, CEP 08531-100, é o controlador dos dados tratados neste site, conforme a Lei Geral de Proteção de Dados (Lei nº 13.709/2018, a LGPD).",
    ],
  },
  {
    heading: "Quais dados coletamos",
    list: [
      "Dados que você informa ao falar com a gente pelo WhatsApp, como nome, telefone e o conteúdo das mensagens.",
      "Dados de navegação, como páginas visitadas, tipo de dispositivo e navegador, coletados por ferramentas de métricas e de anúncios quando ativadas (Google Analytics e Pixel da Meta).",
      "Este site não possui formulário de cadastro nem área de login.",
    ],
  },
  {
    heading: "Para que usamos os dados",
    list: [
      "Responder suas mensagens e apresentar os serviços de consultoria, podcast e estúdio e a formação Da Quebrada ao Digital.",
      "Elaborar propostas e prestar os serviços contratados.",
      "Entender como o site é usado para melhorá-lo.",
      "Medir e otimizar campanhas de divulgação.",
    ],
  },
  {
    heading: "Bases legais",
    paragraphs: [
      "Tratamos dados com base no seu consentimento, na execução de contrato ou de procedimentos preliminares a pedido seu e no nosso legítimo interesse em divulgar e melhorar nossos serviços, sempre respeitando seus direitos. [A CONFIRMAR]",
    ],
  },
  {
    heading: "Compartilhamento",
    paragraphs: [
      "Não vendemos dados pessoais. Podemos compartilhá-los com prestadores que nos ajudam a operar o site e a comunicação, como Meta (WhatsApp e Pixel), Google (Analytics) e a plataforma de hospedagem, e com autoridades quando a lei exigir.",
    ],
  },
  {
    heading: "Cookies e tecnologias semelhantes",
    paragraphs: [
      "Quando ativadas, as ferramentas de métricas e anúncios usam cookies para identificar visitas e ações, como o clique nos botões de WhatsApp. Você pode bloquear ou apagar cookies nas configurações do navegador. [A CONFIRMAR: aviso de cookies no site]",
    ],
  },
  {
    heading: "Por quanto tempo guardamos",
    paragraphs: [
      "Guardamos os dados pelo tempo necessário para cumprir as finalidades acima e as obrigações legais. Prazo específico: [A CONFIRMAR].",
    ],
  },
  {
    heading: "Seus direitos",
    paragraphs: ["Nos termos do art. 18 da LGPD, você pode solicitar a qualquer momento:"],
    list: [
      "Confirmação de que tratamos seus dados e acesso a eles.",
      "Correção de dados incompletos, inexatos ou desatualizados.",
      "Anonimização, bloqueio ou eliminação de dados desnecessários.",
      "Portabilidade dos dados.",
      "Informação sobre com quem compartilhamos seus dados.",
      "Revogação do consentimento.",
    ],
  },
  {
    heading: "Segurança",
    paragraphs: [
      "Adotamos medidas técnicas e organizacionais para proteger os dados contra acessos não autorizados, perda e uso indevido. O site é servido por conexão segura (HTTPS).",
    ],
  },
  {
    heading: "Alterações desta política",
    paragraphs: [
      "Podemos atualizar esta política. A data da última atualização fica sempre no topo da página.",
    ],
  },
  {
    heading: "Fale com a gente",
    paragraphs: [
      "Para exercer seus direitos ou tirar dúvidas sobre privacidade: [E-MAIL REAL AQUI] ou WhatsApp (11) 94217-1635. Encarregado de dados (DPO): [A CONFIRMAR].",
    ],
  },
];

export default function PoliticaDePrivacidadePage() {
  return (
    <LegalPage
      title="Política de Privacidade"
      intro="Esta política explica como o De Quebrada trata os dados pessoais de quem visita este site e conversa com a gente."
      sections={SECTIONS}
    />
  );
}
