import { and, count, desc, eq, gt, gte, lt, lte } from "drizzle-orm";
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

/** Números do Início: mês corrente, últimos 7 dias contra os 7 anteriores, e leads por quiz no mês. */
export async function painelStats() {
  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const week = daysAgo(7);
  const prevWeek = daysAgo(14);
  const n = (rows: { n: number }[]) => rows[0]?.n ?? 0;
  const [publicados, agendados, ativos, contas7, contasAnt, leads7, leadsAnt, leadsMes, fechadosMes, porQuiz] =
    await Promise.all([
      db
        .select({ n: count() })
        .from(posts)
        .where(and(eq(posts.status, "published"), gte(posts.publishedAt, monthStart), lte(posts.publishedAt, now))),
      db
        .select({ n: count() })
        .from(posts)
        .where(and(eq(posts.status, "published"), gt(posts.publishedAt, now))),
      db
        .select({ n: count() })
        .from(users)
        .where(and(eq(users.role, "member"), eq(users.isSubscriber, true))),
      db.select({ n: count() }).from(users).where(and(eq(users.role, "member"), gte(users.createdAt, week))),
      db
        .select({ n: count() })
        .from(users)
        .where(and(eq(users.role, "member"), gte(users.createdAt, prevWeek), lt(users.createdAt, week))),
      db.select({ n: count() }).from(leads).where(gte(leads.createdAt, week)),
      db.select({ n: count() }).from(leads).where(and(gte(leads.createdAt, prevWeek), lt(leads.createdAt, week))),
      db.select({ n: count() }).from(leads).where(gte(leads.createdAt, monthStart)),
      db
        .select({ n: count() })
        .from(leads)
        .where(and(gte(leads.createdAt, monthStart), eq(leads.status, "fechado"))),
      db
        .select({ title: leads.quizTitle, n: count() })
        .from(leads)
        .where(gte(leads.createdAt, monthStart))
        .groupBy(leads.quizTitle)
        .orderBy(desc(count())),
    ]);
  return {
    publicados: n(publicados),
    agendados: n(agendados),
    ativos: n(ativos),
    contas7: n(contas7),
    contasAnt: n(contasAnt),
    leads7: n(leads7),
    leadsAnt: n(leadsAnt),
    leadsMes: n(leadsMes),
    fechadosMes: n(fechadosMes),
    porQuiz,
  };
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

/** Date -> "AAAA-MM-DDTHH:mm" no horário de Brasília (valor do campo datetime-local). */
export function toScheduleInput(d: Date): string {
  return new Date(d.getTime() - 3 * 3_600_000).toISOString().slice(0, 16);
}

/** "21 de nov., 09:00" no horário de Brasília. */
export function scheduleLabel(d: Date | null): string {
  if (!d) return "";
  return d.toLocaleString("pt-BR", {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "America/Sao_Paulo",
  });
}

/**
 * Planilha CSV que abre certa no Excel em português: separador ";", BOM UTF-8 para os acentos
 * e proteção contra fórmula (célula começando com = + - @ vira texto).
 */
export function csvResponse(filename: string, header: string[], rows: (string | number | null)[][]): Response {
  const cell = (v: string | number | null) => {
    let s = v === null ? "" : String(v);
    if (/^[=+\-@\t\r]/.test(s)) s = `'${s}`;
    return /[";\n\r]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
  };
  const body = [header, ...rows].map((r) => r.map(cell).join(";")).join("\r\n");
  return new Response(`﻿${body}\r\n`, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${filename}"`,
      "Cache-Control": "no-store",
    },
  });
}

/** Data e hora de Brasília para planilha: "19/11/2026 14:05". */
export function csvDate(d: Date | null): string {
  if (!d) return "";
  return d.toLocaleString("pt-BR", { timeZone: "America/Sao_Paulo", dateStyle: "short", timeStyle: "short" });
}
