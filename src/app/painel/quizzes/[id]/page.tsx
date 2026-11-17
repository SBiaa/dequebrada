import { notFound } from "next/navigation";
import { eq } from "drizzle-orm";
import { db, schema } from "@/db";
import { parseSteps } from "@/lib/quiz";
import { deleteQuizAction } from "../../quizzes-actions";
import { QuizEditor } from "../QuizEditor";

const UUID = /^[0-9a-f-]{36}$/i;

export default async function EditarQuizPage({ params, searchParams }: PageProps<"/painel/quizzes/[id]">) {
  const { id } = await params;
  const sp = await searchParams;
  if (!UUID.test(id)) notFound();
  const [q] = await db.select().from(schema.quizzes).where(eq(schema.quizzes.id, id)).limit(1);
  if (!q) notFound();

  return (
    <>
      <h1 className="h2-section mb-8">Editar quiz</h1>
      <QuizEditor
        notice={sp.salvo ? "Quiz criado." : undefined}
        values={{ ...q, steps: parseSteps(q.steps) }}
      />
      <form action={deleteQuizAction} className="mt-12 border-t border-line pt-6">
        <input type="hidden" name="id" value={q.id} />
        <p className="text-sm text-muted">Apagar o quiz tira ele do ar. Os leads que já chegaram continuam salvos.</p>
        <button type="submit" className="btn btn-ghost mt-3 !min-h-10 !text-sm">
          Apagar quiz
        </button>
      </form>
    </>
  );
}
