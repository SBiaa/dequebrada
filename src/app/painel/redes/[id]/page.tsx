import { RedeDetail } from "@/components/negocio/RedeDetail";
import { requireAdmin } from "@/lib/auth";

export default async function PainelRedePage({ params, searchParams }: PageProps<"/painel/redes/[id]">) {
  const { id } = await params;
  const sp = await searchParams;
  const user = await requireAdmin(`/painel/redes/${id}`);
  return <RedeDetail userId={user.id} accountId={id} base="/painel/redes" novo={!!sp.novo} form={typeof sp.form === "string" ? sp.form : undefined} />;
}
