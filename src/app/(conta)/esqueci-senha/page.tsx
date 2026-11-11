import type { Metadata } from "next";
import { AuthCard } from "../AuthCard";
import { ForgotForm } from "../forms";

export const metadata: Metadata = {
  title: "Esqueci minha senha",
  description: "Receba por e-mail um link para criar uma nova senha.",
};

export default function EsqueciSenhaPage() {
  return (
    <AuthCard
      title="Esqueci a senha"
      lead="Digite o e-mail da sua conta. Vamos enviar um link para você criar uma nova senha."
    >
      <ForgotForm />
    </AuthCard>
  );
}
