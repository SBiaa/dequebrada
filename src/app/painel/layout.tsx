import type { Metadata } from "next";
import Link from "next/link";
import { PainelNav } from "./PainelNav";
import { logoutAction } from "@/app/(conta)/actions";
import { requireAdmin } from "@/lib/auth";

export const metadata: Metadata = {
  title: "Painel",
  robots: { index: false, follow: false },
};

export default async function PainelLayout({ children }: LayoutProps<"/painel">) {
  const user = await requireAdmin();
  return (
    <div className="px-5 py-10 md:py-14">
      <div className="mx-auto max-w-5xl">
        <div className="flex flex-col gap-4 border-b border-line pb-6 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="eyebrow">Painel do De Quebrada</p>
            <p className="mt-2 text-muted">Olá, {user.name}.</p>
          </div>
          <div className="flex gap-2">
            <Link href="/blog" className="btn btn-ghost !min-h-10 !px-4 !text-sm">
              Ver o site
            </Link>
          <form action={logoutAction}>
            <button type="submit" className="btn btn-ghost !min-h-10 !px-4 !text-sm">
              Sair
            </button>
          </form>
          </div>
        </div>
        <PainelNav />
        <div className="mt-10">{children}</div>
      </div>
    </div>
  );
}
