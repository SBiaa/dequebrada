"use client";

import { useState } from "react";

/** Botão que copia o link completo do quiz (para colar na bio, no story...). */
export function CopyLink({ path, label }: { path: string; label: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      type="button"
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(`${window.location.origin}${path}`);
          setCopied(true);
          setTimeout(() => setCopied(false), 2000);
        } catch {
          /* sem permissão de área de transferência: ignora */
        }
      }}
      className="btn btn-ghost !min-h-9 !px-3 !text-sm"
    >
      <span aria-live="polite">{copied ? "Link copiado!" : "Copiar link"}</span>
      <span className="sr-only"> {label}</span>
    </button>
  );
}
