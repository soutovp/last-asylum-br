import { Metadata } from "next";
import Image from "next/image";
import Header from "@/components/Header";
import GuiasVisuaisContent from "@/components/GuiasVisuaisContent";

export const metadata: Metadata = {
  title: "Guias Visuais, Infográficos e Layouts de Base - Last Asylum BR",
  description: "Acesse infográficos em alta qualidade e tabelas de referência rápida para Last Asylum. Layouts de base para eventos de invasão, tabelas de recursos e muito mais.",
  keywords: [
    "Last Asylum guias visuais",
    "Last Asylum infograficos",
    "Tabelas de referencia Last Asylum",
    "Last Asylum layout de base",
    "Last Asylum layouts invasao",
    "Planners Last Asylum"
  ],
  openGraph: {
    title: "Guias Visuais, Infográficos e Layouts de Base - Last Asylum BR",
    description: "Acesse infográficos e guias visuais em alta qualidade para Last Asylum. Otimize seus layouts de base e consulte tabelas rápidas offline.",
    url: "https://lapbr.netlify.app/guias-visuais",
    siteName: "Last Asylum BR",
    images: [
      {
        url: "https://res.cloudinary.com/orrs3pvy/image/upload/v1786313785/preview-link-url_rcc5uk.webp",
        width: 1200,
        height: 630,
        alt: "Last Asylum BR Visual Guides"
      }
    ],
    locale: "pt_BR",
    type: "website"
  },
  twitter: {
    card: "summary_large_image",
    title: "Guias Visuais, Infográficos e Layouts de Base - Last Asylum BR",
    description: "Acesse infográficos e guias visuais em alta qualidade para Last Asylum.",
    images: ["https://res.cloudinary.com/orrs3pvy/image/upload/v1786313785/preview-link-url_rcc5uk.webp"]
  }
};

export default function GuiasVisuaisPage() {
  return (
    <div className="relative min-h-screen flex flex-col bg-[#080c14] text-slate-100 selection:bg-cyan-400 selection:text-slate-950 overflow-x-hidden">
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
          <GuiasVisuaisContent />
        </main>
      </div>
    </div>
  );
}
