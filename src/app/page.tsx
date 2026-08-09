import { Metadata } from "next";
import Hero from "@/components/Hero";
import NewsSection from "@/components/NewsSection";
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
    <div className="min-h-screen flex flex-col bg-[#080c14] text-slate-100 selection:bg-[#00ff88] selection:text-slate-950">
      {/* BANNER PRINCIPAL COM BARRA DE NAVEGAÇÃO FLUTUANTE */}
      <Hero />

      {/* SEÇÃO DA CENTRAL DE NOTÍCIAS & ATUALIZAÇÕES BRASIL */}
      <NewsSection initialArticles={initialArticles} />
    </div>
  );
}
