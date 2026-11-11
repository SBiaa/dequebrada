declare global {
  interface Window {
    fbq?: (...args: unknown[]) => void;
    gtag?: (...args: unknown[]) => void;
  }
}

/** Dispara o evento "Lead" no Meta Pixel e no Google Analytics, se estiverem carregados. */
export function trackLead(source: string): void {
  if (typeof window === "undefined") return;
  window.fbq?.("track", "Lead", { content_name: source });
  window.gtag?.("event", "Lead", { event_label: source });
}

/**
 * Evento de clique em CTA de venda que não é WhatsApp (checkout, link externo, "Quero ser parceiro").
 * No Pixel vai como evento personalizado "CTA"; no GA, como "cta_click".
 */
export function trackCta(source: string): void {
  if (typeof window === "undefined") return;
  window.fbq?.("trackCustom", "CTA", { content_name: source });
  window.gtag?.("event", "cta_click", { event_label: source });
}

/** Clique no botão de compra que leva ao checkout externo. */
export function trackCheckout(source: string): void {
  if (typeof window === "undefined") return;
  window.fbq?.("track", "InitiateCheckout", { content_name: source });
  window.gtag?.("event", "begin_checkout", { event_label: source });
}
