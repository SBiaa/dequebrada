import Link from "next/link";
import { WHATSAPP_MESSAGES } from "@/lib/site";
import { PageHero } from "@/components/ui/PageHero";
import { PhotoSlot } from "@/components/ui/PhotoSlot";
import { WhatsAppButton } from "@/components/ui/WhatsAppButton";

export function HomeHero() {
  return (
    <PageHero
      eyebrow="Ferraz de Vasconcelos · Alto Tietê"
      title={
        <>
          Da quebrada pra <span className="text-accent">toda a região.</span>
        </>
      }
      lead="Podcast nº 1 do Alto Tietê, portal de notícias, estúdio profissional e espaço de eventos. Tudo construído do zero em Ferraz de Vasconcelos, por quem saiu da quebrada."
      actions={
        <>
          <Link href="/blog" className="btn btn-primary">
            Ler as notícias
          </Link>
          <WhatsAppButton message={WHATSAPP_MESSAGES.geral} source="hero">
            Falar no WhatsApp
          </WhatsAppButton>
        </>
      }
      proof={[
        "Podcast nº 1 do Alto Tietê",
        "4x premiado",
        "600+ episódios",
        "Estúdio profissional em Ferraz",
      ]}
      aside={
        <PhotoSlot
          label="FOTO DO CARLOS / ESTÚDIO AQUI"
          className="hidden aspect-[4/5] lg:block"
        />
      }
    />
  );
}
