import { WHATSAPP_MESSAGES } from "@/lib/site";
import { Section } from "@/components/ui/Section";
import { WhatsAppButton } from "@/components/ui/WhatsAppButton";

type Props = {
  title?: string;
  text?: string;
  button?: string;
  message?: string;
  source?: string;
};

export function FinalCta({
  title = "Chega de tentar no escuro.",
  text = "Chama no WhatsApp e conta onde o seu negócio está. A conversa é sem compromisso.",
  button = "Falar no WhatsApp",
  message = WHATSAPP_MESSAGES.geral,
  source = "cta-final",
}: Props) {
  return (
    <Section id="contato" labelledBy="cta-titulo" tone="panel">
      <div className="flex flex-col items-start justify-between gap-8 lg:flex-row lg:items-center">
        <div className="max-w-2xl">
          <p className="eyebrow mb-4">Fale com a gente</p>
          <h2 id="cta-titulo" className="h2-section">
            {title}
          </h2>
          <p className="mt-4 text-lg text-muted">{text}</p>
        </div>
        <WhatsAppButton message={message} source={source} className="btn btn-wa shrink-0 !px-8">
          {button}
        </WhatsAppButton>
      </div>
    </Section>
  );
}
