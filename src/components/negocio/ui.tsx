import { todayISO } from "@/lib/negocio";

const ABBR: Record<string, string> = {
  instagram: "IG",
  tiktok: "TT",
  youtube: "YT",
  facebook: "FB",
  linkedin: "IN",
  kwai: "KW",
  x: "X",
  whatsapp: "WA",
};

/** Selo redondo com a sigla da rede. */
export function NetworkBadge({ network, className = "h-10 w-10 text-sm" }: { network: string; className?: string }) {
  return (
    <span
      aria-hidden="true"
      className={`inline-flex shrink-0 items-center justify-center rounded-full bg-surface-2 font-bold tracking-wide text-accent ${className}`}
    >
      {ABBR[network] ?? "•"}
    </span>
  );
}

/** Dias entre uma data ISO (AAAA-MM-DD) e hoje. */
export function daysSince(day: string): number {
  return Math.round((Date.parse(todayISO()) - Date.parse(day)) / 86400000);
}

export function relDays(n: number): string {
  if (n <= 0) return "hoje";
  if (n === 1) return "ontem";
  return `há ${n} dias`;
}

/** Atualizado há mais de uma semana: hora de lançar de novo. */
export const STALE_DAYS = 7;

/** Variação com seta e cor. A palavra "mais/menos" fica para leitores de tela. */
export function Delta({ value, suffix = "" }: { value: number; suffix?: string }) {
  const up = value >= 0;
  return (
    <span className={`font-semibold ${up ? "text-accent" : "text-red-400"}`}>
      <span aria-hidden="true">{up ? "▲" : "▼"} </span>
      <span className="sr-only">{up ? "mais " : "menos "}</span>
      {up ? "+" : "−"}
      {Math.abs(value).toLocaleString("pt-BR")}
      {suffix}
    </span>
  );
}

/** Linha pequena de tendência (decorativa: os números aparecem ao lado). */
export function Sparkline({ values, className = "h-10 w-full" }: { values: number[]; className?: string }) {
  if (values.length < 2) return null;
  const min = Math.min(...values);
  const max = Math.max(...values);
  const span = max - min || 1;
  const w = 100;
  const h = 30;
  const pts = values
    .map((v, i) => `${((i / (values.length - 1)) * w).toFixed(2)},${(h - 2 - ((v - min) / span) * (h - 4)).toFixed(2)}`)
    .join(" ");
  return (
    <svg viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="none" aria-hidden="true" className={`text-accent ${className}`}>
      <polyline points={pts} fill="none" stroke="currentColor" strokeWidth="2" vectorEffect="non-scaling-stroke" />
    </svg>
  );
}

/** Botão "Apagar" que pede confirmação antes de enviar. */
export function ConfirmDelete({
  action,
  fields,
  label,
  srLabel,
  warning,
  confirmLabel = "Sim, apagar",
}: {
  action: (fd: FormData) => void | Promise<void>;
  fields: Record<string, string>;
  label: string;
  srLabel?: string;
  warning?: string;
  confirmLabel?: string;
}) {
  return (
    <details className="group relative">
      <summary className="btn btn-ghost !min-h-9 cursor-pointer list-none !px-3 !text-sm text-red-300 [&::-webkit-details-marker]:hidden">
        {label}
        {srLabel && <span className="sr-only"> {srLabel}</span>}
      </summary>
      <div className="mt-2 rounded-lg border border-red-400/50 bg-surface p-3 sm:absolute sm:right-0 sm:z-10 sm:w-64 sm:shadow-lg">
        {warning && <p className="text-sm text-muted">{warning}</p>}
        <form action={action} className={warning ? "mt-3" : ""}>
          {Object.entries(fields).map(([k, v]) => (
            <input key={k} type="hidden" name={k} value={v} />
          ))}
          <button type="submit" className="btn !min-h-9 w-full !text-sm border border-red-400/60 text-red-200 hover:bg-red-500/10">
            {confirmLabel}
          </button>
        </form>
      </div>
    </details>
  );
}
