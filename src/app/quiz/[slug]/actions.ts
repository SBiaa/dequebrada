"use server";

import { and, eq } from "drizzle-orm";
import { db, schema } from "@/db";
import { sendEmail } from "@/lib/email";
import { cleanAnswers, parseSteps } from "@/lib/quiz";
import { siteUrl } from "@/lib/url";

export type LeadResult = { ok: true } | { ok: false; error: string };

export async function saveLeadAction(input: {
  slug: string;
  name: string;
  email: string;
  whatsapp: string;
  instagram: string;
  consent: boolean;
  answers: Record<string, unknown>;
}): Promise<LeadResult> {
  const [quiz] = await db
    .select()
    .from(schema.quizzes)
    .where(and(eq(schema.quizzes.slug, String(input.slug ?? "")), eq(schema.quizzes.published, true)))
    .limit(1);
  if (!quiz) return { ok: false, error: "Este quiz não está mais disponível." };

  const name = String(input.name ?? "").trim().slice(0, 120);
  const email = String(input.email ?? "").trim().toLowerCase().slice(0, 200);
  const whatsapp = String(input.whatsapp ?? "").replace(/\D/g, "").slice(0, 15);
  const instagram = String(input.instagram ?? "").trim().replace(/^@/, "").slice(0, 60);
  if (name.length < 2) return { ok: false, error: "Diga seu nome." };
  if (whatsapp.length < 10) return { ok: false, error: "Coloque o WhatsApp com DDD." };
  if (quiz.askEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return { ok: false, error: "E-mail inválido." };
  if (!input.consent) return { ok: false, error: "Precisamos do seu aceite para entrar em contato." };

  const answers = cleanAnswers(parseSteps(quiz.steps), input.answers ?? {});
  await db.insert(schema.leads).values({
    quizSlug: quiz.slug,
    quizTitle: quiz.title,
    name,
    email: quiz.askEmail ? email : "",
    whatsapp,
    instagram: quiz.askInstagram && instagram ? instagram : null,
    answers: JSON.stringify(answers),
    consentAt: new Date(),
  });

  // O lead já está salvo: se o aviso falhar, a pessoa não vê erro.
  try {
    await notifyLead({ quiz, name, email: quiz.askEmail ? email : "", whatsapp, instagram, answers });
  } catch (err) {
    console.error("Falha ao avisar novo lead", err);
  }
  return { ok: true };
}

/** Avisa por e-mail quem cuida dos leads (LEAD_NOTIFY_EMAIL, ou todos os admins). */
async function notifyLead(l: {
  quiz: { slug: string; title: string };
  name: string;
  email: string;
  whatsapp: string;
  instagram: string;
  answers: Record<string, string>;
}) {
  let to = (process.env.LEAD_NOTIFY_EMAIL ?? "")
    .split(",")
    .map((e) => e.trim())
    .filter(Boolean);
  if (to.length === 0) {
    const admins = await db
      .select({ email: schema.users.email })
      .from(schema.users)
      .where(eq(schema.users.role, "admin"));
    to = admins.map((a) => a.email);
  }
  if (to.length === 0) return;

  const lines = [
    `Novo lead no quiz "${l.quiz.title}".`,
    "",
    `Nome: ${l.name}`,
    `WhatsApp: ${l.whatsapp} (https://wa.me/${l.whatsapp.length <= 11 ? "55" : ""}${l.whatsapp})`,
    l.email ? `E-mail: ${l.email}` : null,
    l.instagram ? `Instagram: @${l.instagram}` : null,
    "",
    ...Object.entries(l.answers).map(([q, a]) => `• ${q}\n  ${a}`),
    "",
    `Ver no painel: ${siteUrl()}/painel/leads?quiz=${encodeURIComponent(l.quiz.slug)}`,
  ].filter((x) => x !== null);
  const text = lines.join("\n");
  await Promise.all(to.map((addr) => sendEmail(addr, `Novo lead: ${l.name} (${l.quiz.title})`, text)));
}
