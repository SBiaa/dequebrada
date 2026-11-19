import Link from "next/link";
import { asc, desc } from "drizzle-orm";
import { db, schema } from "@/db";
import { PRODUCT_CATEGORIES, formatPrice } from "@/data/products";
import { Icon } from "@/components/ui/Icon";

const { products } = schema;

const STATUS = [
  { id: "", label: "Todos" },
  { id: "loja", label: "Na loja" },
  { id: "escondidos", label: "Escondidos" },
] as const;
type StatusId = (typeof STATUS)[number]["id"];

export default async function ProdutosPage({ searchParams }: PageProps<"/painel/produtos">) {
  const sp = await searchParams;
  const st: StatusId = STATUS.some((s) => s.id === sp.status) ? (sp.status as StatusId) : "";
  const cat = typeof sp.cat === "string" && PRODUCT_CATEGORIES.some((c) => c.slug === sp.cat) ? sp.cat : "";

  const all = await db
    .select({
      id: products.id,
      name: products.name,
      category: products.category,
      priceCents: products.priceCents,
      imageUrl: products.imageUrl,
      available: products.available,
      buyType: products.buyType,
      variantOptions: products.variantOptions,
    })
    .from(products)
    .orderBy(asc(products.sortOrder), desc(products.createdAt));

  const byStatus = (s: StatusId) => (p: (typeof all)[number]) =>
    s === "loja" ? p.available : s === "escondidos" ? !p.available : true;
  const inStatus = all.filter(byStatus(st));
  const rows = inStatus.filter((p) => !cat || p.category === cat);

  const href = (next: { status?: string; cat?: string }) => {
    const q = new URLSearchParams();
    const s = next.status ?? st;
    const c = next.cat ?? cat;
    if (s) q.set("status", s);
    if (c) q.set("cat", c);
    const qs = q.toString();
    return qs ? `/painel/produtos?${qs}` : "/painel/produtos";
  };
  const chip = (active: boolean) =>
    `inline-flex min-h-9 items-center rounded-full px-3 text-sm ${
      active ? "bg-ink font-semibold text-bg" : "border border-line text-muted hover:text-ink"
    }`;

  return (
    <>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="h2-section">Produtos da loja</h1>
          <p className="mt-2 text-muted">
            O que aparece em{" "}
            <Link href="/loja" target="_blank" className="text-accent hover:underline">
              /loja<span className="sr-only"> (abre em nova aba)</span>
            </Link>
            . Produto escondido fica salvo aqui, mas some da loja.
          </p>
        </div>
        <Link href="/painel/produtos/novo" className="btn btn-primary">
          + Novo produto
        </Link>
      </div>

      {sp.excluido && (
        <p role="status" className="mt-6 rounded-lg border border-accent/50 bg-accent/10 px-4 py-3">
          Produto excluído.
        </p>
      )}

      {all.length > 0 && (
        <div className="mt-8 space-y-3">
          <nav aria-label="Filtrar por status" className="flex flex-wrap gap-2">
            {STATUS.map((s) => (
              <Link
                key={s.id || "todos"}
                href={href({ status: s.id })}
                aria-current={st === s.id ? "page" : undefined}
                className={chip(st === s.id)}
              >
                {s.label} · {all.filter(byStatus(s.id)).length}
              </Link>
            ))}
          </nav>
          <nav aria-label="Filtrar por categoria" className="flex flex-wrap items-center gap-2">
            <span className="text-sm text-muted">Categoria:</span>
            {[{ slug: "", name: "Todas" }, ...PRODUCT_CATEGORIES].map((c) => {
              const n = c.slug ? inStatus.filter((p) => p.category === c.slug).length : inStatus.length;
              if (c.slug && n === 0) return null;
              return (
                <Link
                  key={c.slug || "todas"}
                  href={href({ cat: c.slug })}
                  aria-current={cat === c.slug ? "page" : undefined}
                  className={chip(cat === c.slug)}
                >
                  {c.name} · {n}
                </Link>
              );
            })}
          </nav>
        </div>
      )}

      {all.length === 0 ? (
        <div className="mt-10 rounded-xl border border-dashed border-line p-8 text-center">
          <p className="text-lg font-semibold">Nenhum produto ainda</p>
          <p className="mx-auto mt-2 max-w-md text-muted">
            Cadastre canecas, camisetas ou equipamentos. O cliente compra pelo WhatsApp ou por um link seu.
          </p>
          <Link href="/painel/produtos/novo" className="btn btn-primary mt-6">
            Cadastrar o primeiro
          </Link>
        </div>
      ) : rows.length === 0 ? (
        <p className="mt-8 rounded-xl border border-line bg-surface p-6 text-muted">Nenhum produto nesse filtro.</p>
      ) : (
        <ul className="mt-6 grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
          {rows.map((p) => (
            <li key={p.id}>
              <Link
                href={`/painel/produtos/${p.id}`}
                className={`group flex h-full flex-col overflow-hidden rounded-xl border bg-surface transition hover:border-accent ${
                  p.available ? "border-line" : "border-dashed border-line"
                }`}
              >
                <div className="relative aspect-square bg-white">
                  {p.imageUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={p.imageUrl}
                      alt=""
                      loading="lazy"
                      className={`h-full w-full object-contain p-3 ${p.available ? "" : "opacity-50 grayscale"}`}
                    />
                  ) : (
                    <span className="flex h-full flex-col items-center justify-center gap-1 bg-surface-2 text-sm text-muted">
                      <Icon name="camera" className="h-8 w-8" />
                      Sem foto
                    </span>
                  )}
                  <span
                    className={`absolute left-2 top-2 rounded-full px-2.5 py-0.5 text-xs font-bold uppercase tracking-wider ${
                      p.available ? "bg-accent text-accent-ink" : "bg-ink text-bg"
                    }`}
                  >
                    {p.available ? "Na loja" : "Escondido"}
                  </span>
                </div>
                <div className="flex flex-1 flex-col p-3">
                  <p className="text-xs text-muted">
                    {PRODUCT_CATEGORIES.find((c) => c.slug === p.category)?.name ?? p.category}
                  </p>
                  <p className="mt-0.5 font-semibold leading-snug group-hover:text-accent [overflow-wrap:anywhere]">
                    {p.name}
                  </p>
                  <p className="mt-auto pt-2 text-lg font-bold">{formatPrice(p.priceCents)}</p>
                  <p className="text-xs text-muted">
                    {p.buyType === "whatsapp" ? "Venda pelo WhatsApp" : "Link externo"}
                    {p.variantOptions?.length ? ` · ${p.variantOptions.length} opções` : ""}
                  </p>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
