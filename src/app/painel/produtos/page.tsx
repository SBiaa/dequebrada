import Link from "next/link";
import { asc, desc } from "drizzle-orm";
import { db, schema } from "@/db";
import { PRODUCT_CATEGORIES, formatPrice } from "@/data/products";

const { products } = schema;

export default async function ProdutosPage({ searchParams }: PageProps<"/painel/produtos">) {
  const sp = await searchParams;
  const rows = await db
    .select({
      id: products.id,
      name: products.name,
      category: products.category,
      priceCents: products.priceCents,
      imageUrl: products.imageUrl,
      available: products.available,
    })
    .from(products)
    .orderBy(asc(products.sortOrder), desc(products.createdAt));

  return (
    <>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <h1 className="h2-section">Produtos da loja</h1>
        <Link href="/painel/produtos/novo" className="btn btn-primary">
          Novo produto
        </Link>
      </div>
      <p className="mt-3 text-muted">O que aparece em /loja. Produto escondido fica salvo aqui, mas some da loja.</p>
      {sp.excluido && (
        <p role="status" className="mt-6 rounded-lg border border-accent/50 bg-accent/10 px-4 py-3">
          Produto excluído.
        </p>
      )}
      {rows.length === 0 ? (
        <p className="mt-10 text-lg text-muted">Nenhum produto ainda.</p>
      ) : (
        <ul className="mt-8 divide-y divide-line rounded-xl border border-line bg-surface">
          {rows.map((p) => (
            <li key={p.id} className="flex items-center gap-4 p-4">
              {p.imageUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={p.imageUrl} alt="" className="h-14 w-14 shrink-0 rounded-md border border-line bg-white object-contain" />
              ) : (
                <div className="h-14 w-14 shrink-0 rounded-md border border-dashed border-line bg-surface-2" />
              )}
              <div className="min-w-0 flex-1">
                <Link href={`/painel/produtos/${p.id}`} className="font-semibold hover:text-accent">
                  {p.name}
                </Link>
                <p className="text-sm text-muted">
                  {PRODUCT_CATEGORIES.find((c) => c.slug === p.category)?.name ?? p.category} · {formatPrice(p.priceCents)}
                </p>
              </div>
              <span
                className={`shrink-0 rounded-full px-3 py-1 text-xs font-bold uppercase tracking-wider ${
                  p.available ? "bg-accent text-accent-ink" : "border border-line text-muted"
                }`}
              >
                {p.available ? "Na loja" : "Escondido"}
              </span>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
