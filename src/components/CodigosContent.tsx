"use client";

import { useState, useEffect } from "react";
import { isSupabaseConfigured } from "@/lib/supabase";

interface GiftCode {
  id: string;
  code: string;
  rewards: string;
  expires_at: string | null;
  created_at: string;
}

export default function CodigosContent() {
  const [codes, setCodes] = useState<GiftCode[]>([]);
  const [loading, setLoading] = useState(true);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  useEffect(() => {
    const fetchCodes = async () => {
      try {
        if (isSupabaseConfigured) {
          const { supabase } = await import("@/lib/supabase");
          const { data, error } = await supabase
            .from("gift_codes")
            .select("*")
            .order("created_at", { ascending: false });

          if (data) {
            setCodes(data);
          }
        }
      } catch (err) {
        console.error("Erro ao buscar códigos:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchCodes();
  }, []);

  const handleCopy = (codeText: string, id: string) => {
    navigator.clipboard.writeText(codeText);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const isOldCode = (addedDateStr: string) => {
    const addedTime = new Date(addedDateStr).getTime();
    const oneMonthMs = 30 * 24 * 60 * 60 * 1000;
    return (Date.now() - addedTime) > oneMonthMs;
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric"
    });
  };

  return (
    <>
      {/* CABEÇALHO DA PÁGINA */}
      <div className="text-center max-w-3xl mx-auto mb-12">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-900/90 border border-[#00ff88]/30 text-xs font-semibold text-[#00ff88] mb-4">
          <span>🎁 Recompensas Gratuitas</span>
        </div>
        <h1 className="text-3xl sm:text-5xl font-extrabold text-white drop-shadow-md">
          Códigos <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#00ff88] to-emerald-400">Presente</span>
        </h1>
        <p className="mt-3 text-slate-300 drop-shadow-sm font-medium">
          Copie os códigos ativos e resgate itens exclusivos direto no menu de configurações do jogo.
        </p>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-pulse">
          <div className="h-44 rounded-2xl bg-slate-900/50 border border-slate-800" />
          <div className="h-44 rounded-2xl bg-slate-900/50 border border-slate-800" />
        </div>
      ) : codes.length === 0 ? (
        <div className="bg-[#101623]/95 border border-slate-800 rounded-3xl p-8 backdrop-blur-xl text-center space-y-4 shadow-2xl">
          <span className="text-4xl block">🗳️</span>
          <h3 className="text-xl font-bold text-white">Nenhum código ativo</h3>
          <p className="text-sm text-slate-400 max-w-md mx-auto">
            Novos códigos de resgate serão anunciados no painel em breve. Fique de olho!
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 items-stretch justify-center">
          {codes.map((item) => {
            const isOld = isOldCode(item.created_at);
            return (
              <div
                key={item.id}
                className={`relative flex flex-col justify-between rounded-2xl bg-[#101623]/80 border ${
                  isOld ? "border-amber-500/20 hover:border-amber-500/40" : "border-[#00ff88]/20 hover:border-[#00ff88]/40"
                } transition-all duration-300 shadow-xl backdrop-blur-md overflow-hidden p-6`}
              >
                {/* Status Badge */}
                <div className="flex justify-between items-center mb-4">
                  <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded ${
                    isOld 
                      ? "bg-amber-500/10 text-orange-400 border border-amber-500/25" 
                      : "bg-[#00ff88]/10 text-[#00ff88] border border-[#00ff88]/25"
                  }`}>
                    {isOld ? "ANTIGO" : "ATIVO"}
                  </span>
                  <span className="text-[10px] text-slate-400 font-mono">
                    Adicionado: {formatDate(item.created_at)}
                  </span>
                </div>

                <div className="space-y-3 mb-6">
                  {/* Codigo de Resgate */}
                  <div className="bg-slate-950/80 rounded-xl p-3 border border-slate-800 flex justify-between items-center gap-2">
                    <span className="font-mono font-black text-white text-lg tracking-wider select-all">
                      {item.code}
                    </span>
                    <button
                      onClick={() => handleCopy(item.code, item.id)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold font-mono transition-all ${
                        copiedId === item.id
                          ? "bg-[#00ff88] text-slate-950 font-black shadow-[0_0_12px_rgba(0,255,136,0.3)]"
                          : "bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white"
                      }`}
                    >
                      {copiedId === item.id ? "COPIADO!" : "COPIAR"}
                    </button>
                  </div>

                  {/* Recompensas */}
                  <div className="space-y-1">
                    <span className="text-[10px] font-mono uppercase tracking-wider text-slate-500 block">Recompensas:</span>
                    <p className="text-xs text-slate-300 font-medium leading-relaxed bg-slate-900/30 rounded-lg p-2 border border-slate-800/40">
                      {item.rewards || "Recursos gerais de sobrevivência."}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </>
  );
}
