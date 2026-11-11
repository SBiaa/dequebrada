/**
 * Cardápio de serviços de publicidade.
 * ATENÇÃO: os itens abaixo são [EXEMPLO] até o cardápio oficial chegar.
 * Para atualizar, troque nome, descrição, formatos e preço de cada item.
 */

export type AdItem = {
  name: string;
  description: string;
  /** Onde a peça aparece. */
  formats: string[];
  price: string;
};

export type AdCategory = {
  id: string;
  title: string;
  description: string;
  items: AdItem[];
};

export const AD_MENU: AdCategory[] = [
  {
    id: "podcast",
    title: "No De Quebrada Podcast",
    description: "Sua marca dentro dos episódios, no YouTube, no Spotify e nos cortes.",
    items: [
      {
        name: "[EXEMPLO] Menção patrocinada no episódio",
        description: "O apresentador fala da sua marca durante o episódio.",
        formats: ["Episódio completo", "YouTube", "Spotify"],
        price: "[DEFINIR]",
      },
      {
        name: "[EXEMPLO] Patrocínio de temporada",
        description: "Sua marca no cenário e na abertura de todos os episódios do período.",
        formats: ["Cenário", "Vinheta", "Descrição dos episódios"],
        price: "[DEFINIR]",
      },
    ],
  },
  {
    id: "redes",
    title: "Nas redes sociais",
    description: "Conteúdo publicado nos perfis do De Quebrada.",
    items: [
      {
        name: "[EXEMPLO] Post em colab no Instagram",
        description: "Publicação feita em conjunto com o perfil da sua marca.",
        formats: ["Instagram feed", "Reels"],
        price: "[DEFINIR]",
      },
      {
        name: "[EXEMPLO] Sequência de stories",
        description: "Stories divulgando sua marca, com link.",
        formats: ["Instagram stories"],
        price: "[DEFINIR]",
      },
    ],
  },
  {
    id: "portal",
    title: "No portal de notícias",
    description: "Presença no blog de notícias do De Quebrada.",
    items: [
      {
        name: "[EXEMPLO] Matéria patrocinada",
        description: "Texto sobre a sua marca publicado no portal, sinalizado como publicidade.",
        formats: ["Portal", "Divulgação nas redes"],
        price: "[DEFINIR]",
      },
      {
        name: "[EXEMPLO] Banner no portal",
        description: "Espaço fixo da sua marca nas páginas de notícia.",
        formats: ["Portal"],
        price: "[DEFINIR]",
      },
    ],
  },
];

/**
 * Mídia kit resumido. Só números que já estão no site atual.
 * O alcance mensal total está divergente no site atual (1,3M views x 800k pessoas).
 */
export const MEDIA_KIT = {
  reach: "[CONFERIR NÚMERO]",
  stats: [
    { value: "600+", label: "episódios" },
    { value: "13,7k", label: "seguidores no Instagram do podcast" },
    { value: "143k", label: "views por mês no YouTube" },
    { value: "44k+", label: "curtidas no TikTok" },
  ],
  audience: "[PERFIL DO PÚBLICO: IDADE, CIDADES, GÊNERO]",
};
