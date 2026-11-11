import type { Metadata } from "next";
import Link from "next/link";
import { Marked } from "@/components/ui/Marked";
import { requireUser } from "@/lib/auth";
import { formatDate } from "@/lib/blog";
import { channelId, listEpisodes } from "@/lib/youtube";

export const metadata: Metadata = {
  title: "Episódios do De Quebrada Podcast",
  description: "Assista aos episódios do De Quebrada Podcast direto no site.",
};

export default async function EpisodiosPage() {
  await requireUser("/membros/episodios");
  const episodes = await listEpisodes();

  return (
    <section className="px-5 py-12 md:py-20">
      <div className="mx-auto max-w-6xl">
        <Link href="/membros" className="text-sm text-muted hover:text-accent">
          ← Área de membros
        </Link>
        <h1 className="h1 mt-4">Episódios</h1>
        <p className="mt-4 max-w-2xl text-lg text-muted">
          O De Quebrada Podcast completo, pra assistir aqui mesmo. A lista é atualizada a cada hora.
        </p>

        {!channelId() ? (
          <p className="mt-10 text-lg">
            <Marked>[CONFIGURAR YOUTUBE_CHANNEL_ID]</Marked>
          </p>
        ) : episodes.length === 0 ? (
          <p className="mt-10 text-lg text-muted">Não foi possível carregar os episódios agora. Tente de novo em instantes.</p>
        ) : (
          <ul className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {episodes.map((ep) => (
              <li key={ep.id}>
                <article className="lift group relative flex h-full flex-col overflow-hidden rounded-xl border border-line bg-surface">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={ep.thumbnail} alt="" loading="lazy" className="aspect-video w-full object-cover" />
                  <div className="flex flex-1 flex-col p-5">
                    <h2 className="text-base font-bold leading-snug">
                      <Link
                        href={`/membros/episodios/${ep.id}`}
                        className="after:absolute after:inset-0 group-hover:text-accent"
                      >
                        {ep.title}
                      </Link>
                    </h2>
                    {ep.publishedAt && (
                      <p className="mt-auto pt-3 text-sm text-muted">{formatDate(new Date(ep.publishedAt))}</p>
                    )}
                  </div>
                </article>
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}
