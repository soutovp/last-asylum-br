"use client";

import { useState, useEffect, FormEvent } from "react";
import Link from "next/link";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";
import { getSavedSession, getDeterministicHeroAvatar, UserSession } from "@/lib/auth";
import { ROLES_REGISTRY, UserRole } from "@/lib/permissions";

// Interface para normalização dos perfis de comentários
interface CommentProfile {
  first_name: string;
  last_name: string;
  role: string;
  avatar_url: string;
  character_name?: string;
  character_id?: string;
  kingdom_number?: number;
  use_character_name?: boolean;
}

// Comentário normalizado para exibição no front-end
interface NormalizedComment {
  id: string;
  articleSlug: string;
  userId: string;
  content: string;
  parentId: string | null;
  createdAt: string;
  
  // Dados do autor normalizados
  displayName: string;
  avatarUrl: string;
  role: UserRole;
  characterName?: string;
  characterId?: string;
  kingdomNumber?: number;
  useCharacterName: boolean;
}

// Estrutura de árvore de comentários
interface CommentNode {
  comment: NormalizedComment;
  replies: CommentNode[];
}

interface CommentsSectionProps {
  articleSlug: string;
}

export default function CommentsSection({ articleSlug }: CommentsSectionProps) {
  const [comments, setComments] = useState<NormalizedComment[]>([]);
  const [loading, setLoading] = useState(true);
  const [session, setSession] = useState<UserSession | null>(null);
  
  // Controle de comentários colapsados/recolhidos (Reddit style)
  const [collapsedIds, setCollapsedIds] = useState<Set<string>>(new Set());

  // Input do comentário raiz
  const [rootCommentText, setRootCommentText] = useState("");
  const [rootSubmitting, setRootSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  // Input de respostas rápidas/inline
  const [replyingToId, setReplyingToId] = useState<string | null>(null);
  const [replyText, setReplyText] = useState("");
  const [replySubmitting, setReplySubmitting] = useState(false);

  // Carrega sessão do usuário e comentários
  const loadSessionAndComments = async () => {
    setSession(getSavedSession());
    await fetchComments();
  };

  useEffect(() => {
    loadSessionAndComments();

    // Listener para caso o usuário faça login em outra parte
    const handleAuthChange = () => {
      setSession(getSavedSession());
    };
    window.addEventListener("auth_state_change", handleAuthChange);
    return () => {
      window.removeEventListener("auth_state_change", handleAuthChange);
    };
  }, [articleSlug]);

  // Busca comentários do Supabase ou do LocalStorage (Fallback)
  const fetchComments = async () => {
    setLoading(true);
    try {
      if (isSupabaseConfigured) {
        const { data, error } = await supabase
          .from("comments")
          .select(`
            id,
            article_slug,
            content,
            parent_id,
            created_at,
            user_id,
            public_profiles (
              first_name,
              last_name,
              role,
              avatar_url,
              character_name,
              character_id,
              kingdom_number,
              use_character_name
            )
          `)
          .eq("article_slug", articleSlug)
          .order("created_at", { ascending: true });

        if (error) throw error;

        if (data) {
          const normalized = data.map((c: any) => normalizeComment(c));
          setComments(normalized);
        }
      } else {
        // Fallback Local Storage
        const stored = localStorage.getItem("local_comments");
        if (stored) {
          const localList = JSON.parse(stored);
          const filtered = localList.filter((c: any) => c.article_slug === articleSlug);
          const normalized = filtered.map((c: any) => normalizeComment(c));
          setComments(normalized);
        } else {
          setComments([]);
        }
      }
    } catch (err: any) {
      console.error("Erro ao carregar comentários:", err);
    } finally {
      setLoading(false);
    }
  };

  // Normaliza o comentário vindo do banco ou mock local
  const normalizeComment = (c: any): NormalizedComment => {
    const profile: CommentProfile = c.public_profiles || c.profiles || {};
    const useCharName = !!profile.use_character_name || !!c.useCharacterName;
    const charName = profile.character_name || c.characterName || "";
    const firstName = profile.first_name || c.authorName || "Jogador";
    const lastName = profile.last_name || "";
    
    const displayName = useCharName && charName 
      ? charName 
      : `${firstName} ${lastName}`.trim();

    return {
      id: c.id,
      articleSlug: c.article_slug || c.articleSlug,
      userId: c.user_id || c.userId,
      content: c.content,
      parentId: c.parent_id || c.parentId || null,
      createdAt: c.created_at || c.createdAt,
      displayName,
      avatarUrl: profile.avatar_url || c.authorAvatar || getDeterministicHeroAvatar(c.email || c.user_id || "default"),
      role: (profile.role as UserRole) || (c.authorRole as UserRole) || "USER",
      characterName: charName || undefined,
      characterId: profile.character_id || c.characterId || undefined,
      kingdomNumber: profile.kingdom_number || c.kingdomNumber || undefined,
      useCharacterName: useCharName,
    };
  };

  // Envio do comentário principal (Root)
  const handlePostRootComment = async (e: FormEvent) => {
    e.preventDefault();
    if (!rootCommentText.trim()) return;
    if (!session) {
      setErrorMessage("Você precisa estar logado para comentar.");
      return;
    }

    setRootSubmitting(true);
    setErrorMessage("");

    try {
      const newComment = await createCommentOnBackend(rootCommentText, null);
      if (newComment) {
        setComments((prev) => [...prev, newComment]);
        setRootCommentText("");
      }
    } catch (err: any) {
      setErrorMessage("Erro ao publicar comentário: " + err.message);
    } finally {
      setRootSubmitting(false);
    }
  };

  // Envio de resposta rápida (Reply)
  const handlePostReply = async (e: FormEvent, parentId: string) => {
    e.preventDefault();
    if (!replyText.trim()) return;
    if (!session) {
      alert("Você precisa estar logado para responder.");
      return;
    }

    setReplySubmitting(true);

    try {
      const newComment = await createCommentOnBackend(replyText, parentId);
      if (newComment) {
        setComments((prev) => [...prev, newComment]);
        setReplyText("");
        setReplyingToId(null);
      }
    } catch (err: any) {
      alert("Erro ao publicar resposta: " + err.message);
    } finally {
      setReplySubmitting(false);
    }
  };

  // Salva no banco ou localStorage
  const createCommentOnBackend = async (content: string, parentId: string | null): Promise<NormalizedComment | null> => {
    const sessionUser = getSavedSession();
    if (!sessionUser) return null;

    const dataToSave = {
      article_slug: articleSlug,
      user_id: sessionUser.id || sessionUser.email,
      content: content.trim(),
      parent_id: parentId,
    };

    if (isSupabaseConfigured) {
      const { data, error } = await supabase
        .from("comments")
        .insert([dataToSave])
        .select(`
          id,
          article_slug,
          content,
          parent_id,
          created_at,
          user_id,
          public_profiles (
            first_name,
            last_name,
            role,
            avatar_url,
            character_name,
            character_id,
            kingdom_number,
            use_character_name
          )
        `)
        .single();

      if (error) throw error;
      return normalizeComment(data);
    } else {
      // Mock para modo sem Supabase
      const newId = Math.random().toString(36).substring(2, 11);
      const mockComment = {
        id: newId,
        article_slug: articleSlug,
        user_id: sessionUser.email,
        content: content.trim(),
        parent_id: parentId,
        created_at: new Date().toISOString(),
        authorName: sessionUser.firstName || "Jogador",
        authorAvatar: sessionUser.avatarUrl,
        authorRole: sessionUser.role,
        characterName: sessionUser.characterName,
        characterId: sessionUser.characterId,
        kingdomNumber: sessionUser.kingdomNumber,
        useCharacterName: sessionUser.useCharacterName,
      };

      const stored = localStorage.getItem("local_comments");
      const commentsList = stored ? JSON.parse(stored) : [];
      localStorage.setItem("local_comments", JSON.stringify([...commentsList, mockComment]));
      return normalizeComment(mockComment);
    }
  };

  // Exclusão de comentário
  const handleDeleteComment = async (commentId: string) => {
    if (!confirm("Deseja realmente deletar seu comentário?")) return;

    try {
      if (isSupabaseConfigured) {
        const { error } = await supabase
          .from("comments")
          .delete()
          .eq("id", commentId);

        if (error) throw error;
      } else {
        const stored = localStorage.getItem("local_comments");
        if (stored) {
          const commentsList = JSON.parse(stored);
          const filtered = commentsList.filter((c: any) => c.id !== commentId);
          localStorage.setItem("local_comments", JSON.stringify(filtered));
        }
      }
      
      // Remove localmente (e também seus descendentes caso queira, mas aqui limpamos o nó na árvore)
      setComments((prev) => prev.filter((c) => c.id !== commentId));
    } catch (err: any) {
      alert("Erro ao excluir comentário: " + err.message);
    }
  };

  // Controle de colapso de árvore
  const toggleCollapse = (id: string) => {
    setCollapsedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  // Constrói a árvore de comentários baseada em arrays planos
  const buildCommentTree = (flat: NormalizedComment[]): CommentNode[] => {
    const nodeMap = new Map<string, CommentNode>();
    const roots: CommentNode[] = [];

    flat.forEach((c) => {
      nodeMap.set(c.id, { comment: c, replies: [] });
    });

    flat.forEach((c) => {
      const node = nodeMap.get(c.id)!;
      if (c.parentId && nodeMap.has(c.parentId)) {
        nodeMap.get(c.parentId)!.replies.push(node);
      } else {
        roots.push(node);
      }
    });

    return roots;
  };

  const countReplies = (node: CommentNode): number => {
    let count = node.replies.length;
    node.replies.forEach((child) => {
      count += countReplies(child);
    });
    return count;
  };

  const formatCommentDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const commentTree = buildCommentTree(comments);

  // Renderizador recursivo de nós de comentário (Reddit-Style)
  const CommentItem = ({ node, depth = 0 }: { node: CommentNode; depth: number }) => {
    const { comment, replies } = node;
    const isCollapsed = collapsedIds.has(comment.id);
    const isOwner = session && (session.id === comment.userId || session.email === comment.userId);
    const isAdmin = session && (session.role === "ADM" || session.role === "SUPER");
    const roleInfo = ROLES_REGISTRY[comment.role];
    const totalReplies = countReplies(node);

    if (isCollapsed) {
      return (
        <div className="mt-3 p-3 rounded-2xl bg-slate-900/40 border border-slate-800/50 text-xs text-slate-400 flex items-center gap-3">
          <button
            onClick={() => toggleCollapse(comment.id)}
            className="w-6 h-6 flex items-center justify-center rounded-lg bg-slate-800 hover:bg-slate-700 text-[#00ff88] font-bold text-xs"
            title="Expandir Comentário"
          >
            [+]
          </button>
          <span>
            <strong>{comment.displayName}</strong> {comment.kingdomNumber && `(Reino #${comment.kingdomNumber})`}{" "}
            • {totalReplies > 0 ? `${totalReplies} respostas recolhidas` : "comentário recolhido"}
          </span>
        </div>
      );
    }

    return (
      <div className="mt-4 flex gap-1 relative group/item">
        
        {/* LINHA DE THREAD CLICÁVEL DO REDDIT (COLAPSA AO CLICAR) */}
        {depth > 0 && (
          <button
            onClick={() => toggleCollapse(comment.id)}
            className="w-4 flex justify-center group/line cursor-pointer select-none focus:outline-none"
            title="Recolher conversa"
          >
            <div className="w-0.5 h-full bg-slate-800 group-hover/line:bg-[#00ff88]/60 group-hover/item:bg-slate-700/80 transition-colors"></div>
          </button>
        )}

        <div className="flex-1 bg-slate-950/20 hover:bg-slate-950/40 border border-slate-900/60 rounded-3xl p-4 sm:p-5 transition-all">
          {/* TOPO: AUTOR, BADGES E METADADOS */}
          <div className="flex flex-wrap items-center justify-between gap-3 mb-2.5 pb-2.5 border-b border-slate-800/40">
            <div className="flex items-center gap-2.5">
              <img
                src={comment.avatarUrl}
                alt={comment.displayName}
                className="w-8 h-8 rounded-full object-cover border border-slate-800"
              />
              
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-sm font-bold text-white leading-none">
                    {comment.displayName}
                  </span>

                  {/* CARGO BADGE */}
                  {comment.role !== "USER" && roleInfo && (
                    <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold font-mono border ${roleInfo.badgeColor} uppercase tracking-wider scale-90`}>
                      {roleInfo.shortName}
                    </span>
                  )}

                  {/* REINO BADGE */}
                  {comment.kingdomNumber && (
                    <span className="px-2 py-0.5 rounded-full text-[9px] font-bold font-mono bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 scale-90">
                      K: #{comment.kingdomNumber}
                    </span>
                  )}

                  {/* CHARACTER ID BADGE */}
                  {comment.characterId && (
                    <span className="hidden sm:inline-block px-2 py-0.5 rounded-full text-[9px] font-bold font-mono bg-slate-900 text-slate-400 border border-slate-800 scale-90">
                      ID: {comment.characterId}
                    </span>
                  )}
                </div>
                <time className="text-[10px] font-mono text-slate-500 mt-1 block">
                  {formatCommentDate(comment.createdAt)}
                </time>
              </div>
            </div>

            {/* BOTÃO DE COLAPSO SUPERIOR */}
            <button
              onClick={() => toggleCollapse(comment.id)}
              className="px-2.5 py-1 text-[10px] font-semibold font-mono text-slate-500 hover:text-[#00ff88] bg-slate-900/60 rounded-lg border border-slate-800 transition-colors"
              title="Recolher comentário"
            >
              [-] recolher
            </button>
          </div>

          {/* CONTEÚDO DO COMENTÁRIO */}
          <div className="text-sm text-slate-300 leading-relaxed break-words whitespace-pre-wrap pl-1 mb-4">
            {comment.content}
          </div>

          {/* AÇÕES (RESPONDER, DELETAR) */}
          <div className="flex items-center gap-4 text-xs font-mono">
            {session ? (
              <button
                onClick={() => {
                  setReplyText("");
                  setReplyingToId(replyingToId === comment.id ? null : comment.id);
                }}
                className={`flex items-center gap-1.5 font-bold transition-colors ${
                  replyingToId === comment.id ? "text-[#00ff88]" : "text-slate-400 hover:text-white"
                }`}
              >
                💬 Responder
              </button>
            ) : (
              <Link href="/login" className="text-slate-500 hover:text-slate-300 transition-colors">
                💬 Faça login para responder
              </Link>
            )}

            {(isOwner || isAdmin) && (
              <button
                onClick={() => handleDeleteComment(comment.id)}
                className="text-red-500/80 hover:text-red-400 transition-colors font-bold"
              >
                🗑️ Excluir
              </button>
            )}
          </div>

          {/* FORMULÁRIO DE RESPOSTA INLINE */}
          {replyingToId === comment.id && (
            <form onSubmit={(e) => handlePostReply(e, comment.id)} className="mt-4 p-4 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-3">
              <span className="text-[10px] font-mono text-cyan-400 block uppercase tracking-wider">
                Respondendo a {comment.displayName}
              </span>
              <textarea
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                placeholder="Escreva sua resposta..."
                required
                rows={3}
                className="w-full p-3 text-xs text-white bg-slate-950 rounded-xl border border-slate-800 focus:outline-none focus:border-[#00ff88] resize-none"
              />
              <div className="flex justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setReplyingToId(null)}
                  className="px-3.5 py-1.5 rounded-lg text-[10px] font-bold text-slate-400 bg-slate-900 border border-slate-800 hover:bg-slate-850"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={replySubmitting || !replyText.trim()}
                  className="px-3.5 py-1.5 rounded-lg text-[10px] font-bold text-slate-950 bg-[#00ff88] hover:bg-[#15ff96] shadow-[0_0_10px_rgba(0,255,136,0.3)] disabled:opacity-50 flex items-center gap-1.5"
                >
                  {replySubmitting ? (
                    <div className="w-3.5 h-3.5 border border-slate-950 border-t-transparent rounded-full animate-spin"></div>
                  ) : (
                    <span>Enviar Resposta</span>
                  )}
                </button>
              </div>
            </form>
          )}

          {/* RENDERIZAÇÃO ANINHADA RECURSIVA (REPLIES) */}
          {replies.length > 0 && (
            <div className="mt-4 border-l border-slate-800/80 pl-2 sm:pl-4 space-y-2">
              {replies.map((replyNode) => (
                <CommentItem
                  key={replyNode.comment.id}
                  node={replyNode}
                  depth={depth + 1}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="mt-12 space-y-8 pt-8 border-t border-slate-800/60">
      
      {/* HEADER DE COMENTÁRIOS */}
      <div className="flex items-center justify-between border-b border-slate-800/80 pb-4">
        <h3 className="text-lg font-black text-white flex items-center gap-2.5">
          <span>💬 Seção de Comentários</span>
          <span className="px-2.5 py-1 text-xs font-mono font-bold bg-slate-900 text-[#00ff88] rounded-full border border-slate-800">
            {comments.length}
          </span>
        </h3>
      </div>

      {/* ÁREA DE POSTAR NOVO COMENTÁRIO RAIZ */}
      {session ? (
        <form onSubmit={handlePostRootComment} className="space-y-3.5 p-5 rounded-3xl bg-slate-900/40 border border-slate-800/80">
          <div className="flex items-center gap-2">
            <img
              src={session.avatarUrl || "https://lastasylumplague.com/wp-content/uploads/2026/04/nicole-full-image-300x266.webp"}
              alt="Seu Avatar"
              className="w-6 h-6 rounded-full object-cover border border-[#00ff88]/30"
            />
            <span className="text-xs text-slate-300">
              Comentando como <strong className="text-white">{session.characterName && session.useCharacterName ? session.characterName : `${session.firstName} ${session.lastName}`}</strong>
              {session.kingdomNumber && <span className="text-cyan-400 font-mono font-bold ml-1.5">(K: #{session.kingdomNumber})</span>}
            </span>
          </div>

          <textarea
            value={rootCommentText}
            onChange={(e) => setRootCommentText(e.target.value)}
            placeholder="Deixe sua dúvida, sugestão ou elogio sobre o guia..."
            rows={4}
            required
            className="w-full p-4 text-xs sm:text-sm text-white bg-slate-950 rounded-2xl border border-slate-800 focus:outline-none focus:border-[#00ff88] resize-none"
          />

          {errorMessage && <p className="text-xs font-semibold text-red-400">{errorMessage}</p>}

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={rootSubmitting || !rootCommentText.trim()}
              className="px-5 py-2.5 rounded-xl text-xs font-bold text-slate-950 bg-[#00ff88] hover:bg-[#15ff96] shadow-[0_0_15px_rgba(0,255,136,0.3)] transition-all flex items-center gap-2 disabled:opacity-50"
            >
              {rootSubmitting ? (
                <div className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <span>Publicar Comentário</span>
              )}
            </button>
          </div>
        </form>
      ) : (
        /* BANNER NÃO AUTENTICADO CTA COM ESTÉTICA PREMIUM */
        <div className="p-8 rounded-3xl border border-dashed border-cyan-500/20 bg-slate-900/20 text-center space-y-4 max-w-xl mx-auto backdrop-blur-xl">
          <span className="text-3xl block">🔒</span>
          <h4 className="text-sm font-bold text-white">Deseja participar da discussão?</h4>
          <p className="text-xs text-slate-400 max-w-sm mx-auto leading-relaxed">
            Faça login na sua conta ou crie um cadastro para deixar comentários nos guias e trocar estratégias com outros sobreviventes.
          </p>
          <div className="pt-2 flex justify-center gap-3">
            <Link
              href="/login"
              className="px-5 py-2 rounded-xl text-xs font-bold text-slate-950 bg-[#00ff88] hover:bg-[#15ff96] shadow-[0_0_15px_rgba(0,255,136,0.2)] transition-colors"
            >
              Entrar na Conta
            </Link>
            <Link
              href="/cadastro"
              className="px-5 py-2 rounded-xl text-xs font-bold text-slate-200 bg-slate-800 hover:bg-slate-700 border border-slate-700 transition-colors"
            >
              Cadastrar-se
            </Link>
          </div>
        </div>
      )}

      {/* RENDERIZAÇÃO DA ÁRVORE DE COMENTÁRIOS */}
      {loading ? (
        <div className="py-12 flex flex-col items-center justify-center gap-3">
          <div className="w-8 h-8 border-4 border-[#00ff88] border-t-transparent rounded-full animate-spin"></div>
          <span className="text-xs text-slate-500 font-mono">Carregando comentários...</span>
        </div>
      ) : commentTree.length === 0 ? (
        <div className="py-10 text-center border border-slate-900/60 rounded-3xl bg-slate-900/10">
          <p className="text-xs text-slate-500 font-mono">Ainda não há comentários neste artigo. Seja o primeiro a comentar!</p>
        </div>
      ) : (
        <div className="space-y-4">
          {commentTree.map((rootNode) => (
            <CommentItem
              key={rootNode.comment.id}
              node={rootNode}
              depth={0}
            />
          ))}
        </div>
      )}
    </div>
  );
}
