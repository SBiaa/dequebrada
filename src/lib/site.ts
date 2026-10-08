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
} as const;

export const NAV_LINKS = [
  { label: "Início", href: "/" },
  { label: "News", href: "/news" },
  { label: "Business", href: "/business" },
  { label: "Podcast", href: "/podcast" },
  { label: "Da Quebrada ao Digital", href: "/da-quebrada-ao-digital" },
  { label: "Presença Digital", href: "/presenca-digital" },
  { label: "Sobre", href: "/sobre" },
] as const;

export const LEGAL_LINKS = [
  { label: "Política de Privacidade", href: "/politica-de-privacidade" },
  { label: "Termos e Condições", href: "/termos-e-condicoes" },
  { label: "Política de Reembolso", href: "/politica-de-reembolso" },
  { label: "Acessibilidade", href: "/acessibilidade" },
] as const;

export const SOCIAL_LINKS = [
  { label: "Instagram", href: "https://www.instagram.com/dequebradapodcast/" },
  { label: "YouTube", href: "https://www.youtube.com/@DeQuebradapodcast" },
  { label: "TikTok", href: "https://www.tiktok.com/@dequebradapodcast" },
  { label: "Spotify", href: "https://open.spotify.com/show/6innHIAEayFKSHgL2xro0P" },
] as const;
