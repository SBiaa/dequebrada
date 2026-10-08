"use client";

import { trackLead } from "@/lib/tracking";
import { WHATSAPP_MESSAGES } from "@/lib/site";
import { whatsappUrl } from "@/lib/whatsapp";
import { WhatsAppIcon } from "@/components/ui/WhatsAppButton";

/** Botão flutuante de WhatsApp, visível só no celular. */
export function WhatsAppFloat() {
  return (
    <a
      href={whatsappUrl(WHATSAPP_MESSAGES.geral)}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Falar no WhatsApp (abre em nova aba)"
      onClick={() => trackLead("botao-flutuante")}
      className="fixed bottom-5 right-5 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-wa text-[#03210f] shadow-[0_4px_16px_rgb(0_0_0/0.35)] xl:hidden"
    >
      <WhatsAppIcon className="h-7 w-7" />
    </a>
  );
}
