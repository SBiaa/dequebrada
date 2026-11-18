"use server";

import { and, eq, ne } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { db, schema } from "@/db";
import { requireAdmin } from "@/lib/auth";
import { slugify } from "@/lib/blog";
import { parseSteps, stepProblems } from "@/lib/quiz";

const { quizzes } = schema;

export type QuizFormState = { error?: string; ok?: string; at?: number } | undefined;

function t(fd: FormData, key: string, max: number) {
  return String(fd.get(key) ?? "").trim().slice(0, max);
}

export async function saveQuizAction(_prev: QuizFormState, fd: FormData): Promise<QuizFormState> {
  await requireAdmin();
  const id = t(fd, "id", 40);
  const title = t(fd, "title", 200);
  const slug = slugify(t(fd, "slug", 80) || title);
  const steps = parseSteps(t(fd, "steps", 60000));

  if (!title) return { error: "Dê um título ao quiz.", at: Date.now() };
  if (!slug) return { error: "Endereço inválido.", at: Date.now() };
  const problem = stepProblems(steps);
  if (problem) return { error: problem, at: Date.now() };

  const [clash] = await db
    .select({ id: quizzes.id })
    .from(quizzes)
    .where(id ? and(eq(quizzes.slug, slug), ne(quizzes.id, id)) : eq(quizzes.slug, slug))
    .limit(1);
  if (clash) return { error: `Já existe um quiz com o endereço /quiz/${slug}.`, at: Date.now() };

  const values = {
    title,
    slug,
    eyebrow: t(fd, "eyebrow", 120),
    intro: t(fd, "intro", 2000),
    ctaLabel: t(fd, "ctaLabel", 60) || "Começar",
    steps: JSON.stringify(steps),
    contactTitle: t(fd, "contactTitle", 200) || "Como podemos falar com você?",
    askEmail: fd.get("askEmail") === "on",
    askInstagram: fd.get("askInstagram") === "on",
    finalTitle: t(fd, "finalTitle", 120) || "Recebemos!",
    finalText: t(fd, "finalText", 1000),
    published: fd.get("published") === "on",
    updatedAt: new Date(),
  };

  let savedId = id;
  if (id) {
    await db.update(quizzes).set(values).where(eq(quizzes.id, id));
  } else {
    const [row] = await db.insert(quizzes).values(values).returning({ id: quizzes.id });
    savedId = row.id;
  }
  revalidatePath("/painel/quizzes");
  revalidatePath(`/quiz/${slug}`);
  if (!id) redirect(`/painel/quizzes/${savedId}?salvo=1`);
  return { ok: values.published ? `Salvo e no ar em /quiz/${slug}.` : "Salvo como rascunho (fora do ar).", at: Date.now() };
}

export async function deleteQuizAction(fd: FormData) {
  await requireAdmin();
  const id = String(fd.get("id") ?? "");
  await db.delete(quizzes).where(eq(quizzes.id, id));
  revalidatePath("/painel/quizzes");
  redirect("/painel/quizzes");
}
