export type NewsPost = {
  title: string;
  summary: string;
  city: string;
  readTime: string;
  href: string;
};

export const CITIES = [
  "Ferraz de Vasconcelos",
  "Poá",
  "Suzano",
  "Itaquaquecetuba",
  "Mogi das Cruzes",
  "Arujá",
  "Guararema",
  "Guarulhos",
  "Santa Isabel",
  "São Paulo",
] as const;

const POST_BASE = "https://www.dequebrada.com/post/";

/**
 * Exemplos reais retirados do portal atual (dequebrada.com/blog).
 * No site final, essa lista vem do blog/CMS do portal.
 */
export const NEWS_POSTS: NewsPost[] = [
  {
    title: "Vila São Paulo recebe novos pontos de ônibus com USB e energia solar",
    summary:
      "Novos abrigos em frente à UBS garantem mais conforto e segurança aos passageiros.",
    city: "Ferraz de Vasconcelos",
    readTime: "2 min",
    href: "https://www.dequebrada.com/blog",
  },
  {
    title: "GCM de Itaquá apreende mais de 9,2 mil entorpecentes em uma semana",
    summary:
      "Ações também resultaram em duas prisões, três casas-bomba desarticuladas e dois veículos recuperados.",
    city: "Itaquaquecetuba",
    readTime: "2 min",
    href: `${POST_BASE}gcm-de-itaqu%C3%A1-apreende-mais-de-9-2-mil-entorpecentes-em-uma-semana`,
  },
  {
    title: "GCM Ambiental de Poá participa de curso de manejo de animais peçonhentos",
    summary:
      "Capacitação reuniu conteúdo teórico e prático sobre identificação, contenção e transporte seguro de animais.",
    city: "Poá",
    readTime: "2 min",
    href: `${POST_BASE}gcm-ambiental-de-po%C3%A1-participa-de-curso-especializado-em-manejo-de-animais-pe%C3%A7onhentos`,
  },
  {
    title: "Mogi abre inscrições para oficina de conservação fotográfica",
    summary:
      "São 20 vagas gratuitas na Oficina de Patrimônio Cultural, com inscrição presencial.",
    city: "Mogi das Cruzes",
    readTime: "2 min",
    href: `${POST_BASE}a-prefeitura-de-mogi-das-cruzes-por-meio-da-secretaria-municipal-de-cultura-abrir%C3%A1-na-pr%C3%B3xima-ter%C3%A7`,
  },
  {
    title: "Suzano divulga cronograma de atividades para o Outubro Rosa",
    summary:
      "Programação inclui iluminação rosa em prédios públicos, exames, palestras e orientações.",
    city: "Suzano",
    readTime: "8 min",
    href: "https://www.dequebrada.com/blog",
  },
  {
    title: "Duas orquestras do Conservatório Municipal se apresentam no Teatro Adamastor",
    summary:
      "Concerto gratuito no dia 16 de outubro, às 20h, com classificação livre.",
    city: "Guarulhos",
    readTime: "2 min",
    href: "https://www.dequebrada.com/blog",
  },
];
