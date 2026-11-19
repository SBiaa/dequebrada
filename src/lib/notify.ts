import "server-only";
import { eq } from "drizzle-orm";
import { db, schema } from "@/db";
import { sendEmail } from "@/lib/email";

/**
 * Manda um aviso para quem cuida do painel: LEAD_NOTIFY_EMAIL (lista separada por vírgula)
 * ou, sem ela, todos os admins. Nunca lança erro: o aviso não pode atrapalhar quem está no site.
 */
export async function notifyAdmins(subject: string, text: string): Promise<void> {
  try {
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
    await Promise.all(to.map((addr) => sendEmail(addr, subject, text)));
  } catch (err) {
    console.error("Falha ao enviar aviso ao painel", err);
  }
}
