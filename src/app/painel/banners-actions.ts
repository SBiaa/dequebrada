"use server";

import { del, put } from "@vercel/blob";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { db, schema } from "@/db";
import { requireAdmin } from "@/lib/auth";

const { banners } = schema;

const MAX_IMAGE_BYTES = 4 * 1024 * 1024;
const IMAGE_TYPES: Record<string, string> = { "image/jpeg": "jpg", "image/png": "png", "image/webp": "webp" };
const PLACEMENTS = ["home", "blog", "both"];
const DATE = /^\d{4}-\d{2}-\d{2}$/;

export type BannerFields = {
  title: string;
  imageAlt: string;
  linkUrl: string;
  startsAt: string;
  endsAt: string;
  sortOrder: string;
  placement: string;
};
export type BannerFormState = { error?: string; ok?: string; fields?: BannerFields; at?: number } | undefined;

function t(fd: FormData, key: string, max: number) {
  return String(fd.get(key) ?? "").trim().slice(0, max);
}

function read(fd: FormData): BannerFields {
  return {
    title: t(fd, "title", 200),
    imageAlt: t(fd, "imageAlt", 300),
    linkUrl: t(fd, "linkUrl", 500),
    startsAt: t(fd, "startsAt", 10),
    endsAt: t(fd, "endsAt", 10),
    sortOrder: t(fd, "sortOrder", 6),
    placement: t(fd, "placement", 10),
  };
}

async function deleteImage(url: string | null | undefined) {
  if (!url || !url.includes(".blob.vercel-storage.com/")) return;
  try {
    await del(url);
  } catch (e) {
    console.error("Não foi possível apagar a imagem antiga", e);
  }
}

export async function saveBannerAction(_: BannerFormState, fd: FormData): Promise<BannerFormState> {
  const result = await saveBanner(fd);
  return result?.error ? { ...result, fields: read(fd), at: Date.now() } : result;
}

async function saveBanner(fd: FormData): Promise<BannerFormState> {
  await requireAdmin();
  const id = String(fd.get("id") ?? "") || null;
  const f = read(fd);
  const active = fd.get("intent") !== "hide";

  if (!f.title) return { error: "Dê um nome ao banner (ex.: Prefeitura de Poá, vacinação)." };
  if (!f.imageAlt) return { error: "Descreva o banner em uma frase (para quem usa leitor de tela)." };
  if (f.startsAt && !DATE.test(f.startsAt)) return { error: "Data de início inválida." };
  if (f.endsAt && !DATE.test(f.endsAt)) return { error: "Data de fim inválida." };
  if (f.startsAt && f.endsAt && f.endsAt < f.startsAt) return { error: "O fim não pode ser antes do início." };

  if (!PLACEMENTS.includes(f.placement)) return { error: "Escolha onde o banner aparece." };

  let linkUrl: string | null = null;
  if (f.linkUrl) {
    try {
      const u = new URL(f.linkUrl);
      if (u.protocol !== "https:" && u.protocol !== "http:") throw new Error();
      linkUrl = u.toString();
    } catch {
      return { error: "O link precisa começar com https://" };
    }
  }

  const existing = id ? (await db.select().from(banners).where(eq(banners.id, id)).limit(1))[0] : undefined;
  if (id && !existing) return { error: "Banner não encontrado." };

  let imageUrl = existing?.imageUrl ?? null;
  const file = fd.get("image");
  if (file instanceof File && file.size > 0) {
    const ext = IMAGE_TYPES[file.type];
    if (!ext) return { error: "A imagem precisa ser JPG, PNG ou WebP." };
    if (file.size > MAX_IMAGE_BYTES) return { error: "A imagem pode ter no máximo 4 MB." };
    try {
      const blob = await put(`banners/banner.${ext}`, file, {
        access: "public",
        addRandomSuffix: true,
        contentType: file.type,
      });
      imageUrl = blob.url;
    } catch (e) {
      console.error(e);
      return { error: "Não foi possível enviar a imagem. Tente de novo." };
    }
  }
  if (!imageUrl) return { error: "Envie a imagem do banner." };

  const values = {
    title: f.title,
    imageUrl,
    imageAlt: f.imageAlt,
    linkUrl,
    placement: f.placement,
    active,
    startsAt: f.startsAt || null,
    endsAt: f.endsAt || null,
    sortOrder: Number.parseInt(f.sortOrder, 10) || 0,
    updatedAt: new Date(),
  };

  let savedId = id;
  if (existing) {
    await db.update(banners).set(values).where(eq(banners.id, existing.id));
  } else {
    const [row] = await db.insert(banners).values(values).returning({ id: banners.id });
    savedId = row.id;
  }
  if (existing?.imageUrl && existing.imageUrl !== imageUrl) await deleteImage(existing.imageUrl);

  revalidatePath("/");
  revalidatePath("/blog/[slug]", "page");
  redirect(`/painel/banners/${savedId}?salvo=${active ? "no-ar" : "oculto"}`);
}

export async function deleteBannerAction(fd: FormData): Promise<void> {
  await requireAdmin();
  const id = String(fd.get("id") ?? "");
  if (id) {
    const [row] = await db.delete(banners).where(eq(banners.id, id)).returning({ imageUrl: banners.imageUrl });
    await deleteImage(row?.imageUrl);
  }
  revalidatePath("/");
  redirect("/painel/banners?excluido=1");
}
