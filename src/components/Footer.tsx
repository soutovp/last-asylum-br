"use client";

import Link from "next/link";
import Image from "next/image";

export default function Footer() {
  return (
    <footer className="w-full bg-[#070a10] border-t border-slate-800/80 mt-auto relative z-10">
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
              <svg className="w-4 h-4 text-emerald-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              <a href="mailto:contato@lastasylumbr.com.br" className="hover:text-white transition-colors underline font-semibold leading-none">
                contato@lastasylumbr.com.br
              </a>
            </div>
            
            <div className="pt-2">
              <a 
                href="https://discord.gg/UVY4uycSK"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#5865F2] hover:bg-[#4752C4] text-xs font-bold text-white transition-all shadow-md hover:shadow-[#5865F2]/20"
              >
                <svg className="w-4 h-4 fill-current" viewBox="0 0 127.14 96.36">
                  <path d="M107.7,8.07A105.15,105.15,0,0,0,77.26,0a77.19,77.19,0,0,0-3.3,6.83A96.67,96.67,0,0,0,53.22,6.83,77.19,77.19,0,0,0,49.88,0,105.15,105.15,0,0,0,19.44,8.07C3.66,31.58-1.86,54.65,1,77.53A105.73,105.73,0,0,0,32,96.36a77.7,77.7,0,0,0,6.63-10.85,68.43,68.43,0,0,1-10.45-5c.87-.64,1.71-1.32,2.51-2a75.76,75.76,0,0,0,72.76,0c.8,0.7,1.64,1.38,2.51,2a68.43,68.43,0,0,1-10.45,5,77.7,77.7,0,0,0,6.63,10.85,105.73,105.73,0,0,0,31-18.83C129.87,50.7,123.82,27.82,107.7,8.07ZM42.45,65.69C36.18,65.69,31,60,31,53S36.18,40.36,42.45,40.36,53.83,46,53.83,53,48.72,65.69,42.45,65.69Zm42.24,0C78.41,65.69,73.24,60,73.24,53S78.41,40.36,84.69,40.36,96.07,46,96.07,53,91,65.69,84.69,65.69Z"/>
                </svg>
                <span>Entrar no Discord</span>
              </a>
            </div>
          </div>

          {/* COLUNA 2: NAVEGAÇÃO RÁPIDA */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold font-mono text-emerald-400 uppercase tracking-wider">Navegação</h4>
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
                <Link href="/calculadoras" className="hover:text-white transition-colors">Calculadoras de Recursos</Link>
              </li>
              <li>
                <Link href="/codigos" className="hover:text-white transition-colors">Códigos Presente (Gift Codes)</Link>
              </li>
              <li>
                <Link href="/guias-visuais" className="hover:text-white transition-colors">Guias Visuais & Tabelas</Link>
              </li>
              <li>
                <Link href="/herois" className="hover:text-white transition-colors">Galeria de Heróis</Link>
              </li>
              <li>
                <a 
                  href="https://discord.gg/UVY4uycSK" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="hover:text-white transition-colors flex items-center gap-1.5"
                >
                  Comunidade Discord
                  <span className="text-[9px] text-emerald-400 bg-emerald-950/60 border border-emerald-500/30 px-1.5 py-0.5 rounded font-sans font-bold uppercase tracking-wide">Novo</span>
                </a>
              </li>
            </ul>
          </div>

          {/* COLUNA 3: CANAIS OFICIAIS */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold font-mono text-amber-400 uppercase tracking-wider leading-relaxed">
              Canais Oficiais <br />
              Last Asylum Plague
            </h4>
            <ul className="space-y-2 text-xs text-slate-400">
              <li>
                <a 
                  href="https://play.google.com/store/apps/details?id=com.phs.global" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="hover:text-white transition-colors"
                >
                  Download Android (Play Store)
                </a>
              </li>
              <li>
                <a 
                  href="https://apps.apple.com/us/app/last-asylum-plague/id6756989323" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="hover:text-white transition-colors"
                >
                  Download iOS (App Store)
                </a>
              </li>
              <li>
                <a 
                  href="https://s.globallap.com/s/71plzq" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="hover:text-emerald-400 text-emerald-400 font-bold transition-colors"
                >
                  Recarga Oficial (Web Shop) 💎
                </a>
              </li>
              <li>
                <a 
                  href="https://discord.com/invite/rxVwBW5d9f" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="hover:text-white transition-colors"
                >
                  Discord Oficial do Jogo
                </a>
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
            <Link href="/termos" className="hover:text-slate-300 transition-colors">Termos de Serviço</Link>
          </div>
        </div>

      </div>
    </footer>
  );
}
