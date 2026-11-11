// Cria as categorias do blog para as cidades do mapa (slug = id da cidade).
// Pode rodar várias vezes: categorias que já existem não são alteradas.
// Uso: npm run seed:categorias
import { config } from "dotenv";
import { neon } from "@neondatabase/serverless";
import { CITIES } from "../src/data/regiao.ts";

config({ path: ".env.local", quiet: true });
if (!process.env.DATABASE_URL) {
  console.error("DATABASE_URL não encontrada. Rode `vercel env pull` antes.");
  process.exit(1);
}
const sql = neon(process.env.DATABASE_URL);
for (const c of CITIES) {
  const rows = await sql`insert into categories (slug, name) values (${c.slug}, ${c.name})
    on conflict (slug) do nothing returning slug`;
  console.log(rows.length ? `criada: ${c.name}` : `já existia: ${c.name}`);
}
