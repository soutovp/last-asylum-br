"use client";

import Link from "next/link";

interface QuickToolItem {
  id: string;
  title: string;
  category: string;
  description: string;
  href: string;
  actionText: string;
  iconBg: string;
  borderColor: string;
  accentColor: string;
  badgeBg: string;
  icon: React.ReactNode;
}

export default function QuickToolsHub() {
  const tools: QuickToolItem[] = [
    {
      id: "calculadoras",
      title: "Calculadoras de Evolução",
      category: "Economia & Planejamento",
      description:
        "Calcule a quantidade exata de Antitoxina, Fragmentos de Herói e Insígnias para o próximo nível sem desperdício de recursos.",
      href: "/calculadoras",
      actionText: "Calcular Recursos",
      iconBg: "bg-emerald-950/60 text-emerald-400 border-emerald-500/30",
      borderColor: "hover:border-emerald-500/40",
      accentColor: "text-emerald-400 group-hover:text-emerald-300",
      badgeBg: "bg-emerald-950/70 text-emerald-300 border-emerald-500/30",
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
          <path strokeLinecap="round" strokeLinejoin="round" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
        </svg>
      ),
    },
    {
      id: "herois",
      title: "Banco de Heróis",
      category: "Combate & Tiers",
      description:
        "Consulte especialidades, habilidades táticas, formações e a progressão de estrelas amarelas e vermelhas (1 a 10).",
      href: "/herois",
      actionText: "Explorar Heróis",
      iconBg: "bg-amber-950/60 text-amber-400 border-amber-500/30",
      borderColor: "hover:border-amber-500/40",
      accentColor: "text-amber-400 group-hover:text-amber-300",
      badgeBg: "bg-amber-950/70 text-amber-300 border-amber-500/30",
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
        </svg>
      ),
    },
    {
      id: "guias-visuais",
      title: "Guias Visuais & Tabelas",
      category: "Consultas Rápidas",
      description:
        "Tabelas de custos de construção, rotações do Duelo de Alianças e infográficos estratégicos prontos para consulta.",
      href: "/guias-visuais",
      actionText: "Ver Tabelas",
      iconBg: "bg-sky-950/60 text-sky-400 border-sky-500/30",
      borderColor: "hover:border-sky-500/40",
      accentColor: "text-sky-400 group-hover:text-sky-300",
      badgeBg: "bg-sky-950/70 text-sky-300 border-sky-500/30",
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
          <path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      ),
    },
    {
      id: "codigos",
      title: "Códigos de Resgate",
      category: "Recompensas Grátis",
      description:
        "Códigos de presente (Gift Codes) ativos e verificados para coletar Diamantes, Aceleradores e itens de sobrevivência.",
      href: "/codigos",
      actionText: "Resgatar Códigos",
      iconBg: "bg-purple-950/60 text-purple-400 border-purple-500/30",
      borderColor: "hover:border-purple-500/40",
      accentColor: "text-purple-400 group-hover:text-purple-300",
      badgeBg: "bg-purple-950/70 text-purple-300 border-purple-500/30",
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
        </svg>
      ),
    },
  ];

  return (
    <section className="relative z-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-6 sm:-mt-8 mb-16">
      <div className="text-center max-w-2xl mx-auto mb-8">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-900/90 border border-amber-500/25 text-[11px] font-semibold text-amber-300 shadow-sm mb-3">
          <span>🏛️ Hub Estratégico</span>
          <span className="text-slate-600">•</span>
          <span>Santuário dos Sobreviventes</span>
        </div>
        <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
          Ferramentas de <span className="text-emerald-400">Domínio Estratégico</span>
        </h2>
        <p className="text-xs sm:text-sm text-slate-400 mt-2">
          Acesse diretamente as ferramentas essenciais para otimizar sua progressão em Last Asylum.
        </p>
      </div>

      {/* GRID DE CARDS DO HUB */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
        {tools.map((tool) => (
          <Link
            key={tool.id}
            href={tool.href}
            className={`group relative flex flex-col justify-between p-5 sm:p-6 rounded-2xl sanctuary-card sanctuary-card-hover ${tool.borderColor} transition-all duration-300`}
          >
            {/* TOPO DO CARD: ÍCONE E BADGE */}
            <div>
              <div className="flex items-center justify-between gap-2 mb-4">
                <div className={`w-11 h-11 rounded-xl flex items-center justify-center border shadow-inner ${tool.iconBg}`}>
                  {tool.icon}
                </div>
                <span className={`text-[10px] font-semibold font-mono px-2 py-0.5 rounded-full border ${tool.badgeBg}`}>
                  {tool.category}
                </span>
              </div>

              {/* TÍTULO E DESCRIÇÃO */}
              <h3 className="text-base sm:text-lg font-bold text-white group-hover:text-emerald-300 transition-colors leading-snug">
                {tool.title}
              </h3>
              <p className="text-xs md:text-sm text-slate-400 mt-2 leading-relaxed">
                {tool.description}
              </p>
            </div>

            {/* AÇÃO NO RODAPÉ DO CARD */}
            <div className="mt-5 pt-3.5 border-t border-slate-800/80 flex items-center justify-between text-xs font-bold">
              <span className={tool.accentColor}>{tool.actionText}</span>
              <span className="text-slate-500 group-hover:translate-x-1 transition-transform duration-200">
                →
              </span>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
