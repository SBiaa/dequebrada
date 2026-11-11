// Cria ou atualiza a conta de administrador do painel.
// Uso: npm run admin:create   (pergunta e-mail, nome e senha)
// A senha é guardada só como hash argon2id.
import { createInterface } from "node:readline/promises";
import { stdin, stdout } from "node:process";
import { config } from "dotenv";
import { neon } from "@neondatabase/serverless";
import { hash } from "@node-rs/argon2";

config({ path: ".env.local" });
const url = process.env.DATABASE_URL;
if (!url) {
  console.error("DATABASE_URL não encontrada. Rode `vercel env pull` antes.");
  process.exit(1);
}

// Também aceita ADMIN_EMAIL, ADMIN_NAME e ADMIN_PASSWORD (útil em automação).
let { ADMIN_EMAIL: email = "", ADMIN_NAME: name = "", ADMIN_PASSWORD: password = "" } = process.env;
if (!email || !name || !password) {
  const rl = createInterface({ input: stdin, output: stdout });
  email = await rl.question("E-mail do admin: ");
  name = await rl.question("Nome que aparece nos posts: ");
  password = await rl.question("Senha (mínimo 8 caracteres): ");
  rl.close();
}
email = email.trim().toLowerCase();
name = name.trim();

if (!email.includes("@") || !name || password.length < 8) {
  console.error("Dados inválidos. Confira e-mail, nome e senha (mínimo 8 caracteres).");
  process.exit(1);
}

const sql = neon(url);
const passwordHash = await hash(password, { memoryCost: 19456, timeCost: 2, parallelism: 1 });
await sql`
  insert into users (email, name, password_hash, role, consent_at)
  values (${email}, ${name}, ${passwordHash}, 'admin', now())
  on conflict (email) do update set name = excluded.name, password_hash = excluded.password_hash, role = 'admin'
`;
console.log(`Pronto: ${email} é administrador do painel.`);
