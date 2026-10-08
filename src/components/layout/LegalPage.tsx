import { Marked } from "@/components/ui/Marked";

export type LegalSection = {
  heading: string;
  paragraphs?: string[];
  list?: string[];
};

type Props = {
  title: string;
  intro: string;
  sections: LegalSection[];
};

export function LegalPage({ title, intro, sections }: Props) {
  return (
    <article className="px-5 py-14 md:py-20">
      <div className="mx-auto max-w-3xl">
        <p className="eyebrow mb-4">Informações legais</p>
        <h1 className="h1">{title}</h1>

        <p
          role="note"
          className="mt-8 rounded-lg border border-dashed border-warn-line bg-warn-bg px-4 py-3 text-sm font-semibold text-warn"
        >
          Texto-base a validar com profissional jurídico antes de publicar.
        </p>

        <p className="mt-8 text-lg leading-relaxed text-muted">
          <Marked>{intro}</Marked>
        </p>
        <p className="mt-2 text-sm text-muted">
          <Marked>Última atualização: [DATA]</Marked>
        </p>

        <div className="mt-12 space-y-10">
          {sections.map((section, i) => (
            <section key={section.heading} aria-labelledby={`sec-${i}`}>
              <h2 id={`sec-${i}`} className="text-2xl font-bold tracking-tight">
                {i + 1}. {section.heading}
              </h2>
              {section.paragraphs?.map((p) => (
                <p key={p} className="mt-3 leading-relaxed text-muted">
                  <Marked>{p}</Marked>
                </p>
              ))}
              {section.list && (
                <ul className="mt-3 list-disc space-y-2 pl-6 text-muted marker:text-accent">
                  {section.list.map((item) => (
                    <li key={item} className="leading-relaxed">
                      <Marked>{item}</Marked>
                    </li>
                  ))}
                </ul>
              )}
            </section>
          ))}
        </div>
      </div>
    </article>
  );
}
