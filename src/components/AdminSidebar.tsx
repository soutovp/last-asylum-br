"use client";

import { useState } from "react";
import Link from "next/link";
import { UserSession, logoutAdmin } from "@/lib/auth";
import { getAccessiblePagesForUser, ROLES_REGISTRY } from "@/lib/permissions";

interface AdminSidebarProps {
  session: UserSession;
  activePageId: string;
  onSelectPage: (pageId: string) => void;
  onLogout: () => void;
  onSessionUpdate: (updated: UserSession) => void;
  collapsed: boolean;
  onToggleCollapse: () => void;
}

export default function AdminSidebar({
  session,
  activePageId,
  onSelectPage,
  onLogout,
  collapsed,
  onToggleCollapse,
}: AdminSidebarProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const accessiblePages = getAccessiblePagesForUser(session.role);
  const pagesToRender = accessiblePages;
  const roleInfo = ROLES_REGISTRY[session.role] || ROLES_REGISTRY.ADM;

  const handleLogout = async () => {
    await logoutAdmin();
    onLogout();
  };

  return (
    <>
      {/* BOTÃO MOBILE HAMBÚRGUER (EXIBIDO APENAS EM DISPOSITIVOS MÓVEIS) */}
      <div className="lg:hidden sticky top-0 z-40 bg-[#101623]/95 border-b border-slate-800 p-4 flex items-center justify-between backdrop-blur-xl">
        <div className="flex items-center">
          <img src="/images/last-asylum-br-logo.webp" alt="Logo" className="h-7 w-auto object-contain" />
        </div>
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-[#00ff88] text-sm font-bold"
        >
          {mobileMenuOpen ? "✕ Fechar" : "☰ Menu Admin"}
        </button>
      </div>

      {/* SIDEBAR CONTAINER */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 bg-[#101623]/98 border-r border-slate-800/90 backdrop-blur-2xl flex flex-col justify-between transition-all duration-300 transform ${
          mobileMenuOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        } ${collapsed ? "w-20" : "w-72"}`}
      >
        <div className="flex flex-col h-full justify-between">
          <div>
            {/* 1. TOPO DA SIDEBAR: BRANDING & BOTÃO DE RECOLHER */}
            <div className={`p-4 border-b border-slate-800/80 flex items-center ${collapsed ? "justify-center" : "justify-between"}`}>
              {!collapsed ? (
                <>
                  <Link href="/" className="flex items-center group">
                    <img src="/images/last-asylum-br-logo.webp" alt="Logo" className="h-[70px] w-auto object-contain" />
                  </Link>
                  <button
                    onClick={onToggleCollapse}
                    className="p-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
                    title="Recolher Menu"
                  >
                    ◀
                  </button>
                </>
              ) : (
                <div className="flex flex-col items-center gap-2">
                  <button
                    onClick={onToggleCollapse}
                    className="p-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
                    title="Expandir Menu"
                  >
                    ▶
                  </button>
                  <img src="/images/icon-last-asylum-br.webp" alt="Icon" className="w-5 h-5 object-contain" />
                </div>
              )}
            </div>

            {/* 2. NAVEGAÇÃO DE PÁGINAS ADMINISTRATIVAS */}
            <div className="p-2 space-y-1.5">
              {!collapsed && (
                <span className="px-3 text-[10px] font-mono uppercase font-bold tracking-widest text-slate-400 block mb-2">
                  Módulos
                </span>
              )}

              {pagesToRender.map((page) => {
                const isActive = activePageId === page.id;
                return (
                  <button
                    key={page.id}
                    onClick={() => {
                      onSelectPage(page.id);
                      setMobileMenuOpen(false);
                    }}
                    className={`w-full flex items-center rounded-2xl text-xs font-bold transition-all duration-200 group ${
                      collapsed ? "justify-center p-3" : "justify-between px-3.5 py-3"
                    } ${
                      isActive
                        ? "bg-[#00ff88] text-slate-950 shadow-[0_0_20px_rgba(0,255,136,0.35)] transform translate-x-1"
                        : "text-slate-300 hover:text-white hover:bg-slate-800/60"
                    }`}
                    title={collapsed ? page.label : undefined}
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-base">{page.icon}</span>
                      {!collapsed && <span>{page.label}</span>}
                    </div>

                    {!collapsed && page.allowedRoles.includes("ADM") && page.id === "usuarios" && (
                      <span className="text-[9px] font-mono font-black uppercase px-1.5 py-0.5 rounded bg-red-500/20 text-red-400 border border-red-500/40">
                        ADM
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* 3. RODAPÉ DA SIDEBAR: INFORMAÇÕES DE USUÁRIO E CONFIGURAÇÕES */}
          <div className="p-2 border-t border-slate-800/80 bg-slate-950/60 relative">
            
            {/* CARD DE INFORMAÇÕES DO USUÁRIO LOGADO */}
            <div className={`rounded-2xl bg-slate-900/90 border border-slate-800 space-y-3 ${collapsed ? "p-1.5" : "p-3.5"}`}>
              <div className="flex flex-col items-center text-center space-y-2">
                {/* Foto do Usuário */}
                <div className={`relative rounded-full overflow-hidden border-2 border-[#00ff88]/30 shadow-[0_0_10px_rgba(0,255,136,0.2)] bg-slate-800 flex items-center justify-center ${collapsed ? "w-10 h-10" : "w-14 h-14"}`}>
                  <img
                    src={session.avatarUrl || "https://api.dicebear.com/7.x/adventurer/svg?seed=Admin"}
                    alt="Avatar do Usuário"
                    className="w-full h-full object-cover object-top"
                  />
                </div>
                
                {/* Nome e Sobrenome (Apenas se não estiver colapsado) */}
                {!collapsed && (
                  <div className="w-full">
                    <span className="block text-xs sm:text-sm font-black text-white truncate px-1">
                      {session.firstName || "Administrador"} {session.lastName || ""}
                    </span>
                    <span className={`inline-block mt-0.5 px-2.5 py-0.5 rounded-full text-[9px] font-mono font-black border ${roleInfo.badgeColor}`}>
                      {roleInfo.shortName}
                    </span>
                  </div>
                )}
              </div>

              {/* AÇÕES DO RODAPÉ (CONFIGURAÇÃO DE PERFIL E LOGOUT) */}
              <div className={`flex border-t border-slate-800/80 gap-1.5 pt-2 ${collapsed ? "flex-col items-center" : "flex-row justify-between"}`}>
                <button
                  type="button"
                  onClick={() => {
                    onSelectPage("configuracoes");
                    setMobileMenuOpen(false);
                  }}
                  className={`rounded-xl text-[11px] font-bold flex items-center justify-center gap-1.5 transition-all ${
                    collapsed ? "w-8 h-8" : "flex-1 px-3 py-1.5"
                  } ${
                    activePageId === "configuracoes"
                      ? "bg-[#00ff88] text-slate-950 shadow-[0_0_12px_rgba(0,255,136,0.3)]"
                      : "bg-slate-800 hover:bg-slate-700 text-slate-300"
                  }`}
                  title="Configurações da Conta"
                >
                  <span>⚙️</span>
                  {!collapsed && <span>Configurações</span>}
                </button>

                <button
                  onClick={handleLogout}
                  className={`rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-400 text-[11px] font-bold border border-red-500/30 flex items-center justify-center gap-1 transition-colors ${
                    collapsed ? "w-8 h-8" : "px-3 py-1.5"
                  }`}
                  title="Encerrar Sessão"
                >
                  <span>↳</span>
                  {!collapsed && <span>Sair</span>}
                </button>
              </div>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
