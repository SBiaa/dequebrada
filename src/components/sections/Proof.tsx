import { stagger } from "@/lib/motion";
import { Ph } from "@/components/ui/Marked";
import { Section, SectionTitle } from "@/components/ui/Section";

export function Proof() {
  return (
    <Section labelledBy="provas-titulo">
      <SectionTitle
        id="provas-titulo"
        eyebrow="Quem já passou por aqui"
        title="Resultado de quem fez"
        lead="Espaço para depoimentos e cases reais."
      />
      <ul className="grid gap-5 md:grid-cols-3">
        {[1, 2, 3].map((n) => (
          <li key={n} data-reveal="" style={stagger(n - 1, 110)}>
            <figure className="flex h-full flex-col rounded-xl border border-line bg-surface p-7">
              <span aria-hidden="true" className="display text-5xl leading-none text-accent">
                “
              </span>
              <blockquote className="mt-2 flex-1 text-lg leading-relaxed">
                <Ph>[DEPOIMENTO REAL AQUI]</Ph>
              </blockquote>
              <figcaption className="mt-6 flex items-center gap-4 border-t border-line pt-5">
                <span aria-hidden="true" className="h-11 w-11 shrink-0 rounded-full bg-surface-2" />
                <span className="space-y-1 text-sm">
                  <Ph>[NOME DO CLIENTE]</Ph>
                  <br />
                  <Ph>[NEGÓCIO / CASE]</Ph>
                </span>
              </figcaption>
            </figure>
          </li>
        ))}
      </ul>
    </Section>
  );
}
