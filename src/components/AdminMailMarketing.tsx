"use client";

import { useState, useEffect } from "react";
import { UserSession } from "@/lib/auth";
import { isSupabaseConfigured } from "@/lib/supabase";
import { compressImageToWebp } from "@/lib/imageCompression";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import LinkExtension from "@tiptap/extension-link";
import ImageExtension from "@tiptap/extension-image";
import Underline from "@tiptap/extension-underline";
import { MailMarketingType } from "@/lib/mailMarketing/types";

interface AdminMailMarketingProps {
  session: UserSession;
}

// Formatador simples para deixar o HTML legível
const formatHTMLCode = (html: string) => {
  let formatted = "";
  const reg = /(>)(<)(\/*)/g;
  const cleanHtml = html.replace(reg, "$1\r\n$2$3");
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

export default function AdminMailMarketing({ session }: AdminMailMarketingProps) {
  // Configuração do formulário de e-mail
  const [selectedType, setSelectedType] = useState<MailMarketingType>("promocional");
  const [subject, setSubject] = useState("");
  const [title, setTitle] = useState("");
  const [summary, setSummary] = useState("");
  const [content, setContent] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [buttonText, setButtonText] = useState("");
  const [buttonUrl, setButtonUrl] = useState("");
  const [testEmailAddress, setTestEmailAddress] = useState(session?.email || "fernandoandradesouto@hotmail.com");

  // Estados de envio e feedback
  const [loading, setLoading] = useState(false);
  const [testLoading, setTestLoading] = useState(false);
  const [statusFeedback, setStatusFeedback] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [audienceCount, setAudienceCount] = useState<number | null>(null);

  // Modo do Editor TipTap
  const [editorMode, setEditorMode] = useState<"visual" | "html">("visual");

  // Modais de Imagem e Link
  const [showLinkModal, setShowLinkModal] = useState(false);
  const [linkText, setLinkText] = useState("");
  const [linkUrl, setLinkUrl] = useState("");
  const [showImageModal, setShowImageModal] = useState(false);
  const [imageTarget, setImageTarget] = useState<"editor" | "destaque">("editor");

  const [imageLibrary, setImageLibrary] = useState<Record<string, string[]>>({
    Banners: [
      "/images/village_banner_2.png",
      "https://lastasylumplague.com/wp-content/uploads/2026/04/nicole-full-image-300x266.webp"
    ],
    Uploads: []
  });
  const [uploadProgress, setUploadProgress] = useState(false);

  // Cloudinary credentials
  const cloudinaryCloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || "";
  const cloudinaryUploadPreset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET || "";

  // TipTap Editor
  const editor = useEditor({
    extensions: [
      StarterKit,
      Underline,
      LinkExtension.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: "text-[#00ff88] underline font-bold hover:text-[#15ff96]",
          target: "_blank",
          rel: "noopener noreferrer",
        },
      }),
      ImageExtension.configure({
        HTMLAttributes: {
          class: "my-4 rounded-2xl max-w-full block mx-auto shadow-lg",
        },
      }),
    ],
    content: "<p>Digite aqui o conteúdo do seu e-mail...</p>",
    editorProps: {
      attributes: {
        class: "w-full min-h-[320px] p-4 rounded-xl bg-slate-900 border border-slate-800 text-sm text-slate-200 focus:outline-none focus:border-[#00ff88] overflow-y-auto prose prose-invert max-w-none focus:ring-0",
      },
    },
    onUpdate: ({ editor }) => {
      setContent(editor.getHTML());
    },
  });

  // Carrega uploads salvos
  const loadMediaAssets = async () => {
    try {
      if (isSupabaseConfigured) {
        const { supabase } = await import("@/lib/supabase");
        const { data } = await supabase
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

  // Calcula a audiência estimada para a categoria selecionada
  const fetchAudienceCount = async () => {
    try {
      if (isSupabaseConfigured) {
        const { supabase } = await import("@/lib/supabase");
        let query = supabase.from("profiles").select("id", { count: "exact", head: true });
        
        switch (selectedType) {
          case "noticia":
            query = query.neq("receive_noticias", false);
            break;
          case "artigo":
            query = query.neq("receive_guias", false);
            break;
          case "codigo":
            query = query.neq("receive_codigos", false);
            break;
          case "promocional":
            query = query.neq("receive_promocionais", false);
            break;
        }

        const { count, error } = await query;
        if (!error && count !== null) {
          setAudienceCount(count);
        }
      } else {
        const stored = localStorage.getItem("local_profiles");
        if (stored) {
          const list = JSON.parse(stored);
          setAudienceCount(list.length);
        } else {
          setAudienceCount(1);
        }
      }
    } catch {
      setAudienceCount(null);
    }
  };

  useEffect(() => {
    loadMediaAssets();
  }, []);

  useEffect(() => {
    fetchAudienceCount();
  }, [selectedType]);

  // Upload de Imagem
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!cloudinaryCloudName || !cloudinaryUploadPreset) {
      alert("Configurações do Cloudinary não encontradas no .env.local!");
      return;
    }

    setUploadProgress(true);
    try {
      const optimizedFile = await compressImageToWebp(file, 1200, 1200, 0.8);
      const formData = new FormData();
      formData.append("file", optimizedFile);
      formData.append("upload_preset", cloudinaryUploadPreset);

      const res = await fetch(`https://api.cloudinary.com/v1_1/${cloudinaryCloudName}/image/upload`, {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      const uploadedUrl = data.secure_url;

      if (isSupabaseConfigured) {
        const { supabase } = await import("@/lib/supabase");
        await supabase.from("media_assets").insert([{ url: uploadedUrl }]);
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

  const selectImage = (url: string) => {
    if (imageTarget === "destaque") {
      setImageUrl(url);
    } else {
      editor?.chain().focus().setImage({ src: url, alt: "Imagem do e-mail" }).run();
    }
    setShowImageModal(false);
  };

  const openLinkModal = () => {
    if (editor) {
      const { from, to } = editor.state.selection;
      const selText = editor.state.doc.textBetween(from, to, " ");
      setLinkText(selText);
    }
    setLinkUrl("");
    setShowLinkModal(true);
  };

  const selectLink = (e: React.FormEvent) => {
    e.preventDefault();
    if (linkUrl && editor) {
      editor.chain().focus().insertContent(`<a href="${linkUrl}" target="_blank" rel="noopener noreferrer" class="text-[#00ff88] underline font-bold hover:text-[#15ff96]">${linkText || linkUrl}</a>`).run();
    }
    setShowLinkModal(false);
  };

  // Envia e-mail de TESTE para o endereço do admin
  const handleSendTest = async () => {
    if (!testEmailAddress || !testEmailAddress.includes("@")) {
      alert("Informe um endereço de e-mail de teste válido.");
      return;
    }
    if (!title) {
      alert("Por favor, preencha o título da mensagem antes de testar.");
      return;
    }

    setTestLoading(true);
    setStatusFeedback(null);

    const finalContent = editorMode === "visual" && editor ? editor.getHTML() : content;
    const currentOrigin = typeof window !== "undefined" ? window.location.origin : undefined;

    try {
      const res = await fetch("/api/mail-marketing/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: selectedType,
          data: {
            subject: subject || `[TESTE] ${title}`,
            title: title,
            summary: summary,
            content: finalContent,
            imageUrl: imageUrl,
            buttonText: buttonText || undefined,
            buttonUrl: buttonUrl || undefined,
            slug: "comunicado-teste",
            code: "TESTCODE2026",
            rewards: "1.000x Diamantes (Exemplo de Teste)",
            authorName: session?.firstName || "Administração Last Asylum",
          },
          testRecipient: testEmailAddress,
          siteUrl: currentOrigin,
        }),
      });

      const data = await res.json();
      if (!res.ok || data.error) {
        setStatusFeedback({ type: "error", text: data.error || "Falha no envio do teste." });
      } else {
        setStatusFeedback({
          type: "success",
          text: `E-mail de teste enviado com sucesso para ${testEmailAddress}! Verifique sua caixa de entrada e spam.`,
        });
      }
    } catch {
      setStatusFeedback({ type: "error", text: "Erro ao comunicar com a API de e-mail." });
    } finally {
      setTestLoading(false);
    }
  };

  // Disparo definitivo em massa para a categoria selecionada
  const handleMassSend = async () => {
    if (!title) {
      alert("O título do e-mail é obrigatório.");
      return;
    }

    setLoading(true);
    setShowConfirmModal(false);
    setStatusFeedback(null);

    const finalContent = editorMode === "visual" && editor ? editor.getHTML() : content;
    const currentOrigin = typeof window !== "undefined" ? window.location.origin : undefined;

    try {
      const res = await fetch("/api/mail-marketing/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: selectedType,
          data: {
            subject: subject || title,
            title: title,
            summary: summary,
            content: finalContent,
            imageUrl: imageUrl,
            buttonText: buttonText || undefined,
            buttonUrl: buttonUrl || undefined,
            slug: "comunicado-oficial",
            code: "PRESENTEDODIA",
            rewards: "Recompensas especiais",
            authorName: session?.firstName || "Last Asylum BR",
          },
          siteUrl: currentOrigin,
        }),
      });

      const data = await res.json();
      if (!res.ok || data.error) {
        setStatusFeedback({ type: "error", text: data.error || "Falha no disparo em massa." });
      } else {
        setStatusFeedback({
          type: "success",
          text: data.message || `Disparo concluído para ${data.recipientCount || 0} inscritos ativos!`,
        });
      }
    } catch {
      setStatusFeedback({ type: "error", text: "Erro na requisição de envio em massa." });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* CABEÇALHO DO MÓDULO */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 rounded-3xl bg-[#101623]/90 border border-slate-800">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#00ff88]/10 border border-[#00ff88]/30 text-xs font-semibold text-[#00ff88] mb-2">
            <span>✉️ Central de Mail Marketing</span>
          </div>
          <h2 className="text-2xl font-extrabold text-white">Disparo de E-mails & Campanhas</h2>
          <p className="text-xs text-slate-400 mt-1">
            Redija mensagens formatadas com TipTap, teste envios e dispare comunicados respeitando o opt-in de cada usuário.
          </p>
        </div>

        {audienceCount !== null && (
          <div className="px-4 py-3 rounded-2xl bg-slate-900 border border-slate-800 text-right">
            <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block">
              Público Opt-in Estimado
            </span>
            <span className="text-xl font-black text-[#00ff88]">{audienceCount} Usuários</span>
          </div>
        )}
      </div>

      {/* FEEDBACK DE STATUS */}
      {statusFeedback && (
        <div
          className={`p-4 rounded-2xl text-xs font-semibold flex items-center gap-3 border ${
            statusFeedback.type === "success"
              ? "bg-[#00ff88]/10 border-[#00ff88]/30 text-[#00ff88]"
              : "bg-red-500/10 border-red-500/30 text-red-400"
          }`}
        >
          <span>{statusFeedback.type === "success" ? "✅" : "⚠️"}</span>
          <span>{statusFeedback.text}</span>
        </div>
      )}

      {/* FORMULÁRIO PRINCIPAL */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* COLUNA ESQUERDA: EDITOR E CONTEÚDO */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* CONFIGURAÇÃO DO ASSUNTO E TÍTULO */}
          <div className="p-6 rounded-3xl bg-[#101623]/90 border border-slate-800 space-y-4">
            
            {/* SELEÇÃO DA FINALIDADE / CATEGORIA */}
            <div>
              <label className="block text-xs font-mono font-bold text-slate-300 uppercase tracking-wider mb-2">
                Finalidade / Categoria do Envio (Opt-In Obrigatório)
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {[
                  { id: "promocional", label: "🔥 Promocional", desc: "receive_promocionais" },
                  { id: "noticia", label: "📰 Notícia", desc: "receive_noticias" },
                  { id: "artigo", label: "📖 Guia/Artigo", desc: "receive_guias" },
                  { id: "codigo", label: "🎁 Gift Code", desc: "receive_codigos" },
                ].map((cat) => (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setSelectedType(cat.id as MailMarketingType)}
                    className={`p-3 rounded-xl border text-left transition-all ${
                      selectedType === cat.id
                        ? "bg-[#00ff88]/10 border-[#00ff88] text-white shadow-[0_0_10px_rgba(0,255,136,0.2)]"
                        : "bg-slate-900/60 border-slate-800 text-slate-400 hover:border-slate-700"
                    }`}
                  >
                    <span className="text-xs font-bold block">{cat.label}</span>
                    <span className="text-[9px] font-mono text-slate-500 block mt-0.5">{cat.desc}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* ASSUNTO DO E-MAIL */}
            <div>
              <label className="block text-xs font-mono font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                Assunto do E-mail (Subject da Caixa de Entrada)
              </label>
              <input
                type="text"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="Ex: 🔥 Evento Especial de Sobrevivência na Vila do Last Asylum!"
                className="w-full h-11 px-4 text-xs sm:text-sm font-medium text-white bg-slate-900 rounded-xl border border-slate-800 focus:outline-none focus:border-[#00ff88]"
              />
            </div>

            {/* TÍTULO PRINCIPAL DO CORPO */}
            <div>
              <label className="block text-xs font-mono font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                Título Principal do E-mail
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Ex: Novidades Exclusivas para Sobreviventes"
                required
                className="w-full h-11 px-4 text-xs sm:text-sm font-medium text-white bg-slate-900 rounded-xl border border-slate-800 focus:outline-none focus:border-[#00ff88]"
              />
            </div>

            {/* RESUMO / PREHEADER */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-mono font-bold text-slate-300 uppercase tracking-wider">
                  Prévia de Texto (Preheader)
                </label>
                <span className="text-[10px] font-mono text-slate-500">
                  {summary.length}/140 caracteres
                </span>
              </div>
              <input
                type="text"
                value={summary}
                onChange={(e) => setSummary(e.target.value.slice(0, 140))}
                placeholder="Breve texto que aparece abaixo do assunto na caixa de entrada..."
                className="w-full h-10 px-4 text-xs font-medium text-white bg-slate-900 rounded-xl border border-slate-800 focus:outline-none focus:border-[#00ff88]"
              />
            </div>

          </div>

          {/* EDITOR TIPTAP */}
          <div className="p-6 rounded-3xl bg-[#101623]/90 border border-slate-800 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <span className="text-xs font-mono font-bold text-slate-400 uppercase">
                Corpo da Mensagem (Rich Text)
              </span>

              <div className="flex items-center gap-1.5 bg-slate-900 p-1 rounded-xl border border-slate-800">
                <button
                  type="button"
                  onClick={() => {
                    if (editor) {
                      editor.commands.setContent(content);
                    }
                    setEditorMode("visual");
                  }}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    editorMode === "visual" ? "bg-slate-800 text-[#00ff88]" : "text-slate-400"
                  }`}
                >
                  Escrita
                </button>
                <button
                  type="button"
                  onClick={() => {
                    if (editorMode === "visual") {
                      const htmlContent = editor?.getHTML() || "";
                      setContent(formatHTMLCode(htmlContent));
                    }
                    setEditorMode("html");
                  }}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    editorMode === "html" ? "bg-slate-800 text-[#00ff88]" : "text-slate-400"
                  }`}
                >
                  Código HTML
                </button>
              </div>
            </div>

            {/* TOOLBAR */}
            {editorMode === "visual" ? (
              <div className="flex flex-wrap gap-1 bg-slate-900 p-2 rounded-xl border border-slate-800">
                <button
                  type="button"
                  onMouseDown={(e) => { e.preventDefault(); editor?.chain().focus().toggleBold().run(); }}
                  className={`px-3 py-1.5 rounded text-xs font-bold transition-colors ${
                    editor?.isActive("bold") ? "bg-[#00ff88] text-slate-950 font-black" : "bg-slate-800 text-slate-200 hover:text-white"
                  }`}
                  title="Negrito"
                >
                  B
                </button>
                <button
                  type="button"
                  onMouseDown={(e) => { e.preventDefault(); editor?.chain().focus().toggleItalic().run(); }}
                  className={`px-3 py-1.5 rounded text-xs italic transition-colors ${
                    editor?.isActive("italic") ? "bg-[#00ff88] text-slate-950 font-black" : "bg-slate-800 text-slate-200 hover:text-white"
                  }`}
                  title="Itálico"
                >
                  I
                </button>
                <button
                  type="button"
                  onMouseDown={(e) => { e.preventDefault(); editor?.chain().focus().toggleUnderline().run(); }}
                  className={`px-3 py-1.5 rounded text-xs underline transition-colors ${
                    editor?.isActive("underline") ? "bg-[#00ff88] text-slate-950 font-black" : "bg-slate-800 text-slate-200 hover:text-white"
                  }`}
                  title="Sublinhado"
                >
                  U
                </button>
                <span className="w-px h-6 bg-slate-800 my-auto"></span>
                <button
                  type="button"
                  onMouseDown={(e) => { e.preventDefault(); editor?.chain().focus().toggleHeading({ level: 2 }).run(); }}
                  className={`px-3 py-1.5 rounded text-xs font-mono transition-colors ${
                    editor?.isActive("heading", { level: 2 }) ? "bg-[#00ff88] text-slate-950 font-black" : "bg-slate-800 text-slate-200 hover:text-white"
                  }`}
                  title="Título H2"
                >
                  H2
                </button>
                <button
                  type="button"
                  onMouseDown={(e) => { e.preventDefault(); editor?.chain().focus().toggleHeading({ level: 3 }).run(); }}
                  className={`px-3 py-1.5 rounded text-xs font-mono transition-colors ${
                    editor?.isActive("heading", { level: 3 }) ? "bg-[#00ff88] text-slate-950 font-black" : "bg-slate-800 text-slate-200 hover:text-white"
                  }`}
                  title="Título H3"
                >
                  H3
                </button>
                <span className="w-px h-6 bg-slate-800 my-auto"></span>
                <button
                  type="button"
                  onMouseDown={(e) => { e.preventDefault(); editor?.chain().focus().toggleBulletList().run(); }}
                  className={`px-3 py-1.5 rounded text-xs transition-colors ${
                    editor?.isActive("bulletList") ? "bg-[#00ff88] text-slate-950 font-black" : "bg-slate-800 text-slate-200 hover:text-white"
                  }`}
                  title="Lista com Marcadores"
                >
                  • Lista
                </button>
                <button
                  type="button"
                  onMouseDown={(e) => { e.preventDefault(); editor?.chain().focus().toggleOrderedList().run(); }}
                  className={`px-3 py-1.5 rounded text-xs transition-colors ${
                    editor?.isActive("orderedList") ? "bg-[#00ff88] text-slate-950 font-black" : "bg-slate-800 text-slate-200 hover:text-white"
                  }`}
                  title="Lista Numerada"
                >
                  1. Lista
                </button>
                <span className="w-px h-6 bg-slate-800 my-auto"></span>
                <button
                  type="button"
                  onMouseDown={(e) => { e.preventDefault(); setImageTarget("editor"); setShowImageModal(true); }}
                  className="px-3 py-1.5 rounded text-xs bg-slate-800 text-slate-200 hover:text-white"
                  title="Inserir Imagem"
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
            ) : (
              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={() => setContent((prev) => formatHTMLCode(prev))}
                  className="px-3 py-1.5 rounded bg-slate-800 text-slate-200 hover:text-[#00ff88] text-xs font-bold transition-colors"
                >
                  🧹 Auto Formatar HTML
                </button>
              </div>
            )}

            <div className="w-full">
              {editorMode === "visual" ? (
                <EditorContent editor={editor} />
              ) : (
                <textarea
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  rows={16}
                  placeholder="Cole ou digite código HTML puro..."
                  className="w-full p-4 rounded-xl bg-slate-900 border border-slate-800 font-mono text-xs text-[#00ff88] focus:outline-none focus:border-[#00ff88]"
                />
              )}
            </div>
          </div>

        </div>

        {/* COLUNA DIREITA: IMAGEM DE CAPA, CTA E CONTROLES DE ENVIO */}
        <div className="space-y-6">
          
          {/* IMAGEM DE CAPA / DESTAQUE */}
          <div className="p-6 rounded-3xl bg-[#101623]/90 border border-slate-800 space-y-4">
            <h3 className="text-xs font-mono font-bold text-slate-400 uppercase">
              Imagem de Capa (Opcional)
            </h3>

            {imageUrl ? (
              <div className="space-y-2">
                <div className="relative w-full h-36 rounded-xl overflow-hidden border border-slate-800 bg-slate-950">
                  <img src={imageUrl} alt="Capa" className="w-full h-full object-cover" />
                </div>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => { setImageTarget("destaque"); setShowImageModal(true); }}
                    className="flex-1 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-bold text-slate-300"
                  >
                    Alterar
                  </button>
                  <button
                    type="button"
                    onClick={() => setImageUrl("")}
                    className="px-3 py-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 text-xs font-bold"
                  >
                    Remover
                  </button>
                </div>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => { setImageTarget("destaque"); setShowImageModal(true); }}
                className="w-full py-6 rounded-2xl border-2 border-dashed border-slate-800 hover:border-[#00ff88] bg-slate-900/50 text-xs font-bold text-slate-400 hover:text-white transition-all flex flex-col items-center gap-2"
              >
                <span>🖼️ Selecionar Imagem de Destaque</span>
              </button>
            )}
          </div>

          {/* BOTÃO DE AÇÃO / CTA (OPCIONAL) */}
          <div className="p-6 rounded-3xl bg-[#101623]/90 border border-slate-800 space-y-4">
            <h3 className="text-xs font-mono font-bold text-slate-400 uppercase">
              Botão de Ação / Link CTA (Opcional)
            </h3>

            <div>
              <label className="block text-[10px] font-mono text-slate-400 uppercase mb-1">
                Texto do Botão
              </label>
              <input
                type="text"
                value={buttonText}
                onChange={(e) => setButtonText(e.target.value)}
                placeholder="Ex: Acessar Portal &rarr;"
                className="w-full h-9 px-3 text-xs text-white bg-slate-900 rounded-xl border border-slate-800 focus:outline-none focus:border-[#00ff88]"
              />
            </div>

            <div>
              <label className="block text-[10px] font-mono text-slate-400 uppercase mb-1">
                URL de Destino
              </label>
              <input
                type="url"
                value={buttonUrl}
                onChange={(e) => setButtonUrl(e.target.value)}
                placeholder="Ex: https://lastasylumbr.com.br/noticias"
                className="w-full h-9 px-3 text-xs text-white bg-slate-900 rounded-xl border border-slate-800 focus:outline-none focus:border-[#00ff88]"
              />
            </div>
          </div>

          {/* PAINEL DE DISPARO & TESTE */}
          <div className="p-6 rounded-3xl bg-[#101623]/90 border border-slate-800 space-y-4">
            <h3 className="text-xs font-mono font-bold text-[#00ff88] uppercase tracking-wider">
              🚀 Ações de Envio
            </h3>

            {/* SEÇÃO DE TESTE INDIVIDUAL */}
            <div className="p-3 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-2">
              <label className="block text-[10px] font-mono font-bold text-slate-400 uppercase">
                Enviar Teste para:
              </label>
              <input
                type="email"
                value={testEmailAddress}
                onChange={(e) => setTestEmailAddress(e.target.value)}
                placeholder="seu-email@dominio.com"
                className="w-full h-9 px-3 text-xs text-white bg-slate-950 rounded-xl border border-slate-800 focus:outline-none focus:border-[#00ff88]"
              />
              <button
                type="button"
                onClick={handleSendTest}
                disabled={testLoading || loading}
                className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-slate-200 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {testLoading ? (
                  <div className="w-4 h-4 border-2 border-[#00ff88] border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <span>✉️ Enviar E-mail de Teste</span>
                )}
              </button>
            </div>

            {/* BOTÃO PRINCIPAL DE DISPARO */}
            <button
              type="button"
              onClick={() => setShowConfirmModal(true)}
              disabled={loading || testLoading}
              className="w-full py-3.5 rounded-2xl bg-[#00ff88] text-slate-950 font-extrabold text-xs shadow-[0_0_20px_rgba(0,255,136,0.3)] hover:bg-[#15ff96] active:scale-98 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-slate-950 border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <span>🚀 Disparar para Todos os Inscritos ({audienceCount ?? "..."})</span>
              )}
            </button>
          </div>

        </div>

      </div>

      {/* MODAL DE CONFIRMAÇÃO DO DISPARO EM MASSA */}
      {showConfirmModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="max-w-md w-full p-6 rounded-3xl bg-[#101623] border border-red-500/40 shadow-2xl space-y-4">
            <div className="flex items-center gap-3 text-red-400">
              <span className="text-2xl">⚠️</span>
              <h3 className="text-lg font-bold text-white">Confirmar Disparo em Massa</h3>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              Você está prestes a enviar este e-mail para todos os usuários que mantêm a preferência <strong>{selectedType.toUpperCase()}</strong> ativa no banco de dados.
            </p>

            <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 text-xs font-mono text-slate-400 space-y-1">
              <div><strong>Assunto:</strong> {subject || title}</div>
              <div><strong>Categoria:</strong> {selectedType}</div>
              <div><strong>Público Estimado:</strong> {audienceCount} usuário(s)</div>
            </div>

            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowConfirmModal(false)}
                className="flex-1 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleMassSend}
                className="flex-1 py-2.5 rounded-xl bg-red-500 hover:bg-red-600 text-white font-bold text-xs shadow-[0_0_15px_rgba(239,68,68,0.4)]"
              >
                Confirmar e Enviar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL DE LINK */}
      {showLinkModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <form onSubmit={selectLink} className="max-w-md w-full p-6 rounded-3xl bg-[#101623] border border-slate-800 space-y-4">
            <h3 className="text-base font-bold text-white">Inserir Link</h3>
            <div>
              <label className="block text-xs font-mono text-slate-400 mb-1">Texto de Exibição</label>
              <input
                type="text"
                value={linkText}
                onChange={(e) => setLinkText(e.target.value)}
                className="w-full h-10 px-3 text-xs text-white bg-slate-900 rounded-xl border border-slate-800 focus:outline-none focus:border-[#00ff88]"
              />
            </div>
            <div>
              <label className="block text-xs font-mono text-slate-400 mb-1">URL (Destino)</label>
              <input
                type="url"
                value={linkUrl}
                onChange={(e) => setLinkUrl(e.target.value)}
                placeholder="https://..."
                required
                className="w-full h-10 px-3 text-xs text-white bg-slate-900 rounded-xl border border-slate-800 focus:outline-none focus:border-[#00ff88]"
              />
            </div>
            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowLinkModal(false)}
                className="flex-1 py-2 rounded-xl bg-slate-800 text-slate-300 font-bold text-xs"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="flex-1 py-2 rounded-xl bg-[#00ff88] text-slate-950 font-bold text-xs"
              >
                Inserir
              </button>
            </div>
          </form>
        </div>
      )}

      {/* MODAL DE IMAGENS */}
      {showImageModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="max-w-2xl w-full p-6 rounded-3xl bg-[#101623] border border-slate-800 space-y-4 max-h-[85vh] flex flex-col">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <h3 className="text-base font-bold text-white">Biblioteca de Imagens</h3>
              <button
                type="button"
                onClick={() => setShowImageModal(false)}
                className="text-slate-400 hover:text-white text-xs font-bold"
              >
                ✕ Fechar
              </button>
            </div>

            {/* UPLOAD DIRETO */}
            <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-white block">Fazer Upload de Nova Imagem</span>
                <span className="text-[10px] text-slate-400 block">Comprime para WebP automaticamente.</span>
              </div>
              <label className="px-4 py-2 rounded-xl bg-[#00ff88] text-slate-950 font-bold text-xs cursor-pointer hover:bg-[#15ff96] transition-colors">
                {uploadProgress ? "Enviando..." : "+ Enviar Imagem"}
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  disabled={uploadProgress}
                  className="hidden"
                />
              </label>
            </div>

            {/* LISTAGEM DE IMAGENS */}
            <div className="flex-1 overflow-y-auto grid grid-cols-2 sm:grid-cols-3 gap-3 p-1">
              {Object.values(imageLibrary).flat().map((url, idx) => (
                <div
                  key={idx}
                  onClick={() => selectImage(url)}
                  className="group relative h-28 rounded-xl overflow-hidden border border-slate-800 bg-slate-950 cursor-pointer hover:border-[#00ff88] transition-all"
                >
                  <img src={url} alt="Galeria" className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                    <span className="text-[10px] font-bold text-[#00ff88] bg-slate-950/80 px-2 py-1 rounded-md">
                      Selecionar
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
