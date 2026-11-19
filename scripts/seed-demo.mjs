// Popula o banco com dados de DEMONSTRAÇÃO para o Carlos ver o painel "vivo".
// - Posts: copiados do site oficial (dequebrada.com/blog), em scripts/demo-posts.json.
// - Leads, assinantes, redes sociais, loja e conteúdos exclusivos: FICTÍCIOS (marcados como exemplo).
// Pode rodar várias vezes: não duplica. Para limpar depois: npm run seed:demo -- --limpar
// Uso: npm run seed:demo
import { readFileSync } from "node:fs";
import { config } from "dotenv";
import { neon } from "@neondatabase/serverless";

config({ path: ".env.local", quiet: true });
if (!process.env.DATABASE_URL) {
  console.error("DATABASE_URL não encontrada. Rode `vercel env pull` antes.");
  process.exit(1);
}
const sql = neon(process.env.DATABASE_URL);
const slugify = (t) =>
  t.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 80);
const minutes = (md) => Math.max(1, Math.round(md.trim().split(/\s+/).length / 200));
const daysAgo = (n) => new Date(Date.now() - n * 86400000);
const isoDay = (n) => daysAgo(n).toISOString().slice(0, 10);
// Pseudo-aleatório determinístico: rodar de novo gera os mesmos números.
let seed = 42;
const rnd = () => ((seed = (seed * 1664525 + 1013904223) % 4294967296) / 4294967296);
const between = (a, b) => Math.round(a + rnd() * (b - a));

const DEMO_EMAIL = "@demo.dequebrada.example";

if (process.argv.includes("--limpar")) {
  await sql`delete from leads where email like ${"%" + DEMO_EMAIL}`;
  await sql`delete from users where email like ${"%" + DEMO_EMAIL}`;
  await sql`delete from products where sku like 'DEMO-%'`;
  await sql`delete from member_contents where slug like 'demo-%'`;
  await sql`delete from posts where body like '%Fonte: [dequebrada.com](%'`;
  console.log("Dados de demonstração removidos (as redes do Carlos ficam; apague pelo painel).");
  process.exit(0);
}

// ---------- Posts (reais, do site oficial) ----------
const cats = Object.fromEntries((await sql`select id, slug from categories`).map((c) => [c.slug, c.id]));
const posts = JSON.parse(readFileSync(new URL("./demo-posts.json", import.meta.url), "utf8"));
let novos = 0;
for (const p of posts) {
  const body = `${p.body}\n\n*Fonte: [dequebrada.com](${p.src})*`;
  const rows = await sql`insert into posts
    (slug, title, excerpt, body, cover_url, cover_alt, category_id, author_name, status, reading_minutes, published_at, created_at, updated_at)
    values (${slugify(p.title)}, ${p.title}, ${p.excerpt}, ${body}, ${p.cover}, ${p.title}, ${cats[p.cat] ?? null},
      ${"Redação De Quebrada"}, 'published', ${minutes(body)}, ${p.date}, ${p.date}, ${p.date})
    on conflict (slug) do nothing returning id`;
  novos += rows.length;
}
console.log(`posts: ${novos} novos de ${posts.length}`);

// ---------- Assinantes e membros (fictícios) ----------
// Hash inválido de propósito: essas contas não conseguem entrar, só aparecem na lista.
const NO_LOGIN = "$demo$sem-login";
const MEMBROS = [
  ["Aline Souza", "aline.souza", true, 40], ["Bruno Almeida", "bruno.almeida", true, 33],
  ["Camila Ferreira", "camila.ferreira", true, 27], ["Diego Santos", "diego.santos", false, 21],
  ["Eduarda Lima", "eduarda.lima", true, 18], ["Felipe Rocha", "felipe.rocha", false, 12],
  ["Gabriela Nunes", "gabriela.nunes", true, 9], ["Henrique Costa", "henrique.costa", false, 5],
  ["Isabela Martins", "isabela.martins", false, 3], ["João Pedro Alves", "joao.alves", true, 1],
];
for (const [name, user, sub, ago] of MEMBROS) {
  await sql`insert into users (email, name, password_hash, role, is_subscriber, consent_at, created_at)
    values (${user + DEMO_EMAIL}, ${name}, ${NO_LOGIN}, 'member', ${sub}, ${daysAgo(ago)}, ${daysAgo(ago)})
    on conflict (email) do nothing`;
}
console.log(`membros: ${MEMBROS.length} (${MEMBROS.filter((m) => m[2]).length} assinantes)`);

// ---------- Leads (fictícios) ----------
const LEADS = [
  ["Marcos Vinícius", "estudio", "Monte sua gravação em 1 minuto", "novo", 0, "oempreendedor_marcos"],
  ["Patrícia Gomes", "participe", "Garanta sua vaga no De Quebrada Podcast", "novo", 1, "patigomes.oficial"],
  ["Rafael Tavares", "estudio", "Monte sua gravação em 1 minuto", "novo", 1, null],
  ["Larissa Prado", "estudio", "Monte sua gravação em 1 minuto", "contatado", 3, "larissaprado.bolos"],
  ["Thiago Moreira", "participe", "Garanta sua vaga no De Quebrada Podcast", "contatado", 4, "thiagomoreira.barber"],
  ["Juliana Batista", "estudio", "Monte sua gravação em 1 minuto", "contatado", 6, null],
  ["Anderson Silva", "estudio", "Monte sua gravação em 1 minuto", "fechado", 9, "andersonsilva.mkt"],
  ["Renata Oliveira", "participe", "Garanta sua vaga no De Quebrada Podcast", "fechado", 12, "renata.oliveira.moda"],
  ["Carlos Eduardo", "estudio", "Monte sua gravação em 1 minuto", "fechado", 15, null],
  ["Vanessa Duarte", "participe", "Garanta sua vaga no De Quebrada Podcast", "perdido", 11, "vanessaduarte.nails"],
  ["Lucas Pereira", "estudio", "Monte sua gravação em 1 minuto", "perdido", 17, null],
  ["Sabrina Melo", "participe", "Garanta sua vaga no De Quebrada Podcast", "contatado", 2, "sabrinamelo.fit"],
];
const RESP = {
  estudio: [
    { "O que você quer gravar?": "Podcast", "Quantas pessoas vão participar?": "2 a 3", "Quando quer gravar?": "Neste mês" },
    { "O que você quer gravar?": "Vídeo para redes sociais", "Quantas pessoas vão participar?": "1", "Quando quer gravar?": "Ainda estou vendo" },
    { "O que você quer gravar?": "Entrevista", "Quantas pessoas vão participar?": "4 ou mais", "Quando quer gravar?": "Esta semana" },
  ],
  participe: [
    { "Qual é o seu negócio?": "Loja de roupas", "Cidade": "Ferraz de Vasconcelos", "Como conheceu o podcast?": "Instagram" },
    { "Qual é o seu negócio?": "Barbearia", "Cidade": "Poá", "Como conheceu o podcast?": "Indicação de amigo" },
    { "Qual é o seu negócio?": "Confeitaria", "Cidade": "Suzano", "Como conheceu o podcast?": "YouTube" },
  ],
};
let i = 0;
for (const [name, quizSlug, quizTitle, status, ago, insta] of LEADS) {
  const email = slugify(name).replace(/-/g, ".") + DEMO_EMAIL;
  const whats = `11 9${String(5000 + i * 137).padStart(4, "0")}-${String(1000 + i * 211).slice(0, 4)}`;
  const [exists] = await sql`select id from leads where email = ${email}`;
  const answers = JSON.stringify(RESP[quizSlug][i % 3]);
  i++;
  if (exists) continue;
  const when = daysAgo(ago);
  await sql`insert into leads (quiz_slug, quiz_title, name, email, whatsapp, instagram, answers, status, consent_at, created_at)
    values (${quizSlug}, ${quizTitle}, ${name}, ${email}, ${whats}, ${insta}, ${answers}, ${status}, ${when}, ${when})`;
}
console.log(`leads: ${LEADS.length}`);

// ---------- Redes do Carlos (números fictícios, só para demonstração) ----------
const [carlos] = await sql`select id from users where role = 'admin' and email = 'carlos@admin.com'`;
if (carlos) {
  let [biz] = await sql`select id from businesses where user_id = ${carlos.id}`;
  if (!biz) [biz] = await sql`insert into businesses (user_id, name, segment, city, description)
    values (${carlos.id}, 'De Quebrada', 'Mídia e comunicação', 'Ferraz de Vasconcelos', 'Portal de notícias, podcast e estúdio da região do Alto Tietê.') returning id`;
  else await sql`update businesses set name = 'De Quebrada', segment = 'Mídia e comunicação', city = 'Ferraz de Vasconcelos',
    description = 'Portal de notícias, podcast e estúdio da região do Alto Tietê.' where id = ${biz.id}`;
  // O perfil de teste "insta" é trocado pelos perfis reais do Carlos.
  await sql`delete from social_accounts where business_id = ${biz.id} and handle = 'insta'`;

  const REDES = [
    { network: "instagram", handle: "dequebradapodcast", base: 48200, growth: 38, reach: [9000, 26000] },
    { network: "instagram", handle: "estudiodequebrada", base: 7300, growth: 12, reach: [1800, 6500] },
    { network: "instagram", handle: "oempreendedordequebrada", base: 15600, growth: 21, reach: [3500, 11000] },
    { network: "youtube", handle: "dequebradapodcast", base: 21400, growth: 16, reach: [6000, 19000] },
  ];
  const FORMATOS = ["Reels / vídeo curto", "Carrossel", "Foto", "Vídeo longo", "Stories"];
  const TITULOS = [
    "Corte: como ele saiu do zero e abriu a loja na quebrada", "Bastidores da gravação com a prefeitura",
    "3 erros que todo pequeno negócio comete no Instagram", "Episódio completo: empreender sem dinheiro",
    "Resumo da semana no Alto Tietê", "Convite: venha gravar no estúdio",
  ];
  for (const r of REDES) {
    let [acc] = await sql`select id from social_accounts where business_id = ${biz.id} and network = ${r.network} and handle = ${r.handle}`;
    if (!acc) [acc] = await sql`insert into social_accounts (business_id, network, handle) values (${biz.id}, ${r.network}, ${r.handle}) returning id`;
    for (let d = 59; d >= 0; d -= 2) {
      const followers = Math.round(r.base - d * r.growth + between(-25, 25));
      await sql`insert into social_snapshots (account_id, day, followers, reach, profile_visits, link_clicks, note)
        values (${acc.id}, ${isoDay(d)}, ${followers}, ${between(...r.reach)}, ${between(300, 2400)}, ${between(20, 260)}, ${""})
        on conflict (account_id, day) do nothing`;
    }
    for (let k = 0; k < 6; k++) {
      const day = isoDay(3 + k * 9);
      const [dup] = await sql`select id from social_posts where account_id = ${acc.id} and day = ${day}`;
      if (dup) continue;
      const reach = between(...r.reach);
      await sql`insert into social_posts (account_id, day, format, title, reach, likes, comments, shares, saves, leads, note)
        values (${acc.id}, ${day}, ${FORMATOS[(k + r.handle.length) % FORMATOS.length]}, ${TITULOS[k % TITULOS.length]}, ${reach},
          ${Math.round(reach * 0.07)}, ${Math.round(reach * 0.008)}, ${Math.round(reach * 0.012)}, ${Math.round(reach * 0.015)}, ${between(0, 9)}, ${""})`;
    }
  }
  console.log(`redes: ${REDES.length} perfis com 30 lançamentos e 6 posts cada`);
}

// ---------- Loja (fictícia) ----------
const PRODUTOS = [
  ["DEMO-CAM-01", "Camiseta De Quebrada Preta", "camisetas", "Algodão penteado, estampa frontal com o logo do podcast.", 8990, "Tamanho", ["P", "M", "G", "GG"], 1],
  ["DEMO-CAM-02", "Camiseta Alto Tietê", "camisetas", "Estampa com o mapa da região. Edição limitada.", 8990, "Tamanho", ["P", "M", "G", "GG"], 2],
  ["DEMO-CAN-01", "Caneca De Quebrada", "canecas", "Porcelana 325 ml, vai ao micro-ondas e à lava-louças.", 3990, null, null, 3],
  ["DEMO-MIC-01", "Microfone Dinâmico para Podcast", "microfones", "Mesmo modelo usado no estúdio. Cabo XLR incluso.", 34900, null, null, 4],
  ["DEMO-EST-01", "Kit Home Studio", "estudio-e-escritorio", "Braço articulado, pop filter e suporte antivibração.", null, null, null, 5],
];
for (const [sku, name, category, description, price, vl, vo, order] of PRODUTOS) {
  await sql`insert into products (sku, name, category, description, price_cents, variant_label, variant_options, buy_type, available, sort_order)
    values (${sku}, ${name}, ${category}, ${description}, ${price}, ${vl}, ${vo}, 'whatsapp', true, ${order})
    on conflict (sku) do nothing`;
}
console.log(`loja: ${PRODUTOS.length} produtos de exemplo`);

// ---------- Conteúdos exclusivos (links reais do site) ----------
const CONTEUDOS = [
  ["demo-bastidores-podcast", "Bastidores do De Quebrada Podcast", "Como é gravar um episódio, do convite à edição.", "https://www.dequebrada.com/blog"],
  ["demo-guia-presenca-digital", "Guia: presença digital para pequenos negócios", "Passo a passo para organizar Instagram, Google e WhatsApp.", "https://www.dequebrada.com/blog"],
  ["demo-agenda-eventos", "Agenda de eventos do Alto Tietê", "Calendário com feiras, editais e eventos da região.", "https://www.dequebrada.com/blog"],
];
for (const [slug, title, description, url] of CONTEUDOS) {
  await sql`insert into member_contents (slug, title, description, kind, external_url, published)
    values (${slug}, ${title}, ${description}, 'link', ${url}, true) on conflict (slug) do nothing`;
}
console.log(`conteúdos exclusivos: ${CONTEUDOS.length}`);
