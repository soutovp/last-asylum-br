import Image from "next/image";
import Header from "@/components/Header";
import Calculators from "@/components/Calculators";

export const metadata = {
  title: "Calculadora de Heróis: Estrelas, Nível e Habilidades - Last Asylum BR",
  description: "Calcule os custos de Antitoxina, Estrelas (Fragmentos) e Medalhas de Habilidade necessárias para evoluir seus heróis no Last Asylum Plague. Planeje seus recursos.",
  keywords: [
    "last asylum",
    "calculadora last asylum",
    "calculadora de herois",
    "custo de antitoxina",
    "estrelas herois last asylum",
    "habilidades herois",
    "last asylum plague",
    "last asylum brasil",
    "evoluir herois last asylum",
    "Fragmento de herói",
    "Insígnia de Habilidade"
  ],
  openGraph: {
    title: "Calculadora de Heróis: Estrelas, Nível e Habilidades - Last Asylum BR",
    description: "Calcule os custos de Antitoxina, Estrelas e Medalhas de Habilidade de Heróis para Last Asylum Plague. Planeje sua evolução de forma otimizada.",
    url: "https://lapbr.netlify.app/calculadoras",
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
    title: "Calculadora de Heróis: Estrelas, Nível e Habilidades - Last Asylum BR",
    description: "Calcule os custos de Antitoxina, Estrelas e Medalhas de Habilidade de Heróis para Last Asylum Plague.",
    images: ["https://res.cloudinary.com/orrs3pvy/image/upload/v1786313785/preview-link-url_rcc5uk.webp"]
  }
};

export default function CalculadorasPage() {
  return (
    <div className="relative min-h-screen flex flex-col bg-[#080c14] text-slate-100 selection:bg-[#00ff88] selection:text-slate-950 overflow-x-hidden">
      
      {/* BACKGROUND FIXO DA VILA COM ALTA INTENSIDADE E OPACIDADE (85%) */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <Image
          src="/images/village_banner_2.png"
          alt="Background Fixo da Vila"
          fill
          priority
          sizes="100vw"
          className="object-cover object-center opacity-85 scale-105"
        />
        {/* OVERLAYS LEVES APENAS PARA CONSERVAR O CONTRASTE DOS TEXTOS */}
        <div className="absolute inset-0 bg-[#080c14]/25 backdrop-blur-[1px]"></div>
        <div className="absolute inset-0 bg-gradient-to-b from-[#080c14]/70 via-transparent to-[#080c14]/80"></div>
      </div>

      {/* CONTEÚDO PRINCIPAL (SOBREPOSTO AO BACKGROUND FIXO) */}
      <div className="relative z-10 flex flex-col min-h-screen">
        <Header />

        <main className="flex-1 py-4">
          <Calculators />

          {/* SEÇÃO DE TEXTO PARA OTIMIZAÇÃO DE SEO (ESTRUTURA DE PALAVRAS-CHAVE) */}
          <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-16 border-t border-slate-800/80 pt-12 pb-16 relative z-10">
            <div className="bg-[#101623]/80 border border-slate-800 rounded-3xl p-8 sm:p-12 backdrop-blur-xl space-y-8">
              <h2 className="text-2xl sm:text-3xl font-extrabold text-white">
                Como funciona a Otimização de Heróis no Last Asylum?
              </h2>
              <p className="text-slate-300 leading-relaxed text-sm sm:text-base">
                Para sobreviver e dominar os desafios no <strong>Last Asylum Plague</strong>, a evolução correta dos seus heróis é fundamental. Nosso portal desenvolveu ferramentas de simulação exata para ajudar você a gerenciar seus materiais e evitar o desperdício de recursos raros. Abaixo explicamos as três frentes essenciais da nossa central:
              </p>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pt-4">
                <div className="space-y-3">
                  <h3 className="text-lg font-bold text-[#00ff88]">1. Nível de Herói (Antitoxina)</h3>
                  <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
                    A evolução de nível aumenta diretamente os atributos base de ataque, defesa e pontos de vida (HP) do herói. Este processo consome <strong>Antitoxina</strong> em quantidades crescentes a cada nível. Nossa calculadora simula o total necessário de qualquer nível inicial até o seu objetivo de forma instantânea.
                  </p>
                </div>

                <div className="space-y-3">
                  <h3 className="text-lg font-bold text-[#00e5ff]">2. Graduação de Estrelas (Fragmento de herói)</h3>
                  <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
                    Subir as estrelas do seu herói desbloqueia novas habilidades e multiplicadores massivos de poder. Cada estrela possui 5 ramificações de graduação (representadas pelas pernas da estrela: 0.2, 0.4, 0.6, 0.8 e 1.0). Esse avanço consome <strong>Fragmento de herói</strong> (Shards ou medalhas específicas) de herói ou curingas da mesma raridade.
                  </p>
                </div>

                <div className="space-y-3">
                  <h3 className="text-lg font-bold text-yellow-400">3. Nível de Habilidade (Insígnia de Habilidade)</h3>
                  <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
                    As habilidades de combate e de desenvolvimento determinam o impacto real do herói em batalha ou na coleta. Para maximizar as habilidades secundárias, você precisa investir <strong>Insígnia de Habilidade</strong> (Skill Badges) e livros de raridade correspondente. Nossa calculadora soma as exigências para planejar o acúmulo desses itens.
                  </p>
                </div>
              </div>
            </div>
          </section>
        </main>
      </div>
    </div>
  );
}
