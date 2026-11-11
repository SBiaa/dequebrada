import { TrackedLink } from "./TrackedLink";
import { WhatsAppButton } from "./WhatsAppButton";

/** Aceita só links https, para nenhum valor estranho virar href. */
function safeUrl(value: string | undefined): string | null {
  if (!value) return null;
  try {
    const url = new URL(value);
    return url.protocol === "https:" ? url.toString() : null;
  } catch {
    return null;
  }
}

type Props = {
  /** Link de checkout (vem de variável de ambiente). Sem link, o botão vai para o WhatsApp. */
  checkoutUrl: string | undefined;
  whatsappMessage: string;
  source: string;
  children: React.ReactNode;
  className?: string;
};

/** Botão principal de compra: checkout quando existir, WhatsApp como alternativa. */
export function BuyButton({ checkoutUrl, whatsappMessage, source, children, className = "btn" }: Props) {
  const href = safeUrl(checkoutUrl);
  if (href) {
    return (
      <TrackedLink href={href} source={source} event="checkout" external className={`${className} btn-primary`}>
        {children}
      </TrackedLink>
    );
  }
  return (
    <WhatsAppButton message={whatsappMessage} source={source} className={`${className} btn-wa`}>
      {children}
    </WhatsAppButton>
  );
}
