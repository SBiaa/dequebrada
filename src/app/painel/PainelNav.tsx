"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { logoutAction } from "@/app/(conta)/actions";
import { Icon, type IconName } from "@/components/ui/Icon";

type Badge = "assinantes" | "leads";

const GROUPS: { title?: string; links: { href: string; label: string; icon: IconName; badge?: Badge }[] }[] = [
  { links: [{ href: "/painel", icon: "home", label: "Início" }] },
  {
    title: "Blog",
    links: [
      { href: "/painel/posts", icon: "doc", label: "Posts" },
      { href: "/painel/categorias", icon: "tag", label: "Categorias" },
    ],
  },
  {
    title: "Redes sociais",
    links: [{ href: "/painel/redes", icon: "chart", label: "Minhas redes" }],
  },
  {
    title: "Membros",
    links: [
      { href: "/painel/assinantes", icon: "users", label: "Assinantes", badge: "assinantes" },
      { href: "/painel/conteudos", icon: "lock", label: "Conteúdos exclusivos" },
    ],
  },
  {
    title: "Vendas",
    links: [
      { href: "/painel/produtos", icon: "bag", label: "Produtos da loja" },
      { href: "/painel/banners", icon: "image", label: "Banners da home" },
      { href: "/painel/quizzes", icon: "clipboard", label: "Quizzes" },
      { href: "/painel/leads", icon: "userPlus", label: "Leads", badge: "leads" },
    ],
  },
];

function isActive(pathname: string, href: string): boolean {
  if (href === "/painel") return pathname === "/painel";
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function PainelNav({
  userName,
  badges,
}: {
  userName: string;
  badges: Record<Badge, number>;
}) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const pending = badges.assinantes + badges.leads;

  return (
    <aside className="border-b border-line bg-surface lg:sticky lg:top-0 lg:flex lg:max-h-screen lg:w-64 lg:shrink-0 lg:flex-col lg:self-stretch lg:overflow-y-auto lg:border-b-0 lg:border-r">
      <div className="flex items-center justify-between px-5 py-4 lg:px-6 lg:pt-6">
        <p className="eyebrow">Painel</p>
        <button
          type="button"
          className="btn btn-ghost !min-h-10 !px-4 !text-sm lg:hidden"
          aria-expanded={open}
          aria-controls="painel-menu"
          onClick={() => setOpen((o) => !o)}
        >
          {open ? "Fechar menu" : "Menu"}
          {!open && pending > 0 && (
            <span className="ml-2 rounded-full bg-warn px-2 text-xs font-bold text-black">
              {pending}
              <span className="sr-only"> pendentes</span>
            </span>
          )}
        </button>
      </div>

      <div id="painel-menu" className={`${open ? "flex" : "hidden"} flex-1 flex-col lg:flex`}>
        <nav aria-label="Painel" className="flex flex-col gap-5 px-3 pb-6">
          {GROUPS.map((g, i) => (
            <div key={g.title ?? i}>
              {g.title && (
                <p className="px-3 pb-1 text-xs font-bold uppercase tracking-[0.14em] text-muted">{g.title}</p>
              )}
              <ul className="flex flex-col gap-0.5">
                {g.links.map((n) => {
                  const active = isActive(pathname, n.href);
                  const count = n.badge ? badges[n.badge] : 0;
                  return (
                    <li key={n.href}>
                      <Link
                        href={n.href}
                        onClick={() => setOpen(false)}
                        aria-current={active ? "page" : undefined}
                        className={`flex min-h-11 items-center justify-between gap-2 rounded-lg px-3 text-[0.95rem] transition-colors ${
                          active ? "bg-surface-2 font-bold text-ink" : "text-muted hover:bg-surface-2 hover:text-ink"
                        }`}
                      >
                        <span className="flex items-center gap-3">
                          <Icon
                            name={n.icon}
                            className={`h-5 w-5 shrink-0 ${active ? "text-accent" : ""}`}
                          />
                          {n.label}
                        </span>
                        {count > 0 && (
                          <span
                            className={`min-w-6 rounded-full px-2 text-center text-xs font-bold ${
                              n.badge === "assinantes" ? "bg-warn text-black" : "bg-accent text-accent-ink"
                            }`}
                          >
                            {count}
                            <span className="sr-only"> pendentes</span>
                          </span>
                        )}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </nav>

        <div className="mt-auto flex items-center justify-between gap-3 border-t border-line px-6 py-4">
          <div className="min-w-0">
            <p className="truncate font-semibold">{userName}</p>
            <Link href="/blog" className="text-sm text-accent hover:underline">
              Ver o site
            </Link>
          </div>
          <form action={logoutAction}>
            <button type="submit" className="btn btn-ghost !min-h-10 !px-3 !text-sm">
              Sair
            </button>
          </form>
        </div>
      </div>
    </aside>
  );
}
