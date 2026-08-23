import { Metadata } from "next";
import Hero from "@/components/Hero";
import QuickToolsHub from "@/components/QuickToolsHub";
import NewsSection from "@/components/NewsSection";
import PartnersCarousel from "@/components/PartnersCarousel";
import Footer from "@/components/Footer";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";

export const revalidate = 60; // Revalida a cada 60 segundos (ISR)

export const metadata: Metadata = {
  title: "Last Asylum BR - Portal, Calculadoras e Guias de Last Asylum Plague",
  description: "O hub brasileiro definitivo para Last Asylum Plague. Encontre calculadoras de recursos (Antitoxina, Fragmentos, Insígnias), calendário de eventos semanais, guias de sobrevivência e notícias oficiais.",
  keywords: [
    "Last Asylum Plague",
    "Last Asylum BR",
    "Last Asylum jogo",
    "Last Asylum guia",
    "Last Asylum calculadoras",
    "Last Asylum dicas",
    "Last Asylum sobrevivência",
    "Last Asylum Brasil",
    "Last Asylum Plague game",
    "Last Asylum Plague dicas"
  ],
  openGraph: {
    title: "Last Asylum BR - Portal, Calculadoras e Guias de Last Asylum Plague",
    description: "O hub brasileiro definitivo para Last Asylum Plague. Encontre calculadoras de recursos, calendário de eventos semanais, guias de sobrevivência e notícias oficiais.",
    url: "https://lapbr.netlify.app",
    siteName: "Last Asylum BR",
    images: [
      {
        url: "https://res.cloudinary.com/orrs3pvy/image/upload/v1786313785/preview-link-url_rcc5uk.webp",
        width: 1200,
        height: 630,
        alt: "Last Asylum BR Preview"
      }
    ],
    locale: "pt_BR",
    type: "website"
  },
  twitter: {
    card: "summary_large_image",
    title: "Last Asylum BR - Portal, Calculadoras e Guias de Last Asylum Plague",
    description: "O hub brasileiro definitivo para Last Asylum Plague. Encontre calculadoras de recursos, calendário de eventos semanais e muito mais.",
    images: ["https://res.cloudinary.com/orrs3pvy/image/upload/v1786313785/preview-link-url_rcc5uk.webp"]
  }
};

export default async function Home() {
  let initialArticles = [];

  if (isSupabaseConfigured) {
    try {
      const { data } = await supabase
        .from("articles")
        .select("*")
        .eq("status", "public")
        .order("created_at", { ascending: false });

      if (data) {
        initialArticles = data;
      }
    } catch (err) {
      console.error("Erro ao buscar artigos no servidor:", err);
    }
  }

  return (
    <div className="min-h-screen flex flex-col bg-background text-slate-100 selection:bg-emerald-500 selection:text-slate-950">
      {/* BANNER PRINCIPAL COM BARRA DE NAVEGAÇÃO FLUTUANTE */}
      <Hero />

      {/* HUB DE FERRAMENTAS ESTRATÉGICAS RÁPIDAS (SANTUÁRIO) */}
      <QuickToolsHub />

      {/* SEÇÃO DA CENTRAL DE NOTÍCIAS & ATUALIZAÇÕES BRASIL */}
      <NewsSection initialArticles={initialArticles} />

      {/* SEÇÃO DE PARCERIAS */}
      <section className="py-16 bg-card/50 border-t border-slate-900/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-12">
            <h2 className="text-xs font-bold font-mono text-amber-400 uppercase tracking-widest">Alianças & Projetos</h2>
            <p className="text-3xl font-extrabold text-white mt-2">Nossos Parceiros</p>
            <p className="text-sm text-slate-400 mt-3 leading-relaxed">
              Conheça os projetos e comunidades aliadas que ajudam a fortalecer e expandir o cenário de Last Asylum Plague no Brasil.
            </p>
          </div>

          <div className="mt-8">
            <PartnersCarousel />
          </div>
        </div>
      </section>

      {/* FOOTER DO SITE */}
      <Footer />
    </div>
  );
}
