/**
 * Cidades do mapa "Notícias da região" (/blog).
 *
 * - CITIES: clicáveis, aparecem nos chips e têm contagem de notícias.
 *   O slug é o id da cidade e também o slug da categoria do blog (/blog/categoria/{slug}).
 * - CONTEXT_CITIES: só desenho de fundo (apagadas, sem clique, sem rótulo).
 *
 * Para incluir uma cidade: adicione aqui com o código IBGE e rode `npm run mapa:gerar`
 * (gera src/data/mapa-regiao.ts a partir das malhas do IBGE). Depois crie a categoria com o mesmo nome.
 */

export type RegionCityConfig = {
  id: string;
  name: string;
  /** Igual ao id: sem acento, minúsculo, com hífen. */
  slug: string;
  ibge: number;
};

export const CITIES: RegionCityConfig[] = [
  { id: "ferraz-de-vasconcelos", name: "Ferraz de Vasconcelos", slug: "ferraz-de-vasconcelos", ibge: 3515707 },
  { id: "poa", name: "Poá", slug: "poa", ibge: 3539806 },
  { id: "suzano", name: "Suzano", slug: "suzano", ibge: 3552502 },
  { id: "itaquaquecetuba", name: "Itaquaquecetuba", slug: "itaquaquecetuba", ibge: 3523107 },
  { id: "mogi-das-cruzes", name: "Mogi das Cruzes", slug: "mogi-das-cruzes", ibge: 3530607 },
  { id: "sao-paulo", name: "São Paulo", slug: "sao-paulo", ibge: 3550308 },
];

export const CONTEXT_CITIES: { id: string; name: string; ibge: number }[] = [
  { id: "guarulhos", name: "Guarulhos", ibge: 3518800 },
  { id: "aruja", name: "Arujá", ibge: 3503901 },
];

/** Cidade selecionada ao abrir a página. */
export const DEFAULT_CITY_ID = "ferraz-de-vasconcelos";

/**
 * Recorte do mapa (graus). São Paulo, Mogi das Cruzes e o sul de Suzano são cortados
 * para as cidades menores ficarem legíveis; o que fica fora aparece como borda esmaecida.
 */
export const MAP_FRAME = { west: -46.47, east: -46.15, north: -23.4, south: -23.66 };
