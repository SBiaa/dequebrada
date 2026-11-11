import type { Metadata } from "next";
import { Marked } from "@/components/ui/Marked";
import { PageHero } from "@/components/ui/PageHero";
import { Section, SectionTitle } from "@/components/ui/Section";
import { TrackedLink } from "@/components/ui/TrackedLink";
import { PARTNERS, type Partner, type PartnerKind } from "@/data/partners";
import { stagger } from "@/lib/motion";

export const metadata: Metadata = {
  title: "Parceiros e Patrocinadores do De Quebrada",
  description:
    "Conheça as marcas que apoiam o De Quebrada Podcast e o portal de notícias de Ferraz de Vasconcelos e Alto Tietê, e saiba como ser parceiro.",
};

const GROUPS: { kind: PartnerKind; title: string }[] = [
  { kind: "patrocinador", title: "Patrocinadores" },
  { kind: "parceiro", title: "Parceiros" },
];

function PartnerCard({ partner }: { partner: Partner }) {
  return (
    <article className="flex h-full flex-col rounded-xl border border-line bg-surface p-6">
      {partner.logo ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={partner.logo}
          alt={`Logo de ${partner.name}`}
          className="h-24 w-full rounded-lg bg-white object-contain p-3"
        />
      ) : (
        <div
          role="img"
          aria-label={`Espaço reservado para o logo de ${partner.name}`}
          className="flex h-24 items-center justify-center rounded-lg border border-dashed border-warn-line bg-surface-2"
        >
          <span className="text-sm font-semibold text-warn">[LOGO]</span>
        </div>
      )}
      <p className="eyebrow mt-5">{partner.kind === "patrocinador" ? "Patrocinador" : "Parceiro"}</p>
      <h3 className="mt-2 text-lg font-bold leading-snug">
        <Marked>{partner.name}</Marked>
      </h3>
      <p className="mt-2 flex-1 text-muted">
        <Marked>{partner.description}</Marked>
      </p>
      <ul className="mt-5 flex flex-wrap gap-2">
        {partner.links.map((l) => (
          <li key={l.href}>
            <a
              href={l.href}
              target="_blank"
              rel="noopener noreferrer sponsored"
              className="btn btn-ghost !min-h-10 !px-4 !text-sm"
            >
              {l.label}
              <span className="sr-only"> de {partner.name} (abre em nova aba)</span>
            </a>
          </li>
        ))}
      </ul>
    </article>
  );
}

export default function ParceirosPage() {
  return (
    <>
      <PageHero
        eyebrow="De Quebrada · Parceiros"
        title={
          <>
            Quem fortalece <span className="text-accent">a quebrada</span> com a gente
          </>
        }
        lead="Marcas e negócios que apoiam o De Quebrada Podcast e o portal de notícias de Ferraz de Vasconcelos e Alto Tietê."
        actions={
          <TrackedLink href="/publicidade" source="parceiros-hero" className="btn btn-primary">
            Quero ser parceiro
          </TrackedLink>
        }
      />

      {GROUPS.map((g, gi) => {
        const list = PARTNERS.filter((p) => p.kind === g.kind);
        if (list.length === 0) return null;
        return (
          <Section key={g.kind} labelledBy={`grupo-${g.kind}`} tone={gi % 2 ? "panel" : "dark"}>
            <SectionTitle id={`grupo-${g.kind}`} title={g.title} />
            <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {list.map((p, i) => (
                <li key={p.name} data-reveal="" style={stagger(i % 3, 100)}>
                  <PartnerCard partner={p} />
                </li>
              ))}
            </ul>
          </Section>
        );
      })}

      <Section labelledBy="ser-parceiro" tone="light">
        <div className="flex flex-col items-start justify-between gap-8 lg:flex-row lg:items-center">
          <div className="max-w-2xl">
            <p className="eyebrow mb-4">Seja parceiro</p>
            <h2 id="ser-parceiro" className="h2-section">
              Sua marca aqui
            </h2>
            <p className="mt-4 text-lg text-muted">
              Veja os formatos de publicidade e patrocínio do De Quebrada.
            </p>
          </div>
          <TrackedLink
            href="/publicidade"
            source="parceiros-cta-final"
            className="btn btn-primary shrink-0 !px-8"
          >
            Quero ser parceiro
          </TrackedLink>
        </div>
      </Section>
    </>
  );
}
