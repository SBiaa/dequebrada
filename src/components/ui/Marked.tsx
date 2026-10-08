import { Fragment } from "react";

/** Marcador visível de conteúdo que o cliente ainda precisa preencher. */
export function Ph({ children }: { children: React.ReactNode }) {
  return (
    <mark className="whitespace-normal rounded border border-dashed border-warn-line bg-warn-bg px-1.5 py-px text-[0.92em] font-semibold text-warn [box-decoration-break:clone]">
      {children}
    </mark>
  );
}

/** Renderiza o texto destacando automaticamente todo trecho entre [COLCHETES]. */
export function Marked({ children }: { children: string }) {
  const parts = children.split(/(\[[^\]]+\])/g);
  return (
    <>
      {parts.map((part, i) =>
        /^\[[^\]]+\]$/.test(part) ? (
          <Ph key={i}>{part}</Ph>
        ) : (
          <Fragment key={i}>{part}</Fragment>
        ),
      )}
    </>
  );
}
