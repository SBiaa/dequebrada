import { Marked } from "@/components/ui/Marked";
import { Section, SectionTitle } from "@/components/ui/Section";

export type FaqItem = { q: string; a: string };

export const HOME_FAQ: FaqItem[] = [
  {
    q: "Como funciona?",
    a: "Você chama no WhatsApp. Pra consultoria, começa por um diagnóstico gratuito de 30 minutos.",
  },
  {
    q: "Quanto custa?",
    a: "Podcast a partir de R$ 250, formação por R$ 47. Consultoria Business a partir de R$ [DEFINIR].",
  },
  {
    q: "Quanto tempo leva?",
    a: "No podcast, episódio editado, fotos e cortes são entregues em até 7 dias úteis. Prazos da consultoria Business: [A CONFIRMAR].",
  },
  {
    q: "Atende qualquer negócio?",
    a: "O foco é o pequeno negócio de Ferraz e do Alto Tietê. Segmentos: [A CONFIRMAR].",
  },
  {
    q: "Como eu pago?",
    a: "Formas de pagamento e parcelamento: [A CONFIRMAR]. A formação tem garantia de 7 dias, com devolução de 100% do valor.",
  },
];

export function Faq({ items = HOME_FAQ }: { items?: FaqItem[] }) {
  return (
    <Section labelledBy="faq-titulo" tone="light">
      <SectionTitle
        id="faq-titulo"
        eyebrow="Tira-dúvidas"
        title="Perguntas frequentes"
      />
      <div className="max-w-3xl space-y-3">
        {items.map((item) => (
          <details
            key={item.q}
            className="group rounded-xl border border-line bg-surface open:border-accent"
          >
            <summary className="flex min-h-14 cursor-pointer list-none items-center justify-between gap-4 px-5 py-4 text-lg font-semibold [&::-webkit-details-marker]:hidden">
              {item.q}
              <span
                aria-hidden="true"
                className="text-2xl font-light text-accent transition-transform group-open:rotate-45"
              >
                +
              </span>
            </summary>
            <p className="px-5 pb-5 leading-relaxed text-muted">
              <Marked>{item.a}</Marked>
            </p>
          </details>
        ))}
      </div>
    </Section>
  );
}
