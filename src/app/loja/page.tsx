import type { Metadata } from "next";
import { ComingSoon } from "@/components/ui/ComingSoon";

export const metadata: Metadata = {
  title: "Loja De Quebrada",
  description: "Canecas, camisetas, microfones e itens de estúdio do De Quebrada. Em breve.",
};

export default function LojaPage() {
  return (
    <ComingSoon
      eyebrow="Loja · Em breve"
      title="Loja De Quebrada"
      lead="Canecas, camisetas, microfones, itens de estúdio e escritório. A vitrine está chegando."
    />
  );
}
