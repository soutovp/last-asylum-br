"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import Image from "next/image";
import { getSavedSession, UserSession } from "@/lib/auth";

export default function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const pathname = usePathname();
  const [session, setSession] = useState<UserSession | null>(null);

  useEffect(() => {
    setSession(getSavedSession());
    const handleAuthChange = () => {
      setSession(getSavedSession());
    };
    window.addEventListener("auth_state_change", handleAuthChange);
    return () => {
      window.removeEventListener("auth_state_change", handleAuthChange);
    };
  }, []);

  const formatFirstName = (fullNameOrCharName: string | undefined): string => {
    if (!fullNameOrCharName) return "Jogador";
    const firstName = fullNameOrCharName.split(" ")[0];
    if (firstName.length > 14) {
      return firstName.substring(0, 11) + "...";
    }
    return firstName;
  };

  const navLinks = [
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
    <header className="sticky top-0 z-50 glass-header border-b border-[#00ff88]/20 bg-[#101623]/90 backdrop-blur-xl">
      <div className="max-w-[90rem] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          
          {/* LOGO OFICIAL 'LAST ASYLUM BR' */}
          <Link href="/" className="flex items-center group">
            <Image 
              src="/images/last-asylum-br-logo.webp" 
              alt="Last Asylum BR Logo" 
              width={160}
              height={48}
              priority
              className="h-10 sm:h-12 w-auto object-contain transition-transform duration-300 group-hover:scale-[1.02]"
            />
          </Link>

          {/* DESKTOP NAVIGATION LINKS COM ÍCONES VETORIZADOS - RESPONSIVO E DINÂMICO */}
          <nav className="hidden md:flex items-center gap-1 xl:gap-1.5 bg-slate-900/80 p-1.5 rounded-full border border-slate-800">
            {navLinks.map((link) => {
              const isExternal = link.href.startsWith("http");
              const isActive = !isExternal && (
                link.href === "/"
                  ? pathname === "/"
                  : link.href === "/guias"
                  ? pathname === "/guias" || pathname.startsWith("/guias/")
                  : pathname.startsWith(link.href)
              );

              const content = (
                <>
                  <span className={isActive ? "text-slate-950" : "text-emerald-400"}>
                    {link.icon}
                  </span>
                  <span className="whitespace-nowrap">{link.label}</span>
                </>
              );

              const className = `flex items-center gap-1 lg:gap-1.5 px-2 lg:px-2.5 xl:px-4 py-2 text-[11px] lg:text-xs xl:text-sm font-semibold rounded-full transition-all duration-200 whitespace-nowrap ${
                isActive
                  ? "text-slate-950 bg-emerald-500 font-bold shadow-[0_0_15px_rgba(16,185,129,0.35)]"
                  : "text-slate-300 hover:text-emerald-300 hover:bg-slate-800/60"
              }`;

              if (isExternal) {
                return (
                  <a
                    key={link.id}
                    href={link.href}
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
                  key={link.id}
                  href={link.href}
                  className={className}
                >
                  {content}
                </Link>
              );
            })}
          </nav>

          {/* BADGE BRASIL DIREITA E AUTH */}
          <div className="hidden md:flex items-center gap-3">
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
                className="px-4 py-2 text-xs font-bold text-slate-950 bg-emerald-500 rounded-full shadow-[0_0_15px_rgba(16,185,129,0.25)] hover:bg-emerald-400 active:scale-98 transition-all"
              >
                Entrar
              </Link>
            )}

          </div>

          {/* MOBILE HAMBURGER BUTTON */}
          <div className="flex md:hidden items-center">
            <button
              onClick={() => setMobileMenuOpen((prev) => !prev)}
              type="button"
              aria-label="Menu principal"
              className="p-2 rounded-full text-emerald-400 bg-slate-900 border border-emerald-500/30 focus:outline-none active:scale-95 transition-transform cursor-pointer"
            >
              <span className="sr-only">Abrir menu</span>
              {!mobileMenuOpen ? (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              ) : (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* MOBILE MENU DROPDOWN */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-[#0e1420]/98 border-b border-emerald-500/20 px-4 pt-3 pb-6 space-y-2 backdrop-blur-2xl">
          {navLinks.map((link) => {
            const isExternal = link.href.startsWith("http");
            const content = (
              <>
                <span className="text-emerald-400">{link.icon}</span>
                <span>{link.label}</span>
              </>
            );
            const className = "flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium text-slate-200 hover:text-emerald-400 hover:bg-slate-900 border border-transparent hover:border-slate-800";
            
            if (isExternal) {
              return (
                <a
                  key={link.id}
                  href={link.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => setMobileMenuOpen(false)}
                  className={className}
                >
                  {content}
                </a>
              );
            }

            return (
              <Link
                key={link.id}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className={className}
              >
                {content}
              </Link>
            );
          })}
          <div className="pt-2 border-t border-slate-800/80 mt-2">
            {session ? (
              <Link
                href="/perfil"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium text-slate-200 hover:text-emerald-400 hover:bg-slate-900 border border-transparent hover:border-slate-800"
              >
                <img 
                  src={session.avatarUrl || "/images/avatar-default.svg"} 
                  alt="Avatar" 
                  className="w-5 h-5 rounded-full object-cover border border-emerald-500/40"
                />
                <span>Meu Perfil ({formatFirstName(session.characterName && session.useCharacterName ? session.characterName : session.firstName)})</span>
              </Link>
            ) : (
              <Link
                href="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold text-slate-950 bg-emerald-500 hover:bg-emerald-400 border border-transparent transition-all shadow-[0_0_15px_rgba(16,185,129,0.2)]"
              >
                <span>🔑 Entrar / Cadastrar</span>
              </Link>
            )}
          </div>
        </div>
      )}
    </header>
  );
}

