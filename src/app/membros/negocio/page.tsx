import type { Metadata } from "next";
import { NegocioOverview } from "@/components/negocio/NegocioOverview";
import { WhatsAppButton } from "@/components/ui/WhatsAppButton";
import { canSeeExclusive, requireUser } from "@/lib/auth";
import { WHATSAPP_MESSAGES } from "@/lib/site";

export const metadata: Metadata = { title: "Meu negócio", robots: { index: false, follow: false } };

export default async function NegocioPage() {
  const user = await requireUser("/membros/negocio");

  if (!canSeeExclusive(user)) {
    return (
      <div className="px-5 py-14">
        <div className="mx-auto max-w-2xl">
          <p className="eyebrow">Área de membros</p>
          <h1 className="h2-section mt-3">Acompanhe o crescimento do seu negócio</h1>
          <p className="mt-4 text-lg text-muted">
            Assinantes cadastram o negócio e as redes sociais, lançam seguidores, insights e posts, e acompanham tudo em
            gráficos. Fale com a gente pra liberar sua assinatura.
          </p>
          <div className="mt-8">
            <WhatsAppButton message={WHATSAPP_MESSAGES.geral} source="membros-negocio-assinar">
              Quero assinar
            </WhatsAppButton>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="px-5 py-10 md:py-14">
      <div className="mx-auto max-w-4xl">
        <NegocioOverview
          userId={user.id}
          base="/membros/negocio"
          eyebrow="Meu negócio"
          back={{ href: "/membros", label: "Área de membros" }}
          intro="Comece pelos dados do seu negócio. Depois você adiciona as redes sociais e lança os números."
        />
      </div>
    </div>
  );
}
