import { listLiveBanners } from "@/lib/banners";
import { BannerCarousel } from "./BannerCarousel";

/** Banners de parceiros (prefeituras etc.), cadastrados no painel, em slide. Sem banner no ar, não renderiza nada. */
export async function Banners() {
  let items: Awaited<ReturnType<typeof listLiveBanners>> = [];
  try {
    items = await listLiveBanners();
  } catch (e) {
    console.error("Não foi possível carregar os banners", e);
  }
  if (items.length === 0) return null;

  return (
    <section aria-label="Comunicados de parceiros" className="mx-auto w-full max-w-6xl px-4 pt-4 sm:px-6 md:pt-6">
      <BannerCarousel items={items} />
    </section>
  );
}
