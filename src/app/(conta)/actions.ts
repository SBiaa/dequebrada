"use server";

import { and, eq, gt, isNull } from "drizzle-orm";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { db, schema } from "@/db";
import {
  MIN_PASSWORD,
  clearFailedLogins,
  createSession,
  destroyAllSessions,
  destroySession,
  getCurrentUser,
  hashPassword,
  isRateLimited,
  newToken,
  normalizeEmail,
  recordFailedLogin,
  sha256,
  verifyAgainstDummy,
  verifyPassword,
} from "@/lib/auth";
import { sendEmail } from "@/lib/email";
import { siteUrl } from "@/lib/url";

const { users, passwordResets } = schema;

/** email: devolvido para o campo não ficar vazio depois de um erro. */
export type FormState = { error?: string; ok?: string; email?: string; name?: string; at?: number } | undefined;

const RESET_MINUTES = 60;

async function clientIp(): Promise<string> {
  const h = await headers();
  return h.get("x-forwarded-for")?.split(",")[0]?.trim() || h.get("x-real-ip") || "desconhecido";
}

/** Só aceita caminhos internos, para o ?next= não virar redirecionamento aberto. */
function safeNext(value: FormDataEntryValue | null): string | null {
  const v = typeof value === "string" ? value : "";
  return v.startsWith("/") && !v.startsWith("//") && !v.startsWith("/\\") ? v : null;
}

export async function loginAction(_: FormState, formData: FormData): Promise<FormState> {
  const email = normalizeEmail(String(formData.get("email") ?? ""));
  const password = String(formData.get("password") ?? "");
  if (!email || !password) return { error: "Preencha e-mail e senha." };

  const ip = await clientIp();
  if (await isRateLimited(email, ip)) {
    return { error: "Muitas tentativas. Aguarde 15 minutos e tente de novo.", email };
  }

  const [user] = await db.select().from(users).where(eq(users.email, email)).limit(1);
  const valid = user ? await verifyPassword(user.passwordHash, password) : (await verifyAgainstDummy(password), false);

  if (!user || !valid) {
    await recordFailedLogin(email, ip);
    return { error: "E-mail ou senha incorretos.", email };
  }

  await clearFailedLogins(email);
  await createSession(user.id);
  redirect(safeNext(formData.get("next")) ?? (user.role === "admin" ? "/painel" : "/membros"));
}

export async function logoutAction(): Promise<void> {
  await destroySession();
  redirect("/");
}

export async function requestResetAction(_: FormState, formData: FormData): Promise<FormState> {
  const email = normalizeEmail(String(formData.get("email") ?? ""));
  const done: FormState = {
    ok: "Se esse e-mail tiver cadastro, enviamos um link para criar uma nova senha. Ele vale por 1 hora.",
  };
  if (!email.includes("@")) return { error: "Digite um e-mail válido." };

  const ip = await clientIp();
  if (await isRateLimited(email, ip)) return done;
  await recordFailedLogin(email, ip); // conta como tentativa, para limitar abuso de envio

  const [user] = await db.select({ id: users.id }).from(users).where(eq(users.email, email)).limit(1);
  if (!user) return done;

  const token = newToken();
  await db.insert(passwordResets).values({
    tokenHash: sha256(token),
    userId: user.id,
    expiresAt: new Date(Date.now() + RESET_MINUTES * 60 * 1000),
  });
  const link = `${siteUrl()}/redefinir-senha?token=${token}`;
  await sendEmail(
    email,
    "Crie uma nova senha · De Quebrada",
    `Oi! Recebemos um pedido para criar uma nova senha no site do De Quebrada.\n\nAbra o link abaixo (vale por 1 hora e só pode ser usado uma vez):\n${link}\n\nSe não foi você, ignore este e-mail. Sua senha continua a mesma.`,
  );
  return done;
}

export async function resetPasswordAction(_: FormState, formData: FormData): Promise<FormState> {
  const token = String(formData.get("token") ?? "");
  const password = String(formData.get("password") ?? "");
  const confirm = String(formData.get("confirm") ?? "");

  if (password.length < MIN_PASSWORD) {
    return { error: `A senha precisa ter pelo menos ${MIN_PASSWORD} caracteres.` };
  }
  if (password !== confirm) return { error: "As senhas não são iguais." };

  const [reset] = await db
    .select()
    .from(passwordResets)
    .where(
      and(
        eq(passwordResets.tokenHash, sha256(token)),
        isNull(passwordResets.usedAt),
        gt(passwordResets.expiresAt, new Date()),
      ),
    )
    .limit(1);
  if (!reset) return { error: "Este link expirou ou já foi usado. Peça um novo." };

  await db.update(users).set({ passwordHash: await hashPassword(password) }).where(eq(users.id, reset.userId));
  await db.update(passwordResets).set({ usedAt: new Date() }).where(eq(passwordResets.tokenHash, reset.tokenHash));
  await destroyAllSessions(reset.userId);
  redirect("/entrar?senha=alterada");
}

export async function signupAction(_: FormState, formData: FormData): Promise<FormState> {
  const name = String(formData.get("name") ?? "").trim().slice(0, 100);
  const email = normalizeEmail(String(formData.get("email") ?? "")).slice(0, 200);
  const password = String(formData.get("password") ?? "");
  const confirm = String(formData.get("confirm") ?? "");
  const consent = formData.get("consent") === "on";
  const keep = { email, name, at: Date.now() };

  if (!name) return { error: "Escreva seu nome.", ...keep };
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return { error: "Digite um e-mail válido.", ...keep };
  if (password.length < MIN_PASSWORD) {
    return { error: `A senha precisa ter pelo menos ${MIN_PASSWORD} caracteres.`, ...keep };
  }
  if (password !== confirm) return { error: "As senhas não são iguais.", ...keep };
  if (!consent) {
    return { error: "Para criar a conta, você precisa aceitar a Política de Privacidade.", ...keep };
  }

  const ip = await clientIp();
  if (await isRateLimited(`cadastro:${ip}`, ip)) {
    return { error: "Muitas tentativas. Aguarde 15 minutos e tente de novo.", ...keep };
  }
  await recordFailedLogin(`cadastro:${ip}`, ip); // limita criação de contas em massa

  const [exists] = await db.select({ id: users.id }).from(users).where(eq(users.email, email)).limit(1);
  if (exists) {
    return { error: "Já existe uma conta com esse e-mail. Entre ou use \"Esqueci minha senha\".", ...keep };
  }

  const [user] = await db
    .insert(users)
    .values({ name, email, passwordHash: await hashPassword(password), role: "member", consentAt: new Date() })
    .returning({ id: users.id });
  await createSession(user.id);
  redirect("/membros?bemvindo=1");
}

/** LGPD: a pessoa apaga a própria conta e os dados ligados a ela. */
export async function deleteAccountAction(_: FormState, formData: FormData): Promise<FormState> {
  const current = await getCurrentUser();
  if (!current) redirect("/entrar?next=/conta");
  if (current.role === "admin") {
    return { error: "A conta de administrador não pode ser excluída por aqui. Fale com a Ace Lab." };
  }
  const password = String(formData.get("password") ?? "");
  const [user] = await db.select().from(users).where(eq(users.id, current.id)).limit(1);
  if (!user || !(await verifyPassword(user.passwordHash, password))) {
    return { error: "Senha incorreta." };
  }
  // Sessões e links de nova senha são apagados em cascata.
  await db.delete(users).where(eq(users.id, user.id));
  await destroySession();
  redirect("/?conta=excluida");
}
