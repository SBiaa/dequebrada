import Link from "next/link";
import { PhotoSlot } from "@/components/ui/PhotoSlot";
import { Section } from "@/components/ui/Section";

export function AboutTeaser() {
  return (
    <Section labelledBy="sobre-titulo">
      <div className="grid items-center gap-12 lg:grid-cols-[0.8fr_1.2fr]">
        <PhotoSlot label="FOTO DO CARLOS JUNIOR AQUI" className="aspect-[4/5] max-w-md" />
        <div data-reveal="">
          <p className="eyebrow mb-4">Quem está por trás</p>
          <h2 id="sobre-titulo" className="h2-section">
            Carlos Junior, de quebrada pro mercado
          </h2>
          <ul className="mt-6 space-y-3 text-lg text-muted">
            <li>Saiu do telemarketing depois de 8 anos numa multinacional, sem rede e sem capital.</li>
            <li>Criou do zero o podcast nº 1 de Ferraz e região, em 2020.</li>
            <li>Dono de estúdio, portal de jornalismo e espaço de eventos.</li>
          </ul>
          <Link href="/sobre" className="btn btn-ghost mt-8">
            Conhecer a história
            <span aria-hidden="true">→</span>
          </Link>
        </div>
      </div>
    </Section>
  );
}
