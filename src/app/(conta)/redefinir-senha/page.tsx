import type { Metadata } from "next";
import Link from "next/link";
import { AuthCard } from "../AuthCard";
import { ResetForm } from "../forms";

export const metadata: Metadata = {
  title: "Criar nova senha",
  description: "Crie uma nova senha para sua conta no De Quebrada.",
  // O token está na URL: não deixar vazar para outros sites.
  referrer: "no-referrer",
};

export default async function RedefinirSenhaPage({ searchParams }: PageProps<"/redefinir-senha">) {
  const { token } = await searchParams;
  if (typeof token !== "string" || !token) {
    return (
      <AuthCard title="Link inválido" lead="Este link está incompleto.">
        <Link href="/esqueci-senha" className="btn btn-primary w-full">
          Pedir um novo link
        </Link>
      </AuthCard>
    );
  }
  return (
    <AuthCard title="Nova senha" lead="Escolha uma nova senha para sua conta.">
      <ResetForm token={token} />
    </AuthCard>
  );
}
