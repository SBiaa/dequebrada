type Props = {
  label: string;
  className?: string;
};

/** Espaço reservado para foto real (estúdio, equipe, clientes). Sem imagem de stock. */
export function PhotoSlot({ label, className = "" }: Props) {
  return (
    <div
      role="img"
      aria-label={`Espaço reservado: ${label}`}
      className={`relative overflow-hidden rounded-2xl border border-line bg-surface-2 ${className}`}
    >
      <div
        aria-hidden="true"
        className="absolute inset-0 [background:radial-gradient(120%_80%_at_80%_0%,rgb(77_184_234/0.16),transparent_60%),linear-gradient(160deg,var(--surface-2),var(--surface))]"
      />
      <div className="relative flex h-full min-h-48 flex-col items-center justify-center gap-3 p-6 text-center">
        <svg
          viewBox="0 0 24 24"
          className="h-8 w-8 text-muted"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          aria-hidden="true"
        >
          <rect x="3" y="5" width="18" height="14" rx="2" />
          <circle cx="9" cy="11" r="2" />
          <path d="m21 16-5-5-8 8" />
        </svg>
        <span className="rounded border border-dashed border-warn-line bg-warn-bg px-2 py-0.5 text-sm font-semibold text-warn">
          [{label}]
        </span>
      </div>
    </div>
  );
}
