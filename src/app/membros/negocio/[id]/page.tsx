import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { RedeDetail } from "@/components/negocio/RedeDetail";
import { canSeeExclusive, requireUser } from "@/lib/auth";

export const metadata: Metadata = { title: "Minha rede", robots: { index: false, follow: false } };

export default async function RedePage({ params, searchParams }: PageProps<"/membros/negocio/[id]">) {
  const { id } = await params;
  const sp = await searchParams;
  const user = await requireUser(`/membros/negocio/${id}`);
  if (!canSeeExclusive(user)) redirect("/membros/negocio");
  return (
    <div className="px-5 py-10 md:py-14">
      <div className="mx-auto max-w-4xl">
        <RedeDetail userId={user.id} accountId={id} base="/membros/negocio" novo={!!sp.novo} form={typeof sp.form === "string" ? sp.form : undefined} />
      </div>
    </div>
  );
}
