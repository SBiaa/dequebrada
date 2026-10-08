import type { Metadata, Viewport } from "next";
import { Bebas_Neue, Inter } from "next/font/google";
import { Analytics } from "@/components/layout/Analytics";
import { Footer } from "@/components/layout/Footer";
import { Header } from "@/components/layout/Header";
import { ProposalBanner } from "@/components/layout/ProposalBanner";
import { WhatsAppFloat } from "@/components/layout/WhatsAppFloat";
import { RevealObserver } from "@/components/motion/RevealObserver";
import "./globals.css";

const bebas = Bebas_Neue({
  variable: "--font-bebas",
  subsets: ["latin"],
  weight: "400",
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "De Quebrada | Presença Digital em Ferraz de Vasconcelos",
    template: "%s | De Quebrada",
  },
  description:
    "Proposta de layout para o De Quebrada, podcast, estúdio e portal de notícias de Ferraz de Vasconcelos, Zona Leste de SP.",
  robots: { index: false, follow: false },
};

export const viewport: Viewport = {
  themeColor: "#05080f",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="pt-BR" className={`${bebas.variable} ${inter.variable}`}>
      <body className="min-h-screen">
        <a
          href="#conteudo"
          className="sr-only z-[60] rounded bg-warn px-4 py-2 font-bold text-black focus:not-sr-only focus:fixed focus:left-3 focus:top-3"
        >
          Pular para o conteúdo
        </a>
        <ProposalBanner />
        <Header />
        <main id="conteudo">{children}</main>
        <Footer />
        <WhatsAppFloat />
        <Analytics />
        <RevealObserver />
      </body>
    </html>
  );
}
