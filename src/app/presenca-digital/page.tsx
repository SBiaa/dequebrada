import type { Metadata } from "next";
import { FinalCta } from "@/components/sections/FinalCta";
import { Ph } from "@/components/ui/Marked";
import { PageHero } from "@/components/ui/PageHero";
import { Section, SectionTitle } from "@/components/ui/Section";
import { Stats } from "@/components/ui/Stats";
import { CountUp } from "@/components/motion/CountUp";
import { SocialIcon, platformOf } from "@/components/ui/SocialIcon";
import { stagger } from "@/lib/motion";
import { WHATSAPP_MESSAGES } from "@/lib/site";

export const metadata: Metadata = {
  title: "Presença Digital: Canais e Alcance",
  description:
    "Podcast, redes sociais, portal de notícias e plataformas de áudio do De Quebrada, em Ferraz de Vasconcelos e Zona Leste de SP. Mais de 1,3 milhão de views por mês.",
};

type Channel = {
  platform: string;
  handle: string;
  description: string;
  href: string;
  metrics: { value: string; label: string }[];
};

const CHANNELS: Channel[] = [
  {
    platform: "Instagram · Podcast",
    handle: "@dequebradapodcast",
    description: "Podcast nº 1 do Alto Tietê · 4x premiado · conteúdo regional",
    href: "https://www.instagram.com/dequebradapodcast/",
    metrics: [
      { value: "13,7k", label: "seguidores" },
      { value: "480k", label: "views em 30 dias" },
    ],
  },
  {
    platform: "Instagram · Empreendedorismo",
    handle: "@oempreendedordequebrada",
    description: "Conteúdo pra quem veio de baixo · negócios · digital",
    href: "https://www.instagram.com/oempreendedordequebrada/",
    metrics: [
      { value: "3,7k", label: "seguidores" },
      { value: "390k", label: "views em 30 dias" },
    ],
  },
  {
    platform: "Instagram · Rancho",
    handle: "@ranchodoquebrada",
    description: "Espaço de lazer e eventos · Ferraz de Vasconcelos",
    href: "https://www.instagram.com/ranchodoquebrada/",
    metrics: [
      { value: "6k+", label: "seguidores" },
      { value: "426k", label: "views em 30 dias" },
    ],
  },
  {
    platform: "Instagram · Estúdio",
    handle: "@estudiodequebrada",
    description: "Estúdio profissional de podcast · produção de conteúdo",
    href: "https://www.instagram.com/estudiodequebrada/",
    metrics: [
      { value: "138", label: "seguidores" },
      { value: "55k", label: "views em 30 dias" },
    ],
  },
  {
    platform: "TikTok · Podcast",
    handle: "@dequebradapodcast",
    description: "Cortes do podcast · histórias reais · conteúdo da quebrada",
    href: "https://www.tiktok.com/@dequebradapodcast",
    metrics: [{ value: "44k+", label: "curtidas" }],
  },
  {
    platform: "TikTok · Empreendedorismo",
    handle: "@oempreendedordequebrada",
    description: "Negócios na prática · dicas rápidas · bastidores reais",
    href: "https://www.tiktok.com/@oempreendedordequebrada",
    metrics: [{ value: "9k+", label: "curtidas" }],
  },
  {
    platform: "YouTube · Canal oficial",
    handle: "De Quebrada Podcast",
    description: "Episódios completos · entrevistas · conteúdo do Alto Tietê",
    href: "https://www.youtube.com/@DeQuebradapodcast",
    metrics: [
      { value: "4,2k", label: "inscritos" },
      { value: "143k", label: "views por mês" },
    ],
  },
  {
    platform: "Spotify · Podcast",
    handle: "De Quebrada Podcast",
    description: "Ouça os episódios onde for melhor pra você",
    href: "https://open.spotify.com/show/6innHIAEayFKSHgL2xro0P",
    metrics: [],
  },
];

export default function PresencaDigitalPage() {
  return (
    <>
      <PageHero
        eyebrow="De Quebrada · Nossa presença digital"
        title={
          <>
            Onde o De Quebrada <span className="text-accent">aparece</span>
          </>
        }
        lead="Podcast, redes sociais, portal de notícias e plataformas de áudio. Mais de 1,3 milhão de views por mês, construídas de forma orgânica."
      />
      <Stats
        items={[
          { value: "22k+", label: "seguidores" },
          { value: "1,3M", label: "views por mês" },
          { value: "600+", label: "episódios" },
          { value: "8", label: "canais ativos" },
        ]}
        label="Presença digital em números"
      />

      <Section labelledBy="canais-titulo">
        <SectionTitle
          id="canais-titulo"
          eyebrow="Canais"
          title={
            <>
              Siga e <span className="text-accent">ouça</span>
            </>
          }
          lead={
            <>
              Números informados pelo De Quebrada, a atualizar antes de publicar:{" "}
              <Ph>[CONFERIR NÚMEROS]</Ph>
            </>
          }
        />
        <ul className="grid gap-5 md:grid-cols-2">
          {CHANNELS.map((c, i) => {
            const icon = platformOf(c.platform);
            return (
              <li key={c.platform + c.handle} data-reveal="" style={stagger(i % 2, 100)}>
                <article className="lift group relative flex h-full flex-col justify-between gap-6 rounded-2xl border border-line bg-surface p-6">
                  <div className="flex gap-4">
                    {icon && (
                      <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-surface-2">
                        <SocialIcon platform={icon} className="h-6 w-6" />
                      </span>
                    )}
                    <div className="min-w-0">
                      <p className="eyebrow">{c.platform}</p>
                      <h3 className="mt-2 text-xl font-bold leading-tight tracking-tight [overflow-wrap:anywhere]">
                        <a
                          href={c.href}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="after:absolute after:inset-0"
                        >
                          {c.handle}
                          <span className="sr-only"> (abre em nova aba)</span>
                        </a>
                      </h3>
                      <p className="mt-1 text-muted">{c.description}</p>
                    </div>
                  </div>
                  {c.metrics.length > 0 && (
                    <dl className="flex gap-10 border-t border-line pt-5">
                      {c.metrics.map((m) => (
                        <div key={m.label}>
                          <dd className="display text-4xl text-ink">
                            <CountUp value={m.value} />
                          </dd>
                          <dt className="text-sm text-muted">{m.label}</dt>
                        </div>
                      ))}
                    </dl>
                  )}
                </article>
              </li>
            );
          })}
        </ul>
      </Section>

      <FinalCta
        title="Quer aparecer pra essa audiência?"
        text="Fale com a gente sobre anúncios, parcerias e participação no podcast e no portal."
        button="Falar no WhatsApp"
        message={WHATSAPP_MESSAGES.anunciar}
        source="presenca-cta-final"
      />
    </>
  );
}
