import Link from "next/link";
import { asc, desc } from "drizzle-orm";
import { db, schema } from "@/db";

const { banners } = schema;

function fmt(d: string | null) {
  return d ? d.split("-").reverse().join("/") : null;
}

export default async function BannersPage({ searchParams }: PageProps<"/painel/banners">) {
  const sp = await searchParams;
  const rows = await db.select().from(banners).orderBy(asc(banners.sortOrder), desc(banners.createdAt));
  const today = new Date().toLocaleDateString("en-CA", { timeZone: "America/Sao_Paulo" });

  function status(b: (typeof rows)[number]) {
    if (!b.active) return { label: "Escondido", on: false };
    if (b.startsAt && b.startsAt > today) return { label: "Agendado", on: false };
    if (b.endsAt && b.endsAt < today) return { label: "Encerrado", on: false };
    return { label: "No ar", on: true };
  }

  return (
    <>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <h1 className="h2-section">Banners da home</h1>
        <Link href="/painel/banners/novo" className="btn btn-primary">
          Novo banner
        </Link>
      </div>
      <p className="mt-3 text-muted">
        Banners das prefeituras e parceiros. Aparecem na home, logo abaixo dos números, dentro do período definido.
      </p>
      {sp.excluido && (
        <p role="status" className="mt-6 rounded-lg border border-accent/50 bg-accent/10 px-4 py-3">
          Banner excluído.
        </p>
      )}
      {rows.length === 0 ? (
        <p className="mt-10 text-lg text-muted">Nenhum banner ainda.</p>
      ) : (
        <ul className="mt-8 divide-y divide-line rounded-xl border border-line bg-surface">
          {rows.map((b) => {
            const s = status(b);
            const period = b.startsAt || b.endsAt ? `${fmt(b.startsAt) ?? "…"} a ${fmt(b.endsAt) ?? "…"}` : "Sem prazo";
            return (
              <li key={b.id} className="flex items-center gap-4 p-4">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={b.imageUrl}
                  alt=""
                  className="aspect-[4/1] w-40 shrink-0 rounded-md border border-line bg-white object-contain"
                />
                <div className="min-w-0 flex-1">
                  <Link href={`/painel/banners/${b.id}`} className="font-semibold hover:text-accent">
                    {b.title}
                  </Link>
                  <p className="text-sm text-muted">{period}</p>
                </div>
                <span
                  className={`shrink-0 rounded-full px-3 py-1 text-xs font-bold uppercase tracking-wider ${
                    s.on ? "bg-accent text-accent-ink" : "border border-line text-muted"
                  }`}
                >
                  {s.label}
                </span>
              </li>
            );
          })}
        </ul>
      )}
    </>
  );
}
