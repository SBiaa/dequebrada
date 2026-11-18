import type { Metadata } from "next";
import Link from "next/link";
import { CardGrid, type CardItem } from "@/components/ui/CardGrid";
import { Marked } from "@/components/ui/Marked";
import { PageHero } from "@/components/ui/PageHero";
import { Section, SectionTitle } from "@/components/ui/Section";
import { WhatsAppButton } from "@/components/ui/WhatsAppButton";
import { canSeeExclusive, getCurrentUser } from "@/lib/auth";
import { KIND_LABEL, listPublishedContents } from "@/lib/members";
import { stagger } from "@/lib/motion";
import { WHATSAPP_MESSAGES } from "@/lib/site";

export const metadata: Metadata = {
  title: "Área de Membros do De Quebrada Podcast",
  description:
    "Assista aos episódios do De Quebrada Podcast direto no site e acesse conteúdos exclusivos para assinantes: vídeos, aulas e materiais.",
};

const BENEFITS: CardItem[] = [
  { icon: "video", title: "Episódios no site", text: "Todos os episódios do De Quebrada Podcast num lugar só, pra assistir aqui mesmo." },
  { icon: "star", title: "Conteúdos exclusivos", text: "Vídeos, aulas e materiais só para assinantes." },
  { icon: "clipboard", title: "Materiais para baixar", text: "PDFs e roteiros pra colocar em prática." },
  { icon: "rocket", title: "Painel do seu negócio", text: "Lance seguidores, insights e posts das suas redes e acompanhe o crescimento em gráficos." },
];

export default async function MembrosPage({ searchParams }: PageProps<"/membros">) {
  const user = await getCurrentUser();
  const sp = await searchParams;

  if (!user) {
    return (
      <>
        <PageHero
          eyebrow="Área de membros"
          title={
            <>
              O De Quebrada <span className="text-accent">por dentro</span>
            </>
          }
          lead="Crie sua conta pra assistir aos episódios aqui no site. Assinantes acessam também os conteúdos exclusivos."
          actions={
            <>
              <Link href="/cadastro" className="btn btn-primary">
                Criar conta grátis
              </Link>
              <Link href="/entrar?next=/membros" className="btn btn-ghost">
                Já tenho conta
              </Link>
            </>
          }
        />
        <Section labelledBy="beneficios-titulo" tone="panel">
          <SectionTitle id="beneficios-titulo" eyebrow="O que tem dentro" title="Pra quem quer ir além do feed" />
          <CardGrid items={BENEFITS} />
          <p className="mt-8 text-lg text-muted">
            Valor da assinatura: <Marked>[DEFINIR]</Marked>
          </p>
        </Section>
      </>
    );
  }

  const exclusive = canSeeExclusive(user);
  const contents = exclusive ? await listPublishedContents() : [];

  return (
    <>
      <PageHero
        eyebrow="Área de membros"
        title={
          <>
            Fala, <span className="text-accent">{user.name.split(" ")[0]}!</span>
          </>
        }
        lead={
          sp.bemvindo
            ? "Sua conta foi criada. Os episódios já estão liberados pra você."
            : "Bom te ver por aqui."
        }
        actions={
          <>
            <Link href="/membros/episodios" className="btn btn-primary">
              Assistir aos episódios
            </Link>
            {exclusive && (
              <Link href="/membros/negocio" className="btn btn-ghost">
                Meu negócio
              </Link>
            )}
            <Link href="/conta" className="btn btn-ghost">
              Minha conta
            </Link>
          </>
        }
      />

      <Section labelledBy="exclusivos-titulo">
        <SectionTitle id="exclusivos-titulo" eyebrow="Só para assinantes" title="Conteúdos exclusivos" />
        {!exclusive ? (
          <div className="max-w-2xl rounded-2xl border border-line bg-surface p-7">
            <h3 className="text-xl font-bold">Sua assinatura ainda não está ativa</h3>
            <p className="mt-3 text-muted">
              Os conteúdos exclusivos são liberados para assinantes. Valor e forma de pagamento:{" "}
              <Marked>[DEFINIR]</Marked>. Chama no WhatsApp pra assinar; a liberação é feita pela equipe.
            </p>
            <div className="mt-6">
              <WhatsAppButton message={WHATSAPP_MESSAGES.assinatura} source="membros-assinar">
                Quero assinar
              </WhatsAppButton>
            </div>
          </div>
        ) : contents.length === 0 ? (
          <p className="text-lg text-muted">Os primeiros conteúdos exclusivos estão chegando.</p>
        ) : (
          <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {contents.map((c, i) => (
              <li key={c.id} data-reveal="" style={stagger(i % 3, 100)}>
                <article className="lift relative flex h-full flex-col rounded-xl border border-line bg-surface p-6">
                  <p className="eyebrow">{KIND_LABEL[c.kind]}</p>
                  <h3 className="mt-3 text-lg font-bold leading-snug">
                    <Link href={`/membros/conteudos/${c.slug}`} className="after:absolute after:inset-0 hover:text-accent">
                      {c.title}
                    </Link>
                  </h3>
                  <p className="mt-2 flex-1 text-muted">{c.description}</p>
                </article>
              </li>
            ))}
          </ul>
        )}
      </Section>
    </>
  );
}
