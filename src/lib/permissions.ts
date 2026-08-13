/**
 * Sistema de Controle de Acesso Baseado em Papéis (RBAC - Role Based Access Control)
 * para o Painel Administrativo do Last Asylum BR.
 */

export type UserRole = "ADM" | "SUPER" | "R" | "E" | "USER";

export interface RoleInfo {
  id: UserRole;
  name: string;
  shortName: string;
  description: string;
  badgeColor: string;
}

export const ROLES_REGISTRY: Record<UserRole, RoleInfo> = {
  ADM: {
    id: "ADM",
    name: "Administrador",
    shortName: "ADM",
    description: "Acesso total irrestrito a todas as páginas e funções do portal.",
    badgeColor: "bg-red-500/20 text-red-400 border-red-500/30",
  },
  SUPER: {
    id: "SUPER",
    name: "Supervisor",
    shortName: "SUPER",
    description: "Acesso de supervisão a todas as páginas de Redatores e Editores.",
    badgeColor: "bg-amber-500/20 text-amber-400 border-amber-500/30",
  },
  R: {
    id: "R",
    name: "Redator",
    shortName: "REDATOR",
    description: "Acesso exclusivo à gestão de Notícias e Tutoriais.",
    badgeColor: "bg-[#00ff88]/20 text-[#00ff88] border-[#00ff88]/30",
  },
  E: {
    id: "E",
    name: "Editor",
    shortName: "EDITOR",
    description: "Acesso à gestão de Heróis e Tutoriais.",
    badgeColor: "bg-cyan-500/20 text-cyan-400 border-cyan-500/30",
  },
  USER: {
    id: "USER",
    name: "Jogador",
    shortName: "JOGADOR",
    description: "Membro da comunidade do Last Asylum.",
    badgeColor: "bg-slate-500/20 text-slate-300 border-slate-500/30",
  },
};

export interface AdminPageDefinition {
  id: string;
  label: string;
  icon: string;
  description: string;
  allowedRoles: UserRole[]; // Permissões explícitas atribuídas à página
}

/**
 * Registro Centralizado Padrão de Páginas Administrativas.
 */
export const ADMIN_PAGES: AdminPageDefinition[] = [
  {
    id: "herois",
    label: "Heróis",
    icon: "🛡️",
    description: "Configuração do catálogo, atributos e especialidades dos heróis.",
    allowedRoles: ["E"],
  },
  {
    id: "noticias",
    label: "Notícias",
    icon: "📰",
    description: "Publicação e gestão de notícias e anúncios da comunidade.",
    allowedRoles: ["R"],
  },
  {
    id: "eventos",
    label: "Eventos",
    icon: "📅",
    description: "Histórico de eventos da semana, invasões e pontuações.",
    allowedRoles: ["R", "E"],
  },
  {
    id: "tutoriais",
    label: "Tutoriais",
    icon: "📚",
    description: "Elaboração e revisão de guias estratégicos para jogadores.",
    allowedRoles: ["R", "E"],
  },
  {
    id: "codigos",
    label: "Códigos de Resgate",
    icon: "🎁",
    description: "Publicação e gestão de códigos presentes para jogadores.",
    allowedRoles: ["R"],
  },
  {
    id: "guias-visuais",
    label: "Guias Visuais",
    icon: "🖼️",
    description: "Publicação de infográficos e imagens explicativas.",
    allowedRoles: ["R", "E"],
  },
  {
    id: "usuarios",
    label: "Gestão de Usuários",
    icon: "👑",
    description: "Controle de usuários e distribuição de cargos de acesso (Exclusivo ADM).",
    allowedRoles: ["ADM"],
  },
];

/**
 * Retorna as páginas administrativas carregando dinamicamente as permissões customizadas de localStorage.
 */
export function getDynamicAdminPages(): AdminPageDefinition[] {
  if (typeof window !== "undefined") {
    const saved = localStorage.getItem("admin_page_permissions_matrix");
    if (saved) {
      try {
        const parsed = JSON.parse(saved) as AdminPageDefinition[];
        // Verifica se há novas páginas no código que não constam no localStorage e faz o merge
        const missing = ADMIN_PAGES.filter(
          (defPage) => !parsed.some((savedPage) => savedPage.id === defPage.id)
        );
        if (missing.length > 0) {
          const merged = [...parsed, ...missing];
          localStorage.setItem("admin_page_permissions_matrix", JSON.stringify(merged));
          return merged;
        }
        return parsed;
      } catch {
        return ADMIN_PAGES;
      }
    }
  }
  return ADMIN_PAGES;
}

/**
 * Função de Validação Automática de Acesso por Página e Cargo:
 * 1. ADM possui acesso a absolutamente TODAS as páginas.
 * 2. SUPER possui acesso a todas as páginas permitidas para Redatores (R) e Editores (E), além de SUPER.
 * 3. R e E possuem acesso se seu cargo constar na lista allowedRoles da página.
 */
export function canUserAccessPage(userRole: UserRole, pageId: string): boolean {
  if (pageId === "configuracoes") return true;
  if (userRole === "ADM") return true;

  const pages = getDynamicAdminPages();
  const page = pages.find((p) => p.id === pageId);
  if (!page) return false;

  // SUPER herda tudo que for liberado para R ou E
  if (userRole === "SUPER") {
    return page.allowedRoles.some((r) => r === "R" || r === "E" || r === "SUPER");
  }

  return page.allowedRoles.includes(userRole);
}

/**
 * Retorna a lista de páginas que o usuário logado tem permissão para visualizar no menu.
 */
export function getAccessiblePagesForUser(userRole: UserRole): AdminPageDefinition[] {
  return getDynamicAdminPages().filter((page) => canUserAccessPage(userRole, page.id));
}
