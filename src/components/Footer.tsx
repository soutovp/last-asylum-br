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
            <div className="text-xs text-slate-400 flex items-center gap-1.5 pt-1">
              <span>📧</span>
              <a href="mailto:contato@lastasylumbr.com.br" className="hover:text-white transition-colors underline font-medium">
                contato@lastasylumbr.com.br
              </a>
            </div>
            {/* REDES SOCIAIS COM HOVER NEON */}
            <div className="flex items-center gap-3 pt-2">
              <a 
                href="https://chat.whatsapp.com/invite" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="w-8 h-8 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-400 hover:text-[#00ff88] hover:border-[#00ff88]/50 hover:shadow-[0_0_10px_rgba(0,255,136,0.2)] transition-all duration-200 text-xs font-mono"
                title="WhatsApp Grupo"
              >
                💬
              </a>
              <a 
                href="https://discord.gg" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="w-8 h-8 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-400 hover:text-cyan-400 hover:border-cyan-400/50 hover:shadow-[0_0_10px_rgba(34,211,238,0.2)] transition-all duration-200 text-xs font-mono"
                title="Discord"
              >
                👾
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
