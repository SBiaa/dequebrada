"use server";

import { and, eq } from "drizzle-orm";
import { db, schema } from "@/db";
import { cleanAnswers, parseSteps } from "@/lib/quiz";

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

  await db.insert(schema.leads).values({
    quizSlug: quiz.slug,
    quizTitle: quiz.title,
    name,
    email: quiz.askEmail ? email : "",
    whatsapp,
    instagram: quiz.askInstagram && instagram ? instagram : null,
    answers: JSON.stringify(cleanAnswers(parseSteps(quiz.steps), input.answers ?? {})),
    consentAt: new Date(),
  });
  return { ok: true };
}
