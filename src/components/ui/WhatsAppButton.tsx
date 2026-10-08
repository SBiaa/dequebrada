"use client";

import { trackLead } from "@/lib/tracking";
import { whatsappUrl } from "@/lib/whatsapp";

export function WhatsAppIcon({ className = "h-5 w-5" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={className}
      aria-hidden="true"
      focusable="false"
    >
      <path
        d="M12 2.5a9.5 9.5 0 0 0-8.1 14.4L2.5 21.5l4.7-1.3A9.5 9.5 0 1 0 12 2.5Z"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinejoin="round"
      />
      <path
        fill="currentColor"
        d="M8.6 7.8c-.4.4-.6 1-.5 1.700.3 1.800 2.600 4.600 5.300 5.500.7.200 1.400.1 1.800-.3l.6-.8-2-1.100-.9.800c-1-.4-2-1.400-2.400-2.400l.8-.9-1.100-2.100-.6.600Z"
      />
    </svg>
  );
}

type Props = {
  message: string;
  /** Identifica de qual botão veio o clique (usado no evento Lead). */
  source: string;
  children: React.ReactNode;
  className?: string;
  showIcon?: boolean;
};

export function WhatsAppButton({
  message,
  source,
  children,
  className = "btn btn-wa",
  showIcon = true,
}: Props) {
  return (
    <a
      href={whatsappUrl(message)}
      target="_blank"
      rel="noopener noreferrer"
      className={className}
      onClick={() => trackLead(source)}
    >
      {showIcon && <WhatsAppIcon />}
      <span>{children}</span>
      <span className="sr-only"> (abre em nova aba)</span>
    </a>
  );
}
