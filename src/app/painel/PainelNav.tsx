"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const GROUPS = [
  {
    title: "Blog",
    links: [
      { href: "/painel", label: "Início" },
      { href: "/painel/posts", label: "Posts" },
      { href: "/painel/posts/novo", label: "Novo post" },
      { href: "/painel/categorias", label: "Categorias" },
    ],
  },
  {
    title: "Membros",
    links: [
      { href: "/painel/assinantes", label: "Assinantes" },
      { href: "/painel/conteudos", label: "Conteúdos exclusivos" },
    ],
  },
  {
    title: "Vendas",
    links: [
      { href: "/painel/produtos", label: "Produtos da loja" },
      { href: "/painel/quizzes", label: "Quizzes" },
      { href: "/painel/leads", label: "Leads" },
    ],
  },
];

function isActive(pathname: string, href: string): boolean {
  if (href === "/painel") return pathname === "/painel";
  if (href === "/painel/posts") return pathname === href || /^\/painel\/posts\/(?!novo)/.test(pathname);
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function PainelNav() {
  const pathname = usePathname();
  return (
    <nav aria-label="Painel" className="mt-6 grid gap-4 sm:grid-cols-3">
      {GROUPS.map((g) => (
        <div key={g.title}>
          <p className="text-xs font-bold uppercase tracking-wider text-muted">{g.title}</p>
          <ul className="mt-2 flex flex-wrap gap-2">
            {g.links.map((n) => {
              const active = isActive(pathname, n.href);
              return (
                <li key={n.href}>
                  <Link
                    href={n.href}
                    aria-current={active ? "page" : undefined}
                    className={`btn !min-h-10 !px-4 !text-sm ${active ? "btn-primary" : "btn-ghost"}`}
                  >
                    {n.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      ))}
    </nav>
  );
}
