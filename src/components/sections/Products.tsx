import Link from "next/link";
import { stagger } from "@/lib/motion";
import { IconTile, type IconName } from "@/components/ui/Icon";
import { Section, SectionTitle } from "@/components/ui/Section";

const PRODUCTS: { name: string; tag: string; text: string; href: string; cta: string; icon: IconName }[] = [
  {
    icon: "compass",
    name: "De Quebrada Business",
    tag: "Consultoria",
    text: "Mentoria, tráfego, social media e conteúdo. Começa por um diagnóstico gratuito.",
    href: "/business",
    cta: "Conhecer o Business",
  },
  {
    icon: "mic",
    name: "Podcast e Estúdio",
    tag: "Visibilidade",
    text: "Seja entrevistado ou lance seu programa, com edição e cortes prontos.",
    href: "/estudio",
    cta: "Ver pacotes e preços",
  },
  {
    icon: "brain",
    name: "Da Quebrada ao Digital",
    tag: "Formação",
    text: "Aprenda a criar conteúdo e vender online, pelo celular. A partir de R$ 47.",
    href: "/daquebradaaodigital",
    cta: "Ver a formação",
  },
];

export function Products() {
  return (
    <Section id="solucoes" labelledBy="solucoes-titulo">
      <SectionTitle
        id="solucoes-titulo"
        eyebrow="Como a gente ajuda"
        title="Três caminhos pra crescer"
      />
      <ul className="grid gap-5 lg:grid-cols-3">
        {PRODUCTS.map((p, i) => (
          <li key={p.name} data-reveal="" style={stagger(i, 120)}>
            <article className="lift flex h-full flex-col rounded-xl border border-line bg-surface p-7 md:p-8">
              <IconTile name={p.icon} />
              <p className="eyebrow mt-5">{p.tag}</p>
              <h3 className="mt-3 text-2xl font-bold leading-tight tracking-tight">{p.name}</h3>
              <p className="mt-3 flex-1 text-muted">{p.text}</p>
              <Link href={p.href} className="btn btn-ghost mt-8 w-full">
                {p.cta}
                <span aria-hidden="true">→</span>
              </Link>
            </article>
          </li>
        ))}
      </ul>
    </Section>
  );
}
