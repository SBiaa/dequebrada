import { canSeeExclusive, getCurrentUser } from "@/lib/auth";
import { getDownloadableFile } from "@/lib/members";

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/** Download de arquivo exclusivo: só para assinante logado. */
export async function GET(_req: Request, ctx: RouteContext<"/membros/arquivo/[id]">) {
  const { id } = await ctx.params;
  const user = await getCurrentUser();
  if (!canSeeExclusive(user)) {
    return new Response("Acesso só para assinantes.", { status: 403 });
  }
  if (!UUID.test(id)) return new Response("Arquivo não encontrado.", { status: 404 });
  const file = await getDownloadableFile(id);
  if (!file) return new Response("Arquivo não encontrado.", { status: 404 });

  const safeName = file.name.replace(/[^\w.\- ]+/g, "_");
  return new Response(new Uint8Array(file.data), {
    headers: {
      "Content-Type": file.mime,
      "Content-Disposition": `attachment; filename="${safeName}"; filename*=UTF-8''${encodeURIComponent(file.name)}`,
      "Cache-Control": "private, no-store",
      "X-Content-Type-Options": "nosniff",
    },
  });
}
