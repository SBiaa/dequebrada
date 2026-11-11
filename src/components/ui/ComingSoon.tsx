import Link from "next/link";
import { PageHero } from "./PageHero";

/** Página de uma seção que ainda vai ser construída (fase futura). */
export function ComingSoon({ eyebrow, title, lead }: { eyebrow: string; title: string; lead: string }) {
  return (
    <PageHero
      eyebrow={eyebrow}
      title={title}
      lead={lead}
      actions={
        <Link href="/" className="btn btn-ghost">
          Voltar ao início
        </Link>
      }
    />
  );
}
