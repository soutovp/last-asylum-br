"use client";

import { useState, useEffect, use } from "react";
import Image from "next/image";
import Link from "next/link";
import Header from "@/components/Header";

interface UnsubscribePageProps {
  params: Promise<{ token: string }>;
}

export default function UnsubscribePage({ params }: UnsubscribePageProps) {
  const resolvedParams = use(params);
  const token = resolvedParams.token;

  const [loading, setLoading] = useState(true);
  const [emailMasked, setEmailMasked] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [saving, setSaving] = useState(false);

  // Estados das 4 categorias de e-mail (Padrão: true)
  const [receiveNoticias, setReceiveNoticias] = useState(true);
  const [receiveGuias, setReceiveGuias] = useState(true);
  const [receiveCodigos, setReceiveCodigos] = useState(true);
  const [receivePromocionais, setReceivePromocionais] = useState(true);

  // Carrega as preferências atuais através do token
  useEffect(() => {
    async function loadPreferences() {
      try {
        const res = await fetch(`/api/unsubscribe/${token}`);
        const data = await res.json();

        if (!res.ok || data.error) {
          setErrorMsg(data.error || "Link de descadastro inválido ou expirado.");
        } else {
          setEmailMasked(data.emailMasked || "sua conta");
          if (data.preferences) {
            setReceiveNoticias(data.preferences.receiveNoticias !== false);
            setReceiveGuias(data.preferences.receiveGuias !== false);
            setReceiveCodigos(data.preferences.receiveCodigos !== false);
            setReceivePromocionais(data.preferences.receivePromocionais !== false);
          }
        }
      } catch (err: any) {
        setErrorMsg("Erro ao conectar com o servidor. Tente novamente.");
      } finally {
        setLoading(false);
      }
    }

    if (token) {
      loadPreferences();
    }
  }, [token]);

  // Salva alterações parciais ou gerais
  const handleSave = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setSaving(true);
    setErrorMsg("");
    setSuccessMsg("");

    try {
      const res = await fetch(`/api/unsubscribe/${token}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          receiveNoticias,
          receiveGuias,
          receiveCodigos,
          receivePromocionais,
        }),
      });

      const data = await res.json();
      if (!res.ok || data.error) {
        setErrorMsg(data.error || "Falha ao salvar preferências.");
      } else {
        setSuccessMsg("Suas preferências de e-mail foram atualizadas com sucesso!");
      }
    } catch {
      setErrorMsg("Erro de conexão ao salvar.");
    } finally {
      setSaving(false);
    }
  };

  // Desativa todas as categorias em 1 clique (Opt-out completo)
  const handleUnsubscribeAll = async () => {
    if (!confirm("Deseja realmente cancelar o recebimento de TODOS os e-mails do portal?")) {
      return;
    }

    setSaving(true);
    setErrorMsg("");
    setSuccessMsg("");

    try {
      const res = await fetch(`/api/unsubscribe/${token}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ unsubscribeAll: true }),
      });

      const data = await res.json();
      if (!res.ok || data.error) {
        setErrorMsg(data.error || "Falha ao processar descadastro.");
      } else {
        setReceiveNoticias(false);
        setReceiveGuias(false);
        setReceiveCodigos(false);
        setReceivePromocionais(false);
        setSuccessMsg("Você foi descadastrado de todas as comunicações por e-mail com sucesso.");
      }
    } catch {
      setErrorMsg("Erro de conexão ao processar descadastro.");
    } finally {
      setSaving(false);
    }
  };

  // Ativa todas as categorias
  const handleEnableAll = () => {
    setReceiveNoticias(true);
    setReceiveGuias(true);
    setReceiveCodigos(true);
    setReceivePromocionais(true);
  };

  return (
    <div className="relative min-h-screen flex flex-col bg-[#080c14] text-slate-100 overflow-x-hidden">
      {/* BACKGROUND FIXO */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <Image
          src="/images/village_banner_2.png"
          alt="Background Vila"
          fill
          priority
          sizes="100vw"
          className="object-cover object-center opacity-60 scale-105"
        />
        <div className="absolute inset-0 bg-[#080c14]/50 backdrop-blur-[2px]"></div>
        <div className="absolute inset-0 bg-gradient-to-b from-[#080c14]/80 via-transparent to-[#080c14]/95"></div>
      </div>

      <div className="relative z-10 flex flex-col min-h-screen">
        <Header />

        <main className="flex-1 max-w-2xl mx-auto px-4 py-12 w-full">
          <div className="p-6 sm:p-10 rounded-3xl bg-[#101623]/95 border border-slate-800 backdrop-blur-2xl shadow-2xl space-y-6">
            
            {/* CABEÇALHO */}
            <div className="text-center space-y-2 pb-4 border-b border-slate-800">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-800 border border-slate-700 text-xs font-mono text-slate-300">
                <span>✉️ Preferências de Comunicação</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
                Gerenciar Inscrição de E-mails
              </h1>
              <p className="text-xs sm:text-sm text-slate-400 max-w-lg mx-auto">
                No <strong>Last Asylum BR</strong> você tem controle total. Escolha quais tipos de e-mails deseja continuar recebendo ou cancele todos a qualquer momento.
              </p>
              {emailMasked && (
                <div className="pt-2">
                  <span className="text-xs font-mono text-cyan-400 bg-cyan-950/60 border border-cyan-800/40 px-3 py-1 rounded-lg">
                    Conta vinculada: <strong>{emailMasked}</strong>
                  </span>
                </div>
              )}
            </div>

            {/* FEEDBACKS */}
            {loading ? (
              <div className="py-12 flex flex-col items-center justify-center gap-3">
                <div className="w-8 h-8 border-4 border-[#00ff88] border-t-transparent rounded-full animate-spin"></div>
                <span className="text-xs font-mono text-slate-400">Carregando suas preferências...</span>
              </div>
            ) : errorMsg ? (
              <div className="p-4 rounded-2xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs font-semibold text-center space-y-3">
                <p>{errorMsg}</p>
                <div>
                  <Link
                    href="/"
                    className="inline-block px-4 py-2 rounded-xl bg-slate-800 text-white font-bold text-xs hover:bg-slate-700 transition-colors"
                  >
                    Ir para a Página Inicial
                  </Link>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSave} className="space-y-6">
                
                {successMsg && (
                  <div className="p-4 rounded-2xl bg-[#00ff88]/10 border border-[#00ff88]/30 text-[#00ff88] text-xs font-semibold flex items-center gap-2">
                    <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span>{successMsg}</span>
                  </div>
                )}

                {/* ATALHOS RÁPIDOS */}
                <div className="flex items-center justify-between text-xs pb-2">
                  <span className="font-mono text-slate-400 uppercase tracking-wider font-bold">
                    Categorias Disponíveis:
                  </span>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={handleEnableAll}
                      className="text-[#00ff88] hover:underline font-semibold text-xs"
                    >
                      Marcar Todos
                    </button>
                    <span className="text-slate-600">|</span>
                    <button
                      type="button"
                      onClick={() => {
                        setReceiveNoticias(false);
                        setReceiveGuias(false);
                        setReceiveCodigos(false);
                        setReceivePromocionais(false);
                      }}
                      className="text-slate-400 hover:text-white font-semibold text-xs"
                    >
                      Desmarcar Todos
                    </button>
                  </div>
                </div>

                {/* LISTA DE TOGGLES */}
                <div className="space-y-3">
                  
                  {/* NOTÍCIAS */}
                  <label className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 hover:border-slate-700 flex items-start justify-between gap-4 cursor-pointer transition-all">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-base">📰</span>
                        <span className="text-sm font-bold text-white">Notícias & Atualizações</span>
                      </div>
                      <p className="text-xs text-slate-400">
                        Patch notes, novidades do jogo, manutenções programadas e anúncios importantes da comunidade.
                      </p>
                    </div>
                    <input
                      type="checkbox"
                      checked={receiveNoticias}
                      onChange={(e) => setReceiveNoticias(e.target.checked)}
                      className="w-5 h-5 rounded border-slate-700 bg-slate-950 accent-[#00ff88] cursor-pointer mt-1"
                    />
                  </label>

                  {/* GUIAS */}
                  <label className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 hover:border-slate-700 flex items-start justify-between gap-4 cursor-pointer transition-all">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-base">📖</span>
                        <span className="text-sm font-bold text-white">Guias & Tutoriais</span>
                      </div>
                      <p className="text-xs text-slate-400">
                        Estratégias de sobrevivência, composições de heróis, formações de tropas e guias táticos.
                      </p>
                    </div>
                    <input
                      type="checkbox"
                      checked={receiveGuias}
                      onChange={(e) => setReceiveGuias(e.target.checked)}
                      className="w-5 h-5 rounded border-slate-700 bg-slate-950 accent-[#00ff88] cursor-pointer mt-1"
                    />
                  </label>

                  {/* CÓDIGOS DE RESGATE */}
                  <label className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 hover:border-slate-700 flex items-start justify-between gap-4 cursor-pointer transition-all">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-base">🎁</span>
                        <span className="text-sm font-bold text-white">Códigos de Presente (Gift Codes)</span>
                      </div>
                      <p className="text-xs text-slate-400">
                        Alertas instantâneos quando novos códigos com recompensas e itens gratuitos forem lançados.
                      </p>
                    </div>
                    <input
                      type="checkbox"
                      checked={receiveCodigos}
                      onChange={(e) => setReceiveCodigos(e.target.checked)}
                      className="w-5 h-5 rounded border-slate-700 bg-slate-950 accent-[#00ff88] cursor-pointer mt-1"
                    />
                  </label>

                  {/* PROMOCIONAIS */}
                  <label className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 hover:border-slate-700 flex items-start justify-between gap-4 cursor-pointer transition-all">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-base">🔥</span>
                        <span className="text-sm font-bold text-white">Envios Promocionais & Eventos</span>
                      </div>
                      <p className="text-xs text-slate-400">
                        Comunicados especiais, eventos sazonais da comunidade, torneios e pesquisas de opinião.
                      </p>
                    </div>
                    <input
                      type="checkbox"
                      checked={receivePromocionais}
                      onChange={(e) => setReceivePromocionais(e.target.checked)}
                      className="w-5 h-5 rounded border-slate-700 bg-slate-950 accent-[#00ff88] cursor-pointer mt-1"
                    />
                  </label>

                </div>

                {/* BOTÕES DE AÇÃO */}
                <div className="space-y-3 pt-2">
                  <button
                    type="submit"
                    disabled={saving}
                    className="w-full h-12 rounded-2xl bg-[#00ff88] text-slate-950 font-bold text-sm shadow-[0_0_20px_rgba(0,255,136,0.3)] hover:bg-[#15ff96] active:scale-98 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    {saving ? (
                      <div className="w-5 h-5 border-2 border-slate-950 border-t-transparent rounded-full animate-spin"></div>
                    ) : (
                      <span>Salvar Minhas Preferências</span>
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={handleUnsubscribeAll}
                    disabled={saving}
                    className="w-full h-11 rounded-2xl border border-red-500/30 bg-red-500/10 hover:bg-red-500/20 text-red-400 font-bold text-xs transition-all"
                  >
                    🚫 Desativar Todos os E-mails (Descadastro Completo)
                  </button>
                </div>

                <div className="text-center pt-2">
                  <Link
                    href="/"
                    className="text-xs text-slate-500 hover:text-slate-300 underline font-mono"
                  >
                    &larr; Voltar para a Página Inicial do Portal
                  </Link>
                </div>
              </form>
            )}

          </div>
        </main>
      </div>
    </div>
  );
}
