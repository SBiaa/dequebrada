import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { YouTubePlayer } from "@/components/members/YouTubePlayer";
import { requireUser } from "@/lib/auth";
import { formatDate } from "@/lib/blog";
import { isVideoId, listEpisodes } from "@/lib/youtube";

export async function generateMetadata({ params }: PageProps<"/membros/episodios/[id]">): Promise<Metadata> {
  const { id } = await params;
  const ep = (await listEpisodes()).find((e) => e.id === id);
  return { title: ep ? ep.title : "Episódio", robots: { index: false, follow: false } };
}

export default async function EpisodioPage({ params }: PageProps<"/membros/episodios/[id]">) {
  const { id } = await params;
  await requireUser(`/membros/episodios/${id}`);
  if (!isVideoId(id)) notFound();
  const episodes = await listEpisodes();
  const ep = episodes.find((e) => e.id === id);
  // Só toca vídeos do canal do De Quebrada.
  if (!ep) notFound();
  const others = episodes.filter((e) => e.id !== id).slice(0, 6);

  return (
    <section className="px-5 py-12 md:py-16">
      <div className="mx-auto max-w-5xl">
        <Link href="/membros/episodios" className="text-sm text-muted hover:text-accent">
          ← Todos os episódios
        </Link>
        <h1 className="mt-4 text-3xl font-bold leading-tight tracking-tight md:text-4xl">{ep.title}</h1>
        {ep.publishedAt && <p className="mt-2 text-muted">{formatDate(new Date(ep.publishedAt))}</p>}
        <div className="mt-8">
          <YouTubePlayer id={ep.id} title={ep.title} />
        </div>
        {ep.description && (
          <p className="mt-8 whitespace-pre-line leading-relaxed text-muted">{ep.description.slice(0, 1500)}</p>
        )}

        {others.length > 0 && (
          <>
            <h2 className="mt-16 text-2xl font-bold">Outros episódios</h2>
            <ul className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {others.map((o) => (
                <li key={o.id}>
                  <Link href={`/membros/episodios/${o.id}`} className="group block">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={o.thumbnail} alt="" loading="lazy" className="aspect-video w-full rounded-xl object-cover" />
                    <span className="mt-2 block font-semibold leading-snug group-hover:text-accent">{o.title}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </>
        )}
      </div>
    </section>
  );
}
