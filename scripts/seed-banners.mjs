// Cria banners FICTÍCIOS de exemplo (imagens em public/banners). Remova pelo painel quando houver reais.
// Pode rodar várias vezes: não duplica (confere pelo título).
// Uso: npm run seed:banners
import { config } from "dotenv";
import { neon } from "@neondatabase/serverless";

config({ path: ".env.local", quiet: true });
if (!process.env.DATABASE_URL) {
  console.error("DATABASE_URL não encontrada. Rode `vercel env pull` antes.");
  process.exit(1);
}
const sql = neon(process.env.DATABASE_URL);
const BANNERS = [
  { title: "[Exemplo] Campanha de vacinação", imageUrl: "/banners/vacinacao.svg", imageAlt: "Campanha de vacinação: postos abertos de segunda a sábado, das 8h às 17h", sortOrder: 1 },
  { title: "[Exemplo] Festival na Quebrada", imageUrl: "/banners/feira-cultural.svg", imageAlt: "Festival na Quebrada: shows, feira de artesanato e food trucks, grátis", sortOrder: 2 },
  { title: "[Exemplo] Empreenda na quebrada", imageUrl: "/banners/empreenda.svg", imageAlt: "Curso gratuito de gestão para pequenos negócios", sortOrder: 3 },
];
for (const b of BANNERS) {
  const [exists] = await sql`select id from banners where title = ${b.title}`;
  if (exists) { console.log(`já existia: ${b.title}`); continue; }
  await sql`insert into banners (title, image_url, image_alt, link_url, active, sort_order)
    values (${b.title}, ${b.imageUrl}, ${b.imageAlt}, ${null}, true, ${b.sortOrder})`;
  console.log(`criado: ${b.title}`);
}
