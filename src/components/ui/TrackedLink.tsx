"use client";

import Link from "next/link";
import { trackCta } from "@/lib/tracking";

type Props = {
  href: string;
  /** Identifica o botão no evento de CTA. */
  source: string;
  children: React.ReactNode;
  className?: string;
  /** Link externo: abre em nova aba. Use rel extra (ex.: "sponsored") quando for patrocinado. */
  external?: boolean;
  rel?: string;
};

/** Link de CTA de venda que dispara evento no Pixel/GA. */
export function TrackedLink({ href, source, children, className, external, rel }: Props) {
  if (external) {
    return (
      <a
        href={href}
        target="_blank"
        rel={["noopener", "noreferrer", rel].filter(Boolean).join(" ")}
        className={className}
        onClick={() => trackCta(source)}
      >
        {children}
        <span className="sr-only"> (abre em nova aba)</span>
      </a>
    );
  }
  return (
    <Link href={href} className={className} onClick={() => trackCta(source)}>
      {children}
    </Link>
  );
}
