"use client";

import { useState } from "react";

interface Partner {
  id: string;
  name: string;
  badge?: string;
  description: string;
  link: string;
  linkText: string;
  icon: React.ReactNode;
  color?: string;
}

interface PartnersCarouselProps {
  partners?: Partner[];
}

export default function PartnersCarousel({ partners = [] }: PartnersCarouselProps) {
  // Lista padrão de parceiros inicial
  const defaultPartners: Partner[] = [
    {
      id: "discord",
      name: "Comunidade Discord",
      badge: "Parceiro Oficial",
      description: "A maior comunidade brasileira no Discord dedicada a Last Asylum BR. Conecte-se com sobreviventes, participe de salas de voz, tire dúvidas sobre estratégias e recrute para sua aliança.",
      link: "https://discord.gg/UVY4uycSK",
      linkText: "Conectar ao servidor",
      icon: (
        <svg className="w-5 h-5 fill-white" viewBox="0 0 127.14 96.36">
          <path d="M107.7,8.07A105.15,105.15,0,0,0,77.26,0a77.19,77.19,0,0,0-3.3,6.83A96.67,96.67,0,0,0,53.22,6.83,77.19,77.19,0,0,0,49.88,0,105.15,105.15,0,0,0,19.44,8.07C3.66,31.58-1.86,54.65,1,77.53A105.73,105.73,0,0,0,32,96.36a77.7,77.7,0,0,0,6.63-10.85,68.43,68.43,0,0,1-10.45-5c.87-.64,1.71-1.32,2.51-2a75.76,75.76,0,0,0,72.76,0c.8,0.7,1.64,1.38,2.51,2a68.43,68.43,0,0,1-10.45,5,77.7,77.7,0,0,0,6.63,10.85,105.73,105.73,0,0,0,31-18.83C129.87,50.7,123.82,27.82,107.7,8.07ZM42.45,65.69C36.18,65.69,31,60,31,53S36.18,40.36,42.45,40.36,53.83,46,53.83,53,48.72,65.69,42.45,65.69Zm42.24,0C78.41,65.69,73.24,60,73.24,53S78.41,40.36,84.69,40.36,96.07,46,96.07,53,91,65.69,84.69,65.69Z"></path>
        </svg>
      ),
      color: "#5865F2",
    },
    {
      id: "parceria-placeholder",
      name: "Sua Comunidade Aqui",
      badge: "Faça Parte",
      description: "Administra um grupo, canal do YouTube, guilda ou página e quer formar uma aliança de divulgação mútua para crescermos juntos?",
      link: "mailto:contato@lastasylumbr.com.br",
      linkText: "Entre em contato",
      icon: "🤝",
      color: "#10b981",
    }
  ];

  const list = partners.length > 0 ? partners : defaultPartners;
  const isCarousel = list.length > 2;
  const [scrollIndex, setScrollIndex] = useState(0);

  const nextSlide = () => {
    setScrollIndex((prev) => (prev + 1) % list.length);
  };

  const prevSlide = () => {
    setScrollIndex((prev) => (prev - 1 + list.length) % list.length);
  };

  return (
    <div className="relative w-full max-w-6xl mx-auto px-4">
      {isCarousel ? (
        // MODO CARROSSEL (SCROLL SNAP NO MOBILE + SLIDER NO DESKTOP)
        <div className="relative group py-4">
          <div 
            className="hidden sm:flex transition-transform duration-500 ease-in-out gap-6"
            style={{ transform: `translateX(-${scrollIndex * (100 / Math.min(list.length, 3))}%)` }}
          >
            {list.map((partner) => (
              <div 
                key={partner.id} 
                className="w-full sm:w-[calc(50%-12px)] md:w-[calc(33.333%-16px)] shrink-0 p-5 rounded-2xl sanctuary-card hover:border-emerald-500/30 transition-all flex flex-col justify-between shadow-lg relative overflow-hidden"
              >
                <div className="space-y-3">
                  <div 
                    className="w-10 h-10 rounded-xl flex items-center justify-center text-lg font-bold"
                    style={{ backgroundColor: `${partner.color || "#10b981"}20`, color: partner.color || "#10b981" }}
                  >
                    {partner.icon}
                  </div>
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="text-sm font-bold text-white hover:underline">
                        <a href={partner.link} target={partner.link.startsWith("mailto") ? undefined : "_blank"} rel="noopener noreferrer">
                          {partner.name}
                        </a>
                      </h3>
                      {partner.badge && (
                        <span 
                          className="text-[8px] font-mono font-bold px-1.5 py-0.5 rounded-full uppercase tracking-wider"
                          style={{ backgroundColor: `${partner.color || "#10b981"}15`, color: partner.color || "#10b981" }}
                        >
                          {partner.badge}
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-slate-400 mt-1.5 leading-relaxed line-clamp-3">
                      {partner.description}
                    </p>
                  </div>
                </div>

                <div className="mt-4">
                  <a 
                    href={partner.link}
                    target={partner.link.startsWith("mailto") ? undefined : "_blank"}
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-[11px] font-bold transition-colors"
                    style={{ color: partner.color || "#10b981" }}
                  >
                    <span>{partner.linkText}</span>
                    <span>→</span>
                  </a>
                </div>
              </div>
            ))}
          </div>

          {/* MOBILE NATIVE SCROLL SNAP CONTAINER */}
          <div className="sm:hidden flex gap-4 overflow-x-auto snap-scroll-x pb-4 pt-1 px-1">
            {list.map((partner) => (
              <div 
                key={partner.id} 
                className="w-[85vw] max-w-[320px] shrink-0 snap-scroll-item p-5 rounded-2xl sanctuary-card border-emerald-500/20 flex flex-col justify-between shadow-lg relative overflow-hidden"
              >
                <div className="space-y-3">
                  <div 
                    className="w-10 h-10 rounded-xl flex items-center justify-center text-lg font-bold"
                    style={{ backgroundColor: `${partner.color || "#10b981"}20`, color: partner.color || "#10b981" }}
                  >
                    {partner.icon}
                  </div>
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="text-sm font-bold text-white hover:underline">
                        <a href={partner.link} target={partner.link.startsWith("mailto") ? undefined : "_blank"} rel="noopener noreferrer">
                          {partner.name}
                        </a>
                      </h3>
                      {partner.badge && (
                        <span 
                          className="text-[8px] font-mono font-bold px-1.5 py-0.5 rounded-full uppercase tracking-wider"
                          style={{ backgroundColor: `${partner.color || "#10b981"}15`, color: partner.color || "#10b981" }}
                        >
                          {partner.badge}
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-slate-400 mt-1.5 leading-relaxed">
                      {partner.description}
                    </p>
                  </div>
                </div>

                <div className="mt-4">
                  <a 
                    href={partner.link}
                    target={partner.link.startsWith("mailto") ? undefined : "_blank"}
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-[11px] font-bold transition-colors"
                    style={{ color: partner.color || "#10b981" }}
                  >
                    <span>{partner.linkText}</span>
                    <span>→</span>
                  </a>
                </div>
              </div>
            ))}
          </div>

          {/* CONTROLES DO CARROSSEL DESKTOP */}
          <button
            type="button"
            onClick={prevSlide}
            aria-label="Ver parceiro anterior"
            className="hidden sm:flex carousel-nav-btn absolute -left-4 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 shadow-xl z-20"
          >
            ◀
          </button>
          <button
            type="button"
            onClick={nextSlide}
            aria-label="Ver próximo parceiro"
            className="hidden sm:flex carousel-nav-btn absolute -right-4 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 shadow-xl z-20"
          >
            ▶
          </button>
        </div>
      ) : (
        // MODO GRID ESTÁTICO (REDUZIDO)
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 max-w-3xl mx-auto">
          {list.map((partner) => (
            <div 
              key={partner.id} 
              className="p-6 rounded-2xl sanctuary-card hover:border-emerald-500/30 transition-all flex flex-col justify-between shadow-lg relative overflow-hidden"
            >
              <div className="space-y-3">
                <div 
                  className="w-10 h-10 rounded-xl flex items-center justify-center text-lg font-bold"
                  style={{ backgroundColor: `${partner.color || "#10b981"}20`, color: partner.color || "#10b981" }}
                >
                  {partner.icon}
                </div>
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="text-sm font-bold text-white hover:underline">
                      <a href={partner.link} target={partner.link.startsWith("mailto") ? undefined : "_blank"} rel="noopener noreferrer">
                        {partner.name}
                      </a>
                    </h3>
                    {partner.badge && (
                      <span 
                        className="text-[8px] font-mono font-bold px-1.5 py-0.5 rounded-full uppercase tracking-wider"
                        style={{ backgroundColor: `${partner.color || "#10b981"}15`, color: partner.color || "#10b981" }}
                      >
                        {partner.badge}
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-slate-400 mt-1.5 leading-relaxed">
                    {partner.description}
                  </p>
                </div>
              </div>

              <div className="mt-4">
                <a 
                  href={partner.link}
                  target={partner.link.startsWith("mailto") ? undefined : "_blank"}
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-[11px] font-bold transition-colors"
                  style={{ color: partner.color || "#10b981" }}
                >
                  <span>{partner.linkText}</span>
                  <span>→</span>
                </a>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
