import "server-only";
import { asc, desc, eq } from "drizzle-orm";
import { db, schema } from "@/db";
import type { Product } from "@/data/products";

const { products } = schema;

/** Produtos visíveis na loja, na ordem definida no painel. */
export async function getShopProducts(): Promise<Product[]> {
  const rows = await db
    .select()
    .from(products)
    .where(eq(products.available, true))
    .orderBy(asc(products.sortOrder), desc(products.createdAt));
  return rows.map((r) => ({
    sku: r.sku,
    name: r.name,
    category: r.category,
    description: r.description,
    priceCents: r.priceCents,
    variants: r.variantLabel && r.variantOptions?.length ? { label: r.variantLabel, options: r.variantOptions } : undefined,
    image: r.imageUrl ? { src: r.imageUrl, alt: r.imageAlt || r.name } : undefined,
    buy:
      r.buyType === "external" && r.buyUrl
        ? { type: "external", url: r.buyUrl, label: r.buyLabel || "Comprar" }
        : { type: "whatsapp" },
  }));
}
