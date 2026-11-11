import { MAIN_CHANNELS } from "@/data/channels";

export const SITE = {
  name: "De Quebrada",
  cnpj: "59.814.997/0001-66",
  phoneDisplay: "(11) 94217-1635",
  phoneE164: "+5511942171635",
  whatsappNumber: "5511942171635",
  emailPlaceholder: "[E-MAIL REAL AQUI]",
  address: {
    street: "Avenida Santos Dumont, 1320",
    district: "Tanquinho",
    city: "Ferraz de Vasconcelos",
    region: "SP",
    postalCode: "08531-100",
  },
  region: "Ferraz de Vasconcelos e Zona Leste de SP",
} as const;

const base = "Oi! Vim pelo site do De Quebrada e quero";

export const WHATSAPP_MESSAGES = {
  geral: `${base} saber mais`,
  business: `${base} saber mais sobre o De Quebrada Business`,
  diagnostico: `${base} agendar o diagnóstico gratuito do meu negócio`,
  presencaDigital: `${base} saber mais sobre a Presença Digital`,
  raioX: `${base} ser o próximo no Raio-X da Quebrada`,
  entrevista: `${base} participar do De Quebrada Podcast como entrevistado`,
  proprioPodcast: `${base} lançar o meu próprio podcast no Estúdio de Quebrada`,
  formacao: `${base} entrar na formação Da Quebrada ao Digital`,
  anunciar: `${base} saber como anunciar no portal e no podcast`,
  parceiro: `${base} ser parceiro ou patrocinador do De Quebrada`,
  estudio: `${base} agendar uma gravação no Estúdio de Quebrada`,
} as const;

/** Menu principal (cabeçalho e rodapé). */
export const NAV_LINKS = [
  { label: "Início", href: "/" },
  { label: "Da Quebrada ao Digital", href: "/daquebradaaodigital" },
  { label: "Estúdio", href: "/estudio" },
  { label: "Publicidade", href: "/publicidade" },
  // Até a fase 3 (blog com painel), o portal de notícias continua em /news.
  { label: "Blog", href: "/news" },
  { label: "Loja", href: "/loja" },
  { label: "Parceiros", href: "/parceiros" },
  { label: "Sobre", href: "/sobre" },
  { label: "Área de membros", href: "/membros" },
] as const;

/** Páginas que saíram do menu principal, mas continuam no ar (links já divulgados). */
export const MORE_LINKS = [
  { label: "De Quebrada Business", href: "/business" },
  { label: "Presença Digital", href: "/presenca-digital" },
] as const;

export const LEGAL_LINKS = [
  { label: "Política de Privacidade", href: "/politica-de-privacidade" },
  { label: "Termos e Condições", href: "/termos-e-condicoes" },
  { label: "Política de Reembolso", href: "/politica-de-reembolso" },
  { label: "Acessibilidade", href: "/acessibilidade" },
] as const;

/** Lista curta de redes. A lista completa fica em src/data/channels.ts. */
export const SOCIAL_LINKS = MAIN_CHANNELS.map((c) => ({
  label: c.platform,
  href: c.href,
  platform: c.platform,
}));
