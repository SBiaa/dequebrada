import type { Metadata } from "next";
import Link from "next/link";
import { logoutAction } from "@/app/(conta)/actions";
import { requireAdmin } from "@/lib/auth";

export const metadata: Metadata = {
  title: "Painel",
  robots: { index: false, follow: false },
};

const NAV = [
  { href: "/painel", label: "Posts" },
  { href: "/painel/posts/novo", label: "Novo post" },
  { href: "/painel/categorias", label: "Categorias" },
  { href: "/painel/assinantes", label: "Assinantes" },
  { href: "/painel/conteudos", label: "Conteúdos exclusivos" },
  { href: "/painel/produtos", label: "Produtos da loja" },
  { href: "/painel/quizzes", label: "Quizzes" },
  { href: "/painel/leads", label: "Leads" },
];

export default async function PainelLayout({ children }: LayoutProps<"/painel">) {
  const user = await requireAdmin();
  return (
    <div className="px-5 py-10 md:py-14">
      <div className="mx-auto max-w-5xl">
        <div className="flex flex-col gap-4 border-b border-line pb-6 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="eyebrow">Painel do De Quebrada</p>
            <p className="mt-2 text-muted">Olá, {user.name}.</p>
          </div>
          <form action={logoutAction}>
            <button type="submit" className="btn btn-ghost !min-h-10 !px-4 !text-sm">
              Sair
            </button>
          </form>
        </div>
        <nav aria-label="Painel" className="mt-6">
          <ul className="flex flex-wrap gap-2">
            {NAV.map((n) => (
              <li key={n.href}>
                <Link href={n.href} className="btn btn-ghost !min-h-10 !px-4 !text-sm">
                  {n.label}
                </Link>
              </li>
            ))}
            <li>
              <Link href="/blog" className="btn btn-ghost !min-h-10 !px-4 !text-sm">
                Ver o blog
              </Link>
            </li>
          </ul>
        </nav>
        <div className="mt-10">{children}</div>
      </div>
    </div>
  );
}
