import { notFound } from "next/navigation";
import { eq } from "drizzle-orm";
import { db, schema } from "@/db";
import { deleteBannerAction } from "../../banners-actions";
import { BannerForm } from "../BannerForm";

const { banners } = schema;
const UUID = /^[0-9a-f-]{36}$/i;

export default async function EditarBannerPage({ params, searchParams }: PageProps<"/painel/banners/[id]">) {
  const { id } = await params;
  const sp = await searchParams;
  if (!UUID.test(id)) notFound();
  const [b] = await db.select().from(banners).where(eq(banners.id, id)).limit(1);
  if (!b) notFound();

  const notice =
    sp.salvo === "no-ar"
      ? "Salvo e no ar na home (dentro do período)."
      : sp.salvo === "oculto"
        ? "Salvo, escondido da home."
        : undefined;

  return (
    <>
      <h1 className="h2-section mb-8">Editar banner</h1>
      <BannerForm
        notice={notice}
        values={{
          id: b.id,
          title: b.title,
          imageAlt: b.imageAlt,
          linkUrl: b.linkUrl ?? "",
          startsAt: b.startsAt ?? "",
          endsAt: b.endsAt ?? "",
          sortOrder: String(b.sortOrder),
          imageUrl: b.imageUrl,
          active: b.active,
        }}
      />
      <details className="mt-12 w-fit rounded-xl border border-red-400/40 p-4">
        <summary className="cursor-pointer font-semibold text-red-300">Excluir banner</summary>
        <p className="mt-3 text-sm text-muted">
          Apaga o banner e a imagem. Não dá para desfazer. Para tirar só por um tempo, use &quot;esconder&quot;.
        </p>
        <form action={deleteBannerAction} className="mt-3">
          <input type="hidden" name="id" value={b.id} />
          <button type="submit" className="btn border-red-400/60 text-red-200 hover:bg-red-500/10">
            Sim, excluir para sempre
          </button>
        </form>
      </details>
    </>
  );
}
