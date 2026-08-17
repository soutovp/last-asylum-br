import { Metadata } from "next";
import Hero from "@/components/Hero";
import NewsSection from "@/components/NewsSection";
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
    <div className="min-h-screen flex flex-col bg-[#080c14] text-slate-100 selection:bg-[#00ff88] selection:text-slate-950">
      {/* BANNER PRINCIPAL COM BARRA DE NAVEGAÇÃO FLUTUANTE */}
      <Hero />

      {/* SEÇÃO DA CENTRAL DE NOTÍCIAS & ATUALIZAÇÕES BRASIL */}
      <NewsSection initialArticles={initialArticles} />

      {/* SEÇÃO DE PARCERIAS */}
      <section className="py-16 bg-[#090d16] border-t border-slate-900/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-12">
            <h2 className="text-xs font-bold font-mono text-[#00ff88] uppercase tracking-widest">Alianças & Projetos</h2>
            <p className="text-3xl font-extrabold text-white mt-2">Nossos Parceiros</p>
            <p className="text-sm text-slate-400 mt-3 leading-relaxed">
              Conheça os projetos e comunidades aliadas que ajudam a fortalecer e expandir o cenário de Last Asylum Plague no Brasil.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            {/* PARCEIRO 1: Comunidade Discord */}
            <div className="p-8 rounded-3xl bg-[#101623]/80 border border-slate-800/80 hover:border-[#5865F2]/30 transition-all flex flex-col justify-between group shadow-xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-[#5865F2]/5 rounded-full filter blur-3xl group-hover:bg-[#5865F2]/10 transition-all"></div>
              
              <div className="space-y-4 relative z-10">
                <div className="w-12 h-12 rounded-2xl bg-[#5865F2]/10 flex items-center justify-center text-white group-hover:scale-110 transition-transform">
                  <svg className="w-6 h-6 fill-current" viewBox="0 0 127.14 96.36">
                    <path d="M107.7,8.07A105.15,105.15,0,0,0,77.26,0a77.19,77.19,0,0,0-3.3,6.83A96.67,96.67,0,0,0,53.22,6.83,77.19,77.19,0,0,0,49.88,0,105.15,105.15,0,0,0,19.44,8.07C3.66,31.58-1.86,54.65,1,77.53A105.73,105.73,0,0,0,32,96.36a77.7,77.7,0,0,0,6.63-10.85,68.43,68.43,0,0,1-10.45-5c.87-.64,1.71-1.32,2.51-2a75.76,75.76,0,0,0,72.76,0c.8,0.7,1.64,1.38,2.51,2a68.43,68.43,0,0,1-10.45,5,77.7,77.7,0,0,0,6.63,10.85,105.73,105.73,0,0,0,31-18.83C129.87,50.7,123.82,27.82,107.7,8.07ZM42.45,65.69C36.18,65.69,31,60,31,53S36.18,40.36,42.45,40.36,53.83,46,53.83,53,48.72,65.69,42.45,65.69Zm42.24,0C78.41,65.69,73.24,60,73.24,53S78.41,40.36,84.69,40.36,96.07,46,96.07,53,91,65.69,84.69,65.69Z"/>
                  </svg>
                </div>
                
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-lg font-bold text-white group-hover:text-[#5865F2] transition-colors">Comunidade Discord</h3>
                    <span className="text-[9px] font-mono font-bold text-[#5865F2] bg-[#5865F2]/10 px-2 py-0.5 rounded-full uppercase tracking-wider">Parceiro Oficial</span>
                  </div>
                  <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                    A maior comunidade brasileira no Discord dedicada a Last Asylum BR. Conecte-se com sobreviventes, participe de salas de voz, tire dúvidas sobre estratégias e recrute para sua aliança.
                  </p>
                </div>
              </div>

              <div className="mt-6 relative z-10">
                <a 
                  href="https://discord.gg/UVY4uycSK"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-[#5865F2] hover:text-[#727efb] transition-colors group/btn"
                >
                  Conectar ao servidor
                  <span className="group-hover/btn:translate-x-1 transition-transform inline-block">→</span>
                </a>
              </div>
            </div>

            {/* BOX ESPAÇADOR/PERSPECTIVA DE NOVAS PARCERIAS */}
            <div className="p-8 rounded-3xl bg-[#0a0e16]/40 border border-dashed border-slate-800 flex flex-col justify-between group py-8 shadow-xl">
              <div className="space-y-4">
                <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 flex items-center justify-center text-cyan-400 group-hover:scale-110 transition-transform text-xl">
                  🤝
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-200 group-hover:text-white transition-colors">Sua Comunidade Aqui</h3>
                  <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                    Administra um grupo, canal do YouTube, guilda ou página e quer formar uma aliança de divulgação mútua para crescermos juntos?
                  </p>
                </div>
              </div>
              <div className="mt-6">
                <a 
                  href="mailto:contato@lastasylumbr.com.br"
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-[#00ff88] hover:text-white transition-colors group/btn"
                >
                  Entre em contato
                  <span className="group-hover/btn:translate-x-1 transition-transform inline-block">→</span>
                </a>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* FOOTER DO SITE */}
      <Footer />
    </div>
  );
}
