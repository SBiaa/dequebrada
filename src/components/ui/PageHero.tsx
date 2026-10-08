type Props = {
  eyebrow: string;
  title: React.ReactNode;
  lead?: React.ReactNode;
  actions?: React.ReactNode;
  aside?: React.ReactNode;
  /** Linha discreta de credenciais abaixo dos botões. */
  proof?: string[];
};

/** Abertura das páginas internas. Contém o único <h1> da página. */
export function PageHero({ eyebrow, title, lead, actions, aside, proof }: Props) {
  return (
    <section className="relative overflow-hidden bg-bg px-5 pb-16 pt-14 md:pb-24 md:pt-24">
      <div
        aria-hidden="true"
        className="drift pointer-events-none absolute inset-0 [background:radial-gradient(60rem_28rem_at_88%_-12%,rgb(77_184_234/0.14),transparent_65%)]"
      />
      <div
        className={`relative mx-auto grid max-w-6xl items-center gap-14 ${aside ? "lg:grid-cols-[1.2fr_0.8fr]" : ""}`}
      >
        <div>
          <p className="eyebrow hero-in mb-5">{eyebrow}</p>
          <h1 className="h1 hero-in max-w-3xl" style={{ "--d": "100ms" } as React.CSSProperties}>
            {title}
          </h1>
          {lead && (
            <p
              className="hero-in mt-6 max-w-2xl text-lg leading-relaxed text-muted md:text-xl"
              style={{ "--d": "220ms" } as React.CSSProperties}
            >
              {lead}
            </p>
          )}
          {actions && (
            <div
              className="hero-in mt-9 flex flex-col gap-3 sm:flex-row"
              style={{ "--d": "340ms" } as React.CSSProperties}
            >
              {actions}
            </div>
          )}
          {proof && (
            <ul
              className="hero-in mt-10 flex flex-wrap gap-x-6 gap-y-2 border-t border-line pt-6 text-sm text-muted"
              style={{ "--d": "460ms" } as React.CSSProperties}
            >
              {proof.map((item) => (
                <li key={item} className="flex items-center gap-2">
                  <span aria-hidden="true" className="h-1 w-1 rounded-full bg-accent" />
                  {item}
                </li>
              ))}
            </ul>
          )}
        </div>
        {aside && (
          <div className="hero-in" style={{ "--d": "300ms" } as React.CSSProperties}>
            {aside}
          </div>
        )}
      </div>
    </section>
  );
}
