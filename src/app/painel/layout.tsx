import type { Metadata } from "next";
import Link from "next/link";
import { PainelNav } from "./PainelNav";
import { requireAdmin } from "@/lib/auth";
import { painelBadges } from "@/lib/painel";

export const metadata: Metadata = {
  title: "Painel",
  robots: { index: false, follow: false },
};

export default async function PainelLayout({ children }: LayoutProps<"/painel">) {
  const user = await requireAdmin();
  const badges = await painelBadges();
  return (
    <div className="lg:flex lg:items-start">
      <PainelNav userName={user.name} badges={badges} />
      <div className="min-w-0 flex-1">
        <form
          action="/painel/busca"
          role="search"
          className="flex flex-wrap items-center gap-3 border-b border-line px-5 py-4 md:px-8"
        >
          <label htmlFor="painel-q" className="sr-only">
            Buscar no painel
          </label>
          <input
            id="painel-q"
            name="q"
            type="search"
            placeholder="Buscar posts, leads ou assinantes"
            className="min-h-11 min-w-0 flex-1 basis-64 rounded-lg border border-line bg-bg px-4 text-base text-ink placeholder:text-muted/70 focus:border-accent focus:outline-none"
          />
          <Link href="/painel/posts/novo" className="btn btn-primary !min-h-11 !px-5 !text-sm">
            + Novo post
          </Link>
        </form>
        <div className="px-5 py-8 md:px-8 md:py-10">
          <div className="mx-auto max-w-5xl">{children}</div>
        </div>
      </div>
    </div>
  );
}
