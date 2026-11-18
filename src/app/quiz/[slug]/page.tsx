import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { and, eq } from "drizzle-orm";
import { db, schema } from "@/db";
import { parseSteps } from "@/lib/quiz";
import { QuizRunner } from "@/components/quiz/QuizRunner";

async function getQuiz(slug: string) {
  const [quiz] = await db
    .select()
    .from(schema.quizzes)
    .where(and(eq(schema.quizzes.slug, slug), eq(schema.quizzes.published, true)))
    .limit(1);
  return quiz;
}

export async function generateMetadata({ params }: PageProps<"/quiz/[slug]">): Promise<Metadata> {
  const quiz = await getQuiz((await params).slug);
  if (!quiz) return {};
  return { title: quiz.title, description: quiz.intro || quiz.title };
}

export default async function QuizPage({ params }: PageProps<"/quiz/[slug]">) {
  const quiz = await getQuiz((await params).slug);
  if (!quiz) notFound();
  return (
    <div className="px-5 py-12 md:py-20">
      <div className="mx-auto max-w-xl">
        <QuizRunner
          quiz={{
            slug: quiz.slug,
            title: quiz.title,
            eyebrow: quiz.eyebrow,
            intro: quiz.intro,
            ctaLabel: quiz.ctaLabel,
            steps: parseSteps(quiz.steps),
            contactTitle: quiz.contactTitle,
            askEmail: quiz.askEmail,
            askInstagram: quiz.askInstagram,
            finalTitle: quiz.finalTitle,
            finalText: quiz.finalText,
          }}
        />
      </div>
    </div>
  );
}
