/**
 * Loja De Quebrada (fase 1: vitrine, sem carrinho).
 * ATENÇÃO: todos os produtos abaixo são [PRODUTO EXEMPLO] até a lista real chegar.
 *
 * Cada produto tem um botão de compra:
 *  - { type: "whatsapp" }: abre o WhatsApp com mensagem pronta (nome, variação e SKU).
 *  - { type: "external", url, label }: leva para Mercado Livre, Shopee, link de Pix etc.
 *
 * sku, priceCents e variants já ficam prontos para um carrinho no futuro.
 * image: caminho em /public (ex.: "/loja/caneca.jpg"). Sem imagem, aparece o espaço reservado.
 */

export type ProductCategory = { slug: string; name: string };

export const PRODUCT_CATEGORIES: ProductCategory[] = [
  { slug: "canecas", name: "Canecas" },
  { slug: "camisetas", name: "Camisetas" },
  { slug: "microfones", name: "Microfones" },
  { slug: "estudio-e-escritorio", name: "Estúdio e escritório" },
  { slug: "eletronicos", name: "Eletrônicos" },
];

export type BuyAction =
  | { type: "whatsapp" }
  | { type: "external"; url: string; label: string };

export type Product = {
  sku: string;
  name: string;
  category: ProductCategory["slug"];
  description: string;
  /** Preço em centavos. null = ainda não definido (aparece [DEFINIR]). */
  priceCents: number | null;
  /** Ex.: tamanhos de camiseta ou cores. */
  variants?: { label: string; options: string[] };
  image?: { src: string; alt: string };
  buy: BuyAction;
  /** false esconde o produto sem apagar. */
  available?: boolean;
};

export const PRODUCTS: Product[] = [
  {
    sku: "DQ-CANECA-01",
    name: "[PRODUTO EXEMPLO] Caneca De Quebrada",
    category: "canecas",
    description: "[DESCRIÇÃO DO PRODUTO: MATERIAL, CAPACIDADE]",
    priceCents: null,
    buy: { type: "whatsapp" },
  },
  {
    sku: "DQ-CAMISETA-01",
    name: "[PRODUTO EXEMPLO] Camiseta De Quebrada",
    category: "camisetas",
    description: "[DESCRIÇÃO DO PRODUTO: TECIDO, MODELAGEM]",
    priceCents: null,
    variants: { label: "Tamanho", options: ["P", "M", "G", "GG"] },
    buy: { type: "whatsapp" },
  },
  {
    sku: "DQ-MIC-01",
    name: "[PRODUTO EXEMPLO] Microfone para podcast",
    category: "microfones",
    description: "[DESCRIÇÃO DO PRODUTO: TIPO, CONEXÃO]",
    priceCents: null,
    buy: { type: "external", url: "https://www.mercadolivre.com.br/", label: "Comprar no Mercado Livre" },
  },
  {
    sku: "DQ-ESTUDIO-01",
    name: "[PRODUTO EXEMPLO] Braço articulado para microfone",
    category: "estudio-e-escritorio",
    description: "[DESCRIÇÃO DO PRODUTO]",
    priceCents: null,
    buy: { type: "whatsapp" },
  },
  {
    sku: "DQ-ELETRO-01",
    name: "[PRODUTO EXEMPLO] Iluminador LED",
    category: "eletronicos",
    description: "[DESCRIÇÃO DO PRODUTO]",
    priceCents: null,
    buy: { type: "external", url: "https://shopee.com.br/", label: "Comprar na Shopee" },
  },
];

export function formatPrice(cents: number | null): string {
  if (cents === null) return "[DEFINIR PREÇO]";
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(cents / 100);
}
