"use client";

import { useState, useSyncExternalStore } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { getSavedSession, UserSession } from "@/lib/auth";

const subscribeAuth = (callback: () => void) => {
  if (typeof window === "undefined") return () => {};
  window.addEventListener("auth_state_change", callback);
  window.addEventListener("storage", callback);
  return () => {
    window.removeEventListener("auth_state_change", callback);
    window.removeEventListener("storage", callback);
  };
};

export default function FloatingNavbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = usePathname();

  const sessionRaw = useSyncExternalStore(
    subscribeAuth,
    () => {
      const s = getSavedSession();
      return s ? JSON.stringify(s) : null;
    },
    () => null
  );

  const session: UserSession | null = sessionRaw ? JSON.parse(sessionRaw) : null;

  const formatFirstName = (fullNameOrCharName: string | undefined): string => {
    if (!fullNameOrCharName) return "Jogador";
    const firstName = fullNameOrCharName.split(" ")[0];
    if (firstName.length > 14) {
      return firstName.substring(0, 11) + "...";
    }
    return firstName;
  };

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
      id: "noticias",
      label: "Notícias",
      href: "/noticias",
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 4a2 2 0 012 2v6a2 2 0 01-2 2h-2v-4m-3.333-4H10m0-3h3m-3 6h5" />
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
    <nav className="w-full max-w-5xl mx-auto px-4 relative z-50">
      {/* BARRA FLUTUANTE CENTRALIZADA COM BORDAS ARREDONDADAS */}
      <div className="flex items-center justify-between md:justify-center gap-3 sm:gap-6 p-2 sm:p-2.5 rounded-full glass-card border-emerald-500/25 shadow-[0_15px_40px_rgba(0,0,0,0.85)] transition-all duration-300">
        {/* NAV LINKS DESKTOP CENTRALIZADOS */}
        <div className="hidden md:flex items-center gap-0.5 sm:gap-1.5">
          {navItems.map((item) => {
            const isExternal = item.href.startsWith("http");
            const isActive = !isExternal && (
              item.href === "/"
                ? pathname === "/"
                : item.href === "/guias"
                ? pathname === "/guias" || pathname.startsWith("/guias/")
                : pathname.startsWith(item.href)
            );

            const content = (
              <>
                <span className={isActive ? "text-slate-950" : "text-emerald-400"}>
                  {item.icon}
                </span>
                <span className="whitespace-nowrap">{item.label}</span>
              </>
            );

            const className = `flex items-center gap-1.5 px-2.5 sm:px-4 py-2 text-[11px] sm:text-sm font-semibold rounded-full transition-all duration-200 whitespace-nowrap ${
              isActive
                ? "bg-emerald-500 text-slate-950 shadow-[0_0_15px_rgba(16,185,129,0.35)] transform scale-105"
                : "text-slate-300 hover:text-emerald-300 hover:bg-slate-800/60"
            }`;

            if (isExternal) {
              return (
                <a
                  key={item.id}
                  href={item.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={className}
                >
                  {content}
                </a>
              );
            }

            return (
              <Link
                key={item.id}
                href={item.href}
                className={className}
              >
                {content}
              </Link>
            );
          })}
        </div>

        {/* AUTH E BADGE BRASIL À DIREITA */}
        <div className="flex items-center gap-3">
          {session ? (
            <Link href="/perfil" className="flex items-center gap-2 group p-1 pr-3.5 rounded-full bg-slate-900 border border-slate-800 hover:border-emerald-500/50 transition-colors flex-shrink-0">
              <img 
                src={session.avatarUrl || "/images/avatar-default.svg"} 
                alt="Avatar" 
                className="w-7 h-7 rounded-full object-cover border border-emerald-500/30 group-hover:border-emerald-400 transition-colors flex-shrink-0"
              />
              <span className="text-xs font-semibold text-slate-300 group-hover:text-white transition-colors whitespace-nowrap overflow-hidden text-ellipsis max-w-[120px] sm:max-w-none">
                {formatFirstName(session.characterName && session.useCharacterName ? session.characterName : session.firstName)}
              </span>
            </Link>
          ) : (
            <Link 
              href="/login" 
              className="px-4 py-1.5 text-[11px] sm:text-xs font-bold text-slate-950 bg-emerald-500 rounded-full shadow-[0_0_10px_rgba(16,185,129,0.25)] hover:bg-emerald-400 transition-all"
            >
              Entrar
            </Link>
          )}
        </div>

        {/* BOTÃO MOBILE */}
        <button
          type="button"
          aria-label="Abrir Menu de Navegação"
          onClick={() => setMobileOpen((prev) => !prev)}
          className="md:hidden flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-emerald-500 text-slate-950 font-bold text-xs shadow-[0_0_10px_rgba(16,185,129,0.25)] active:scale-95 transition-transform cursor-pointer"
        >
          <span>{mobileOpen ? "✕ Fechar" : "☰ Menu"}</span>
        </button>
      </div>

      {/* DROPDOWN NAV MOBILE */}
      {mobileOpen && (
        <div className="md:hidden mt-2 p-3 rounded-2xl glass-card border-emerald-500/30 shadow-2xl space-y-1.5 animate-in fade-in slide-in-from-top-2 duration-200 relative z-50">
          {navItems.map((item) => {
            const isExternal = item.href.startsWith("http");
            const isActive = !isExternal && (
              item.href === "/"
                ? pathname === "/"
                : item.href === "/guias"
                ? pathname === "/guias" || pathname.startsWith("/guias/")
                : pathname.startsWith(item.href)
            );

            const content = (
              <>
                <span className={isActive ? "text-slate-950" : "text-emerald-400"}>
                  {item.icon}
                </span>
                <span>{item.label}</span>
              </>
            );

            const className = `flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-colors ${
              isActive
                ? "bg-emerald-500 text-slate-950 font-bold"
                : "text-slate-200 hover:bg-slate-800/80"
            }`;

            if (isExternal) {
              return (
                <a
                  key={item.id}
                  href={item.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => setMobileOpen(false)}
                  className={className}
                >
                  {content}
                </a>
              );
            }

            return (
              <Link
                key={item.id}
                href={item.href}
                onClick={() => setMobileOpen(false)}
                className={className}
              >
                {content}
              </Link>
            );
          })}

          <div className="pt-2 border-t border-slate-800 mt-2">
            {session ? (
              <Link
                href="/perfil"
                onClick={() => setMobileOpen(false)}
                className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium text-slate-200 hover:text-emerald-400 hover:bg-slate-900 border border-transparent"
              >
                <img 
                  src={session.avatarUrl || "https://lastasylumplague.com/wp-content/uploads/2026/04/nicole-full-image-300x266.webp"} 
                  alt="Avatar" 
                  className="w-5 h-5 rounded-full object-cover border border-emerald-500/40"
                />
                <span>Meu Perfil ({formatFirstName(session.characterName && session.useCharacterName ? session.characterName : session.firstName)})</span>
              </Link>
            ) : (
              <Link
                href="/login"
                onClick={() => setMobileOpen(false)}
                className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold text-slate-950 bg-emerald-500 hover:bg-emerald-400 transition-all shadow-[0_0_15px_rgba(16,185,129,0.2)]"
              >
                <span>🔑 Entrar / Cadastrar</span>
              </Link>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}


