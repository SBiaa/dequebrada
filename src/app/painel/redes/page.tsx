import { NegocioOverview } from "@/components/negocio/NegocioOverview";
import { requireAdmin } from "@/lib/auth";

/** As redes do próprio De Quebrada, com o mesmo controle que os membros têm. */
export default async function PainelRedesPage() {
  const user = await requireAdmin("/painel/redes");
  return (
    <NegocioOverview
      userId={user.id}
      base="/painel/redes"
      eyebrow="Minhas redes"
      intro="Cadastre o De Quebrada (ou o nome que quiser) pra começar. Depois adicione as redes e lance seguidores e posts."
    />
  );
}
