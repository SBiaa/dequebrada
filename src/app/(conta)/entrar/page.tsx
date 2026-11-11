import type { Metadata } from "next";
import { AuthCard } from "../AuthCard";
import { LoginForm } from "../forms";

export const metadata: Metadata = {
  title: "Entrar",
  description: "Acesse sua conta no site do De Quebrada.",
};

export default async function EntrarPage({ searchParams }: PageProps<"/entrar">) {
  const sp = await searchParams;
  const next = typeof sp.next === "string" ? sp.next : "";
  const notice = sp.senha === "alterada" ? "Senha alterada. Entre com a nova senha." : undefined;
  return (
    <AuthCard title="Entrar" lead="Acesse sua conta no De Quebrada.">
      <LoginForm next={next} notice={notice} />
    </AuthCard>
  );
}
