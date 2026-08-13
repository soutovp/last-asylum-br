"use client";

import Link from "next/link";
import Image from "next/image";

export default function Footer() {
  return (
    <footer className="w-full bg-[#0a0f1d] border-t border-slate-800/80 mt-auto relative z-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* GRID DE 4 COLUNAS */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
          
          {/* COLUNA 1: SOBRE & REDES */}
          <div className="space-y-4">
            <Link href="/" className="inline-block">
              <Image 
                src="/images/last-asylum-br-logo.webp" 
                alt="Last Asylum BR Logo" 
                width={140}
                height={42}
                className="w-auto h-8 object-contain"
              />
            </Link>
            <p className="text-xs text-slate-400 leading-relaxed max-w-xs">
              O maior portal brasileiro de Last Asylum Plague. Guias de sobrevivência, calculadoras de evolução e novidades da comunidade.
            </p>
            <div className="text-xs text-slate-400 flex items-center gap-2 pt-2">
              <svg className="w-4 h-4 text-[#00ff88] shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              <a href="mailto:contato@lastasylumbr.com.br" className="hover:text-white transition-colors underline font-semibold leading-none">
                contato@lastasylumbr.com.br
              </a>
            </div>
          </div>

          {/* COLUNA 2: NAVEGAÇÃO RÁPIDA */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold font-mono text-[#00ff88] uppercase tracking-wider">Navegação</h4>
            <ul className="space-y-2 text-xs text-slate-400">
              <li>
                <Link href="/" className="hover:text-white transition-colors">Início</Link>
              </li>
              <li>
                <Link href="/noticias" className="hover:text-white transition-colors">Notícias & Updates</Link>
              </li>
              <li>
                <Link href="/guias" className="hover:text-white transition-colors">Guias Estratégicos</Link>
              </li>
              <li>
                <Link href="/eventos" className="hover:text-white transition-colors">Calendário de Eventos</Link>
              </li>
              <li>
                <Link href="/herois" className="hover:text-white transition-colors">Galeria de Heróis</Link>
              </li>
            </ul>
          </div>

          {/* COLUNA 3: UTILIÁRIOS & RECURSOS */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold font-mono text-cyan-400 uppercase tracking-wider">Recursos</h4>
            <ul className="space-y-2 text-xs text-slate-400">
              <li>
                <Link href="/calculadoras" className="hover:text-white transition-colors">Calculadoras de Recursos</Link>
              </li>
              <li>
                <Link href="/codigos" className="hover:text-white transition-colors">Códigos Presente (Gift Codes)</Link>
              </li>
              <li>
                <Link href="/guias-visuais" className="hover:text-white transition-colors">Guias Visuais & Tabelas</Link>
              </li>
            </ul>
          </div>

          {/* COLUNA 4: LEGAL & DISCLAIMER */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold font-mono text-slate-300 uppercase tracking-wider">Disclaimer Legal</h4>
            <p className="text-[10px] text-slate-500 leading-relaxed">
              Este é um fã-site desenvolvido de forma independente para a comunidade. Não possui filiação oficial, patrocínio ou parceria com os criadores ou distribuidores de Last Asylum.
            </p>
            <p className="text-[10px] text-slate-500">
              Todas as artes, marcas e personagens do jogo pertencem aos seus respectivos proprietários.
            </p>
          </div>

        </div>

        {/* LINHA DE COPYRIGHT FINAL */}
        <div className="pt-8 border-t border-slate-900 flex flex-col sm:flex-row items-center justify-between gap-4 text-[10px] text-slate-500 font-mono">
          <span>&copy; {new Date().getFullYear()} Last Asylum BR. Todos os direitos reservados.</span>
          <div className="flex gap-4">
            <Link href="/privacidade" className="hover:text-slate-300 transition-colors">Política de Privacidade</Link>
          </div>
        </div>

      </div>
    </footer>
  );
}
