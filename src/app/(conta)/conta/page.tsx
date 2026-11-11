import type { Metadata } from "next";
import Link from "next/link";
import { requireUser } from "@/lib/auth";
import { AuthCard } from "../AuthCard";
import { DeleteAccountForm } from "../forms";
import { logoutAction } from "../actions";

export const metadata: Metadata = {
  title: "Minha conta",
  description: "Dados da sua conta e exclusão de conta.",
};

export default async function ContaPage() {
  const user = await requireUser("/conta");
  return (
    <AuthCard title="Minha conta">
      <dl className="space-y-3">
        <div>
          <dt className="text-sm text-muted">Nome</dt>
          <dd className="font-semibold">{user.name}</dd>
        </div>
        <div>
          <dt className="text-sm text-muted">E-mail</dt>
          <dd className="font-semibold [overflow-wrap:anywhere]">{user.email}</dd>
        </div>
        <div>
          <dt className="text-sm text-muted">Assinatura</dt>
          <dd className="font-semibold">
            {user.isSubscriber || user.role === "admin" ? "Ativa" : "Aguardando liberação"}
          </dd>
        </div>
      </dl>
      <div className="mt-6 flex flex-col gap-3">
        <Link href="/membros" className="btn btn-primary">
          Ir para a área de membros
        </Link>
        <Link href="/esqueci-senha" className="btn btn-ghost">
          Trocar minha senha
        </Link>
        <form action={logoutAction}>
          <button type="submit" className="btn btn-ghost w-full">
            Sair
          </button>
        </form>
      </div>

      {user.role !== "admin" && (
        <section aria-labelledby="excluir-titulo" className="mt-10 border-t border-line pt-8">
          <h2 id="excluir-titulo" className="text-xl font-bold">
            Excluir minha conta
          </h2>
          <p className="mt-2 text-sm text-muted">
            Apaga sua conta, seu nome, seu e-mail e suas sessões. Não dá para desfazer. Veja a{" "}
            <Link href="/politica-de-privacidade" className="text-accent underline underline-offset-4">
              Política de Privacidade
            </Link>
            .
          </p>
          <div className="mt-5">
            <DeleteAccountForm />
          </div>
        </section>
      )}
    </AuthCard>
  );
}
