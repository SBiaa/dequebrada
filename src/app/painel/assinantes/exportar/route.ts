import { desc, eq } from "drizzle-orm";
import { db, schema } from "@/db";
import { requireAdmin } from "@/lib/auth";
import { csvDate, csvResponse } from "@/lib/painel";

const { users } = schema;

/** Baixa as contas de membros em CSV (?f=ativo só assinantes, ?f=gratis só contas grátis). */
export async function GET(req: Request) {
  await requireAdmin("/painel/assinantes");
  const f = new URL(req.url).searchParams.get("f");
  const rows = await db
    .select({ name: users.name, email: users.email, isSubscriber: users.isSubscriber, createdAt: users.createdAt })
    .from(users)
    .where(eq(users.role, "member"))
    .orderBy(desc(users.createdAt));
  const list = f === "ativo" ? rows.filter((u) => u.isSubscriber) : f === "gratis" ? rows.filter((u) => !u.isSubscriber) : rows;

  const day = new Date().toISOString().slice(0, 10);
  return csvResponse(
    `contas-${f === "ativo" ? "assinantes" : f === "gratis" ? "gratis" : "todas"}-${day}.csv`,
    ["Nome", "E-mail", "Situação", "Conta criada em"],
    list.map((u) => [u.name, u.email, u.isSubscriber ? "Assinante" : "Conta grátis", csvDate(u.createdAt)]),
  );
}
