import {
  boolean,
  date,
  customType,
  index,
  integer,
  pgTable,
  serial,
  text,
  timestamp,
  uniqueIndex,
  uuid,
} from "drizzle-orm/pg-core";

/** Contas: admin (Carlos) e, na fase 5, assinantes. */
export const users = pgTable("users", {
  id: uuid("id").primaryKey().defaultRandom(),
  email: text("email").notNull().unique(),
  name: text("name").notNull(),
  /** Hash argon2id. A senha nunca é guardada em texto. */
  passwordHash: text("password_hash").notNull(),
  role: text("role", { enum: ["admin", "member"] }).notNull().default("member"),
  /** Liberação manual de assinante (fase 5). */
  isSubscriber: boolean("is_subscriber").notNull().default(false),
  /** Aceite da política de privacidade (LGPD). */
  consentAt: timestamp("consent_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

/** Sessões de login. O id é o hash SHA-256 do token que vai no cookie. */
export const sessions = pgTable(
  "sessions",
  {
    id: text("id").primaryKey(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
  },
  (t) => [index("sessions_user_idx").on(t.userId)],
);

/** Links de "esqueci minha senha". Guardamos só o hash do token. */
export const passwordResets = pgTable("password_resets", {
  tokenHash: text("token_hash").primaryKey(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
  usedAt: timestamp("used_at", { withTimezone: true }),
});

/** Tentativas de login com erro, para bloquear força bruta. */
export const loginAttempts = pgTable(
  "login_attempts",
  {
    id: serial("id").primaryKey(),
    key: text("key").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [index("login_attempts_key_idx").on(t.key, t.createdAt)],
);

export const categories = pgTable("categories", {
  id: serial("id").primaryKey(),
  slug: text("slug").notNull().unique(),
  name: text("name").notNull(),
});

export const posts = pgTable(
  "posts",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    slug: text("slug").notNull().unique(),
    title: text("title").notNull(),
    excerpt: text("excerpt").notNull(),
    /** Corpo em Markdown. */
    body: text("body").notNull(),
    coverUrl: text("cover_url"),
    coverAlt: text("cover_alt"),
    categoryId: integer("category_id").references(() => categories.id, { onDelete: "set null" }),
    authorName: text("author_name").notNull(),
    status: text("status", { enum: ["draft", "published"] }).notNull().default("draft"),
    readingMinutes: integer("reading_minutes").notNull().default(1),
    publishedAt: timestamp("published_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [index("posts_status_published_idx").on(t.status, t.publishedAt)],
);

export type User = typeof users.$inferSelect;
export type Post = typeof posts.$inferSelect;
export type Category = typeof categories.$inferSelect;

/** Bytes de arquivo (PDF) guardados no banco: só saem por rota que confere a assinatura. */
const bytea = customType<{ data: Buffer; driverData: string | Buffer }>({
  dataType: () => "bytea",
  // O driver HTTP do Neon trafega bytea como texto hexadecimal ("\x...").
  toDriver: (value) => `\\x${value.toString("hex")}`,
  fromDriver: (value) =>
    Buffer.isBuffer(value) ? value : Buffer.from(String(value).replace(/^\\x/, ""), "hex"),
});

/** Arquivos exclusivos de assinantes (PDF até 4 MB). */
export const memberFiles = pgTable("member_files", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(),
  mime: text("mime").notNull(),
  size: integer("size").notNull(),
  data: bytea("data").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

/** Conteúdos exclusivos (vídeos, aulas, PDFs, links), cadastrados pelo painel. */
export const memberContents = pgTable("member_contents", {
  id: uuid("id").primaryKey().defaultRandom(),
  slug: text("slug").notNull().unique(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  kind: text("kind", { enum: ["video", "aula", "pdf", "link"] }).notNull(),
  /** ID do vídeo no YouTube (pode ser "não listado"). */
  youtubeId: text("youtube_id"),
  externalUrl: text("external_url"),
  fileId: uuid("file_id").references(() => memberFiles.id, { onDelete: "set null" }),
  published: boolean("published").notNull().default(false),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export type MemberContent = typeof memberContents.$inferSelect;

/** Produtos da loja (/loja), cadastrados pelo painel. Categorias ficam em src/data/products.ts. */
export const products = pgTable(
  "products",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    sku: text("sku").notNull().unique(),
    name: text("name").notNull(),
    category: text("category").notNull(),
    description: text("description").notNull(),
    /** Preço em centavos. null = "sob consulta". */
    priceCents: integer("price_cents"),
    /** Ex.: "Tamanho" + "P, M, G, GG". */
    variantLabel: text("variant_label"),
    variantOptions: text("variant_options").array(),
    imageUrl: text("image_url"),
    imageAlt: text("image_alt"),
    buyType: text("buy_type", { enum: ["whatsapp", "external"] }).notNull().default("whatsapp"),
    buyUrl: text("buy_url"),
    buyLabel: text("buy_label"),
    /** false esconde da loja sem apagar. */
    available: boolean("available").notNull().default(true),
    sortOrder: integer("sort_order").notNull().default(0),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [index("products_available_idx").on(t.available, t.sortOrder)],
);

export type ProductRow = typeof products.$inferSelect;

/**
 * Quizzes de captação (/quiz/[slug]), editáveis no painel.
 * `steps` é JSON com a lista de passos (ver src/lib/quiz.ts).
 */
export const quizzes = pgTable("quizzes", {
  id: uuid("id").primaryKey().defaultRandom(),
  slug: text("slug").notNull().unique(),
  title: text("title").notNull(),
  eyebrow: text("eyebrow").notNull().default(""),
  /** Texto da capa. Vazio = o quiz começa direto na primeira pergunta. */
  intro: text("intro").notNull().default(""),
  ctaLabel: text("cta_label").notNull().default("Começar"),
  steps: text("steps").notNull().default("[]"),
  contactTitle: text("contact_title").notNull().default("Como podemos falar com você?"),
  askEmail: boolean("ask_email").notNull().default(true),
  askInstagram: boolean("ask_instagram").notNull().default(false),
  finalTitle: text("final_title").notNull().default("Recebemos!"),
  finalText: text("final_text").notNull().default("A gente vai te chamar no WhatsApp em breve."),
  published: boolean("published").notNull().default(false),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export type QuizRow = typeof quizzes.$inferSelect;

/** Leads que vêm dos quizzes. */
export const leads = pgTable(
  "leads",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    /** Slug do quiz de origem (fica mesmo se o quiz for apagado). */
    quizSlug: text("quiz_slug").notNull().default("estudio"),
    quizTitle: text("quiz_title").notNull().default("Monte sua gravação"),
    name: text("name").notNull(),
    email: text("email").notNull().default(""),
    whatsapp: text("whatsapp").notNull(),
    instagram: text("instagram"),
    /** Respostas do quiz: { pergunta: resposta }. */
    answers: text("answers").notNull(),
    status: text("status", { enum: ["novo", "contatado", "fechado", "perdido"] }).notNull().default("novo"),
    consentAt: timestamp("consent_at", { withTimezone: true }).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [index("leads_created_idx").on(t.createdAt)],
);

export type Lead = typeof leads.$inferSelect;

/** Negócio do membro (um por conta), cadastrado em /membros/negocio. */
export const businesses = pgTable("businesses", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id")
    .notNull()
    .unique()
    .references(() => users.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  segment: text("segment").notNull().default(""),
  city: text("city").notNull().default(""),
  description: text("description").notNull().default(""),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

/** Perfis do negócio nas redes sociais. */
export const socialAccounts = pgTable(
  "social_accounts",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    businessId: uuid("business_id")
      .notNull()
      .references(() => businesses.id, { onDelete: "cascade" }),
    network: text("network").notNull(),
    handle: text("handle").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [index("social_accounts_business_idx").on(t.businessId)],
);

/** Números do perfil num dia (lançados à mão). Um registro por perfil por dia. */
export const socialSnapshots = pgTable(
  "social_snapshots",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    accountId: uuid("account_id")
      .notNull()
      .references(() => socialAccounts.id, { onDelete: "cascade" }),
    day: date("day", { mode: "string" }).notNull(),
    followers: integer("followers").notNull(),
    reach: integer("reach"),
    profileVisits: integer("profile_visits"),
    linkClicks: integer("link_clicks"),
    note: text("note").notNull().default(""),
  },
  (t) => [uniqueIndex("social_snapshots_account_day_idx").on(t.accountId, t.day)],
);

/** Posts publicados e seus resultados (lançados à mão). */
export const socialPosts = pgTable(
  "social_posts",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    accountId: uuid("account_id")
      .notNull()
      .references(() => socialAccounts.id, { onDelete: "cascade" }),
    day: date("day", { mode: "string" }).notNull(),
    format: text("format").notNull(),
    title: text("title").notNull(),
    url: text("url"),
    reach: integer("reach"),
    likes: integer("likes"),
    comments: integer("comments"),
    shares: integer("shares"),
    saves: integer("saves"),
    /** Contatos, pedidos ou vendas que vieram do post. */
    leads: integer("leads"),
    note: text("note").notNull().default(""),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [index("social_posts_account_day_idx").on(t.accountId, t.day)],
);

export type SocialAccount = typeof socialAccounts.$inferSelect;
export type SocialSnapshot = typeof socialSnapshots.$inferSelect;
export type SocialPost = typeof socialPosts.$inferSelect;

/**
 * Banners da home (parcerias com prefeituras e outros), enviados pelo painel.
 * Aparece quando `active` e dentro do período (início/fim opcionais, inclusive).
 */
export const banners = pgTable(
  "banners",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    /** Nome interno (ex.: "Prefeitura de Poá, Campanha vacinação"). Não aparece no site. */
    title: text("title").notNull(),
    imageUrl: text("image_url").notNull(),
    imageAlt: text("image_alt").notNull(),
    /** Link ao clicar. null = banner sem link. */
    linkUrl: text("link_url"),
    active: boolean("active").notNull().default(true),
    startsAt: date("starts_at", { mode: "string" }),
    endsAt: date("ends_at", { mode: "string" }),
    sortOrder: integer("sort_order").notNull().default(0),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [index("banners_active_idx").on(t.active, t.sortOrder)],
);

export type BannerRow = typeof banners.$inferSelect;
