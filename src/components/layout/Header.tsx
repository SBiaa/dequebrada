"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { NAV_LINKS, WHATSAPP_MESSAGES } from "@/lib/site";
import { WhatsAppButton } from "@/components/ui/WhatsAppButton";
import { Logo } from "./Logo";

export function Header() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <header className="relative border-b border-line bg-bg/95 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-6 px-5">
        <Logo />

        <nav aria-label="Principal" className="hidden xl:block">
          <ul className="flex items-center gap-5">
            {NAV_LINKS.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className="text-[0.92rem] font-medium text-muted transition-colors hover:text-ink"
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className="hidden xl:block">
          <WhatsAppButton
            message={WHATSAPP_MESSAGES.geral}
            source="header"
            className="btn btn-wa !min-h-10 !px-4 !text-[0.92rem]"
          >
            Falar no WhatsApp
          </WhatsAppButton>
        </div>

        <button
          type="button"
          className="flex h-11 w-11 items-center justify-center rounded-lg border border-line xl:hidden"
          aria-expanded={open}
          aria-controls="menu-mobile"
          aria-label={open ? "Fechar menu" : "Abrir menu"}
          onClick={() => setOpen((v) => !v)}
        >
          <span aria-hidden="true" className="relative block h-3.5 w-6">
            <span
              className={`absolute left-0 h-0.5 w-6 bg-ink transition-all ${open ? "top-1.5 rotate-45" : "top-0"}`}
            />
            <span
              className={`absolute left-0 top-1.5 h-0.5 w-6 bg-ink transition-opacity ${open ? "opacity-0" : "opacity-100"}`}
            />
            <span
              className={`absolute left-0 h-0.5 w-6 bg-ink transition-all ${open ? "top-1.5 -rotate-45" : "top-3"}`}
            />
          </span>
        </button>
      </div>

      {open && (
        <nav
          id="menu-mobile"
          aria-label="Menu mobile"
          className="border-t border-line bg-bg px-5 pb-6 pt-2 xl:hidden"
        >
          <ul>
            {NAV_LINKS.map((link) => (
              <li key={link.href} className="border-b border-line/70">
                <Link
                  href={link.href}
                  onClick={() => setOpen(false)}
                  className="block py-4 text-lg font-semibold"
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
          <div className="mt-5">
            <WhatsAppButton
              message={WHATSAPP_MESSAGES.geral}
              source="header-mobile"
              className="btn btn-wa w-full"
            >
              Falar no WhatsApp
            </WhatsAppButton>
          </div>
        </nav>
      )}
    </header>
  );
}
