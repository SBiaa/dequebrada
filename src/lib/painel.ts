import { and, count, desc, eq, gte } from "drizzle-orm";
import { db, schema } from "@/db";

const { users, leads, posts } = schema;

/** Contas criadas nos últimos N dias e ainda sem assinatura entram na fila "Liberar acesso". */
export const PENDING_DAYS = 14;

function daysAgo(n: number): Date {
  return new Date(Date.now() - n * 24 * 60 * 60 * 1000);
}

/** Contas criadas a partir desta data ainda contam como "esperando liberação". */
export function pendingSince(): Date {
  return daysAgo(PENDING_DAYS);
}

const pendingWhere = () =>
  and(eq(users.role, "member"), eq(users.isSubscriber, false), gte(users.createdAt, daysAgo(PENDING_DAYS)));

/** Contadores do menu lateral. */
export async function painelBadges() {
  const [[acesso], [novos]] = await Promise.all([
    db.select({ n: count() }).from(users).where(pendingWhere()),
    db.select({ n: count() }).from(leads).where(eq(leads.status, "novo")),
  ]);
  return { assinantes: acesso.n, leads: novos.n };
}

/** Itens da fila do Início. */
export async function painelQueue() {
  const [pendentes, leadsNovos, rascunhos] = await Promise.all([
    db
      .select({ id: users.id, name: users.name, email: users.email, createdAt: users.createdAt })
      .from(users)
      .where(pendingWhere())
      .orderBy(desc(users.createdAt)),
    db
      .select({
        id: leads.id,
        name: leads.name,
        whatsapp: leads.whatsapp,
        quizTitle: leads.quizTitle,
        createdAt: leads.createdAt,
      })
      .from(leads)
      .where(eq(leads.status, "novo"))
      .orderBy(desc(leads.createdAt)),
    db
      .select({ id: posts.id, title: posts.title, updatedAt: posts.updatedAt })
      .from(posts)
      .where(eq(posts.status, "draft"))
      .orderBy(desc(posts.updatedAt)),
  ]);
  return { pendentes, leadsNovos, rascunhos };
}

/** Números do mês corrente. */
export async function painelStats() {
  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const [[publicados], [ativos], [leadsMes]] = await Promise.all([
    db
      .select({ n: count() })
      .from(posts)
      .where(and(eq(posts.status, "published"), gte(posts.publishedAt, monthStart))),
    db
      .select({ n: count() })
      .from(users)
      .where(and(eq(users.role, "member"), eq(users.isSubscriber, true))),
    db.select({ n: count() }).from(leads).where(gte(leads.createdAt, monthStart)),
  ]);
  return { publicados: publicados.n, ativos: ativos.n, leadsMes: leadsMes.n };
}

/** Link do WhatsApp com mensagem pronta para o lead. */
export function leadWhatsAppLink(phone: string, name: string, quizTitle: string): string {
  const full = phone.length <= 11 ? `55${phone}` : phone;
  const msg = `Oi, ${name.split(" ")[0]}! Aqui é do De Quebrada, vi que você respondeu o nosso quiz "${quizTitle}".`;
  return `https://wa.me/${full}?text=${encodeURIComponent(msg)}`;
}

/** "há 2 h", "ontem", "12 nov". */
export function tempoRelativo(d: Date): string {
  const diff = Date.now() - d.getTime();
  const h = Math.floor(diff / 3_600_000);
  if (h < 1) return "agora há pouco";
  if (h < 24) return `há ${h} h`;
  const dias = Math.floor(h / 24);
  if (dias === 1) return "ontem";
  if (dias < 7) return `há ${dias} dias`;
  return d.toLocaleDateString("pt-BR", { day: "numeric", month: "short", timeZone: "America/Sao_Paulo" });
}
