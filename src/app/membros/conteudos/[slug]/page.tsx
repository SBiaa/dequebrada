import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { YouTubePlayer } from "@/components/members/YouTubePlayer";
import { canSeeExclusive, requireUser } from "@/lib/auth";
import { KIND_LABEL, formatBytes, getPublishedContent } from "@/lib/members";

export const metadata: Metadata = {
  title: "Conteúdo exclusivo",
  robots: { index: false, follow: false },
};

export default async function ConteudoPage({ params }: PageProps<"/membros/conteudos/[slug]">) {
  const { slug } = await params;
  const user = await requireUser(`/membros/conteudos/${slug}`);
  // Checagem no servidor: quem não é assinante não recebe nada do conteúdo.
  if (!canSeeExclusive(user)) redirect("/membros");
  const c = await getPublishedContent(slug);
  if (!c) notFound();

  return (
    <section className="px-5 py-12 md:py-16">
      <div className="mx-auto max-w-4xl">
        <Link href="/membros" className="text-sm text-muted hover:text-accent">
          ← Área de membros
        </Link>
        <p className="eyebrow mt-6">{KIND_LABEL[c.kind]} exclusivo</p>
        <h1 className="mt-3 text-3xl font-bold leading-tight tracking-tight md:text-4xl">{c.title}</h1>
        <p className="mt-4 whitespace-pre-line text-lg leading-relaxed text-muted">{c.description}</p>

        <div className="mt-10">
          {c.youtubeId && <YouTubePlayer id={c.youtubeId} title={c.title} />}
          {c.fileId && (
            <a href={`/membros/arquivo/${c.fileId}`} className="btn btn-primary mt-6">
              Baixar {c.fileName} {c.fileSize ? `(${formatBytes(c.fileSize)})` : ""}
            </a>
          )}
          {c.externalUrl && (
            <a href={c.externalUrl} target="_blank" rel="noopener noreferrer" className="btn btn-ghost mt-6">
              Abrir conteúdo <span className="sr-only">(abre em nova aba)</span>
            </a>
          )}
        </div>
      </div>
    </section>
  );
}
