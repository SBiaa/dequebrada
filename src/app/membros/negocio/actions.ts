"use server";

import { and, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { db, schema } from "@/db";
import { canSeeExclusive, requireUser } from "@/lib/auth";
import { getBusiness, getOwnedAccount, NETWORKS, POST_FORMATS } from "@/lib/negocio";

const { businesses, socialAccounts, socialSnapshots, socialPosts } = schema;

export type NegocioState = { error?: string; ok?: string; at?: number } | undefined;

const fail = (error: string): NegocioState => ({ error, at: Date.now() });
const t = (fd: FormData, k: string, max: number) => String(fd.get(k) ?? "").trim().slice(0, max);

/** Número inteiro opcional ("1.234" ou "1234"). undefined = inválido. */
function num(fd: FormData, k: string): number | null | undefined {
  const raw = t(fd, k, 20).replace(/[.\s]/g, "");
  if (!raw) return null;
  if (!/^\d+$/.test(raw)) return undefined;
  const n = Number(raw);
  return n <= 2_000_000_000 ? n : undefined;
}

function day(fd: FormData) {
  const d = t(fd, "day", 10);
  return /^\d{4}-\d{2}-\d{2}$/.test(d) && !Number.isNaN(Date.parse(d)) ? d : null;
}

async function member() {
  const user = await requireUser("/membros/negocio");
  if (!canSeeExclusive(user)) redirect("/membros/negocio");
  return user;
}

export async function saveBusinessAction(_p: NegocioState, fd: FormData): Promise<NegocioState> {
  const user = await member();
  const name = t(fd, "name", 120);
  if (!name) return fail("Coloque o nome do negócio.");
  const values = { name, segment: t(fd, "segment", 120), city: t(fd, "city", 120), description: t(fd, "description", 1000) };
  const existing = await getBusiness(user.id);
  if (existing) await db.update(businesses).set(values).where(eq(businesses.id, existing.id));
  else await db.insert(businesses).values({ ...values, userId: user.id });
  revalidatePath("/membros/negocio");
  return { ok: "Negócio salvo.", at: Date.now() };
}

export async function addAccountAction(_p: NegocioState, fd: FormData): Promise<NegocioState> {
  const user = await member();
  const business = await getBusiness(user.id);
  if (!business) return fail("Cadastre o negócio primeiro.");
  const network = t(fd, "network", 20);
  const handle = t(fd, "handle", 100).replace(/^@/, "");
  if (!(network in NETWORKS)) return fail("Escolha a rede.");
  if (!handle) return fail("Coloque o @ ou nome do perfil.");
  const [row] = await db.insert(socialAccounts).values({ businessId: business.id, network, handle }).returning({ id: socialAccounts.id });
  redirect(`/membros/negocio/${row.id}?novo=1`);
}

export async function deleteAccountAction(fd: FormData) {
  const user = await member();
  const account = await getOwnedAccount(user.id, String(fd.get("accountId") ?? ""));
  if (account) await db.delete(socialAccounts).where(eq(socialAccounts.id, account.id));
  revalidatePath("/membros/negocio");
  redirect("/membros/negocio");
}

export async function saveSnapshotAction(_p: NegocioState, fd: FormData): Promise<NegocioState> {
  const user = await member();
  const account = await getOwnedAccount(user.id, String(fd.get("accountId") ?? ""));
  if (!account) return fail("Perfil não encontrado.");
  const d = day(fd);
  if (!d) return fail("Data inválida.");
  const followers = num(fd, "followers");
  const reach = num(fd, "reach");
  const profileVisits = num(fd, "profileVisits");
  const linkClicks = num(fd, "linkClicks");
  if (followers == null) return fail("Coloque o número de seguidores (só números).");
  if ([reach, profileVisits, linkClicks].includes(undefined)) return fail("Use só números nos campos.");
  const values = {
    followers,
    reach: reach ?? null,
    profileVisits: profileVisits ?? null,
    linkClicks: linkClicks ?? null,
    note: t(fd, "note", 300),
  };
  await db
    .insert(socialSnapshots)
    .values({ accountId: account.id, day: d, ...values })
    .onConflictDoUpdate({ target: [socialSnapshots.accountId, socialSnapshots.day], set: values });
  revalidatePath(`/membros/negocio/${account.id}`);
  return { ok: "Números salvos. Se já havia registro nesse dia, ele foi atualizado.", at: Date.now() };
}

export async function deleteSnapshotAction(fd: FormData) {
  const user = await member();
  const account = await getOwnedAccount(user.id, String(fd.get("accountId") ?? ""));
  if (!account) return;
  await db
    .delete(socialSnapshots)
    .where(and(eq(socialSnapshots.id, String(fd.get("id") ?? "")), eq(socialSnapshots.accountId, account.id)));
  revalidatePath(`/membros/negocio/${account.id}`);
}

export async function savePostAction(_p: NegocioState, fd: FormData): Promise<NegocioState> {
  const user = await member();
  const account = await getOwnedAccount(user.id, String(fd.get("accountId") ?? ""));
  if (!account) return fail("Perfil não encontrado.");
  const d = day(fd);
  if (!d) return fail("Data inválida.");
  const title = t(fd, "title", 200);
  if (!title) return fail("Diga sobre o que foi o post.");
  const format = t(fd, "format", 40);
  if (!(POST_FORMATS as readonly string[]).includes(format)) return fail("Escolha o formato.");
  const url = t(fd, "url", 500);
  if (url && !/^https?:\/\//i.test(url)) return fail("O link do post precisa começar com https://");
  const n = {
    reach: num(fd, "reach"),
    likes: num(fd, "likes"),
    comments: num(fd, "comments"),
    shares: num(fd, "shares"),
    saves: num(fd, "saves"),
    leads: num(fd, "leads"),
  };
  if (Object.values(n).includes(undefined)) return fail("Use só números nos resultados.");
  const values = {
    day: d,
    format,
    title,
    url: url || null,
    reach: n.reach ?? null,
    likes: n.likes ?? null,
    comments: n.comments ?? null,
    shares: n.shares ?? null,
    saves: n.saves ?? null,
    leads: n.leads ?? null,
    note: t(fd, "note", 500),
  };
  const postId = t(fd, "postId", 40);
  if (postId) {
    await db.update(socialPosts).set(values).where(and(eq(socialPosts.id, postId), eq(socialPosts.accountId, account.id)));
  } else {
    await db.insert(socialPosts).values({ accountId: account.id, ...values });
  }
  revalidatePath(`/membros/negocio/${account.id}`);
  return { ok: postId ? "Post atualizado." : "Post registrado.", at: Date.now() };
}

export async function deletePostAction(fd: FormData) {
  const user = await member();
  const account = await getOwnedAccount(user.id, String(fd.get("accountId") ?? ""));
  if (!account) return;
  await db
    .delete(socialPosts)
    .where(and(eq(socialPosts.id, String(fd.get("id") ?? "")), eq(socialPosts.accountId, account.id)));
  revalidatePath(`/membros/negocio/${account.id}`);
}
