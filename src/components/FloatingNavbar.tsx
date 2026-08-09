"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function FloatingNavbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = usePathname();

  const navItems = [
    {
      id: "inicio",
      label: "Início",
      href: "/",
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
          <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
        </svg>
      ),
    },
    {
      id: "calculadoras",
      label: "Calculadoras",
      href: "/calculadoras",
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 7h6m-6 4h6m-6 4h4m-6-10h10a2 2 0 012 2v12a2 2 0 01-2 2H7a2 2 0 01-2-2V7a2 2 0 012-2z" />
        </svg>
      ),
    },
    {
      id: "eventos",
      label: "Eventos",
      href: "/eventos",
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
          <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      ),
    },
    {
      id: "herois",
      label: "Heróis",
      href: "/herois",
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
        </svg>
      ),
    },
    {
      id: "guias",
      label: "Guias",
      href: "/guias",
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
        </svg>
      ),
    },
    {
      id: "guias-visuais",
      label: "Guias Visuais",
      href: "/guias-visuais",
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
          <path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      ),
    },
    {
      id: "codigos",
      label: "Códigos",
      href: "/codigos",
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
          <path strokeLinecap="round" strokeLinejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
        </svg>
      ),
    },
  ];

  return (
    <nav className="w-full max-w-4xl mx-auto px-4 relative z-30">
      {/* BARRA FLUTUANTE CENTRALIZADA COM BORDAS ARREDONDADAS - LARGURA OTIMIZADA */}
      <div className="flex items-center justify-between md:justify-center gap-3 sm:gap-6 p-2 sm:p-2.5 rounded-full bg-[#101623]/90 border border-[#00ff88]/30 shadow-[0_15px_40px_rgba(0,0,0,0.8)] backdrop-blur-xl transition-all duration-300">
        {/* NAV LINKS DESKTOP CENTRALIZADOS */}
        <div className="hidden md:flex items-center gap-0.5 sm:gap-1.5">
          {navItems.map((item) => {
            const isActive =
              item.href === "/"
                ? pathname === "/"
                : item.href === "/guias"
                ? pathname === "/guias" || pathname.startsWith("/guias/")
                : pathname.startsWith(item.href);
            return (
              <Link
                key={item.id}
                href={item.href}
                className={`flex items-center gap-1.5 px-2.5 sm:px-4 py-2 text-xs sm:text-sm font-semibold rounded-full transition-all duration-200 ${
                  isActive
                    ? "bg-[#00ff88] text-slate-950 shadow-[0_0_15px_rgba(0,255,136,0.4)] transform scale-105"
                    : "text-slate-300 hover:text-[#00ff88] hover:bg-slate-800/60"
                }`}
              >
                <span className={isActive ? "text-slate-950" : "text-[#00ff88]"}>
                  {item.icon}
                </span>
                <span>{item.label}</span>
              </Link>
            );
          })}
        </div>

        {/* BADGE BRASIL À DIREITA */}
        <div className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-slate-900/80 border border-[#00ff88]/30 text-xs font-semibold text-slate-300 shadow-inner">
          <span className="font-mono text-[#00ff88]">BR</span>
        </div>

        {/* BOTÃO MOBILE */}
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="md:hidden flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#00ff88] text-slate-950 font-bold text-xs shadow-[0_0_10px_rgba(0,255,136,0.3)]"
        >
          <span>{mobileOpen ? "✕ Fechar" : "☰ Menu"}</span>
        </button>
      </div>

      {/* DROPDOWN NAV MOBILE */}
      {mobileOpen && (
        <div className="md:hidden mt-2 p-3 rounded-2xl bg-[#101623]/95 border border-[#00ff88]/30 shadow-2xl backdrop-blur-2xl space-y-1.5 animate-in fade-in slide-in-from-top-2 duration-200">
          {navItems.map((item) => {
            const isActive =
              item.href === "/"
                ? pathname === "/"
                : item.href === "/guias"
                ? pathname === "/guias" || pathname.startsWith("/guias/")
                : pathname.startsWith(item.href);
            return (
              <Link
                key={item.id}
                href={item.href}
                onClick={() => setMobileOpen(false)}
                className={`flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                  isActive
                    ? "bg-[#00ff88] text-slate-950 font-bold"
                    : "text-slate-200 hover:bg-slate-800/80"
                }`}
              >
                <span className={isActive ? "text-slate-950" : "text-[#00ff88]"}>
                  {item.icon}
                </span>
                <span>{item.label}</span>
              </Link>
            );
          })}
        </div>
      )}
    </nav>
  );
}


