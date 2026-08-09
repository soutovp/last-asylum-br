"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";

interface VisualGuide {
  id: string;
  title: string;
  description: string;
  image_url: string;
  webp_url?: string;
  created_at: string;
}

export default function AdminVisualGuides() {
  const [guides, setGuides] = useState<VisualGuide[]>([]);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [uploading, setUploading] = useState(false);

  // Form fields
  const [editId, setEditId] = useState<string | null>(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [imageUrl, setImageUrl] = useState(""); // Imagem original
  const [webpUrl, setWebpUrl] = useState("");   // Imagem otimizada (webp) gerada pelo sistema

  const cloudinaryCloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || "dprnbe247";
  const cloudinaryUploadPreset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET || "ml_default";

  const fetchGuides = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("visual_guides")
        .select("*")
        .order("created_at", { ascending: false });
      if (data) setGuides(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGuides();
  }, []);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", cloudinaryUploadPreset);

    try {
      const res = await fetch(
        `https://api.cloudinary.com/v1_1/${cloudinaryCloudName}/image/upload`,
        {
          method: "POST",
          body: formData,
        }
      );
      const data = await res.json();
      if (data.secure_url) {
        const secureUrl = data.secure_url;
        setImageUrl(secureUrl);

        // O sistema converte e otimiza automaticamente para WebP gerando a URL correspondente
        if (secureUrl.includes("cloudinary.com")) {
          const generatedWebp = secureUrl
            .replace("/image/upload/", "/image/upload/f_webp,q_auto/")
            .replace(/\.[^/.]+$/, ".webp");
          setWebpUrl(generatedWebp);
        } else {
          setWebpUrl(secureUrl);
        }
      } else {
        alert("Falha no upload da imagem.");
      }
    } catch (err) {
      console.error("Erro no upload da imagem:", err);
      alert("Erro ao realizar o upload.");
    } finally {
      setUploading(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !imageUrl) {
      alert("Por favor, preencha o título e faça o upload da imagem do guia.");
      return;
    }

    const payload = {
      title: title.trim(),
      description: description.trim(),
      image_url: imageUrl,
      webp_url: webpUrl || null,
    };

    try {
      if (editId) {
        // Editar
        await supabase.from("visual_guides").update(payload).eq("id", editId);
      } else {
        // Cadastrar
        await supabase.from("visual_guides").insert([payload]);
      }
      resetForm();
      fetchGuides();
    } catch (err) {
      console.error(err);
    }
  };

  const handleEdit = (item: VisualGuide) => {
    setEditId(item.id);
    setTitle(item.title);
    setDescription(item.description);
    setImageUrl(item.image_url);
    setWebpUrl(item.webp_url || "");
    setIsEditing(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Deseja realmente deletar este guia visual?")) return;
    try {
      await supabase.from("visual_guides").delete().eq("id", id);
      fetchGuides();
    } catch (err) {
      console.error(err);
    }
  };

  const resetForm = () => {
    setEditId(null);
    setTitle("");
    setDescription("");
    setImageUrl("");
    setWebpUrl("");
    setIsEditing(false);
  };

  return (
    <div className="space-y-6">
      {/* HEADER DA PÁGINA */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-3xl bg-[#101623]/95 border border-slate-800">
        <div>
          <h2 className="text-2xl font-extrabold text-white">Guias Visuais</h2>
          <p className="text-xs text-slate-400 mt-1">
            Publique infográficos, layouts de base e tabelas de consulta rápida em imagem.
          </p>
        </div>
        {!isEditing && (
          <button
            onClick={() => setIsEditing(true)}
            className="px-5 py-2.5 rounded-xl bg-[#00ff88] text-slate-950 font-bold text-xs shadow-[0_0_15px_rgba(0,255,136,0.3)] hover:bg-[#15ff96]"
          >
            + Adicionar Guia
          </button>
        )}
      </div>

      {isEditing && (
        <form onSubmit={handleSave} className="p-6 rounded-3xl bg-[#101623]/90 border border-slate-800 space-y-4">
          <h3 className="text-lg font-bold text-white">
            {editId ? "Editar Guia Visual" : "Cadastrar Novo Guia Visual"}
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-4">
              <div>
                <label className="text-xs text-slate-400 font-mono block mb-1">TÍTULO:</label>
                <input
                  type="text"
                  required
                  placeholder="EX: Tabela de Experiência dos Sobreviventes"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl p-3 text-sm text-white focus:outline-none focus:border-[#00ff88]"
                />
              </div>
              <div>
                <label className="text-xs text-slate-400 font-mono block mb-1">BREVE DESCRIÇÃO:</label>
                <textarea
                  placeholder="Explicação resumida do conteúdo abordado no infográfico."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={3}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl p-3 text-sm text-white focus:outline-none focus:border-[#00ff88] resize-none"
                />
              </div>
            </div>

            <div className="flex flex-col justify-center items-center border border-dashed border-slate-800 rounded-2xl p-4 bg-slate-950/30 text-center min-h-[160px]">
              {imageUrl ? (
                <div className="space-y-2 w-full">
                  <span className="text-[10px] font-mono text-[#00ff88] block font-bold">IMAGEM CARREGADA COM SUCESSO</span>
                  <img
                    src={imageUrl}
                    alt="Preview Original"
                    className="max-h-28 object-contain rounded mx-auto border border-slate-800"
                  />
                  <div className="text-[9px] text-slate-400 font-mono">
                    O sistema já otimizou uma versão WebP para visualizações.
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setImageUrl("");
                      setWebpUrl("");
                    }}
                    className="text-[10px] font-bold text-red-400 hover:underline block mx-auto pt-1"
                  >
                    Remover Imagem
                  </button>
                </div>
              ) : (
                <div className="space-y-2">
                  <span className="text-3xl block">🖼️</span>
                  <p className="text-xs text-slate-400">Selecione a imagem original (Alta Resolução)</p>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    disabled={uploading}
                    className="text-xs text-slate-400 max-w-[200px] mx-auto block"
                  />
                  {uploading && (
                    <span className="text-[9px] text-[#00ff88] font-mono block animate-pulse">
                      Fazendo upload e otimizando...
                    </span>
                  )}
                </div>
              )}
            </div>
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={resetForm}
              className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 font-bold text-xs hover:bg-slate-700"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={uploading || !imageUrl}
              className="px-5 py-2.5 rounded-xl bg-[#00ff88] text-slate-950 font-bold text-xs disabled:opacity-50"
            >
              {editId ? "Salvar Alterações" : "Salvar Guia Visual"}
            </button>
          </div>
        </form>
      )}

      {loading ? (
        <div className="flex justify-center py-10">
          <div className="w-8 h-8 border-4 border-[#00ff88] border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {guides.map((item) => (
            <div key={item.id} className="rounded-2xl bg-[#101623]/90 border border-slate-800 overflow-hidden flex flex-col justify-between">
              <div>
                <div className="aspect-square bg-slate-950 overflow-hidden relative border-b border-slate-850 p-2 flex items-center justify-center">
                  <img src={item.webp_url || item.image_url} alt={item.title} className="max-w-full max-h-full object-contain" />
                </div>
                <div className="p-4 space-y-2">
                  <h4 className="font-bold text-white leading-tight">{item.title}</h4>
                  <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">{item.description}</p>
                </div>
              </div>
              <div className="p-4 border-t border-slate-800/60 flex gap-2">
                <button
                  onClick={() => handleEdit(item)}
                  className="flex-1 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-slate-300"
                >
                  Editar
                </button>
                <button
                  onClick={() => handleDelete(item.id)}
                  className="flex-1 py-2 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-xs font-bold text-red-400 border border-red-500/20"
                >
                  Deletar
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
