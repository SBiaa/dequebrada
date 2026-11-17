import Link from "next/link";
import { notFound } from "next/navigation";
import { eq } from "drizzle-orm";
import { db, schema } from "@/db";
import { deleteProductAction } from "../../produtos-actions";
import { ProductForm } from "../ProductForm";

const { products } = schema;
const UUID = /^[0-9a-f-]{36}$/i;

export default async function EditarProdutoPage({ params, searchParams }: PageProps<"/painel/produtos/[id]">) {
  const { id } = await params;
  const sp = await searchParams;
  if (!UUID.test(id)) notFound();
  const [p] = await db.select().from(products).where(eq(products.id, id)).limit(1);
  if (!p) notFound();

  const notice =
    sp.salvo === "na-loja" ? "Salvo e visível na loja." : sp.salvo === "oculto" ? "Salvo, escondido da loja." : undefined;

  return (
    <>
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <h1 className="h2-section">Editar produto</h1>
        {p.available && (
          <Link href={`/loja?categoria=${p.category}`} className="btn btn-ghost !min-h-10 !text-sm" target="_blank">
            Ver na loja <span className="sr-only">(abre em nova aba)</span>
          </Link>
        )}
      </div>
      <ProductForm
        notice={notice}
        values={{
          id: p.id,
          name: p.name,
          sku: p.sku,
          category: p.category,
          description: p.description,
          price: p.priceCents === null ? "" : (p.priceCents / 100).toFixed(2).replace(".", ","),
          variantLabel: p.variantLabel ?? "",
          variantOptions: (p.variantOptions ?? []).join(", "),
          imageAlt: p.imageAlt ?? "",
          imageUrl: p.imageUrl,
          buyType: p.buyType,
          buyUrl: p.buyUrl ?? "",
          buyLabel: p.buyLabel ?? "",
          sortOrder: String(p.sortOrder),
          available: p.available,
        }}
      />
      <details className="mt-12 w-fit rounded-xl border border-red-400/40 p-4">
        <summary className="cursor-pointer font-semibold text-red-300">Excluir produto</summary>
        <p className="mt-3 text-sm text-muted">
          Apaga o produto e a foto. Não dá para desfazer. Para tirar da loja só por um tempo, use &quot;esconder&quot;.
        </p>
        <form action={deleteProductAction} className="mt-3">
          <input type="hidden" name="id" value={p.id} />
          <button type="submit" className="btn border-red-400/60 text-red-200 hover:bg-red-500/10">
            Sim, excluir para sempre
          </button>
        </form>
      </details>
    </>
  );
}
