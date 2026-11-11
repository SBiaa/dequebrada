/**
 * Fonte única dos canais e redes do De Quebrada.
 * Usado em: rodapé, home, /sobre ("Onde nos encontrar") e /presenca-digital.
 * Para incluir um canal novo, basta adicionar um item aqui.
 */

export type Platform = "Instagram" | "TikTok" | "YouTube" | "Spotify";

export type Channel = {
  /** Plataforma, usada para escolher o ícone. */
  platform: Platform;
  /** Nome que aparece na tela, ex.: "Instagram · Podcast". */
  label: string;
  handle: string;
  description: string;
  href: string;
  /** Números exibidos em /presenca-digital. Deixe vazio se não houver. */
  metrics: { value: string; label: string }[];
  /** Aparece na lista curta do rodapé e da home. */
  main?: boolean;
};

export const CHANNELS: Channel[] = [
  {
    platform: "Instagram",
    label: "Instagram · Podcast",
    handle: "@dequebradapodcast",
    description: "Podcast nº 1 do Alto Tietê · 4x premiado · conteúdo regional",
    href: "https://www.instagram.com/dequebradapodcast/",
    metrics: [
      { value: "13,7k", label: "seguidores" },
      { value: "480k", label: "views em 30 dias" },
    ],
    main: true,
  },
  {
    platform: "YouTube",
    label: "YouTube · Canal oficial",
    handle: "De Quebrada Podcast",
    description: "Episódios completos · entrevistas · conteúdo do Alto Tietê",
    href: "https://www.youtube.com/@DeQuebradapodcast",
    metrics: [
      { value: "4,2k", label: "inscritos" },
      { value: "143k", label: "views por mês" },
    ],
    main: true,
  },
  {
    platform: "TikTok",
    label: "TikTok · Podcast",
    handle: "@dequebradapodcast",
    description: "Cortes do podcast · histórias reais · conteúdo da quebrada",
    href: "https://www.tiktok.com/@dequebradapodcast",
    metrics: [{ value: "44k+", label: "curtidas" }],
    main: true,
  },
  {
    platform: "Spotify",
    label: "Spotify · Podcast",
    handle: "De Quebrada Podcast",
    description: "Ouça os episódios onde for melhor pra você",
    href: "https://open.spotify.com/show/6innHIAEayFKSHgL2xro0P",
    metrics: [],
    main: true,
  },
  {
    platform: "Instagram",
    label: "Instagram · Empreendedorismo",
    handle: "@oempreendedordequebrada",
    description: "Conteúdo pra quem veio de baixo · negócios · digital",
    href: "https://www.instagram.com/oempreendedordequebrada/",
    metrics: [
      { value: "3,7k", label: "seguidores" },
      { value: "390k", label: "views em 30 dias" },
    ],
  },
  {
    platform: "TikTok",
    label: "TikTok · Empreendedorismo",
    handle: "@oempreendedordequebrada",
    description: "Negócios na prática · dicas rápidas · bastidores reais",
    href: "https://www.tiktok.com/@oempreendedordequebrada",
    metrics: [{ value: "9k+", label: "curtidas" }],
  },
  {
    platform: "Instagram",
    label: "Instagram · Estúdio",
    handle: "@estudiodequebrada",
    description: "Estúdio profissional de podcast · produção de conteúdo",
    href: "https://www.instagram.com/estudiodequebrada/",
    metrics: [
      { value: "138", label: "seguidores" },
      { value: "55k", label: "views em 30 dias" },
    ],
  },
  {
    platform: "Instagram",
    label: "Instagram · Rancho",
    handle: "@ranchodoquebrada",
    description: "Espaço de lazer e eventos · Ferraz de Vasconcelos",
    href: "https://www.instagram.com/ranchodoquebrada/",
    metrics: [
      { value: "6k+", label: "seguidores" },
      { value: "426k", label: "views em 30 dias" },
    ],
  },
];

/** Lista curta (rodapé, home). */
export const MAIN_CHANNELS = CHANNELS.filter((c) => c.main);
