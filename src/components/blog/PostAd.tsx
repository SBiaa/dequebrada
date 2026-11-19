type Ad = { id: string; imageUrl: string; imageAlt: string; linkUrl: string | null };

/** Banner de parceiro dentro do post, marcado como "Patrocinado" (estilo anúncio). */
export function PostAd({ ad }: { ad: Ad }) {
  const img = (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={ad.imageUrl} alt={ad.imageAlt} loading="lazy" className="aspect-[4/1] w-full rounded-lg object-cover" />
  );
  return (
    <aside aria-label="Patrocinado" className="mx-auto my-10 max-w-3xl rounded-xl border border-line bg-surface p-3">
      <p className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-muted">
        <span className="rounded border border-line px-1.5 py-0.5">Patrocinado</span>
        Parceiro do De Quebrada
      </p>
      {ad.linkUrl ? (
        <a href={ad.linkUrl} target="_blank" rel="noopener noreferrer sponsored" className="block">
          {img}
          <span className="sr-only">(anúncio, abre em nova aba)</span>
        </a>
      ) : (
        img
      )}
    </aside>
  );
}
