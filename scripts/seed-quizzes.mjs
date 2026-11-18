// Cria os quizzes iniciais (estúdio e participe do podcast), já publicados.
// Pode rodar várias vezes: quizzes que já existem não são alterados.
// Uso: npm run seed:quizzes
import { config } from "dotenv";
import { neon } from "@neondatabase/serverless";
import { QUIZ_SEEDS } from "../src/data/quiz.ts";

config({ path: ".env.local", quiet: true });
if (!process.env.DATABASE_URL) {
  console.error("DATABASE_URL não encontrada. Rode `vercel env pull` antes.");
  process.exit(1);
}
const sql = neon(process.env.DATABASE_URL);
for (const q of QUIZ_SEEDS) {
  const rows = await sql`insert into quizzes
    (slug, title, eyebrow, intro, cta_label, steps, contact_title, ask_email, ask_instagram, final_title, final_text, published)
    values (${q.slug}, ${q.title}, ${q.eyebrow}, ${q.intro}, ${q.ctaLabel}, ${JSON.stringify(q.steps)},
      ${q.contactTitle}, ${q.askEmail}, ${q.askInstagram}, ${q.finalTitle}, ${q.finalText}, true)
    on conflict (slug) do nothing returning slug`;
  console.log(rows.length ? `criado: ${q.slug}` : `já existia: ${q.slug}`);
}
