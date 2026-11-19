import { getCurrentUser } from "@/lib/auth";

export const dynamic = "force-dynamic";

/** Diz só se há alguém logado (membro ou admin). Não expõe dados do usuário. */
export async function GET() {
  const user = await getCurrentUser();
  return Response.json({ logged: Boolean(user) }, { headers: { "Cache-Control": "no-store" } });
}
