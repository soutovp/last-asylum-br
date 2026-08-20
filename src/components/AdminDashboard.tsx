"use client";

import { useState, useEffect } from "react";
import { UserSession, updateSessionProfile, maskEmail } from "@/lib/auth";
import AdminSidebar from "./AdminSidebar";
import AdminUserManagement from "./AdminUserManagement";
import AdminArticleEditor, { ArticleData } from "./AdminArticleEditor";
import AdminGiftCodes from "./AdminGiftCodes";
import AdminVisualGuides from "./AdminVisualGuides";
import AdminMailMarketing from "./AdminMailMarketing";
import { canUserAccessPage, getAccessiblePagesForUser, ADMIN_PAGES } from "@/lib/permissions";
import { isSupabaseConfigured } from "@/lib/supabase";
import { compressImageToWebp } from "@/lib/imageCompression";

interface AdminDashboardProps {
  session: UserSession;
  onLogout: () => void;
  onSessionUpdate: (updated: UserSession) => void;
}

export default function AdminDashboard({
  session,
  onLogout,
  onSessionUpdate,
}: AdminDashboardProps) {
  // Controle de colapso da barra lateral
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  // Dummy state para forçar renderização em atualizações de permissões dinâmicas
  const [dummy, setDummy] = useState(0);

  // Estados dos Artigos (Tutoriais & Notícias)
  const [articles, setArticles] = useState<ArticleData[]>([]);
  const [reloadTrigger, setReloadTrigger] = useState(0);

  // Controle de SubView do Editor Compartilhado
  const [activeSubView, setActiveSubView] = useState<"list" | "editor">("list");
  const [editorArticleId, setEditorArticleId] = useState<string | undefined>(undefined);
  const [editorType, setEditorType] = useState<"noticia" | "guia" | null>(null);

  // Carrega as permissões do backend Supabase ao iniciar no ambiente de produção
  useEffect(() => {
    if (isSupabaseConfigured) {
      import("@/lib/supabase").then(async ({ supabase }) => {
        try {
          const { data, error } = await supabase
            .from("page_permissions")
            .select("*");
          if (data && data.length > 0) {
            const formatted = data.map((item: any) => ({
              id: item.page_id,
              label: ADMIN_PAGES.find(p => p.id === item.page_id)?.label || item.page_id,
              icon: ADMIN_PAGES.find(p => p.id === item.page_id)?.icon || "⚙️",
              description: ADMIN_PAGES.find(p => p.id === item.page_id)?.description || "",
              allowedRoles: item.allowed_roles,
            }));
            localStorage.setItem("admin_page_permissions_matrix", JSON.stringify(formatted));
            window.dispatchEvent(new Event("permissions_updated"));
          }
        } catch (err) {
          console.error("Erro ao carregar permissões do backend:", err);
        }
      });
    }
  }, []);

  // Carrega artigos do banco de dados (Supabase ou LocalStorage fallback)
  useEffect(() => {
    const loadArticles = async () => {
      try {
        if (isSupabaseConfigured) {
          const { supabase } = await import("@/lib/supabase");
          const { data, error } = await supabase
            .from("articles")
            .select("*")
            .order("created_at", { ascending: false });
          if (data) {
            setArticles(
              data.map((item: any) => ({
                id: item.id,
                title: item.title,
                summary: item.summary,
                content: item.content,
                layout_columns: item.layout_columns,
                scheduled_at: item.scheduled_at ? new Date(item.scheduled_at).toISOString().slice(0, 16) : "",
                slug: item.slug,
                seo_title: item.seo_title || "",
                seo_description: item.seo_description || "",
                seo_keywords: item.seo_keywords || "",
                type: item.type,
                status: item.status || "public",
                is_featured: item.is_featured || false,
                category: item.category || (item.type === "guia" ? "Guias" : "Atualizações"),
                image_url: item.image_url || "",
              }))
            );
          }
        } else {
          // Fallback Local Storage
          const stored = localStorage.getItem("local_articles");
          if (stored) {
            setArticles(JSON.parse(stored));
          } else {
            // Seed de amostras
            const sampleArticles: ArticleData[] = [
              {
                id: "seed-1",
                title: "Guia de Sobrevivência: Primeiros 30 Dias de Progressão",
                summary: "Aprenda a gerenciar seus suprimentos, laboratório de antitoxina e defesa rápida contra ratos.",
                content: "Guia detalhado de sobrevivência...",
                layout_columns: 1,
                scheduled_at: "",
                slug: "guia-sobrevivencia-inicial",
                seo_title: "Guia para Iniciantes - Last Asylum",
                seo_description: "Como iniciar bem o jogo.",
                seo_keywords: "guia, iniciante",
                type: "guia",
                status: "public",
                is_featured: true,
                category: "Guias",
                image_url: "",
              },
              {
                id: "seed-2",
                title: "Patch Notes v2.5: Buffs Estratégicos no Laboratório",
                summary: "Novas regras de progressão de habilidades e balanceamento de heróis já estão em teste.",
                content: "Conteúdo das notas do patch...",
                layout_columns: 1,
                scheduled_at: new Date(Date.now() + 86400000 * 3).toISOString().slice(0, 16), // 3 dias no futuro
                slug: "patch-notes-2-5-laboratorio",
                seo_title: "Patch Notes v2.5 - Atualizações",
                seo_description: "Buffs de laboratório.",
                seo_keywords: "patch, update",
                type: "noticia",
                status: "public",
                is_featured: false,
                category: "Atualizações",
                image_url: "",
              },
            ];
            localStorage.setItem("local_articles", JSON.stringify(sampleArticles));
            setArticles(sampleArticles);
          }
        }
      } catch (err) {
        console.error("Erro ao carregar artigos:", err);
      }
    };
    loadArticles();
  }, [reloadTrigger]);

  const handleDeleteArticle = async (id: string) => {
    if (!confirm("Deseja realmente excluir este artigo permanentemente?")) return;
    try {
      if (isSupabaseConfigured) {
        const { supabase } = await import("@/lib/supabase");
        const { error } = await supabase
          .from("articles")
          .delete()
          .eq("id", id);
        if (error) throw error;
      } else {
        const stored = localStorage.getItem("local_articles");
        if (stored) {
          const list = JSON.parse(stored) as ArticleData[];
          const filtered = list.filter((a) => a.id !== id);
          localStorage.setItem("local_articles", JSON.stringify(filtered));
        }
      }
      setReloadTrigger((prev) => prev + 1);
    } catch (err: any) {
      alert("Erro ao excluir artigo: " + err.message);
    }
  };

  useEffect(() => {
    const handlePermsChange = () => {
      setDummy((d) => d + 1);
    };
    window.addEventListener("permissions_updated", handlePermsChange);
    return () => window.removeEventListener("permissions_updated", handlePermsChange);
  }, []);

  const accessiblePages = getAccessiblePagesForUser(session.role);
  const defaultPageId = accessiblePages.length > 0 ? accessiblePages[0].id : "herois";

  const [activePageId, setActivePageId] = useState<string>(defaultPageId);

  // Garante que se o papel for alterado para um que não tenha acesso à página atual, ajusta para a 1ª liberada
  const hasAccess = canUserAccessPage(session.role, activePageId);
  const currentPageId = hasAccess ? activePageId : defaultPageId;

  // Estados das Configurações do Usuário
  const [firstNameInput, setFirstNameInput] = useState(session.firstName || "");
  const [lastNameInput, setLastNameInput] = useState(session.lastName || "");
  const [regionInput, setRegionInput] = useState(session.region || "");
  const [passwordInput, setPasswordInput] = useState("");
  const [confirmPasswordInput, setConfirmPasswordInput] = useState("");
  const [saveLoading, setSaveLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  const [errMsg, setErrMsg] = useState("");

  // Solicitação de alteração de e-mail
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [requestedEmail, setRequestedEmail] = useState("");
  const [emailRequestSent, setEmailRequestSent] = useState(false);

  // Sincroniza inputs quando a sessão for atualizada (ex: pelo login ou salvamento)
  useEffect(() => {
    setFirstNameInput(session.firstName || "");
    setLastNameInput(session.lastName || "");
    setRegionInput(session.region || "");
  }, [session]);

  const handleUpdateSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setSuccessMsg("");
    setErrMsg("");

    if (passwordInput && passwordInput !== confirmPasswordInput) {
      setErrMsg("As senhas não coincidem.");
      return;
    }

    setSaveLoading(true);

    try {
      if (isSupabaseConfigured) {
        const { supabase } = await import("@/lib/supabase");
        
        // 1. Salva/Atualiza na tabela publica public.profiles via upsert
        const { error: dbError } = await supabase
          .from("profiles")
          .upsert({
            email: session.email,
            first_name: firstNameInput,
            last_name: lastNameInput,
            region: regionInput,
            role: session.role,
            avatar_url: session.avatarUrl
          });
        
        if (dbError) throw dbError;

        // 2. Tenta atualizar no Supabase Auth se houver sessão (silencioso se falhar)
        try {
          await supabase.auth.updateUser({
            data: {
              first_name: firstNameInput,
              last_name: lastNameInput,
              region: regionInput,
            }
          });
          if (passwordInput) {
            await supabase.auth.updateUser({
              password: passwordInput
            });
          }
        } catch (authErr) {
          console.warn("Supabase Auth update ignored:", authErr);
        }
      }

      // Atualiza na sessão persistida do LocalStorage
      const updated = updateSessionProfile({
        firstName: firstNameInput,
        lastName: lastNameInput,
        region: regionInput,
      });

      if (updated) {
        onSessionUpdate(updated);
      }

      setSuccessMsg("Perfil atualizado com sucesso!");
      setPasswordInput("");
      setConfirmPasswordInput("");
    } catch (err: any) {
      setErrMsg(err.message || "Erro ao salvar alterações do perfil.");
    } finally {
      setSaveLoading(false);
    }
  };

  const handleRequestEmailChange = (e: React.FormEvent) => {
    e.preventDefault();
    if (!requestedEmail) return;

    // Simula o disparo de uma notificação para o Admin
    setEmailRequestSent(true);
    setTimeout(() => {
      setShowEmailModal(false);
      setEmailRequestSent(false);
      setRequestedEmail("");
      alert(`Solicitação para alterar e-mail enviada ao administrador! E-mail solicitado: ${requestedEmail}`);
    }, 2000);
  };

  // Upload do Avatar diretamente para o Cloudinary
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || "orrs3pvy";
    const uploadPreset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET || "ml_default";

    try {
      // Converte o avatar para WebP com tamanho menor (ex: 300x300 pixels para avatars)
      const optimizedFile = await compressImageToWebp(file, 300, 300, 0.85);

      const formData = new FormData();
      formData.append("file", optimizedFile);
      formData.append("upload_preset", uploadPreset);

      const res = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        throw new Error("Erro na requisição para o servidor Cloudinary");
      }

      const data = await res.json();
      const uploadedUrl = data.secure_url;

      if (isSupabaseConfigured) {
        const { supabase } = await import("@/lib/supabase");
        
        // 1. Salva/Atualiza na tabela public.profiles via upsert
        await supabase
          .from("profiles")
          .upsert({
            email: session.email,
            avatar_url: uploadedUrl,
            first_name: session.firstName || "",
            last_name: session.lastName || "",
            role: session.role
          });

        // 2. Tenta salvar na auth de forma silenciosa
        try {
          await supabase.auth.updateUser({
            data: { avatar_url: uploadedUrl }
          });
        } catch (authErr) {
          console.warn("Ignored auth user update:", authErr);
        }
      }

      const updated = updateSessionProfile({ avatarUrl: uploadedUrl });
      if (updated) {
        onSessionUpdate(updated);
      }
      
      alert("Foto de perfil atualizada com sucesso!");
    } catch (err: any) {
      alert("Erro ao enviar foto: " + err.message);
    }
  };

  // Filtros de Artigos
  const currentGuides = articles.filter(
    (a) =>
      a.type === "guia" &&
      (!a.scheduled_at || new Date(a.scheduled_at).getTime() <= Date.now())
  );
  const scheduledGuides = articles.filter(
    (a) =>
      a.type === "guia" &&
      a.scheduled_at &&
      new Date(a.scheduled_at).getTime() > Date.now()
  );

  const currentNews = articles.filter(
    (a) =>
      a.type === "noticia" &&
      (!a.scheduled_at || new Date(a.scheduled_at).getTime() <= Date.now())
  );
  const scheduledNews = articles.filter(
    (a) =>
      a.type === "noticia" &&
      a.scheduled_at &&
      new Date(a.scheduled_at).getTime() > Date.now()
  );

  if (accessiblePages.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6 bg-[#080c14] text-slate-100 relative z-10 w-full">
        <div className="max-w-md w-full p-8 rounded-3xl bg-[#101623] border border-slate-800 text-center space-y-5 shadow-2xl">
          <span className="text-4xl block">🛡️🚫</span>
          <h2 className="text-lg font-black text-white">Acesso Restrito</h2>
          <p className="text-xs text-slate-400 leading-relaxed">
            Sua conta ({session.email}) está ativa, mas você não possui privilégios administrativos para acessar este painel.
          </p>
          <button
            onClick={onLogout}
            className="w-full py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs transition-colors border border-red-500/20"
          >
            Sair da Conta e Entrar com Outro Usuário
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex bg-[#080c14] text-slate-100 selection:bg-[#00ff88] selection:text-slate-950">
      
      {/* SIDEBAR ADMINISTRATIVA PROFISSIONAL COLARESVEL */}
      <AdminSidebar
        session={session}
        activePageId={currentPageId}
        collapsed={sidebarCollapsed}
        onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
        onSelectPage={(id) => {
          setActiveTabAndPage(id);
          setActiveSubView("list"); // reseta subview ao trocar aba
        }}
        onLogout={onLogout}
        onSessionUpdate={(updated) => {
          onSessionUpdate(updated);
          const newPages = getAccessiblePagesForUser(updated.role);
          if (newPages.length > 0 && !newPages.some((p) => p.id === currentPageId)) {
            setActivePageId(newPages[0].id);
          }
        }}
      />

      {/* ÁREA DE CONTEÚDO PRINCIPAL DO DASHBOARD COM MARGEM AJUSTÁVEL */}
      <div className={`flex-1 flex flex-col min-h-screen transition-all duration-300 ${sidebarCollapsed ? "lg:pl-20" : "lg:pl-72"}`}>
        <main className="flex-1 p-6 sm:p-10 max-w-7xl w-full mx-auto">
          
          {/* SE RENDERIZA O EDITOR COMPARTILHADO */}
          {activeSubView === "editor" && editorType && (
            <AdminArticleEditor
              articleId={editorArticleId}
              articleType={editorType}
              onCancel={() => {
                setActiveSubView("list");
                setEditorArticleId(undefined);
                setEditorType(null);
              }}
              onSave={() => {
                setActiveSubView("list");
                setEditorArticleId(undefined);
                setEditorType(null);
                setReloadTrigger((prev) => prev + 1);
              }}
            />
          )}

          {activeSubView === "list" && (
            <>
              {/* PÁGINA: GESTÃO DE HERÓIS */}
              {currentPageId === "herois" && (
                <div className="space-y-6">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-3xl bg-[#101623]/90 border border-slate-800">
                    <div>
                      <h2 className="text-2xl font-extrabold text-white">Catálogo & Atributos de Heróis</h2>
                      <p className="text-xs text-slate-400 mt-1">
                        Cadastre novos heróis, edite atributos de combate e vincule fotos dos personagens.
                      </p>
                    </div>
                    <button className="px-5 py-2.5 rounded-xl bg-[#00ff88] text-slate-950 font-bold text-xs shadow-[0_0_15px_rgba(0,255,136,0.3)] hover:bg-[#15ff96]">
                      + Novo Herói
                    </button>
                  </div>

                  <div className="p-8 rounded-3xl bg-[#101623]/80 border border-slate-800 backdrop-blur-xl text-center space-y-3">
                    <span className="text-4xl block">🛡️</span>
                    <h3 className="text-lg font-bold text-white">Módulo de Gestão de Heróis</h3>
                    <p className="text-xs text-slate-400 max-w-md mx-auto">
                      Utilize o formulário de cadastro para publicar novos heróis com imagem e estatísticas.
                    </p>
                  </div>
                </div>
              )}

              {/* PÁGINA: CENTRAL DE NOTÍCIAS */}
              {currentPageId === "noticias" && (
                <div className="space-y-8">
                  {/* SEÇÃO 1: CABEÇALHO */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-3xl bg-[#101623]/90 border border-slate-800">
                    <div>
                      <h2 className="text-2xl font-extrabold text-white">Central de Notícias & Matérias</h2>
                      <p className="text-xs text-slate-400 mt-1">
                        Gerencie os artigos, comunicados da praga e notas de patch da página inicial.
                      </p>
                    </div>
                    <button
                      onClick={() => {
                        setEditorType("noticia");
                        setEditorArticleId(undefined);
                        setActiveSubView("editor");
                      }}
                      className="px-5 py-2.5 rounded-xl bg-[#00ff88] text-slate-950 font-bold text-xs shadow-[0_0_15px_rgba(0,255,136,0.3)] hover:bg-[#15ff96]"
                    >
                      + Nova Matéria
                    </button>
                  </div>

                  {/* SEÇÃO 2: MATÉRIAS PUBLICADAS (DECERSCENTE) */}
                  <div className="p-6 rounded-3xl bg-[#101623]/80 border border-slate-800 space-y-4">
                    <h3 className="text-base font-bold text-white">Matérias Publicadas</h3>
                    {currentNews.length === 0 ? (
                      <p className="text-xs text-slate-500 py-4">Nenhuma notícia publicada.</p>
                    ) : (
                      <div className="grid grid-cols-1 gap-3">
                        {currentNews.map((news) => (
                          <div
                            key={news.id}
                            className="p-4 rounded-2xl bg-slate-900 border border-slate-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                          >
                            <div>
                              <div className="flex items-center gap-2 flex-wrap">
                                <h4 className="text-sm font-bold text-white leading-snug">{news.title}</h4>
                                {news.status === "hidden" && (
                                  <span className="px-2 py-0.5 rounded-full text-[9px] font-mono font-bold bg-slate-800 text-red-400 border border-red-500/30">
                                    Oculto
                                  </span>
                                )}
                              </div>
                              <p className="text-xs text-slate-400 mt-1 line-clamp-2">{news.summary}</p>
                              <a
                                href={`/noticias/${news.slug}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-[10px] font-mono text-[#00ff88] hover:underline block mt-2"
                              >
                                URL: /noticias/{news.slug}
                              </a>
                            </div>
                            <div className="flex items-center gap-2 self-end sm:self-center">
                              <button
                                onClick={() => {
                                  setEditorType("noticia");
                                  setEditorArticleId(news.id);
                                  setActiveSubView("editor");
                                }}
                                className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold transition-colors"
                              >
                                Editar
                              </button>
                              <button
                                onClick={() => handleDeleteArticle(news.id || "")}
                                className="px-3 py-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 text-xs font-bold border border-red-500/30 transition-colors"
                              >
                                Excluir
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* SEÇÃO 3: PUBLICAÇÕES AGENDADAS */}
                  <div className="p-6 rounded-3xl bg-[#101623]/80 border border-slate-800 space-y-4">
                    <h3 className="text-base font-bold text-amber-400 flex items-center gap-2">
                      <span>⏳</span>
                      <span>Notícias Agendadas</span>
                    </h3>
                    {scheduledNews.length === 0 ? (
                      <p className="text-xs text-slate-500 py-2">Nenhuma publicação agendada no momento.</p>
                    ) : (
                      <div className="grid grid-cols-1 gap-3">
                        {scheduledNews.map((news) => (
                          <div
                            key={news.id}
                            className="p-4 rounded-2xl bg-slate-900 border border-amber-500/20 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                          >
                            <div>
                              <h4 className="text-sm font-bold text-white leading-snug">{news.title}</h4>
                              <p className="text-xs text-slate-400 mt-1 line-clamp-2">{news.summary}</p>
                              <span className="text-[10px] font-mono text-amber-400 font-bold block mt-2">
                                Agendado para: {new Date(news.scheduled_at).toLocaleString()}
                              </span>
                            </div>
                            <div className="flex items-center gap-2 self-end sm:self-center">
                              <button
                                onClick={() => {
                                  setEditorType("noticia");
                                  setEditorArticleId(news.id);
                                  setActiveSubView("editor");
                                }}
                                className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold transition-colors"
                              >
                                Editar
                              </button>
                              <button
                                onClick={() => handleDeleteArticle(news.id || "")}
                                className="px-3 py-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 text-xs font-bold border border-red-500/30 transition-colors"
                              >
                                Excluir
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* PÁGINA: HISTÓRICO DE EVENTOS */}
              {currentPageId === "eventos" && (
                <div className="space-y-6">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-3xl bg-[#101623]/90 border border-slate-800">
                    <div>
                      <h2 className="text-2xl font-extrabold text-white">Histórico & Calendário de Eventos</h2>
                      <p className="text-xs text-slate-400 mt-1">
                        Configure os eventos da semana, pontuações de aliança e cronômetros regressivos.
                      </p>
                    </div>
                    <button className="px-5 py-2.5 rounded-xl bg-amber-400 text-slate-950 font-bold text-xs shadow-[0_0_15px_rgba(245,158,11,0.3)]">
                      + Programar Evento
                    </button>
                  </div>

                  <div className="p-8 rounded-3xl bg-[#101623]/80 border border-slate-800 backdrop-blur-xl text-center space-y-3">
                    <span className="text-4xl block">📅</span>
                    <h3 className="text-lg font-bold text-white">Módulo de Histórico de Eventos</h3>
                    <p className="text-xs text-slate-400 max-w-md mx-auto">
                      Agende as fases semanais de invasão para exibição na página de eventos.
                    </p>
                  </div>
                </div>
              )}

              {/* PÁGINA: TUTORIAIS & GUIAS ESTRATÉGICOS */}
              {currentPageId === "tutoriais" && (
                <div className="space-y-8">
                  {/* SEÇÃO 1: CABEÇALHO COM BOTÃO CRIAR */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-3xl bg-[#101623]/90 border border-slate-800">
                    <div>
                      <h2 className="text-2xl font-extrabold text-white">Tutoriais & Guias Estratégicos</h2>
                      <p className="text-xs text-slate-400 mt-1">
                        Gerencie os artigos de guias e tutoriais avançados de evolução publicados para os usuários.
                      </p>
                    </div>
                    <button
                      onClick={() => {
                        setEditorType("guia");
                        setEditorArticleId(undefined);
                        setActiveSubView("editor");
                      }}
                      className="px-5 py-2.5 rounded-xl bg-[#00ff88] text-slate-950 font-bold text-xs shadow-[0_0_15px_rgba(0,255,136,0.3)] hover:bg-[#15ff96]"
                    >
                      + Criar Novo Guia
                    </button>
                  </div>

                  {/* SEÇÃO 2: ARTIGOS EXISTENTES (PUBLICADOS) */}
                  <div className="p-6 rounded-3xl bg-[#101623]/80 border border-slate-800 space-y-4">
                    <h3 className="text-base font-bold text-white">Guias Publicados</h3>
                    {currentGuides.length === 0 ? (
                      <p className="text-xs text-slate-500 py-4">Nenhum guia de tutorial publicado.</p>
                    ) : (
                      <div className="grid grid-cols-1 gap-3">
                        {currentGuides.map((guide) => (
                          <div
                            key={guide.id}
                            className="p-4 rounded-2xl bg-slate-900 border border-slate-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                          >
                            <div>
                              <div className="flex items-center gap-2 flex-wrap">
                                <h4 className="text-sm font-bold text-white leading-snug">{guide.title}</h4>
                                {guide.status === "hidden" && (
                                  <span className="px-2 py-0.5 rounded-full text-[9px] font-mono font-bold bg-slate-800 text-red-400 border border-red-500/30">
                                    Oculto
                                  </span>
                                )}
                              </div>
                              <p className="text-xs text-slate-400 mt-1 line-clamp-2">{guide.summary}</p>
                              <a
                                 href={`/guias/${guide.slug}`}
                                 target="_blank"
                                 rel="noopener noreferrer"
                                 className="text-[10px] font-mono text-[#00ff88] hover:underline block mt-2"
                              >
                                 URL: /guias/{guide.slug}
                              </a>
                            </div>
                            <div className="flex items-center gap-2 self-end sm:self-center">
                              <button
                                onClick={() => {
                                  setEditorType("guia");
                                  setEditorArticleId(guide.id);
                                  setActiveSubView("editor");
                                }}
                                className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold transition-colors"
                              >
                                Editar
                              </button>
                              <button
                                onClick={() => handleDeleteArticle(guide.id || "")}
                                className="px-3 py-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 text-xs font-bold border border-red-500/30 transition-colors"
                              >
                                Excluir
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* SEÇÃO 3: PUBLICAÇÕES AGENDADAS */}
                  <div className="p-6 rounded-3xl bg-[#101623]/80 border border-slate-800 space-y-4">
                    <h3 className="text-base font-bold text-amber-400 flex items-center gap-2">
                      <span>⏳</span>
                      <span>Guias Agendados</span>
                    </h3>
                    {scheduledGuides.length === 0 ? (
                      <p className="text-xs text-slate-500 py-2">Nenhuma publicação agendada no momento.</p>
                    ) : (
                      <div className="grid grid-cols-1 gap-3">
                        {scheduledGuides.map((guide) => (
                          <div
                            key={guide.id}
                            className="p-4 rounded-2xl bg-slate-900 border border-amber-500/20 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                          >
                            <div>
                              <h4 className="text-sm font-bold text-white leading-snug">{guide.title}</h4>
                              <p className="text-xs text-slate-400 mt-1 line-clamp-2">{guide.summary}</p>
                              <span className="text-[10px] font-mono text-amber-400 font-bold block mt-2">
                                Agendado para: {new Date(guide.scheduled_at).toLocaleString()}
                              </span>
                            </div>
                            <div className="flex items-center gap-2 self-end sm:self-center">
                              <button
                                onClick={() => {
                                  setEditorType("guia");
                                  setEditorArticleId(guide.id);
                                  setActiveSubView("editor");
                                }}
                                className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold transition-colors"
                              >
                                Editar
                              </button>
                              <button
                                onClick={() => handleDeleteArticle(guide.id || "")}
                                className="px-3 py-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 text-xs font-bold border border-red-500/30 transition-colors"
                              >
                                Excluir
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* PÁGINA: GESTÃO DE USUÁRIOS */}
              {currentPageId === "usuarios" && (
                <AdminUserManagement />
              )}

              {/* PÁGINA: CÓDIGOS DE RESGATE */}
              {currentPageId === "codigos" && (
                <AdminGiftCodes />
              )}

              {/* PÁGINA: GUIAS VISUAIS */}
              {currentPageId === "guias-visuais" && (
                <AdminVisualGuides />
              )}

              {/* PÁGINA: MAIL MARKETING */}
              {currentPageId === "mail-marketing" && (
                <AdminMailMarketing session={session} />
              )}

              {/* PÁGINA: CONFIGURAÇÕES DE PERFIL */}
              {currentPageId === "configuracoes" && (
                <div className="space-y-6">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-3xl bg-[#101623]/90 border border-slate-800">
                    <div>
                      <h2 className="text-2xl font-extrabold text-white">Configurações do Perfil</h2>
                      <p className="text-xs text-slate-400 mt-1">
                        Gerencie os dados cadastrais da sua conta administrativa de forma unificada.
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    
                    {/* 1. SEÇÃO DO CARTÃO DO PERFIL ATUAL COM FOTO */}
                    <div className="p-6 rounded-3xl bg-[#101623]/90 border border-slate-800 flex flex-col items-center text-center space-y-4 h-fit">
                      <div className="relative w-24 h-24 rounded-full overflow-hidden border-2 border-[#00ff88] bg-slate-900 shadow-xl">
                        <img
                          src={session.avatarUrl}
                          alt="Sua foto de perfil"
                          className="w-full h-full object-cover object-top"
                        />
                      </div>
                      
                      {/* UPLOAD E COMPRESSÃO DE IMAGEM */}
                      <div className="w-full">
                        <label className="cursor-pointer block text-center px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs font-bold text-slate-300 transition-colors">
                          <span>📤 Enviar Foto</span>
                          <input
                            type="file"
                            accept="image/*"
                            onChange={handleImageUpload}
                            className="hidden"
                          />
                        </label>
                      </div>

                      <div>
                        <h3 className="text-lg font-black text-white">
                          {session.firstName || "Administrador"} {session.lastName || ""}
                        </h3>
                        <span className="text-xs font-mono text-slate-400 block mt-1">
                          {maskEmail(session.email)}
                        </span>
                        <span className="inline-block mt-3 px-3 py-1 rounded-full text-[10px] font-mono font-black uppercase tracking-wider bg-[#00ff88]/10 text-[#00ff88] border border-[#00ff88]/30">
                          Função: {session.role}
                        </span>
                      </div>

                      {/* DATA DE NASCIMENTO E EMAIL RESUMIDO */}
                      <div className="w-full pt-4 border-t border-slate-800/80 text-left space-y-3 text-xs font-mono">
                        <div>
                          <span className="text-slate-400 block font-bold uppercase tracking-wider text-[10px] mb-1">
                            E-mail
                          </span>
                          <span className="text-white font-bold block bg-slate-950 px-3 py-2 rounded-xl border border-slate-800">
                            📧 {maskEmail(session.email)}
                          </span>
                        </div>
                        <div>
                          <span className="text-slate-400 block font-bold uppercase tracking-wider text-[10px] mb-1">
                            Data de Nascimento
                          </span>
                          <span className="text-white font-bold block bg-slate-950 px-3 py-2 rounded-xl border border-slate-800">
                            📅 {session.birthDate || "15/05/1990"}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* 2. FORMULÁRIO DE ATUALIZAÇÃO DE INFORMAÇÕES */}
                    <div className="lg:col-span-2 p-6 sm:p-8 rounded-3xl bg-[#101623]/80 border border-slate-800 backdrop-blur-xl space-y-6 shadow-2xl">
                      {successMsg && (
                        <div className="p-4 rounded-xl bg-[#00ff88]/10 border border-[#00ff88]/30 text-[#00ff88] text-xs font-semibold flex items-center gap-2">
                          <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          <span>{successMsg}</span>
                        </div>
                      )}
                      {errMsg && (
                        <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs font-semibold flex items-center gap-2">
                          <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          <span>{errMsg}</span>
                        </div>
                      )}

                      <form onSubmit={handleUpdateSettings} className="space-y-5">
                        
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-xs font-mono font-bold text-slate-300 uppercase tracking-wider mb-2">
                              Nome
                            </label>
                            <input
                              type="text"
                              value={firstNameInput}
                              onChange={(e) => setFirstNameInput(e.target.value)}
                              required
                              className="w-full h-12 px-4 text-sm font-medium text-white bg-slate-900/90 rounded-xl border border-slate-800 focus:outline-none focus:border-[#00ff88] transition-colors"
                            />
                          </div>

                          <div>
                            <label className="block text-xs font-mono font-bold text-slate-300 uppercase tracking-wider mb-2">
                              Sobrenome
                            </label>
                            <input
                              type="text"
                              value={lastNameInput}
                              onChange={(e) => setLastNameInput(e.target.value)}
                              required
                              className="w-full h-12 px-4 text-sm font-medium text-white bg-slate-900/90 rounded-xl border border-slate-800 focus:outline-none focus:border-[#00ff88] transition-colors"
                            />
                          </div>
                        </div>

                        <div>
                          <label className="block text-xs font-mono font-bold text-slate-300 uppercase tracking-wider mb-2">
                            Região
                          </label>
                          <input
                            type="text"
                            value={regionInput}
                            onChange={(e) => setRegionInput(e.target.value)}
                            required
                            className="w-full h-12 px-4 text-sm font-medium text-white bg-slate-900/90 rounded-xl border border-slate-800 focus:outline-none focus:border-[#00ff88] transition-colors"
                          />
                        </div>

                        {/* E-MAIL RESUMIDO (LEITURA APENAS E COM BOTÃO DE SOLICITAÇÃO) */}
                        <div>
                          <label className="block text-xs font-mono font-bold text-slate-300 uppercase tracking-wider mb-2">
                            E-mail Cadastrado
                          </label>
                          <div className="flex flex-col sm:flex-row gap-3">
                            <input
                              type="text"
                              value={maskEmail(session.email)}
                              disabled
                              className="flex-1 h-12 px-4 text-sm font-medium text-slate-400 bg-slate-950 rounded-xl border border-slate-800 cursor-not-allowed"
                            />
                            <button
                              type="button"
                              onClick={() => setShowEmailModal(true)}
                              className="px-4 h-12 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs border border-slate-700 transition-colors"
                            >
                              Solicitar Alteração
                            </button>
                          </div>
                        </div>

                        {/* ALTERAÇÃO DE SENHA */}
                        <div className="border-t border-slate-800/80 pt-5 space-y-5">
                          <h4 className="text-xs font-mono font-bold text-[#00ff88] uppercase tracking-wider">
                            Segurança & Senha
                          </h4>
                          
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                              <label className="block text-xs font-mono font-bold text-slate-300 uppercase tracking-wider mb-2">
                                Nova Senha
                              </label>
                              <input
                                type="password"
                                value={passwordInput}
                                onChange={(e) => setPasswordInput(e.target.value)}
                                placeholder="Mínimo 6 caracteres"
                                className="w-full h-12 px-4 text-sm font-medium text-white bg-slate-900/90 rounded-xl border border-slate-800 focus:outline-none focus:border-[#00ff88] transition-colors"
                              />
                            </div>

                            <div>
                              <label className="block text-xs font-mono font-bold text-slate-300 uppercase tracking-wider mb-2">
                                Confirmar Nova Senha
                              </label>
                              <input
                                type="password"
                                value={confirmPasswordInput}
                                onChange={(e) => setConfirmPasswordInput(e.target.value)}
                                placeholder="Repita a senha acima"
                                className="w-full h-12 px-4 text-sm font-medium text-white bg-slate-900/90 rounded-xl border border-slate-800 focus:outline-none focus:border-[#00ff88] transition-colors"
                              />
                            </div>
                          </div>
                        </div>

                        <button
                          type="submit"
                          disabled={saveLoading}
                          className="px-6 py-3 rounded-xl bg-[#00ff88] text-slate-950 font-bold text-sm shadow-[0_0_20px_rgba(0,255,136,0.3)] hover:bg-[#15ff96] active:scale-98 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                        >
                          {saveLoading ? (
                            <div className="w-5 h-5 border-2 border-slate-950 border-t-transparent rounded-full animate-spin"></div>
                          ) : (
                            <span>Salvar Alterações</span>
                          )}
                        </button>
                      </form>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}

        </main>
      </div>

      {/* MODAL PARA SOLICITAÇÃO DE ALTERAÇÃO DE E-MAIL */}
      {showEmailModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-md p-6 rounded-3xl bg-[#101623] border border-[#00ff88]/30 shadow-2xl relative">
            <h3 className="text-lg font-black text-white mb-2">Solicitar Alteração de E-mail</h3>
            <p className="text-xs text-slate-400 mb-4 leading-relaxed">
              Digite o novo endereço de e-mail desejado. Uma notificação com o pedido será encaminhada para análise do Administrador.
            </p>

            <form onSubmit={handleRequestEmailChange} className="space-y-4">
              <div>
                <label className="block text-xs font-mono font-bold text-slate-300 uppercase tracking-wider mb-2">
                  Novo E-mail Solicitado
                </label>
                <input
                  type="email"
                  value={requestedEmail}
                  onChange={(e) => setRequestedEmail(e.target.value)}
                  placeholder="novo.email@lastasylum.br"
                  required
                  className="w-full h-11 px-4 text-xs font-medium text-white bg-slate-900 rounded-xl border border-slate-800 focus:outline-none focus:border-[#00ff88]"
                />
              </div>

              <div className="flex items-center gap-2 pt-2">
                <button
                  type="submit"
                  disabled={emailRequestSent}
                  className="flex-1 py-2.5 rounded-xl bg-[#00ff88] text-slate-950 font-bold text-xs hover:bg-[#15ff96] transition-colors disabled:opacity-50 flex items-center justify-center"
                >
                  {emailRequestSent ? (
                    <div className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin"></div>
                  ) : (
                    "Enviar Solicitação"
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => setShowEmailModal(false)}
                  className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs"
                >
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );

  function setActiveTabAndPage(id: string) {
    if (canUserAccessPage(session.role, id)) {
      setActivePageId(id);
    }
  }
}
