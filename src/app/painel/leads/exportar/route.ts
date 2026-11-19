import { desc, eq } from "drizzle-orm";
import { db, schema } from "@/db";
import { requireAdmin } from "@/lib/auth";
import { csvDate, csvResponse } from "@/lib/painel";

const { leads } = schema;

/** Baixa os leads em CSV. Respeita o filtro de quiz da tela (?quiz=slug). */
export async function GET(req: Request) {
  await requireAdmin("/painel/leads");
  const quiz = new URL(req.url).searchParams.get("quiz") ?? "";
  const rows = await db
    .select()
    .from(leads)
    .where(quiz ? eq(leads.quizSlug, quiz) : undefined)
    .orderBy(desc(leads.createdAt));

  const answersText = (raw: string) => {
    try {
      return Object.entries(JSON.parse(raw) as Record<string, string>)
        .map(([q, a]) => `${q}: ${a}`)
        .join(" | ");
    } catch {
      return "";
    }
  };

  const day = new Date().toISOString().slice(0, 10);
  return csvResponse(
    `leads-${quiz || "todos"}-${day}.csv`,
    ["Data", "Nome", "WhatsApp", "E-mail", "Instagram", "Quiz", "Andamento", "Respostas"],
    rows.map((l) => [
      csvDate(l.createdAt),
      l.name,
      l.whatsapp,
      l.email,
      l.instagram ? `@${l.instagram}` : "",
      l.quizTitle,
      l.status,
      answersText(l.answers),
    ]),
  );
}
