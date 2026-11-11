import "server-only";
import { createHash, randomBytes } from "node:crypto";
import { hash, verify } from "@node-rs/argon2";
import { and, eq, gt, lt } from "drizzle-orm";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { cache } from "react";
import { db, schema } from "@/db";

const { users, sessions, loginAttempts } = schema;

export const SESSION_COOKIE = "dq_session";
const SESSION_DAYS = 30;
/** Bloqueio: 5 erros por e-mail ou 20 por IP em 15 minutos. */
const WINDOW_MS = 15 * 60 * 1000;
const MAX_PER_EMAIL = 5;
const MAX_PER_IP = 20;

export const MIN_PASSWORD = 8;

export function sha256(value: string): string {
  return createHash("sha256").update(value).digest("hex");
}

export function newToken(): string {
  return randomBytes(32).toString("base64url");
}

export function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

export async function hashPassword(password: string): Promise<string> {
  // argon2id com os parâmetros recomendados pela OWASP.
  return hash(password, { memoryCost: 19456, timeCost: 2, parallelism: 1 });
}

export async function verifyPassword(passwordHash: string, password: string): Promise<boolean> {
  try {
    return await verify(passwordHash, password);
  } catch {
    return false;
  }
}

/** Hash fixo usado quando o e-mail não existe, para o tempo de resposta não denunciar contas. */
let dummyHash: string | null = null;
export async function verifyAgainstDummy(password: string): Promise<void> {
  dummyHash ??= await hashPassword("senha-inexistente-para-tempo-constante");
  await verifyPassword(dummyHash, password);
}

// ---------- Limite de tentativas ----------

export async function isRateLimited(email: string, ip: string): Promise<boolean> {
  const since = new Date(Date.now() - WINDOW_MS);
  const [byEmail, byIp] = await Promise.all([
    db.$count(loginAttempts, and(eq(loginAttempts.key, `email:${email}`), gt(loginAttempts.createdAt, since))),
    db.$count(loginAttempts, and(eq(loginAttempts.key, `ip:${ip}`), gt(loginAttempts.createdAt, since))),
  ]);
  return byEmail >= MAX_PER_EMAIL || byIp >= MAX_PER_IP;
}

export async function recordFailedLogin(email: string, ip: string): Promise<void> {
  await db.insert(loginAttempts).values([{ key: `email:${email}` }, { key: `ip:${ip}` }]);
  // Limpeza simples de registros antigos.
  await db.delete(loginAttempts).where(lt(loginAttempts.createdAt, new Date(Date.now() - 24 * 3600 * 1000)));
}

export async function clearFailedLogins(email: string): Promise<void> {
  await db.delete(loginAttempts).where(eq(loginAttempts.key, `email:${email}`));
}

// ---------- Sessão ----------

export async function createSession(userId: string): Promise<void> {
  const token = newToken();
  const expiresAt = new Date(Date.now() + SESSION_DAYS * 24 * 3600 * 1000);
  await db.insert(sessions).values({ id: sha256(token), userId, expiresAt });
  const jar = await cookies();
  jar.set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    expires: expiresAt,
  });
}

export async function destroySession(): Promise<void> {
  const jar = await cookies();
  const token = jar.get(SESSION_COOKIE)?.value;
  if (token) await db.delete(sessions).where(eq(sessions.id, sha256(token)));
  jar.delete(SESSION_COOKIE);
}

export type SessionUser = Pick<
  typeof users.$inferSelect,
  "id" | "email" | "name" | "role" | "isSubscriber"
>;

/** Usuário logado (validado no banco a cada requisição). */
export const getCurrentUser = cache(async (): Promise<SessionUser | null> => {
  const token = (await cookies()).get(SESSION_COOKIE)?.value;
  if (!token) return null;
  const rows = await db
    .select({
      id: users.id,
      email: users.email,
      name: users.name,
      role: users.role,
      isSubscriber: users.isSubscriber,
      expiresAt: sessions.expiresAt,
    })
    .from(sessions)
    .innerJoin(users, eq(sessions.userId, users.id))
    .where(eq(sessions.id, sha256(token)))
    .limit(1);
  const row = rows[0];
  if (!row || row.expiresAt.getTime() < Date.now()) return null;
  return { id: row.id, email: row.email, name: row.name, role: row.role, isSubscriber: row.isSubscriber };
});

/** Use no topo de páginas e em toda Server Action do painel. */
export async function requireAdmin(nextPath = "/painel"): Promise<SessionUser> {
  const user = await getCurrentUser();
  if (!user) redirect(`/entrar?next=${encodeURIComponent(nextPath)}`);
  if (user.role !== "admin") redirect("/");
  return user;
}

/** Qualquer conta logada (episódios, minha conta). */
export async function requireUser(nextPath: string): Promise<SessionUser> {
  const user = await getCurrentUser();
  if (!user) redirect(`/entrar?next=${encodeURIComponent(nextPath)}`);
  return user;
}

/** Assinante liberado pelo admin (o admin também tem acesso). */
export function canSeeExclusive(user: SessionUser | null): boolean {
  return !!user && (user.isSubscriber || user.role === "admin");
}

/** Apaga todas as sessões de um usuário (após troca de senha). */
export async function destroyAllSessions(userId: string): Promise<void> {
  await db.delete(sessions).where(eq(sessions.userId, userId));
}
