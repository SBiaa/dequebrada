import { WHATSAPP_MESSAGES } from "@/lib/site";
import { Section } from "@/components/ui/Section";
import { WhatsAppButton } from "@/components/ui/WhatsAppButton";

export function RaioX() {
  return (
    <Section labelledBy="raiox-titulo" tone="panel">
      <div className="grid items-center gap-10 lg:grid-cols-[1.3fr_0.7fr]">
        <div>
          <p className="eyebrow mb-4">Quadro do podcast</p>
          <h2 id="raiox-titulo" className="h2-section">
            Raio-X da Quebrada
          </h2>
          <p className="mt-5 max-w-2xl text-lg leading-relaxed text-muted">
            Todo mês, um comércio da região senta no estúdio e tem a presença digital
            analisada ao vivo no podcast.
          </p>
          <div className="mt-8">
            <WhatsAppButton message={WHATSAPP_MESSAGES.raioX} source="raio-x">
              Quero ser o próximo
            </WhatsAppButton>
          </div>
        </div>
        <ul className="space-y-4 border-l border-line pl-8 text-muted">
          <li>
            <strong className="block text-ink">1. Você senta no estúdio</strong>
            Um comércio da região por mês.
          </li>
          <li>
            <strong className="block text-ink">2. Análise ao vivo</strong>
            Perfil, Google, vitrine e atendimento.
          </li>
          <li>
            <strong className="block text-ink">3. Plano pra amanhã</strong>
            O que ajustar primeiro.
          </li>
        </ul>
      </div>
    </Section>
  );
}
