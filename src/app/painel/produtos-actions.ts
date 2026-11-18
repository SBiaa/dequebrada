"use server";

import { del, put } from "@vercel/blob";
import { and, eq, ne } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { db, schema } from "@/db";
import { PRODUCT_CATEGORIES } from "@/data/products";
import { requireAdmin } from "@/lib/auth";
import { slugify } from "@/lib/blog";

const { products } = schema;

const MAX_IMAGE_BYTES = 4 * 1024 * 1024;
const IMAGE_TYPES: Record<string, string> = { "image/jpeg": "jpg", "image/png": "png", "image/webp": "webp" };

export type ProductFields = {
  name: string;
  sku: string;
  category: string;
  description: string;
  price: string;
  variantLabel: string;
  variantOptions: string;
  imageAlt: string;
  buyType: "whatsapp" | "external";
  buyUrl: string;
  buyLabel: string;
  sortOrder: string;
};
export type ProductFormState = { error?: string; ok?: string; fields?: ProductFields; at?: number } | undefined;

function t(fd: FormData, key: string, max: number) {
  return String(fd.get(key) ?? "").trim().slice(0, max);
}

function read(fd: FormData): ProductFields {
  return {
    name: t(fd, "name", 200),
    sku: t(fd, "sku", 60),
    category: t(fd, "category", 60),
    description: t(fd, "description", 2000),
    price: t(fd, "price", 20),
    variantLabel: t(fd, "variantLabel", 60),
    variantOptions: t(fd, "variantOptions", 500),
    imageAlt: t(fd, "imageAlt", 200),
    buyType: fd.get("buyType") === "external" ? "external" : "whatsapp",
    buyUrl: t(fd, "buyUrl", 500),
    buyLabel: t(fd, "buyLabel", 80),
    sortOrder: t(fd, "sortOrder", 6),
  };
}

/** "49,90", "R$ 1.299,00" ou "49.9" → centavos. Vazio → null. */
function parsePrice(raw: string): number | null | "invalid" {
  if (!raw) return null;
  let s = raw.replace(/[R$\s]/gi, "");
  if (s.includes(",")) s = s.replace(/\./g, "").replace(",", ".");
  const n = Number(s);
  if (!Number.isFinite(n) || n < 0) return "invalid";
  return Math.round(n * 100);
}

async function deleteImage(url: string | null | undefined) {
  if (!url || !url.includes(".blob.vercel-storage.com/")) return;
  try {
    await del(url);
  } catch (e) {
    console.error("Não foi possível apagar a imagem antiga", e);
  }
}

export async function saveProductAction(_: ProductFormState, fd: FormData): Promise<ProductFormState> {
  const result = await saveProduct(fd);
  return result?.error ? { ...result, fields: read(fd), at: Date.now() } : result;
}

async function saveProduct(fd: FormData): Promise<ProductFormState> {
  await requireAdmin();
  const id = String(fd.get("id") ?? "") || null;
  const f = read(fd);
  const available = fd.get("intent") !== "hide";

  if (!f.name) return { error: "Escreva o nome do produto." };
  if (!PRODUCT_CATEGORIES.some((c) => c.slug === f.category)) return { error: "Escolha uma categoria." };
  if (!f.description) return { error: "Escreva uma descrição curta." };
  const priceCents = parsePrice(f.price);
  if (priceCents === "invalid") return { error: "Preço inválido. Use, por exemplo, 49,90." };

  const sku = (f.sku ? slugify(f.sku) : `dq-${slugify(f.name)}`).toUpperCase();
  if (!sku || sku === "DQ-") return { error: "Use letras ou números no nome ou no código (SKU)." };

  const options = f.variantOptions.split(",").map((o) => o.trim()).filter(Boolean);
  if (f.variantLabel && options.length === 0) return { error: "Coloque as opções da variação separadas por vírgula." };
  if (!f.variantLabel && options.length > 0) return { error: 'Dê um nome à variação (ex.: "Tamanho").' };

  let buyUrl: string | null = null;
  if (f.buyType === "external") {
    try {
      const u = new URL(f.buyUrl);
      if (u.protocol !== "https:") throw new Error();
      buyUrl = u.toString();
    } catch {
      return { error: "O link de compra precisa começar com https://" };
    }
  }

  const [taken] = await db
    .select({ id: products.id })
    .from(products)
    .where(id ? and(eq(products.sku, sku), ne(products.id, id)) : eq(products.sku, sku))
    .limit(1);
  if (taken) return { error: `Já existe um produto com o código "${sku}".` };

  const existing = id ? (await db.select().from(products).where(eq(products.id, id)).limit(1))[0] : undefined;
  if (id && !existing) return { error: "Produto não encontrado." };

  let imageUrl = existing?.imageUrl ?? null;
  const file = fd.get("image");
  if (file instanceof File && file.size > 0) {
    const ext = IMAGE_TYPES[file.type];
    if (!ext) return { error: "A foto precisa ser JPG, PNG ou WebP." };
    if (file.size > MAX_IMAGE_BYTES) return { error: "A foto pode ter no máximo 4 MB." };
    try {
      const blob = await put(`loja/${sku.toLowerCase()}.${ext}`, file, {
        access: "public",
        addRandomSuffix: true,
        contentType: file.type,
      });
      imageUrl = blob.url;
    } catch (e) {
      console.error(e);
      return { error: "Não foi possível enviar a foto. Tente de novo." };
    }
  } else if (fd.get("removeImage") === "on") {
    imageUrl = null;
  }

  const values = {
    sku,
    name: f.name,
    category: f.category,
    description: f.description,
    priceCents,
    variantLabel: f.variantLabel || null,
    variantOptions: options.length ? options : null,
    imageUrl,
    imageAlt: f.imageAlt || null,
    buyType: f.buyType,
    buyUrl,
    buyLabel: f.buyType === "external" ? f.buyLabel || "Comprar" : null,
    available,
    sortOrder: Number.parseInt(f.sortOrder, 10) || 0,
    updatedAt: new Date(),
  };

  let savedId = id;
  if (existing) {
    await db.update(products).set(values).where(eq(products.id, existing.id));
  } else {
    const [row] = await db.insert(products).values(values).returning({ id: products.id });
    savedId = row.id;
  }
  if (existing?.imageUrl && existing.imageUrl !== imageUrl) await deleteImage(existing.imageUrl);

  revalidatePath("/loja");
  redirect(`/painel/produtos/${savedId}?salvo=${available ? "na-loja" : "oculto"}`);
}

export async function deleteProductAction(fd: FormData): Promise<void> {
  await requireAdmin();
  const id = String(fd.get("id") ?? "");
  if (id) {
    const [row] = await db.delete(products).where(eq(products.id, id)).returning({ imageUrl: products.imageUrl });
    await deleteImage(row?.imageUrl);
  }
  revalidatePath("/loja");
  redirect("/painel/produtos?excluido=1");
}
