/** Moldura das telas de conta (entrar, esqueci a senha, nova senha). */
export function AuthCard({
  title,
  lead,
  children,
}: {
  title: string;
  lead?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="px-5 py-16 md:py-24">
      <div className="mx-auto max-w-md rounded-2xl border border-line bg-surface p-7 md:p-10">
        <h1 className="display text-5xl">{title}</h1>
        {lead && <p className="mt-3 text-muted">{lead}</p>}
        <div className="mt-8">{children}</div>
      </div>
    </section>
  );
}
