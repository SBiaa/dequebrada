"use server";

import { del, put } from "@vercel/blob";
import { and, eq, ne } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { db, schema } from "@/db";
import { requireAdmin } from "@/lib/auth";
import { readingMinutes, slugify } from "@/lib/blog";

const { posts, categories } = schema;

export type PostFields = {
  title: string;
  slug: string;
  excerpt: string;
  body: string;
  coverAlt: string;
  categoryId: number | null;
  authorName: string;
  scheduleAt: string;
};

export type PostFormState = { error?: string; ok?: string; fields?: PostFields; at?: number } | undefined;

const MAX_IMAGE_BYTES = 4 * 1024 * 1024;
const IMAGE_TYPES: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
};

function text(formData: FormData, key: string, max: number): string {
  return String(formData.get(key) ?? "").trim().slice(0, max);
}

/** Apaga do Blob uma capa que deixou de ser usada. Falha aqui não impede salvar. */
async function deleteCover(url: string | null | undefined) {
  if (!url || !url.includes(".blob.vercel-storage.com/")) return;
  try {
    await del(url);
  } catch (e) {
    console.error("Não foi possível apagar a imagem antiga", e);
  }
}

function refreshBlog() {
  revalidatePath("/", "layout");
}

async function uploadCover(file: File, slug: string): Promise<string> {
  const ext = IMAGE_TYPES[file.type];
  if (!ext) throw new Error("tipo");
  if (file.size > MAX_IMAGE_BYTES) throw new Error("tamanho");
  const blob = await put(`blog/${slug}.${ext}`, file, {
    access: "public",
    addRandomSuffix: true,
    contentType: file.type,
  });
  return blob.url;
}

export async function savePostAction(_: PostFormState, formData: FormData): Promise<PostFormState> {
  const result = await savePost(formData);
  if (!result?.error) return result;
  // Devolve o que foi digitado, para o formulário não perder o texto quando há erro.
  return {
    ...result,
    at: Date.now(),
    fields: {
      title: text(formData, "title", 200),
      slug: text(formData, "slug", 100),
      excerpt: text(formData, "excerpt", 320),
      body: String(formData.get("body") ?? "").slice(0, 100_000),
      coverAlt: text(formData, "coverAlt", 200),
      categoryId: Number(formData.get("categoryId")) || null,
      authorName: text(formData, "authorName", 100),
      scheduleAt: text(formData, "scheduleAt", 16),
    },
  };
}

async function savePost(formData: FormData): Promise<PostFormState> {
  const user = await requireAdmin();

  const id = text(formData, "id", 64) || null;
  const title = text(formData, "title", 200);
  const excerpt = text(formData, "excerpt", 320);
  const body = String(formData.get("body") ?? "").slice(0, 100_000);
  const coverAlt = text(formData, "coverAlt", 200);
  const authorName = text(formData, "authorName", 100) || user.name;
  const categoryRaw = text(formData, "categoryId", 12);
  const categoryId = categoryRaw ? Number(categoryRaw) : null;
  const intent = formData.get("intent") === "publish" ? "published" : "draft";
  const slug = slugify(text(formData, "slug", 100) || title);
  // "Agendar para": datetime-local no horário de Brasília (sem horário de verão desde 2019).
  const scheduleRaw = text(formData, "scheduleAt", 16);
  const scheduleAt = scheduleRaw ? new Date(`${scheduleRaw}:00-03:00`) : null;
  if (scheduleAt && Number.isNaN(scheduleAt.getTime())) return { error: "Data de agendamento inválida." };

  if (!title) return { error: "Escreva o título." };
  if (!slug) return { error: "O endereço (slug) ficou vazio. Use letras ou números no título." };
  if (!excerpt) return { error: "Escreva o resumo. Ele aparece no Google e nos cards." };
  if (!body.trim()) return { error: "Escreva o texto da notícia." };
  if (categoryId !== null && !Number.isInteger(categoryId)) return { error: "Categoria inválida." };

  const [taken] = await db
    .select({ id: posts.id })
    .from(posts)
    .where(id ? and(eq(posts.slug, slug), ne(posts.id, id)) : eq(posts.slug, slug))
    .limit(1);
  if (taken) return { error: `Já existe um post com o endereço "${slug}". Mude o título ou o endereço.` };

  const existing = id
    ? (await db.select().from(posts).where(eq(posts.id, id)).limit(1))[0]
    : undefined;
  if (id && !existing) return { error: "Post não encontrado." };

  let coverUrl = existing?.coverUrl ?? null;
  const file = formData.get("cover");
  if (file instanceof File && file.size > 0) {
    try {
      coverUrl = await uploadCover(file, slug);
    } catch (e) {
      const reason = e instanceof Error ? e.message : "";
      return {
        error:
          reason === "tipo"
            ? "A imagem precisa ser JPG, PNG ou WEBP."
            : reason === "tamanho"
              ? "A imagem pode ter no máximo 4 MB."
              : "Não foi possível enviar a imagem. Tente de novo.",
      };
    }
  }
  if (formData.get("removeCover") === "on") coverUrl = null;
  if (coverUrl && !coverAlt) {
    return { error: "Descreva a imagem de capa (texto alternativo), para quem usa leitor de tela." };
  }

  const values = {
    slug,
    title,
    excerpt,
    body,
    coverUrl,
    coverAlt: coverUrl ? coverAlt : null,
    categoryId,
    authorName,
    status: intent as "draft" | "published",
    readingMinutes: readingMinutes(body),
    updatedAt: new Date(),
    publishedAt:
      intent === "published"
        ? (scheduleAt ??
          (existing?.publishedAt && existing.publishedAt <= new Date() ? existing.publishedAt : new Date()))
        : (scheduleAt ?? existing?.publishedAt ?? null),
  };

  if (existing?.coverUrl && existing.coverUrl !== coverUrl) await deleteCover(existing.coverUrl);

  let savedId = id;
  if (existing) {
    await db.update(posts).set(values).where(eq(posts.id, existing.id));
  } else {
    const [row] = await db.insert(posts).values(values).returning({ id: posts.id });
    savedId = row.id;
  }

  refreshBlog();
  const salvo =
    intent === "published" ? (scheduleAt && scheduleAt > new Date() ? "agendado" : "publicado") : "rascunho";
  redirect(`/painel/posts/${savedId}?salvo=${salvo}`);
}

export async function deletePostAction(formData: FormData): Promise<void> {
  await requireAdmin();
  const id = String(formData.get("id") ?? "");
  if (id) {
    const [deleted] = await db.delete(posts).where(eq(posts.id, id)).returning({ coverUrl: posts.coverUrl });
    await deleteCover(deleted?.coverUrl);
  }
  refreshBlog();
  redirect("/painel/posts?excluido=1");
}

export async function unpublishPostAction(formData: FormData): Promise<void> {
  await requireAdmin();
  const id = String(formData.get("id") ?? "");
  if (id) await db.update(posts).set({ status: "draft", updatedAt: new Date() }).where(eq(posts.id, id));
  refreshBlog();
  redirect(`/painel/posts/${id}?salvo=rascunho`);
}

export async function saveCategoryAction(_: PostFormState, formData: FormData): Promise<PostFormState> {
  await requireAdmin();
  const name = text(formData, "name", 60);
  const idRaw = text(formData, "id", 12);
  if (!name) return { error: "Escreva o nome da categoria." };
  const slug = slugify(name);
  if (!slug) return { error: "Use letras ou números no nome." };

  const [taken] = await db.select({ id: categories.id }).from(categories).where(eq(categories.slug, slug)).limit(1);
  if (taken && String(taken.id) !== idRaw) return { error: "Já existe uma categoria com esse nome." };

  if (idRaw) {
    await db.update(categories).set({ name, slug }).where(eq(categories.id, Number(idRaw)));
  } else {
    await db.insert(categories).values({ name, slug });
  }
  refreshBlog();
  return { ok: `Categoria "${name}" salva.` };
}

export async function deleteCategoryAction(formData: FormData): Promise<void> {
  await requireAdmin();
  const id = Number(formData.get("id"));
  if (Number.isInteger(id)) await db.delete(categories).where(eq(categories.id, id));
  refreshBlog();
  redirect("/painel/categorias");
}
