import type { Metadata } from "next";
import { AuthCard } from "../AuthCard";
import { SignupForm } from "../forms";

export const metadata: Metadata = {
  title: "Criar conta",
  description: "Crie sua conta na área de membros do De Quebrada.",
};

export default function CadastroPage() {
  return (
    <AuthCard title="Criar conta" lead="Com a conta, você assiste aos episódios aqui no site e acessa os conteúdos liberados para assinantes.">
      <SignupForm />
    </AuthCard>
  );
}
