type SectionProps = {
  id?: string;
  className?: string;
  children: React.ReactNode;
  labelledBy?: string;
  /** "light" inverte a seção para fundo claro (papel). */
  tone?: "dark" | "light" | "panel";
};

const TONES = {
  dark: "bg-bg text-ink",
  panel: "bg-surface text-ink",
  light: "light bg-bg text-ink",
} as const;

export function Section({
  id,
  className = "",
  children,
  labelledBy,
  tone = "dark",
}: SectionProps) {
  return (
    <section
      id={id}
      aria-labelledby={labelledBy}
      className={`scroll-anchor px-5 py-20 md:py-28 ${TONES[tone]} ${className}`}
    >
      <div className="mx-auto max-w-6xl">{children}</div>
    </section>
  );
}

type TitleProps = {
  id?: string;
  eyebrow?: string;
  title: React.ReactNode;
  lead?: React.ReactNode;
};

export function SectionTitle({ id, eyebrow, title, lead }: TitleProps) {
  return (
    <header data-reveal="" className="mb-12 max-w-3xl md:mb-14">
      {eyebrow && <p className="eyebrow mb-4">{eyebrow}</p>}
      <h2 id={id} className="h2-section">
        {title}
      </h2>
      {lead && <p className="mt-4 text-lg leading-relaxed text-muted">{lead}</p>}
    </header>
  );
}
