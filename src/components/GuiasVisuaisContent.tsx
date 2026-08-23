"use client";

import { useState, useEffect } from "react";
import { isSupabaseConfigured } from "@/lib/supabase";

interface VisualGuide {
  id: string;
  title: string;
  description: string;
  image_url: string;
  webp_url?: string;
  created_at: string;
}

export default function GuiasVisuaisContent() {
  const [guides, setGuides] = useState<VisualGuide[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [previewGuide, setPreviewGuide] = useState<VisualGuide | null>(null);

  useEffect(() => {
    const fetchGuides = async () => {
      try {
        if (isSupabaseConfigured) {
          const { supabase } = await import("@/lib/supabase");
          const { data, error } = await supabase
            .from("visual_guides")
            .select("*")
            .order("created_at", { ascending: false });

          if (data) {
            setGuides(data);
          }
        }
      } catch (err) {
        console.error("Erro ao buscar guias visuais:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchGuides();
  }, []);

  const handleDownload = async (url: string, title: string) => {
    const filename = `${title.toLowerCase().replace(/[^a-z0-9]+/g, "-")}.png`;
    try {
      const response = await fetch(url);
      const blob = await response.blob();
      const blobUrl = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = blobUrl;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(blobUrl);
    } catch (err) {
      console.warn("Download bloqueado ou falhou. Abrindo na nova aba:", err);
      window.open(url, "_blank");
    }
  };

  // Filtragem por termo de busca
  const filteredGuides = guides.filter((item) => {
    if (!searchTerm.trim()) return true;
    const term = searchTerm.toLowerCase();
    return (
      item.title.toLowerCase().includes(term) ||
      item.description.toLowerCase().includes(term)
    );
  });

  return (
    <>
      {/* CABEÇALHO DA PÁGINA */}
      <div className="text-center max-w-3xl mx-auto mb-10">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-900/90 border border-cyan-500/30 text-xs font-semibold text-cyan-400 mb-4">
          <span>🖼️ Infográficos & Guias Rápidos</span>
        </div>
        <h1 className="text-3xl sm:text-5xl font-extrabold text-white drop-shadow-md">
          Guias <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-[#00ff88]">Visuais</span>
        </h1>
        <p className="mt-3 text-slate-300 drop-shadow-sm font-medium">
          Acesse e baixe nossos infográficos em alta qualidade para consultar tabelas e layouts de base offline.
        </p>
      </div>

      {/* CAMPO DE PESQUISA */}
      <div className="max-w-md mx-auto mb-10 relative">
        <input
          type="text"
          placeholder="Buscar infográficos ou tabelas..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full px-4 py-3 pl-11 rounded-2xl bg-slate-900/90 border border-slate-800 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 transition-all shadow-inner"
        />
        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 text-sm pointer-events-none">
          🔍
        </span>
        {searchTerm && (
          <button
            onClick={() => setSearchTerm("")}
            className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-white"
          >
            ✕
          </button>
        )}
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-pulse">
          <div className="h-64 rounded-2xl bg-slate-900/50 border border-slate-800" />
          <div className="h-64 rounded-2xl bg-slate-900/50 border border-slate-800" />
          <div className="h-64 rounded-2xl bg-slate-900/50 border border-slate-800" />
        </div>
      ) : filteredGuides.length === 0 ? (
        <div className="bg-[#101623]/95 border border-slate-800 rounded-3xl p-8 backdrop-blur-xl text-center space-y-4 shadow-2xl">
          <span className="text-4xl block">🖼️</span>
          <h3 className="text-xl font-bold text-white">
            {searchTerm ? "Nenhum guia visual encontrado" : "Nenhum guia visual"}
          </h3>
          <p className="text-sm text-slate-400 max-w-md mx-auto">
            {searchTerm
              ? `Não encontramos infográficos correspondentes a "${searchTerm}". Tente outros termos.`
              : "Novos infográficos de estratégias estão sendo desenvolvidos e serão postados aqui."}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 items-stretch justify-center">
          {filteredGuides.map((item) => {
            const previewImageUrl = item.webp_url || (
              item.image_url.includes("cloudinary.com")
                ? item.image_url.replace("/image/upload/", "/image/upload/f_webp,q_auto/").replace(/\.[^/.]+$/, ".webp")
                : item.image_url
            );

            return (
              <div
                key={item.id}
                className="group flex flex-col justify-between rounded-3xl bg-[#101623]/80 border border-slate-800 hover:border-cyan-500/30 transition-all duration-300 shadow-xl backdrop-blur-md overflow-hidden"
              >
                {/* Thumbnail Container Quadrado com enquadramento ajustado (object-contain) e hover dinâmico */}
                <div className="aspect-square w-full relative overflow-hidden bg-slate-950/60 flex items-center justify-center border-b border-slate-850 p-3 group/thumb">
                  <img
                    src={previewImageUrl}
                    alt={item.title}
                    className="max-w-full max-h-full object-contain group-hover/thumb:scale-[1.02] transition-transform duration-500"
                  />
                  {/* Overlay de hover com botão de pré-visualização */}
                  <div className="absolute inset-0 bg-slate-950/70 opacity-0 group-hover/thumb:opacity-100 transition-opacity duration-300 flex flex-col items-center justify-center gap-2 p-4">
                    <button
                      onClick={() => setPreviewGuide(item)}
                      className="px-4 py-2.5 rounded-xl bg-[#00ff88] hover:bg-[#15ff96] text-slate-950 font-black text-xs shadow-lg transform translate-y-2 group-hover/thumb:translate-y-0 transition-all duration-300"
                    >
                      👁️ Pré-visualizar
                    </button>
                    <span className="text-[9px] font-mono text-slate-400">Clique para abrir a galeria</span>
                  </div>
                </div>

                {/* Corpo */}
                <div className="p-6 flex flex-col justify-between flex-1">
                  <div className="space-y-2 mb-6">
                    <h3 className="text-lg font-bold text-white group-hover:text-cyan-400 transition-colors leading-snug">
                      {item.title}
                    </h3>
                    <p className="text-xs sm:text-sm text-slate-400 leading-relaxed line-clamp-3">
                      {item.description || "Sem descrição disponível."}
                    </p>
                  </div>

                  <div className="pt-4 border-t border-slate-800/80">
                    <button
                      onClick={() => handleDownload(item.image_url, item.title)}
                      className="w-full flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-cyan-500/10 hover:bg-cyan-400 text-cyan-400 hover:text-slate-950 border border-cyan-500/20 font-bold text-xs transition-all"
                    >
                      <span>📥</span>
                      <span>Baixar Original (Alta Resolução)</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* JANELA DE PRÉ-VISUALIZAÇÃO / LIGHTBOX MODAL */}
      {previewGuide && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-in fade-in duration-200">
          <div className="bg-[#101623] border border-slate-800 rounded-3xl max-w-6xl w-full max-h-[92vh] overflow-y-auto flex flex-col md:flex-row shadow-2xl relative">
            {/* Botão Fechar no Topo */}
            <button
              onClick={() => setPreviewGuide(null)}
              className="absolute top-4 right-4 z-20 w-8 h-8 rounded-full bg-slate-900 hover:bg-slate-800 border border-slate-800 flex items-center justify-center text-slate-400 hover:text-white text-xs font-bold transition-all"
            >
              ✕
            </button>

            {/* Coluna Esquerda: Imagem Centralizada Ampliada (2/3 da largura) */}
            <div className="md:w-2/3 p-6 bg-slate-950/40 flex items-center justify-center border-b md:border-b-0 md:border-r border-slate-850 aspect-square md:aspect-auto md:min-h-[500px]">
              <img
                src={previewGuide.webp_url || previewGuide.image_url}
                alt={previewGuide.title}
                className="max-w-full max-h-[80vh] object-contain rounded-xl shadow-xl"
              />
            </div>

            {/* Coluna Direita: Informações & Download (1/3 da largura) */}
            <div className="md:w-1/3 p-8 flex flex-col justify-between">
              <div className="space-y-4">
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-[#00ff88]/10 text-[#00ff88] text-[9px] font-mono font-bold uppercase tracking-wider border border-[#00ff88]/20">
                  ⚡ Visualização Rápida
                </span>
                <h3 className="text-2xl font-black text-white leading-tight">
                  {previewGuide.title}
                </h3>
                <p className="text-xs sm:text-sm text-slate-400 leading-relaxed max-h-[200px] overflow-y-auto pr-2">
                  {previewGuide.description || "Sem descrição adicional disponível para este guia visual."}
                </p>
              </div>

              <div className="pt-6 border-t border-slate-800/80 mt-6 space-y-2">
                <button
                  onClick={() => handleDownload(previewGuide.image_url, previewGuide.title)}
                  className="w-full flex items-center justify-center gap-2 px-5 py-4 rounded-xl bg-cyan-400 hover:bg-cyan-300 text-slate-950 font-black text-xs shadow-lg shadow-cyan-500/10 transition-all duration-200"
                >
                  <span>📥</span>
                  <span>Baixar Guia em Alta Resolução (Original)</span>
                </button>
                <button
                  onClick={() => setPreviewGuide(null)}
                  className="w-full py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-xs font-bold text-slate-400 hover:text-slate-300 border border-slate-800 transition-all"
                >
                  Fechar Janela
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
