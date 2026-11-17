/**
 * Loja De Quebrada (vitrine, sem carrinho).
 * Os produtos são cadastrados no painel (/painel/produtos) e ficam no banco (tabela products).
 * Aqui ficam só as categorias, os tipos e a formatação de preço.
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
  /** Preço em centavos. null = "Sob consulta". */
  priceCents: number | null;
  /** Ex.: tamanhos de camiseta ou cores. */
  variants?: { label: string; options: string[] };
  image?: { src: string; alt: string };
  buy: BuyAction;
  /** false esconde o produto sem apagar. */
  available?: boolean;
};

export function formatPrice(cents: number | null): string {
  if (cents === null) return "Sob consulta";
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(cents / 100);
}
