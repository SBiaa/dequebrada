import "server-only";
import { and, desc, eq } from "drizzle-orm";
import { db, schema } from "@/db";

const { memberContents, memberFiles } = schema;

export const KIND_LABEL = { video: "Vídeo", aula: "Aula", pdf: "PDF", link: "Link" } as const;

export async function listPublishedContents() {
  return db
    .select({
      id: memberContents.id,
      slug: memberContents.slug,
      title: memberContents.title,
      description: memberContents.description,
      kind: memberContents.kind,
      youtubeId: memberContents.youtubeId,
    })
    .from(memberContents)
    .where(eq(memberContents.published, true))
    .orderBy(desc(memberContents.createdAt));
}

export async function getPublishedContent(slug: string) {
  const [row] = await db
    .select({
      id: memberContents.id,
      slug: memberContents.slug,
      title: memberContents.title,
      description: memberContents.description,
      kind: memberContents.kind,
      youtubeId: memberContents.youtubeId,
      externalUrl: memberContents.externalUrl,
      fileId: memberContents.fileId,
      fileName: memberFiles.name,
      fileSize: memberFiles.size,
    })
    .from(memberContents)
    .leftJoin(memberFiles, eq(memberContents.fileId, memberFiles.id))
    .where(and(eq(memberContents.slug, slug), eq(memberContents.published, true)))
    .limit(1);
  return row ?? null;
}

/** Arquivo só sai se estiver ligado a um conteúdo publicado. */
export async function getDownloadableFile(fileId: string) {
  const [row] = await db
    .select({ name: memberFiles.name, mime: memberFiles.mime, data: memberFiles.data })
    .from(memberFiles)
    .innerJoin(memberContents, eq(memberContents.fileId, memberFiles.id))
    .where(and(eq(memberFiles.id, fileId), eq(memberContents.published, true)))
    .limit(1);
  return row ?? null;
}

/** Aceita a URL inteira do YouTube ou só o ID e devolve o ID de 11 caracteres. */
export function parseYouTubeId(input: string): string | null {
  const v = input.trim();
  if (/^[A-Za-z0-9_-]{11}$/.test(v)) return v;
  try {
    const url = new URL(v);
    const host = url.hostname.replace(/^www\./, "");
    let id: string | null = null;
    if (host === "youtu.be") id = url.pathname.slice(1);
    else if (host.endsWith("youtube.com") || host.endsWith("youtube-nocookie.com")) {
      id = url.searchParams.get("v") ?? url.pathname.split("/").filter(Boolean).pop() ?? null;
    }
    return id && /^[A-Za-z0-9_-]{11}$/.test(id) ? id : null;
  } catch {
    return null;
  }
}

export function formatBytes(n: number | null): string {
  if (!n) return "";
  return n > 1024 * 1024 ? `${(n / 1024 / 1024).toFixed(1).replace(".", ",")} MB` : `${Math.ceil(n / 1024)} KB`;
}
