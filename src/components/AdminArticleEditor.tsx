"use client";

import { useState, useEffect, useRef } from "react";
import { isSupabaseConfigured } from "@/lib/supabase";
import { getSavedSession } from "@/lib/auth";
import { compressImageToWebp } from "@/lib/imageCompression";

export interface ArticleData {
  id?: string;
  title: string;
  summary: string;
  content: string; 
  layout_columns: number;
  scheduled_at: string; 
  slug: string;
  seo_title: string;
  seo_description: string;
  seo_keywords: string;
  type: "noticia" | "guia";
  status: "public" | "hidden";
  is_featured: boolean;
  category: "Atualizações" | "Eventos" | "Guias" | "Manutenção";
  image_url?: string; // Imagem destaque do artigo
}

interface AdminArticleEditorProps {
  articleId?: string; 
  articleType: "noticia" | "guia";
  onCancel: () => void;
  onSave: () => void;
}

// Helper to generate friendly URLs (slugs)
const slugify = (text: string) => {
  return text
    .toString()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // Remove acentos/diacríticos
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-") // Substitui espaços por hifens
    .replace(/[^\w\-]+/g, "") // Remove caracteres não-alfanuméricos (exceto hifen)
    .replace(/\-\-+/g, "-") // Remove hifens duplicados
    .replace(/^-+/, "") // Remove hifens no início
    .replace(/-+$/, ""); // Remove hifens no fim
};

// Formatador simples para deixar o HTML legível
const formatHTMLCode = (html: string) => {
  let formatted = "";
  const reg = /(>)(<)(\/*)/g;
  let cleanHtml = html.replace(reg, "$1\r\n$2$3");
  let pad = 0;
  cleanHtml.split("\r\n").forEach((line) => {
    let indent = 0;
    if (line.match(/.+<\/\w[^>]*>$/)) {
      indent = 0;
    } else if (line.match(/^<\/\w/)) {
      if (pad !== 0) pad -= 1;
    } else if (line.match(/^<\w[^>]*[^\/]>.*$/)) {
      indent = 1;
    } else {
      indent = 0;
    }
    formatted += "  ".repeat(pad) + line + "\n";
    pad += indent;
  });
  return formatted.trim();
};

export default function AdminArticleEditor({
  articleId,
  articleType,
  onCancel,
  onSave,
}: AdminArticleEditorProps) {
  const [loading, setLoading] = useState(false);
  const [saveLoading, setSaveLoading] = useState(false);
  const [errMsg, setErrMsg] = useState("");

  // Cloudinary credentials from env
  const cloudinaryCloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || "";
  const cloudinaryUploadPreset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET || "";

  // Campos do formulário
  const [title, setTitle] = useState("");
  const [summary, setSummary] = useState("");
  const [scheduledAt, setScheduledAt] = useState(""); 
  const [slug, setSlug] = useState("");
  const [isSlugEdited, setIsSlugEdited] = useState(false);
  const [seoTitle, setSeoTitle] = useState("");
  const [seoDescription, setSeoDescription] = useState("");
  const [seoKeywords, setSeoKeywords] = useState("");
  const [status, setStatus] = useState<"public" | "hidden">("public");
  const [isFeatured, setIsFeatured] = useState(false);
  const [imageUrl, setImageUrl] = useState(""); // Imagem de Destaque

  // Determina se o artigo já foi publicado anteriormente
  const [alreadyPublished, setAlreadyPublished] = useState(false);
  const [originalAuthorEmail, setOriginalAuthorEmail] = useState("");

  // Conteúdo do Editor
  const [content, setContent] = useState("");
  const [editorMode, setEditorMode] = useState<"visual" | "html">("visual");

  const editorRef = useRef<HTMLDivElement>(null);

  // Estados para Ativação Visual dos Botões de Formatação
  const [activeFormats, setActiveFormats] = useState({
    bold: false,
    italic: false,
    underline: false,
    h2: false,
    h3: false,
    ul: false,
    ol: false,
  });

  // Estados das Modais Personalizadas
  const [showLinkModal, setShowLinkModal] = useState(false);
  const [linkText, setLinkText] = useState("");
  const [linkUrl, setLinkUrl] = useState("");

  const [showImageModal, setShowImageModal] = useState(false);
  // Identifica a ação de inserção da imagem: 'editor' (para o texto) ou 'destaque' (para a capa do card)
  const [imageTarget, setImageTarget] = useState<"editor" | "destaque">("editor");

  const [currentFolder, setCurrentFolder] = useState<"Banners" | "Heróis" | "Uploads">("Uploads");
  const [imageLibrary, setImageLibrary] = useState<Record<string, string[]>>({
    Banners: [
      "/images/village_banner_2.png",
      "https://lastasylumplague.com/wp-content/uploads/2026/04/nicole-full-image-300x266.webp"
    ],
    "Heróis": [
      "https://lastasylumplague.com/wp-content/uploads/2026/03/annie-full-image-226x300.webp",
      "https://lastasylumplague.com/wp-content/uploads/2026/03/marlena-full-image-300x281.webp",
      "https://lastasylumplague.com/wp-content/uploads/2026/03/jester-full-image-275x300.webp"
    ],
    Uploads: []
  });

  const [savedRange, setSavedRange] = useState<Range | null>(null);
  const [uploadProgress, setUploadProgress] = useState(false);

  // Carrega uploads salvos no Banco ou LocalStorage ao montar/atualizar
  const loadMediaAssets = async () => {
    try {
      if (isSupabaseConfigured) {
        const { supabase } = await import("@/lib/supabase");
        const { data, error } = await supabase
          .from("media_assets")
          .select("url")
          .order("created_at", { ascending: false });

        if (data) {
          setImageLibrary((prev) => ({
            ...prev,
            Uploads: data.map((item: any) => item.url)
          }));
        }
      } else {
        const saved = localStorage.getItem("local_uploads");
        if (saved) {
          setImageLibrary((prev) => ({
            ...prev,
            Uploads: JSON.parse(saved)
          }));
        }
      }
    } catch (err) {
      console.error("Erro ao carregar galeria:", err);
    }
  };

  useEffect(() => {
    loadMediaAssets();
  }, []);

  // Carrega dados para edição
  useEffect(() => {
    if (!articleId) {
      setSlug(`${articleType}-novo-${Date.now().toString().slice(-4)}`);
      setIsSlugEdited(false);
      return;
    }

    const loadArticle = async () => {
      setLoading(true);
      try {
        if (isSupabaseConfigured) {
          const { supabase } = await import("@/lib/supabase");
          const { data, error } = await supabase
            .from("articles")
            .select("*")
            .eq("id", articleId)
            .single();

          if (error) throw error;
          if (data) {
            setTitle(data.title);
            setSummary(data.summary);
            setSlug(data.slug);
            setIsSlugEdited(true);
            setSeoTitle(data.seo_title || "");
            setSeoDescription(data.seo_description || "");
            setSeoKeywords(data.seo_keywords || "");
            setStatus(data.status as "public" | "hidden");
            setIsFeatured(data.is_featured || false);
            setImageUrl(data.image_url || "");
            setContent(data.content || "");
            setOriginalAuthorEmail(data.author_email || "");
            
            if (data.scheduled_at) {
              const schedTime = new Date(data.scheduled_at);
              setScheduledAt(schedTime.toISOString().slice(0, 16));
              setAlreadyPublished(schedTime.getTime() <= Date.now());
            } else {
              setAlreadyPublished(true);
            }
          }
        } else {
          // Fallback Local Storage
          const stored = localStorage.getItem("local_articles");
          if (stored) {
            const list = JSON.parse(stored) as any[];
            const found = list.find((a) => a.id === articleId);
            if (found) {
              setTitle(found.title);
              setSummary(found.summary);
              setSlug(found.slug);
              setIsSlugEdited(true);
              setSeoTitle(found.seo_title);
              setSeoDescription(found.seo_description);
              setSeoKeywords(found.seo_keywords);
              setScheduledAt(found.scheduled_at);
              setStatus(found.status || "public");
              setIsFeatured(found.is_featured || false);
              setImageUrl(found.image_url || "");
              setContent(found.content || "");
              setOriginalAuthorEmail(found.author_email || "");
              
              if (found.scheduled_at) {
                setAlreadyPublished(new Date(found.scheduled_at).getTime() <= Date.now());
              } else {
                setAlreadyPublished(true);
              }
            }
          }
        }
      } catch (err: any) {
        setErrMsg("Erro ao carregar o artigo: " + err.message);
      } finally {
        setLoading(false);
      }
    };

    loadArticle();
  }, [articleId, articleType]);

  // Configura separador de parágrafos padrão no WYSIWYG
  useEffect(() => {
    if (editorMode === "visual" && editorRef.current) {
      document.execCommand("defaultParagraphSeparator", false, "p");
      if (editorRef.current.innerHTML !== content) {
        editorRef.current.innerHTML = content;
      }
    }
  }, [editorMode, content]);

  // Salva a seleção do cursor antes de abrir modais
  const backupSelection = () => {
    const sel = window.getSelection();
    if (sel && sel.rangeCount > 0) {
      setSavedRange(sel.getRangeAt(0));
    }
  };

  const restoreSelection = () => {
    if (savedRange) {
      const sel = window.getSelection();
      if (sel) {
        sel.removeAllRanges();
        sel.addRange(savedRange);
      }
    }
  };

  // Atualiza estados dos botões de formatação ativa
  const updateToolbarStates = () => {
    setActiveFormats({
      bold: document.queryCommandState("bold"),
      italic: document.queryCommandState("italic"),
      underline: document.queryCommandState("underline"),
      h2: document.queryCommandValue("formatBlock") === "h2",
      h3: document.queryCommandValue("formatBlock") === "h3",
      ul: document.queryCommandState("insertUnorderedList"),
      ol: document.queryCommandState("insertOrderedList"),
    });
  };

  const syncContentFromVisual = () => {
    if (editorRef.current) {
      setContent(editorRef.current.innerHTML);
    }
  };

  const formatText = (command: string, value = "") => {
    document.execCommand(command, false, value);
    syncContentFromVisual();
    updateToolbarStates();
  };

  // Atalhos de teclado no Editor (keydown)
  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.ctrlKey) {
      const key = e.key.toLowerCase();
      if (key === "b") {
        e.preventDefault();
        formatText("bold");
      } else if (key === "i") {
        e.preventDefault();
        formatText("italic");
      } else if (key === "u") {
        e.preventDefault();
        formatText("underline");
      }
    }

    // Interceptação de Enter / Shift+Enter
    if (e.key === "Enter") {
      const selection = window.getSelection();
      if (selection && selection.rangeCount > 0) {
        const range = selection.getRangeAt(0);
        let node = range.startContainer;
        let liNode: HTMLElement | null = null;
        while (node && node !== editorRef.current) {
          if (node.nodeName === "LI") {
            liNode = node as HTMLElement;
            break;
          }
          node = node.parentNode!;
        }

        // Comportamento customizado dentro de Listas
        if (liNode) {
          e.preventDefault();
          if (e.shiftKey) {
            document.execCommand("insertParagraph");
          } else {
            const parentList = liNode.parentNode;
            if (parentList) {
              const nextP = document.createElement("p");
              nextP.innerHTML = "<br>";
              if (parentList.nextSibling) {
                parentList.parentNode?.insertBefore(nextP, parentList.nextSibling);
              } else {
                parentList.parentNode?.appendChild(nextP);
              }
              const newRange = document.createRange();
              newRange.setStart(nextP, 0);
              newRange.collapse(true);
              selection.removeAllRanges();
              selection.addRange(newRange);
            }
          }
          syncContentFromVisual();
          updateToolbarStates();
          return;
        }

        // Fora de listas: se a linha estiver vazia, insere <br> ao invés de <p>
        const textContent = range.startContainer.textContent || "";
        if (textContent.trim() === "") {
          e.preventDefault();
          document.execCommand("insertHTML", false, "<br>");
          syncContentFromVisual();
          return;
        }

        // Reseta todos os efeitos de texto ativos no Enter
        setTimeout(() => {
          if (document.queryCommandState("bold")) document.execCommand("bold");
          if (document.queryCommandState("italic")) document.execCommand("italic");
          if (document.queryCommandState("underline")) document.execCommand("underline");
          updateToolbarStates();
        }, 0);
      }
    }
  };

  // Abre Modal de Imagens
  const openImageModal = (target: "editor" | "destaque") => {
    setImageTarget(target);
    if (target === "editor") {
      backupSelection();
    }
    setShowImageModal(true);
  };

  // Upload para o Cloudinary via API
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!cloudinaryCloudName || !cloudinaryUploadPreset) {
      alert("Por favor, configure NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME e NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET no arquivo .env.local!");
      return;
    }

    setUploadProgress(true);
    try {
      // Converte a imagem para WebP e comprime antes do upload
      const optimizedFile = await compressImageToWebp(file, 1200, 1200, 0.8);

      const formData = new FormData();
      formData.append("file", optimizedFile);
      formData.append("upload_preset", cloudinaryUploadPreset);

      const res = await fetch(`https://api.cloudinary.com/v1_1/${cloudinaryCloudName}/image/upload`, {
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
        await supabase
          .from("media_assets")
          .insert([{ url: uploadedUrl }]);
      } else {
        const saved = localStorage.getItem("local_uploads");
        const list = saved ? JSON.parse(saved) : [];
        list.push(uploadedUrl);
        localStorage.setItem("local_uploads", JSON.stringify(list));
      }

      await loadMediaAssets();
    } catch (err: any) {
      alert("Erro ao enviar imagem: " + err.message);
    } finally {
      setUploadProgress(false);
    }
  };

  // Remove imagem da galeria
  const deleteUploadImage = async (urlToDelete: string) => {
    if (!confirm("Tem certeza que deseja excluir esta imagem da biblioteca?")) return;
    try {
      if (isSupabaseConfigured) {
        const { supabase } = await import("@/lib/supabase");
        await supabase
          .from("media_assets")
          .delete()
          .eq("url", urlToDelete);
      } else {
        const saved = localStorage.getItem("local_uploads");
        if (saved) {
          const list = JSON.parse(saved) as string[];
          const filtered = list.filter((url) => url !== urlToDelete);
          localStorage.setItem("local_uploads", JSON.stringify(filtered));
        }
      }
      await loadMediaAssets();
    } catch (err: any) {
      alert("Erro ao excluir imagem: " + err.message);
    }
  };

  const selectImage = (url: string) => {
    if (imageTarget === "destaque") {
      setImageUrl(url);
    } else {
      restoreSelection();
      document.execCommand("insertHTML", false, `<img src="${url}" alt="Imagem do artigo" class="my-4 rounded-2xl max-w-full block mx-auto shadow-lg" />`);
      syncContentFromVisual();
    }
    setShowImageModal(false);
  };

  // Abre Modal de Link
  const openLinkModal = () => {
    backupSelection();
    const selText = window.getSelection()?.toString() || "";
    setLinkText(selText);
    setLinkUrl("");
    setShowLinkModal(true);
  };

  const selectLink = (e: React.FormEvent) => {
    e.preventDefault();
    restoreSelection();
    if (linkUrl) {
      document.execCommand(
        "insertHTML",
        false,
        `<a href="${linkUrl}" target="_blank" rel="noopener noreferrer" class="text-[#00ff88] underline font-bold hover:text-[#15ff96]">${linkText || linkUrl}</a>`
      );
    }
    setShowLinkModal(false);
    syncContentFromVisual();
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrMsg("");
    setSaveLoading(true);

    if (editorMode === "visual") {
      syncContentFromVisual();
    }
    const finalCategory = articleType === "guia" ? "Guias" : "Atualizações";
    const session = getSavedSession();
    const currentEmail = session?.email || "admin@lastasylum.br";
    // Mantém o autor original se estiver editando, caso contrário atribui o e-mail logado atual
    const authorEmail = articleId ? (originalAuthorEmail || currentEmail) : currentEmail;

    // Gerar slug amigável limpo a partir do slug atual ou do título
    let finalSlug = slugify(slug || title);
    if (!finalSlug) {
      finalSlug = `${articleType}-novo-${Date.now().toString().slice(-4)}`;
    }

    try {
      if (isSupabaseConfigured) {
        const { supabase } = await import("@/lib/supabase");

        // Checar se já existe um artigo com o mesmo slug (excluindo o atual se for edição)
        let exists = false;
        let query = supabase.from("articles").select("id").eq("slug", finalSlug);
        if (articleId) {
          query = query.neq("id", articleId);
        }
        const { data: existingArticles, error: checkError } = await query;
        if (checkError) throw checkError;

        if (existingArticles && existingArticles.length > 0) {
          exists = true;
        }

        const payload: any = {
          title,
          summary,
          content,
          layout_columns: 1,
          scheduled_at: alreadyPublished ? null : (scheduledAt ? new Date(scheduledAt).toISOString() : null),
          seo_title: seoTitle || title,
          seo_description: seoDescription || summary,
          seo_keywords: seoKeywords,
          type: articleType,
          status,
          is_featured: isFeatured,
          category: finalCategory,
          image_url: imageUrl,
          author_email: authorEmail,
        };

        if (articleId) {
          const actualSlug = exists ? `${finalSlug}-${articleId}` : finalSlug;
          payload.slug = actualSlug;

          const { error } = await supabase
            .from("articles")
            .update(payload)
            .eq("id", articleId);
          if (error) throw error;
        } else {
          // Para novos artigos, usamos um slug temporário garantido se o base já existir
          const actualSlug = exists ? `${finalSlug}-temp-${Date.now()}` : finalSlug;
          payload.slug = actualSlug;

          const { data: insertedData, error } = await supabase
            .from("articles")
            .insert([payload])
            .select()
            .single();
          if (error) throw error;

          // Se o slug já existia, atualizamos com o ID gerado pelo banco no final
          if (exists && insertedData) {
            const realId = insertedData.id;
            const updatedSlug = `${finalSlug}-${realId}`;
            const { error: updateSlugError } = await supabase
              .from("articles")
              .update({ slug: updatedSlug })
              .eq("id", realId);
            if (updateSlugError) throw updateSlugError;
          }
        }
      } else {
        // Fallback local storage
        const stored = localStorage.getItem("local_articles");
        const list = stored ? (JSON.parse(stored) as ArticleData[]) : [];
        
        let updatedList = [...list];
        if (isFeatured) {
          updatedList = updatedList.map((a) =>
            a.type === articleType ? { ...a, is_featured: false } : a
          );
        }

        const tempId = articleId || Date.now().toString();
        const exists = list.some((a) => a.slug === finalSlug && a.id !== tempId);
        const actualSlug = exists ? `${finalSlug}-${tempId}` : finalSlug;

        const articlePayload: ArticleData & { author_email?: string } = {
          id: tempId,
          title,
          summary,
          content,
          layout_columns: 1, 
          scheduled_at: alreadyPublished ? "" : scheduledAt, 
          slug: actualSlug,
          seo_title: seoTitle || title,
          seo_description: seoDescription || summary,
          seo_keywords: seoKeywords,
          type: articleType,
          status,
          is_featured: isFeatured,
          category: finalCategory,
          image_url: imageUrl,
          author_email: authorEmail,
        };

        if (articleId) {
          updatedList = updatedList.map((a) =>
            a.id === articleId ? { ...articlePayload } : a
          );
        } else {
          updatedList.push(articlePayload);
        }
        localStorage.setItem("local_articles", JSON.stringify(updatedList));
      }
      onSave();
    } catch (err: any) {
      setErrMsg("Erro ao salvar artigo: " + err.message);
    } finally {
      setSaveLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      
      {/* HEADER DE AÇÕES */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-3xl bg-[#101623]/90 border border-slate-800">
        <div>
          <h2 className="text-2xl font-extrabold text-white">
            {articleId ? "Editar Artigo" : "Criar Novo Artigo"}
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Redija conteúdos formatados, gerencie a visibilidade e otimize o SEO.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onCancel}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-slate-300 transition-colors"
          >
            Cancelar
          </button>
        </div>
      </div>

      {errMsg && (
        <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs font-semibold">
          {errMsg}
        </div>
      )}

      {/* FORMULÁRIO GERAL */}
      <form onSubmit={handleSave} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* COLUNA DA ESQUERDA (EDITOR E CONTEÚDO) */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* TÍTULO & RESUMO */}
          <div className="p-6 rounded-3xl bg-[#101623]/90 border border-slate-800 space-y-4">
            <div>
              <label className="block text-xs font-mono font-bold text-slate-300 uppercase tracking-wider mb-2">
                Título do Artigo
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => {
                  const newTitle = e.target.value;
                  setTitle(newTitle);
                  if (!isSlugEdited) {
                    setSlug(slugify(newTitle));
                  }
                }}
                placeholder="Ex: Guia Definitivo do Médico da Praga"
                required
                className="w-full h-12 px-4 text-sm font-medium text-white bg-slate-900 rounded-xl border border-slate-800 focus:outline-none focus:border-[#00ff88]"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-xs font-mono font-bold text-slate-300 uppercase tracking-wider">
                  Resumo de Exibição
                </label>
                <span className="text-[10px] font-mono text-slate-400">
                  {summary.length}/200 caracteres (Recomendado)
                </span>
              </div>
              <textarea
                value={summary}
                onChange={(e) => setSummary(e.target.value.slice(0, 200))}
                placeholder="Uma breve introdução curta para atrair leitores na lista inicial..."
                required
                rows={3}
                className="w-full p-4 text-xs sm:text-sm font-medium text-white bg-slate-900 rounded-xl border border-slate-800 focus:outline-none focus:border-[#00ff88] resize-none"
              />
            </div>
          </div>

          {/* O EDITOR DE CONTEÚDO */}
          <div className="p-6 rounded-3xl bg-[#101623]/80 border border-slate-800 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <span className="text-xs font-mono font-bold text-slate-400 uppercase">
                Editor
              </span>

              <div className="flex items-center gap-1.5 bg-slate-900 p-1 rounded-xl border border-slate-800">
                <button
                  type="button"
                  onClick={() => setEditorMode("visual")}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    editorMode === "visual" ? "bg-slate-800 text-[#00ff88]" : "text-slate-400"
                  }`}
                >
                  Visual WYSIWYG
                </button>
                <button
                  type="button"
                  onClick={() => {
                    if (editorMode === "visual") {
                      syncContentFromVisual();
                      setContent(prev => formatHTMLCode(prev));
                    }
                    setEditorMode("html");
                  }}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    editorMode === "html" ? "bg-slate-800 text-[#00ff88]" : "text-slate-400"
                  }`}
                >
                  Código HTML (Formatado)
                </button>
              </div>
            </div>

            {editorMode === "visual" && (
              <div className="flex flex-wrap gap-1 bg-slate-900 p-2 rounded-xl border border-slate-800">
                <button
                  type="button"
                  onMouseDown={(e) => { e.preventDefault(); formatText("bold"); }}
                  className={`px-3 py-1.5 rounded text-xs font-bold transition-colors ${
                    activeFormats.bold ? "bg-[#00ff88] text-slate-950 font-black" : "bg-slate-800 text-slate-200 hover:text-white"
                  }`}
                  title="Negrito (Ctrl+B)"
                >
                  B
                </button>
                <button
                  type="button"
                  onMouseDown={(e) => { e.preventDefault(); formatText("italic"); }}
                  className={`px-3 py-1.5 rounded text-xs italic transition-colors ${
                    activeFormats.italic ? "bg-[#00ff88] text-slate-950 font-black" : "bg-slate-800 text-slate-200 hover:text-white"
                  }`}
                  title="Itálico (Ctrl+I)"
                >
                  I
                </button>
                <button
                  type="button"
                  onMouseDown={(e) => { e.preventDefault(); formatText("underline"); }}
                  className={`px-3 py-1.5 rounded text-xs underline transition-colors ${
                    activeFormats.underline ? "bg-[#00ff88] text-slate-950 font-black" : "bg-slate-800 text-slate-200 hover:text-white"
                  }`}
                  title="Sublinhado (Ctrl+U)"
                >
                  U
                </button>
                <span className="w-px h-6 bg-slate-800 my-auto"></span>
                <button
                  type="button"
                  onMouseDown={(e) => { e.preventDefault(); formatText("formatBlock", activeFormats.h2 ? "div" : "h2"); }}
                  className={`px-3 py-1.5 rounded text-xs font-mono transition-colors ${
                    activeFormats.h2 ? "bg-[#00ff88] text-slate-950 font-black" : "bg-slate-800 text-slate-200 hover:text-white"
                  }`}
                  title="Título H2"
                >
                  H2
                </button>
                <button
                  type="button"
                  onMouseDown={(e) => { e.preventDefault(); formatText("formatBlock", activeFormats.h3 ? "div" : "h3"); }}
                  className={`px-3 py-1.5 rounded text-xs font-mono transition-colors ${
                    activeFormats.h3 ? "bg-[#00ff88] text-slate-950 font-black" : "bg-slate-800 text-slate-200 hover:text-white"
                  }`}
                  title="Título H3"
                >
                  H3
                </button>
                <span className="w-px h-6 bg-slate-800 my-auto"></span>
                <button
                  type="button"
                  onMouseDown={(e) => { e.preventDefault(); formatText("insertUnorderedList"); }}
                  className={`px-3 py-1.5 rounded text-xs transition-colors ${
                    activeFormats.ul ? "bg-[#00ff88] text-slate-950 font-black" : "bg-slate-800 text-slate-200 hover:text-white"
                  }`}
                  title="Lista com Marcadores"
                >
                  • Lista
                </button>
                <button
                  type="button"
                  onMouseDown={(e) => { e.preventDefault(); formatText("insertOrderedList"); }}
                  className={`px-3 py-1.5 rounded text-xs transition-colors ${
                    activeFormats.ol ? "bg-[#00ff88] text-slate-950 font-black" : "bg-slate-800 text-slate-200 hover:text-white"
                  }`}
                  title="Lista Numerada"
                >
                  1. Lista
                </button>
                <span className="w-px h-6 bg-slate-800 my-auto"></span>
                <button
                  type="button"
                  onMouseDown={(e) => { e.preventDefault(); openImageModal("editor"); }}
                  className="px-3 py-1.5 rounded text-xs bg-slate-800 text-slate-200 hover:text-white"
                  title="Biblioteca de Imagens"
                >
                  🖼️ Imagem
                </button>
                <button
                  type="button"
                  onMouseDown={(e) => { e.preventDefault(); openLinkModal(); }}
                  className="px-3 py-1.5 rounded text-xs bg-slate-800 text-slate-200 hover:text-white"
                  title="Inserir Link"
                >
                  🔗 Link
                </button>
              </div>
            )}

            <div className="w-full">
              {editorMode === "visual" ? (
                <div
                  ref={editorRef}
                  contentEditable
                  onKeyDown={handleKeyDown}
                  onKeyUp={updateToolbarStates}
                  onMouseUp={updateToolbarStates}
                  onBlur={syncContentFromVisual}
                  className="w-full min-h-[400px] p-4 rounded-xl bg-slate-900 border border-slate-800 text-sm text-slate-200 focus:outline-none focus:border-[#00ff88] overflow-y-auto prose prose-invert max-w-none 
                    [&_h2]:text-2xl [&_h2]:font-extrabold [&_h2]:text-white [&_h2]:mt-8 [&_h2]:mb-4
                    [&_h3]:text-xl [&_h3]:font-bold [&_h3]:text-slate-200 [&_h3]:mt-6 [&_h3]:mb-3
                    [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:my-3
                    [&_ol]:list-decimal [&_ol]:pl-5 [&_ol]:my-3
                    [&_p]:leading-relaxed [&_p]:my-2.5"
                  style={{ whiteSpace: "pre-wrap" }}
                />
              ) : (
                <textarea
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  rows={20}
                  placeholder="Cole ou digite código HTML puro..."
                  className="w-full p-4 rounded-xl bg-slate-900 border border-slate-800 font-mono text-xs text-[#00ff88] focus:outline-none focus:border-[#00ff88]"
                />
              )}
            </div>
          </div>
        </div>

        {/* COLUNA DA DIREITA (SEO E CONFIGURAÇÃO DE AGENDA / VISIBILIDADE / DESTAQUE / CAPA) */}
        <div className="space-y-6">
          
          {/* SEÇÃO GERAL: STATUS E VISIBILIDADE */}
          <div className="p-6 rounded-3xl bg-[#101623]/90 border border-slate-800 space-y-4">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider border-b border-slate-800 pb-2">
              Status & Visibilidade
            </h3>

            {/* DESTAQUE PRINCIPAL DA TELA INICIAL */}
            <div className="flex items-center gap-2.5 bg-slate-950 p-3.5 rounded-xl border border-slate-850">
              <input
                type="checkbox"
                id="isFeatured"
                checked={isFeatured}
                onChange={(e) => setIsFeatured(e.target.checked)}
                className="w-4 h-4 rounded text-[#00ff88] focus:ring-[#00ff88] bg-slate-900 border-slate-800 cursor-pointer"
              />
              <label htmlFor="isFeatured" className="text-xs font-mono font-bold text-slate-200 cursor-pointer uppercase">
                ⭐ Destaque na Home Page
              </label>
            </div>

            {/* SELEÇÃO DA IMAGEM DE DESTAQUE DO CARD */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-xs font-mono font-bold text-slate-300 uppercase tracking-wider">
                  Imagem Destaque (Capa)
                </label>
                <span className="text-[9px] font-sans font-semibold text-cyan-400">
                  Recomendado: 1200x630 (16:9)
                </span>
              </div>
              {imageUrl ? (
                <div className="relative aspect-[16/9] rounded-xl overflow-hidden border border-slate-800 mb-2 bg-slate-900 group">
                  <img src={imageUrl} alt="Capa" className="w-full h-full object-cover" />
                  <button
                    type="button"
                    onClick={() => setImageUrl("")}
                    className="absolute top-2 right-2 bg-red-600 text-white rounded-full p-1 text-[10px] font-bold hover:bg-red-500"
                  >
                    ✕
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onMouseDown={(e) => { e.preventDefault(); openImageModal("destaque"); }}
                  className="w-full h-24 rounded-xl border border-dashed border-slate-800 hover:border-[#00ff88]/50 flex flex-col items-center justify-center gap-1.5 text-xs text-slate-400 hover:text-slate-200 transition-colors"
                >
                  <span>🖼️ Escolher Capa Destaque</span>
                </button>
              )}
            </div>

            {alreadyPublished ? (
              <div>
                <label className="block text-xs font-mono font-bold text-slate-300 uppercase tracking-wider mb-2">
                  Visibilidade do Artigo
                </label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value as "public" | "hidden")}
                  className="w-full h-10 px-4 text-xs font-bold text-white bg-slate-900 rounded-xl border border-slate-800 focus:outline-none focus:border-[#00ff88]"
                >
                  <option value="public">Público (Visível)</option>
                  <option value="hidden">Oculto (Rascunho)</option>
                </select>
                <span className="block mt-2 text-[10px] text-slate-400 leading-normal">
                  Este artigo já foi publicado. Você não pode mais agendá-lo, mas pode alterar sua visibilidade.
                </span>
              </div>
            ) : (
              <>
                <div>
                  <label className="block text-xs font-mono font-bold text-slate-300 uppercase tracking-wider mb-2">
                    Data de Agendamento
                  </label>
                  <input
                    type="datetime-local"
                    value={scheduledAt}
                    onChange={(e) => setScheduledAt(e.target.value)}
                    className="w-full h-10 px-4 text-xs font-medium text-white bg-slate-900 rounded-xl border border-slate-800 focus:outline-none focus:border-[#00ff88]"
                  />
                  <span className="block mt-1.5 text-[10px] text-slate-400 leading-normal">
                    Deixe em branco para publicar imediatamente ao salvar.
                  </span>
                </div>
                <div>
                  <label className="block text-xs font-mono font-bold text-slate-300 uppercase tracking-wider mb-2">
                    Visibilidade Padrão
                  </label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value as "public" | "hidden")}
                    className="w-full h-10 px-4 text-xs font-bold text-white bg-slate-900 rounded-xl border border-slate-800 focus:outline-none focus:border-[#00ff88]"
                  >
                    <option value="public">Público</option>
                    <option value="hidden">Oculto</option>
                  </select>
                </div>
              </>
            )}
          </div>

          {/* SEÇÃO SEO */}
          <div className="p-6 rounded-3xl bg-[#101623]/90 border border-slate-800 space-y-4">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider border-b border-slate-800 pb-2">
              Configuração de SEO
            </h3>

            <div>
              <label className="block text-xs font-mono font-bold text-slate-300 uppercase tracking-wider mb-2">
                URL Personalizada (Slug)
              </label>
              <input
                type="text"
                value={slug}
                onChange={(e) => {
                  setSlug(e.target.value);
                  setIsSlugEdited(true);
                }}
                placeholder="Ex: guia-como-evoluir-rapido"
                required
                className="w-full h-10 px-4 text-xs font-medium text-white bg-slate-900 rounded-xl border border-slate-800 focus:outline-none focus:border-[#00ff88]"
              />
            </div>

            <div>
              <label className="block text-xs font-mono font-bold text-slate-300 uppercase tracking-wider mb-2">
                Título SEO (Google)
              </label>
              <input
                type="text"
                value={seoTitle}
                onChange={(e) => setSeoTitle(e.target.value)}
                placeholder="Título que aparece nos resultados"
                className="w-full h-10 px-4 text-xs font-medium text-white bg-slate-900 rounded-xl border border-slate-800 focus:outline-none focus:border-[#00ff88]"
              />
            </div>

            <div>
              <label className="block text-xs font-mono font-bold text-slate-300 uppercase tracking-wider mb-2">
                Descrição SEO (Google)
              </label>
              <textarea
                value={seoDescription}
                onChange={(e) => setSeoDescription(e.target.value)}
                placeholder="Resumo do artigo para resultados de busca..."
                rows={3}
                className="w-full p-3 text-xs font-medium text-white bg-slate-900 rounded-xl border border-slate-800 focus:outline-none focus:border-[#00ff88] resize-none"
              />
            </div>

            <div>
              <label className="block text-xs font-mono font-bold text-slate-300 uppercase tracking-wider mb-2">
                Palavras-chave
              </label>
              <input
                type="text"
                value={seoKeywords}
                onChange={(e) => setSeoKeywords(e.target.value)}
                placeholder="guias, herois, last asylum"
                className="w-full h-10 px-4 text-xs font-medium text-white bg-slate-900 rounded-xl border border-slate-800 focus:outline-none focus:border-[#00ff88]"
              />
            </div>
          </div>

          {/* BOTÃO SALVAR */}
          <button
            type="submit"
            disabled={saveLoading}
            className="w-full h-12 rounded-xl bg-[#00ff88] text-slate-950 font-bold text-sm shadow-[0_0_20px_rgba(0,255,136,0.3)] hover:bg-[#15ff96] active:scale-98 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {saveLoading ? (
              <div className="w-5 h-5 border-2 border-slate-950 border-t-transparent rounded-full animate-spin"></div>
            ) : (
              <>
                <span>Publicar / Salvar Artigo</span>
                <span>✔</span>
              </>
            )}
          </button>
        </div>
      </form>

      {/* MODAL 1: BIBLIOTECA DE IMAGENS */}
      {showImageModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-2xl p-6 rounded-3xl bg-[#101623] border border-[#00ff88]/30 shadow-2xl relative flex flex-col h-[550px]">
            <h3 className="text-lg font-black text-white mb-2">Biblioteca de Mídias</h3>
            
            <div className="flex gap-2 border-b border-slate-800 pb-3 mb-4">
              {(["Uploads", "Heróis", "Banners"] as const).map((folder) => (
                <button
                  key={folder}
                  type="button"
                  onClick={() => setCurrentFolder(folder)}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                    currentFolder === folder ? "bg-[#00ff88] text-slate-950" : "bg-slate-900 text-slate-300"
                  }`}
                >
                  📁 {folder}
                </button>
              ))}
            </div>

            <div className="mb-4">
              <label className="cursor-pointer inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-[#00ff88] border border-slate-700">
                {uploadProgress ? (
                  <span>Enviando...</span>
                ) : (
                  <span>📤 Enviar Foto para Pasta</span>
                )}
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  disabled={uploadProgress}
                  className="hidden"
                />
              </label>
            </div>

            <div className="flex-1 overflow-y-auto grid grid-cols-3 sm:grid-cols-4 gap-3 p-1">
              {imageLibrary[currentFolder].length === 0 ? (
                <div className="col-span-full flex flex-col items-center justify-center text-slate-500 py-12">
                  <span>Pasta vazia.</span>
                </div>
              ) : (
                imageLibrary[currentFolder].map((url, i) => (
                  <div
                    key={i}
                    onClick={() => selectImage(url)}
                    className="aspect-square rounded-xl overflow-hidden border border-slate-800 hover:border-[#00ff88] cursor-pointer bg-slate-900 relative group transition-all"
                  >
                    <img
                      src={url}
                      alt="Thumbnail"
                      className="w-full h-full object-cover object-top"
                    />
                    
                    {currentFolder === "Uploads" && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteUploadImage(url);
                        }}
                        className="absolute top-1.5 right-1.5 z-30 bg-red-650/90 text-white rounded p-1.5 hover:bg-red-500 text-[10px] shadow"
                      >
                        🗑️
                      </button>
                    )}

                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center text-[10px] text-white font-bold transition-opacity">
                      Selecionar
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className="flex justify-end pt-4 border-t border-slate-800 mt-4">
              <button
                type="button"
                onClick={() => setShowImageModal(false)}
                className="px-5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs"
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 2: LINK */}
      {showLinkModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-md p-6 rounded-3xl bg-[#101623] border border-[#00ff88]/30 shadow-2xl relative">
            <h3 className="text-lg font-black text-white mb-2">Inserir Link</h3>
            
            <form onSubmit={selectLink} className="space-y-4">
              <div>
                <label className="block text-xs font-mono font-bold text-slate-300 uppercase tracking-wider mb-2">
                  Texto a exibir
                </label>
                <input
                  type="text"
                  value={linkText}
                  onChange={(e) => setLinkText(e.target.value)}
                  placeholder="Ex: Clique aqui"
                  className="w-full h-11 px-4 text-xs font-medium text-white bg-slate-900 rounded-xl border border-slate-800 focus:outline-none focus:border-[#00ff88]"
                />
              </div>

              <div>
                <label className="block text-xs font-mono font-bold text-slate-300 uppercase tracking-wider mb-2">
                  Endereço URL (Link)
                </label>
                <input
                  type="url"
                  value={linkUrl}
                  onChange={(e) => setLinkUrl(e.target.value)}
                  placeholder="https://exemplo.com"
                  required
                  className="w-full h-11 px-4 text-xs font-medium text-white bg-slate-900 rounded-xl border border-slate-800 focus:outline-none focus:border-[#00ff88]"
                />
              </div>

              <div className="flex items-center gap-2 pt-2">
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-[#00ff88] text-slate-950 font-bold text-xs hover:bg-[#15ff96] transition-colors"
                >
                  Inserir Link
                </button>
                <button
                  type="button"
                  onClick={() => setShowLinkModal(false)}
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
}
