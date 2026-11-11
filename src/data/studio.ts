/**
 * Estúdio de Quebrada e De Quebrada Podcast.
 * Preços trazidos do site atual (página /podcasts). Para mudar um preço, edite aqui.
 */

export type StudioPackage = {
  name: string;
  forWho: string;
  items: string[];
  price: string;
  note?: string;
  badge?: string;
};

/** Caminho 1: ser entrevistado no De Quebrada Podcast. */
export const INTERVIEW_PACKAGES: StudioPackage[] = [
  {
    name: "Aceleração",
    forWho: "Pra começar a construir autoridade agora.",
    items: [
      "Entrevista no De Quebrada Podcast",
      "Gravação ao vivo (YouTube, Instagram, Facebook)",
      "Flyer de divulgação e fotos dos bastidores",
      "3 cortes editados pra Reels/TikTok",
    ],
    price: "R$ 250",
  },
  {
    name: "Alavancagem de Imagem",
    forWho: "Pra dominar as redes de uma vez só.",
    items: [
      "Tudo do pacote Aceleração",
      "8 cortes editados: conteúdo pra 2 semanas",
      "Legenda dinâmica e áudio tratado em todos",
      "Postagem em colab nas redes do podcast",
    ],
    price: "R$ 350",
    badge: "Mais comprado",
  },
];

/** Caminho 2: gravar o próprio podcast no estúdio (pacotes mensais). */
export const MONTHLY_PACKAGES: StudioPackage[] = [
  {
    name: "Visibilidade",
    forWho: "Presença constante com o mínimo de esforço.",
    items: [
      "1 episódio por semana (1h de gravação)",
      "12 cortes verticais por mês",
      "Legenda, color correction e áudio tratado",
      "Fotos dos bastidores",
    ],
    price: "R$ 750/mês",
    note: "Avulso seria R$ 800.",
    badge: "Melhor custo-benefício",
  },
  {
    name: "Lançamento",
    forWho: "Conteúdo suficiente pra crescer de verdade.",
    items: [
      "1 episódio por semana (1h de gravação)",
      "32 cortes verticais por mês",
      "Legenda, color correction e áudio em todos",
      "Conteúdo pra 2 meses de redes sociais",
    ],
    price: "R$ 1.200/mês",
    note: "Avulso seria R$ 1.680.",
  },
];

/** Serviços avulsos do estúdio: [serviço, preço]. */
export const STUDIO_SERVICES: [string, string][] = [
  ["Gravação 1h (avulsa)", "R$ 100"],
  ["Gravação 1h (pacote mensal de 4h por R$ 350)", "R$ 87/h"],
  ["Pack 3 cortes verticais (reels prontos)", "R$ 100"],
  ["Pack 8 cortes verticais", "R$ 240"],
  ["Vinheta de abertura/encerramento", "R$ 100"],
  ["Edição de episódio completo", "R$ 250/h"],
  ["Identidade visual completa", "R$ 650"],
  ["Gestão de redes sociais", "R$ 650/mês"],
];

/** Fotos da galeria. Troque o texto por foto real quando chegar. */
export const STUDIO_GALLERY = [
  "FOTO DO ESTÚDIO: CENÁRIO PRINCIPAL",
  "FOTO DO ESTÚDIO: BANCADA E MICROFONES",
  "FOTO DOS BASTIDORES DE UMA GRAVAÇÃO",
  "FOTO DA FACHADA OU RECEPÇÃO",
];

export const STUDIO_FAQ = [
  {
    q: "Onde fica o estúdio?",
    a: "Avenida Santos Dumont, 1320, Tanquinho, Ferraz de Vasconcelos, a 5 minutos da CPTM.",
  },
  {
    q: "Em quanto tempo recebo o material?",
    a: "Episódio editado, fotos e cortes são entregues em até 7 dias úteis.",
  },
  {
    q: "Preciso levar equipamento?",
    a: "Não. O estúdio tem a estrutura de gravação. Equipamentos inclusos: [A CONFIRMAR].",
  },
  {
    q: "Quantas pessoas cabem na gravação?",
    a: "[A CONFIRMAR]",
  },
  {
    q: "Como eu pago e reservo a data?",
    a: "Você agenda pelo WhatsApp. Formas de pagamento e sinal para reservar: [A CONFIRMAR].",
  },
  {
    q: "Qualquer pessoa pode ser entrevistada no De Quebrada Podcast?",
    a: "O podcast fala de empreendedorismo, histórias reais e da região. Critérios para ser entrevistado: [A CONFIRMAR].",
  },
];
