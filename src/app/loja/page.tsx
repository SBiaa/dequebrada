import type { Metadata } from "next";
import Link from "next/link";
import { BuyBox } from "@/components/shop/BuyBox";
import { Marked } from "@/components/ui/Marked";
import { PageHero } from "@/components/ui/PageHero";
import { Section } from "@/components/ui/Section";
import { WhatsAppButton } from "@/components/ui/WhatsAppButton";
import { PRODUCT_CATEGORIES, PRODUCTS, formatPrice, type Product } from "@/data/products";
import { stagger } from "@/lib/motion";
import { WHATSAPP_MESSAGES } from "@/lib/site";

export async function generateMetadata({ searchParams }: PageProps<"/loja">): Promise<Metadata> {
  const { categoria } = await searchParams;
  const cat = PRODUCT_CATEGORIES.find((c) => c.slug === categoria);
  return {
    title: cat ? `${cat.name} · Loja De Quebrada` : "Loja De Quebrada: Canecas, Camisetas e Itens de Estúdio",
    description:
      "Canecas, camisetas, microfones, itens de estúdio e escritório e eletrônicos do De Quebrada, de Ferraz de Vasconcelos. Compre pelo WhatsApp.",
    alternates: { canonical: cat ? `/loja?categoria=${cat.slug}` : "/loja" },
  };
}

const chip =
  "block rounded-full border border-line px-4 py-2 text-sm font-semibold hover:border-accent aria-[current=page]:border-accent aria-[current=page]:bg-accent aria-[current=page]:text-accent-ink";

function ProductCard({ product }: { product: Product }) {
  const price = formatPrice(product.priceCents);
  const category = PRODUCT_CATEGORIES.find((c) => c.slug === product.category);
  return (
    <article className="flex h-full flex-col overflow-hidden rounded-xl border border-line bg-surface">
      {product.image ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={product.image.src}
          alt={product.image.alt}
          loading="lazy"
          className="aspect-square w-full bg-white object-contain"
        />
      ) : (
        <div
          role="img"
          aria-label={`Espaço reservado para a foto de ${product.name}`}
          className="flex aspect-square items-center justify-center border-b border-line bg-surface-2"
        >
          <span className="rounded border border-dashed border-warn-line bg-warn-bg px-2 py-0.5 text-sm font-semibold text-warn">
            [FOTO DO PRODUTO]
          </span>
        </div>
      )}
      <div className="flex flex-1 flex-col p-5">
        {category && <p className="eyebrow">{category.name}</p>}
        <h3 className="mt-2 text-lg font-bold leading-snug">
          <Marked>{product.name}</Marked>
        </h3>
        <p className="mt-2 flex-1 text-muted">
          <Marked>{product.description}</Marked>
        </p>
        <p className="mt-4 text-2xl font-bold">
          <Marked>{price}</Marked>
        </p>
        <BuyBox
          sku={product.sku}
          name={product.name}
          price={price}
          buy={product.buy}
          variants={product.variants}
        />
      </div>
    </article>
  );
}

export default async function LojaPage({ searchParams }: PageProps<"/loja">) {
  const sp = await searchParams;
  const active = PRODUCT_CATEGORIES.find((c) => c.slug === sp.categoria)?.slug;
  const visible = PRODUCTS.filter((p) => p.available !== false && (!active || p.category === active));
  const used = PRODUCT_CATEGORIES.filter((c) => PRODUCTS.some((p) => p.category === c.slug && p.available !== false));

  return (
    <>
      <PageHero
        eyebrow="Loja De Quebrada"
        title={
          <>
            Leve a quebrada <span className="text-accent">com você</span>
          </>
        }
        lead="Canecas, camisetas, microfones, itens de estúdio e escritório e eletrônicos. Escolha o produto e finalize pelo WhatsApp ou pelo link indicado."
      />

      <Section labelledBy="produtos-titulo" className="pt-0 md:pt-0">
        <h2 id="produtos-titulo" className="sr-only">
          Produtos
        </h2>
        <nav aria-label="Categorias da loja">
          <ul className="flex flex-wrap gap-2">
            <li>
              <Link href="/loja" aria-current={!active ? "page" : undefined} className={chip} scroll={false}>
                Todos
              </Link>
            </li>
            {used.map((c) => (
              <li key={c.slug}>
                <Link
                  href={`/loja?categoria=${c.slug}`}
                  aria-current={active === c.slug ? "page" : undefined}
                  className={chip}
                  scroll={false}
                >
                  {c.name}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        {visible.length === 0 ? (
          <p className="mt-10 text-lg text-muted">Nenhum produto nesta categoria no momento.</p>
        ) : (
          <ul className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {visible.map((p, i) => (
              <li key={p.sku} data-reveal="" style={stagger(i % 3, 100)}>
                <ProductCard product={p} />
              </li>
            ))}
          </ul>
        )}
      </Section>

      <Section labelledBy="loja-ajuda" tone="panel">
        <div className="flex flex-col items-start justify-between gap-8 lg:flex-row lg:items-center">
          <div className="max-w-2xl">
            <p className="eyebrow mb-4">Dúvidas</p>
            <h2 id="loja-ajuda" className="h2-section">
              Não achou o que procura?
            </h2>
            <p className="mt-4 text-lg text-muted">
              Chama no WhatsApp. Entrega e retirada: <Marked>[COMO FUNCIONA A ENTREGA OU RETIRADA]</Marked>
            </p>
          </div>
          <WhatsAppButton message={WHATSAPP_MESSAGES.loja} source="loja-cta-final" className="btn btn-wa shrink-0 !px-8">
            Falar no WhatsApp
          </WhatsAppButton>
        </div>
      </Section>
    </>
  );
}
