import { listLiveBanners } from "@/lib/banners";

/** Banners de parceiros (prefeituras etc.), cadastrados no painel. Sem banner no ar, não renderiza nada. */
export async function Banners() {
  let items: Awaited<ReturnType<typeof listLiveBanners>> = [];
  try {
    items = await listLiveBanners();
  } catch (e) {
    console.error("Não foi possível carregar os banners", e);
  }
  if (items.length === 0) return null;

  return (
    <section aria-label="Comunicados de parceiros" className="mx-auto w-full max-w-6xl px-4 py-6 sm:px-6 md:py-8">
      <ul className="space-y-4">
        {items.map((b) => {
          const img = (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={b.imageUrl}
              alt={b.imageAlt}
              loading="lazy"
              className="aspect-[4/1] w-full rounded-xl border border-line bg-surface object-contain"
            />
          );
          return (
            <li key={b.id}>
              {b.linkUrl ? (
                <a href={b.linkUrl} target="_blank" rel="noopener noreferrer sponsored" className="block rounded-xl">
                  {img}
                  <span className="sr-only">(abre em nova aba)</span>
                </a>
              ) : (
                img
              )}
            </li>
          );
        })}
      </ul>
      <p className="mt-2 text-xs text-muted">Comunicados de parceiros do De Quebrada.</p>
    </section>
  );
}
