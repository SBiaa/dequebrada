import { stagger } from "@/lib/motion";
import { Marked } from "@/components/ui/Marked";
import { Section, SectionTitle } from "@/components/ui/Section";

export type Testimonial = { quote: string; name: string; business: string };

const PLACEHOLDER: Testimonial[] = [1, 2, 3].map(() => ({
  quote: "[DEPOIMENTO REAL AQUI]",
  name: "[NOME DO CLIENTE]",
  business: "[NEGÓCIO / CASE]",
}));

export function Proof({
  items = PLACEHOLDER,
  title = "Resultado de quem fez",
  lead = "Espaço para depoimentos e cases reais.",
}: {
  items?: Testimonial[];
  title?: string;
  lead?: string;
}) {
  return (
    <Section labelledBy="provas-titulo">
      <SectionTitle
        id="provas-titulo"
        eyebrow="Quem já passou por aqui"
        title={title}
        lead={lead}
      />
      <ul className="grid gap-5 md:grid-cols-3">
        {items.map((t, i) => (
          <li key={i} data-reveal="" style={stagger(i, 110)}>
            <figure className="flex h-full flex-col rounded-xl border border-line bg-surface p-7">
              <span aria-hidden="true" className="display text-5xl leading-none text-accent">
                “
              </span>
              <blockquote className="mt-2 flex-1 text-lg leading-relaxed">
                <Marked>{t.quote}</Marked>
              </blockquote>
              <figcaption className="mt-6 flex items-center gap-4 border-t border-line pt-5">
                <span aria-hidden="true" className="h-11 w-11 shrink-0 rounded-full bg-surface-2" />
                <span className="space-y-1 text-sm">
                  <Marked>{t.name}</Marked>
                  <br />
                  <Marked>{t.business}</Marked>
                </span>
              </figcaption>
            </figure>
          </li>
        ))}
      </ul>
    </Section>
  );
}
