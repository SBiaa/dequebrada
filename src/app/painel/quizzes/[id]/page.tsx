import Link from "next/link";
import { notFound } from "next/navigation";
import { count, eq } from "drizzle-orm";
import { db, schema } from "@/db";
import { parseSteps } from "@/lib/quiz";
import { ConfirmDelete } from "@/components/negocio/ui";
import { deleteQuizAction } from "../../quizzes-actions";
import { QuizEditor } from "../QuizEditor";

const UUID = /^[0-9a-f-]{36}$/i;

export default async function EditarQuizPage({ params, searchParams }: PageProps<"/painel/quizzes/[id]">) {
  const { id } = await params;
  const sp = await searchParams;
  if (!UUID.test(id)) notFound();
  const [q] = await db.select().from(schema.quizzes).where(eq(schema.quizzes.id, id)).limit(1);
  if (!q) notFound();
  const [{ n }] = await db.select({ n: count() }).from(schema.leads).where(eq(schema.leads.quizSlug, q.slug));

  return (
    <>
      <Link href="/painel/quizzes" className="text-sm text-muted hover:text-ink">
        ← Quizzes
      </Link>
      <h1 className="h2-section mb-6 mt-2 [overflow-wrap:anywhere]">{q.title}</h1>
      <QuizEditor
        notice={sp.salvo ? "Quiz criado." : undefined}
        leads={n}
        values={{ ...q, steps: parseSteps(q.steps) }}
      />
      <div className="mt-12 flex flex-wrap items-center justify-between gap-3 border-t border-line pt-6">
        <p className="text-sm text-muted">Apagar o quiz tira ele do ar. Os leads que já chegaram continuam salvos.</p>
        <ConfirmDelete
          action={deleteQuizAction}
          fields={{ id: q.id }}
          label="Apagar quiz"
          warning={`Apagar "${q.title}"? Não dá para desfazer.`}
          confirmLabel="Sim, apagar quiz"
        />
      </div>
    </>
  );
}
