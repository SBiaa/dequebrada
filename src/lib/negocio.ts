import "server-only";
import { and, asc, desc, eq } from "drizzle-orm";
import { db, schema } from "@/db";
import type { SocialPost } from "@/db/schema";

const { businesses, socialAccounts, socialSnapshots, socialPosts } = schema;

export const NETWORKS = {
  instagram: "Instagram",
  tiktok: "TikTok",
  youtube: "YouTube",
  facebook: "Facebook",
  linkedin: "LinkedIn",
  kwai: "Kwai",
  x: "X (Twitter)",
  whatsapp: "Canal do WhatsApp",
  outro: "Outra",
} as const;
export type Network = keyof typeof NETWORKS;

export const POST_FORMATS = ["Reels / vídeo curto", "Carrossel", "Foto", "Stories", "Vídeo longo", "Live", "Texto"] as const;

export function networkLabel(n: string) {
  return NETWORKS[n as Network] ?? n;
}

export async function getBusiness(userId: string) {
  const [b] = await db.select().from(businesses).where(eq(businesses.userId, userId)).limit(1);
  return b ?? null;
}

/** Perfil só se pertencer ao negócio do usuário. */
export async function getOwnedAccount(userId: string, accountId: string) {
  if (!/^[0-9a-f-]{36}$/i.test(accountId)) return null;
  const [row] = await db
    .select({ account: socialAccounts })
    .from(socialAccounts)
    .innerJoin(businesses, eq(socialAccounts.businessId, businesses.id))
    .where(and(eq(socialAccounts.id, accountId), eq(businesses.userId, userId)))
    .limit(1);
  return row?.account ?? null;
}

export async function listAccountsWithLatest(businessId: string) {
  const accounts = await db
    .select()
    .from(socialAccounts)
    .where(eq(socialAccounts.businessId, businessId))
    .orderBy(asc(socialAccounts.createdAt));
  return Promise.all(
    accounts.map(async (a) => {
      const snaps = await db
        .select()
        .from(socialSnapshots)
        .where(eq(socialSnapshots.accountId, a.id))
        .orderBy(asc(socialSnapshots.day));
      const posts = await db.select({ id: socialPosts.id }).from(socialPosts).where(eq(socialPosts.accountId, a.id));
      return { ...a, snaps, postCount: posts.length };
    }),
  );
}

export async function listSnapshots(accountId: string) {
  return db.select().from(socialSnapshots).where(eq(socialSnapshots.accountId, accountId)).orderBy(asc(socialSnapshots.day));
}

export async function listPosts(accountId: string) {
  return db
    .select()
    .from(socialPosts)
    .where(eq(socialPosts.accountId, accountId))
    .orderBy(desc(socialPosts.day), desc(socialPosts.createdAt));
}

/** Curtidas + comentários + compartilhamentos + salvos. */
export function interactions(p: Pick<SocialPost, "likes" | "comments" | "shares" | "saves">) {
  return (p.likes ?? 0) + (p.comments ?? 0) + (p.shares ?? 0) + (p.saves ?? 0);
}

/** Engajamento sobre o alcance, em %. null sem alcance. */
export function engagementRate(p: SocialPost) {
  return p.reach ? (interactions(p) / p.reach) * 100 : null;
}

export const fmtInt = (n: number | null | undefined) => (n == null ? "-" : n.toLocaleString("pt-BR"));
export const fmtPct = (n: number | null) => (n == null ? "-" : `${n.toLocaleString("pt-BR", { maximumFractionDigits: 1 })}%`);
export function fmtDay(day: string) {
  const [y, m, d] = day.split("-");
  return `${d}/${m}/${y}`;
}
export function todayISO() {
  return new Intl.DateTimeFormat("en-CA", { timeZone: "America/Sao_Paulo" }).format(new Date());
}
