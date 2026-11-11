import type { Metadata } from "next";
import { ChannelCards } from "@/components/sections/ChannelCards";
import { FinalCta } from "@/components/sections/FinalCta";
import { CardGrid, type CardItem } from "@/components/ui/CardGrid";
import { MapEmbed } from "@/components/ui/MapEmbed";
import { Marked, Ph } from "@/components/ui/Marked";
import { PageHero } from "@/components/ui/PageHero";
import { PhotoSlot } from "@/components/ui/PhotoSlot";
import { Section, SectionTitle } from "@/components/ui/Section";
import { Stats, BRAND_STATS } from "@/components/ui/Stats";
import { stagger } from "@/lib/motion";
import { SITE } from "@/lib/site";

export const metadata: Metadata = {
  title: "Sobre o De Quebrada e Onde Nos Encontrar",
  description:
    "A história do De Quebrada, podcast, estúdio e portal de notícias de Ferraz de Vasconcelos, Zona Leste de SP. Equipe, valores, redes sociais, endereço e telefone.",
};

const HISTORY = [
  "O De Quebrada nasceu em Ferraz de Vasconcelos pra contar as histórias da quebrada com a voz de quem vive nela. Começou como podcast em [ANO DE INÍCIO] e virou o podcast nº 1 do Alto Tietê, eleito três anos seguidos e 4x premiado.",
  "Hoje é também estúdio de gravação, portal de notícias da região e escola pra empreendedor, com a formação Da Quebrada ao Digital e a consultoria De Quebrada Business.",
  "[COMPLETAR A HISTÓRIA: MARCOS, PRIMEIRO EPISÓDIO, MUDANÇAS DE ENDEREÇO, CONQUISTAS]",
];

const CARLOS = [
  "Carlos Junior, o Juninho de Ferraz, é empreendedor digital, mentor, palestrante e especialista em comunicação estratégica, marketing e posicionamento. Criador do premiado Podcast De Quebrada, ele transforma a vivência na periferia e a experiência em multinacional em ferramentas reais pra formar empreendedores.",
  "Dirige mais de 10 podcasts e lidera um estúdio completo de gravação de podcasts, videoaulas e conteúdo pras redes. É fundador da AUVED, a Universidade do Empreendedor Digital, e criou a Liga dos Empreendedores, comunidade de networking e negócios da região.",
];

const TEAM = [
  { name: "[NOME DA PESSOA DA EQUIPE]", role: "[FUNÇÃO]" },
  { name: "[NOME DA PESSOA DA EQUIPE]", role: "[FUNÇÃO]" },
  { name: "[NOME DA PESSOA DA EQUIPE]", role: "[FUNÇÃO]" },
];

const VALUES: CardItem[] = [
  { icon: "chat", title: "Falar a língua da quebrada", text: "Sem papo de guru, sem teoria de livro." },
  { icon: "pin", title: "Orgulho de onde a gente vem", text: "Ferraz e o Alto Tietê no centro da conversa." },
  { icon: "rocket", title: "Resultado de verdade", text: "Conteúdo e negócio que dão retorno pra quem participa." },
  { icon: "star", title: "[VALOR A CONFIRMAR]", text: "[DESCRIÇÃO DO VALOR]" },
];

export default function SobrePage() {
  const { address } = SITE;
  const fullAddress = `${address.street}, ${address.district}, ${address.city} ${address.region}, ${address.postalCode}`;

  return (
    <>
      <PageHero
        eyebrow="Sobre o De Quebrada"
        title={
          <>
            Da quebrada pro topo, com <span className="text-accent">visão, voz e atitude.</span>
          </>
        }
        lead="Podcast, estúdio, portal de notícias e escola pra empreendedor, direto de Ferraz de Vasconcelos."
        actions={
          <a href="#onde-encontrar" className="btn btn-primary">
            Onde nos encontrar
          </a>
        }
        aside={<PhotoSlot label="FOTO DO CARLOS JUNIOR AQUI" className="hidden aspect-[4/5] lg:block" />}
      />
      <Stats items={BRAND_STATS} />

      <Section labelledBy="historia-titulo" tone="light">
        <SectionTitle id="historia-titulo" eyebrow="Nossa história" title="Como tudo começou" />
        <div data-reveal="" className="max-w-3xl space-y-5 text-lg leading-relaxed text-muted">
          {HISTORY.map((p) => (
            <p key={p.slice(0, 30)}>
              <Marked>{p}</Marked>
            </p>
          ))}
        </div>

        <h3 className="mt-16 text-2xl font-bold tracking-tight">Realizações</h3>
        <p className="mt-3 text-lg text-muted">
          <Ph>[LISTA DE PRÊMIOS E REALIZAÇÕES]</Ph> Hoje fica só em imagem no site atual; precisa
          ser enviada em texto.
        </p>
      </Section>

      <Section labelledBy="equipe-titulo">
        <SectionTitle id="equipe-titulo" eyebrow="Equipe" title="Quem faz o De Quebrada" />
        <div className="grid items-start gap-10 lg:grid-cols-[0.8fr_1.2fr]">
          <PhotoSlot label="FOTO DA EQUIPE AQUI" className="aspect-[4/3] lg:aspect-[4/5]" />
          <div>
            <h3 className="text-2xl font-bold tracking-tight">Carlos Junior, o Juninho de Ferraz</h3>
            <p className="mt-1 text-accent">Fundador e apresentador</p>
            <div className="mt-5 space-y-5 text-lg leading-relaxed text-muted">
              {CARLOS.map((p) => (
                <p key={p.slice(0, 30)}>{p}</p>
              ))}
            </div>
            <ul className="mt-10 grid gap-4 sm:grid-cols-3">
              {TEAM.map((m, i) => (
                <li
                  key={i}
                  data-reveal=""
                  style={stagger(i, 90)}
                  className="rounded-xl border border-line bg-surface p-5"
                >
                  <p className="font-bold">
                    <Marked>{m.name}</Marked>
                  </p>
                  <p className="mt-1 text-sm text-muted">
                    <Marked>{m.role}</Marked>
                  </p>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </Section>

      <Section labelledBy="valores-titulo" tone="panel">
        <SectionTitle id="valores-titulo" eyebrow="Valores" title="No que a gente acredita" />
        <CardGrid items={VALUES} columns="2" />
      </Section>

      <Section id="onde-encontrar" labelledBy="onde-titulo">
        <SectionTitle
          id="onde-titulo"
          eyebrow="Onde nos encontrar"
          title="Siga, ouça e assista"
          lead="O De Quebrada Podcast e os perfis do De Quebrada em todas as plataformas."
        />
        <ChannelCards showMetrics={false} />
      </Section>

      <Section labelledBy="visite-titulo" tone="light">
        <SectionTitle id="visite-titulo" eyebrow="Visite a gente" title="Endereço e contato" />
        <div className="grid gap-10 lg:grid-cols-[0.8fr_1.2fr]">
          <address className="space-y-6 text-lg not-italic">
            <div>
              <p className="text-sm font-bold uppercase tracking-[0.14em] text-muted">Endereço</p>
              <p className="mt-2">
                {address.street}, {address.district}
                <br />
                {address.city} {address.region}, {address.postalCode}
              </p>
            </div>
            <div>
              <p className="text-sm font-bold uppercase tracking-[0.14em] text-muted">Telefone e WhatsApp</p>
              <p className="mt-2">
                <a className="font-semibold text-accent underline-offset-4 hover:underline" href={`tel:${SITE.phoneE164}`}>
                  {SITE.phoneDisplay}
                </a>
              </p>
            </div>
            <div>
              <p className="text-sm font-bold uppercase tracking-[0.14em] text-muted">E-mail</p>
              <p className="mt-2">
                <Ph>{SITE.emailPlaceholder}</Ph>
              </p>
            </div>
            <div>
              <p className="text-sm font-bold uppercase tracking-[0.14em] text-muted">Horário</p>
              <p className="mt-2">
                <Ph>[HORÁRIO DE ATENDIMENTO]</Ph>
              </p>
            </div>
          </address>
          <MapEmbed query={fullAddress} title={`Mapa: ${fullAddress}`} />
        </div>
      </Section>

      <FinalCta />
    </>
  );
}
