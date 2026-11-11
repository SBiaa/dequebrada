"use client";

import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { trackLead } from "@/lib/tracking";
import { WHATSAPP_MESSAGES } from "@/lib/site";
import { whatsappUrl } from "@/lib/whatsapp";
import { WhatsAppIcon } from "@/components/ui/WhatsAppButton";

/**
 * Botão flutuante de WhatsApp, visível só no celular.
 * Some enquanto alguma área marcada com data-hide-wa-float está na tela (ex.: o mapa do blog,
 * para não cobrir o card) e volta assim que a pessoa sai dela.
 */
export function WhatsAppFloat() {
  const pathname = usePathname();
  const [hidden, setHidden] = useState(false);

  useEffect(() => {
    const targets = document.querySelectorAll("[data-hide-wa-float]");
    if (targets.length === 0) return;
    const visible = new Set<Element>();
    const io = new IntersectionObserver((entries) => {
      for (const e of entries) {
        if (e.isIntersecting) visible.add(e.target);
        else visible.delete(e.target);
      }
      setHidden(visible.size > 0);
    });
    targets.forEach((t) => io.observe(t));
    return () => {
      io.disconnect();
      setHidden(false);
    };
  }, [pathname]);

  return (
    <a
      href={whatsappUrl(WHATSAPP_MESSAGES.geral)}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Falar no WhatsApp (abre em nova aba)"
      aria-hidden={hidden || undefined}
      tabIndex={hidden ? -1 : undefined}
      onClick={() => trackLead("botao-flutuante")}
      className={`fixed bottom-5 right-5 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-wa text-[#03210f] shadow-[0_4px_16px_rgb(0_0_0/0.35)] transition-all duration-200 xl:hidden ${
        hidden ? "pointer-events-none translate-y-4 opacity-0" : "opacity-100"
      }`}
    >
      <WhatsAppIcon className="h-7 w-7" />
    </a>
  );
}
