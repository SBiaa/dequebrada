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
