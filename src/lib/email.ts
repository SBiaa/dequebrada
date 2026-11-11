import "server-only";

/**
 * Envio de e-mail via API do Resend (sem SDK).
 * Sem RESEND_API_KEY e EMAIL_FROM, o e-mail não é enviado: o conteúdo vai para o log do servidor
 * (útil em desenvolvimento). Em produção, configure as duas variáveis.
 */
export async function sendEmail(to: string, subject: string, text: string): Promise<void> {
  const key = process.env.RESEND_API_KEY;
  const from = process.env.EMAIL_FROM;
  if (!key || !from) {
    console.warn(`[e-mail não configurado] Para: ${to} | ${subject}\n${text}`);
    return;
  }
  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
    body: JSON.stringify({ from, to, subject, text }),
  });
  if (!res.ok) {
    console.error("Falha ao enviar e-mail", res.status, await res.text());
  }
}
