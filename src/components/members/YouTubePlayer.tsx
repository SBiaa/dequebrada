import { embedUrl } from "@/lib/youtube";

/** Player do YouTube no modo de privacidade aprimorada (youtube-nocookie). */
export function YouTubePlayer({ id, title }: { id: string; title: string }) {
  return (
    <div className="relative aspect-video overflow-hidden rounded-2xl border border-line bg-black">
      <iframe
        src={embedUrl(id)}
        title={title}
        className="absolute inset-0 h-full w-full"
        allow="accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
        loading="lazy"
        referrerPolicy="strict-origin-when-cross-origin"
      />
    </div>
  );
}
