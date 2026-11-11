"use server";

import { and, eq, ne } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { db, schema } from "@/db";
import { requireAdmin } from "@/lib/auth";
import { slugify } from "@/lib/blog";
import { parseYouTubeId } from "@/lib/members";

const { users, memberContents, memberFiles } = schema;

const MAX_FILE_BYTES = 4 * 1024 * 1024;
const KINDS = ["video", "aula", "pdf", "link"] as const;
type Kind = (typeof KINDS)[number];

export type ContentFields = {
  title: string;
  slug: string;
  description: string;
  kind: Kind;
  youtube: string;
  externalUrl: string;
};
export type ContentFormState = { error?: string; ok?: string; fields?: ContentFields; at?: number } | undefined;

/** Libera ou retira o acesso de assinante (liberação manual). */
export async function setSubscriberAction(formData: FormData): Promise<void> {
  await requireAdmin();
  const id = String(formData.get("id") ?? "");
  const value = formData.get("value") === "1";
  if (id) {
    await db.update(users).set({ isSubscriber: value }).where(and(eq(users.id, id), eq(users.role, "member")));
  }
  revalidatePath("/painel/assinantes");
}

function read(formData: FormData): ContentFields {
  const kind = String(formData.get("kind") ?? "");
  return {
    title: String(formData.get("title") ?? "").trim().slice(0, 200),
    slug: String(formData.get("slug") ?? "").trim().slice(0, 100),
    description: String(formData.get("description") ?? "").trim().slice(0, 2000),
    kind: (KINDS as readonly string[]).includes(kind) ? (kind as Kind) : "video",
    youtube: String(formData.get("youtube") ?? "").trim().slice(0, 300),
    externalUrl: String(formData.get("externalUrl") ?? "").trim().slice(0, 500),
  };
}

export async function saveContentAction(_: ContentFormState, formData: FormData): Promise<ContentFormState> {
  const result = await saveContent(formData);
  return result?.error ? { ...result, fields: read(formData), at: Date.now() } : result;
}

async function saveContent(formData: FormData): Promise<ContentFormState> {
  await requireAdmin();
  const id = String(formData.get("id") ?? "") || null;
  const f = read(formData);
  const published = formData.get("intent") === "publish";
  const slug = slugify(f.slug || f.title);

  if (!f.title) return { error: "Escreva o título." };
  if (!slug) return { error: "Use letras ou números no título." };
  if (!f.description) return { error: "Escreva uma descrição curta." };

  const youtubeId = f.youtube ? parseYouTubeId(f.youtube) : null;
  if (f.youtube && !youtubeId) return { error: "Link do YouTube inválido. Cole o link do vídeo ou o ID." };

  let externalUrl: string | null = null;
  if (f.externalUrl) {
    try {
      const u = new URL(f.externalUrl);
      if (u.protocol !== "https:") throw new Error();
      externalUrl = u.toString();
    } catch {
      return { error: "O link externo precisa começar com https://" };
    }
  }

  const [taken] = await db
    .select({ id: memberContents.id })
    .from(memberContents)
    .where(id ? and(eq(memberContents.slug, slug), ne(memberContents.id, id)) : eq(memberContents.slug, slug))
    .limit(1);
  if (taken) return { error: `Já existe um conteúdo com o endereço "${slug}".` };

  const existing = id
    ? (await db.select().from(memberContents).where(eq(memberContents.id, id)).limit(1))[0]
    : undefined;
  if (id && !existing) return { error: "Conteúdo não encontrado." };

  let fileId = existing?.fileId ?? null;
  const file = formData.get("file");
  if (file instanceof File && file.size > 0) {
    if (file.type !== "application/pdf") return { error: "O arquivo precisa ser PDF." };
    if (file.size > MAX_FILE_BYTES) return { error: "O PDF pode ter no máximo 4 MB." };
    const [row] = await db
      .insert(memberFiles)
      .values({ name: file.name.slice(0, 150), mime: "application/pdf", size: file.size, data: Buffer.from(await file.arrayBuffer()) })
      .returning({ id: memberFiles.id });
    fileId = row.id;
  }
  if (formData.get("removeFile") === "on") fileId = null;

  if (published && !youtubeId && !fileId && !externalUrl) {
    return { error: "Para publicar, coloque um vídeo do YouTube, um PDF ou um link." };
  }

  const values = { slug, title: f.title, description: f.description, kind: f.kind, youtubeId, externalUrl, fileId, published };
  let savedId = id;
  if (existing) {
    await db.update(memberContents).set(values).where(eq(memberContents.id, existing.id));
  } else {
    const [row] = await db.insert(memberContents).values(values).returning({ id: memberContents.id });
    savedId = row.id;
  }
  // Arquivo antigo que ficou sem uso é apagado.
  if (existing?.fileId && existing.fileId !== fileId) {
    await db.delete(memberFiles).where(eq(memberFiles.id, existing.fileId));
  }
  revalidatePath("/membros");
  redirect(`/painel/conteudos/${savedId}?salvo=${published ? "publicado" : "rascunho"}`);
}

export async function deleteContentAction(formData: FormData): Promise<void> {
  await requireAdmin();
  const id = String(formData.get("id") ?? "");
  if (id) {
    const [row] = await db.delete(memberContents).where(eq(memberContents.id, id)).returning({ fileId: memberContents.fileId });
    if (row?.fileId) await db.delete(memberFiles).where(eq(memberFiles.id, row.fileId));
  }
  revalidatePath("/membros");
  redirect("/painel/conteudos?excluido=1");
}
