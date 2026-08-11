import { Metadata } from "next";
import Image from "next/image";
import Header from "@/components/Header";
import CodigosContent from "@/components/CodigosContent";
import Footer from "@/components/Footer";

export const metadata: Metadata = {
  title: "Códigos de Resgate Ativos (Gift Codes) - Last Asylum BR",
  description: "Lista de todos os códigos de presente (Gift Codes) ativos de Last Asylum Plague. Copie e resgate recompensas de diamantes, recursos e antitoxina.",
  keywords: [
    "Last Asylum códigos",
    "Last Asylum gift codes",
    "Códigos presente Last Asylum",
    "Códigos ativos Last Asylum",
    "Last Asylum cupons",
    "Last Asylum resgate"
  ],
  openGraph: {
    title: "Códigos de Resgate Ativos (Gift Codes) - Last Asylum BR",
    description: "Lista de todos os códigos de presente ativos de Last Asylum Plague. Copie e resgate recompensas grátis de antitoxina, diamantes e recursos.",
    url: "https://lapbr.netlify.app/codigos",
    siteName: "Last Asylum BR",
    images: [
      {
        url: "https://res.cloudinary.com/orrs3pvy/image/upload/v1786313785/preview-link-url_rcc5uk.webp",
        width: 1200,
        height: 630,
        alt: "Last Asylum BR Gift Codes"
      }
    ],
    locale: "pt_BR",
    type: "website"
  },
  twitter: {
    card: "summary_large_image",
    title: "Códigos de Resgate Ativos (Gift Codes) - Last Asylum BR",
    description: "Lista de todos os códigos de presente ativos de Last Asylum Plague.",
    images: ["https://res.cloudinary.com/orrs3pvy/image/upload/v1786313785/preview-link-url_rcc5uk.webp"]
  }
};

export default function CodigosPage() {
  return (
    <div className="relative min-h-screen flex flex-col bg-[#080c14] text-slate-100 selection:bg-[#00ff88] selection:text-slate-950 overflow-x-hidden">
      {/* BACKGROUND VILA */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <Image
          src="/images/village_banner_2.png"
          alt="Background Vila"
          fill
          priority
          sizes="100vw"
          className="object-cover object-center opacity-85 scale-105"
        />
        <div className="absolute inset-0 bg-[#080c14]/30 backdrop-blur-[1px]"></div>
        <div className="absolute inset-0 bg-gradient-to-b from-[#080c14]/75 via-[#080c14]/65 to-[#080c14]/85"></div>
      </div>

      <div className="relative z-10 flex flex-col min-h-screen">
        <Header />
        <main className="flex-1 py-12 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
          <CodigosContent />
        </main>
        <Footer />
      </div>
    </div>
  );
}
