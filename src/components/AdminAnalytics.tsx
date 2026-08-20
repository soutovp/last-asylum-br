"use client";

import { useState, useEffect } from "react";

interface TopLink {
  label: string;
  url: string;
  category: string;
  count: number;
}

interface TopCode {
  code: string;
  label: string;
  count: number;
  lastCopied?: string;
}

interface TopGuide {
  id: string;
  title: string;
  slug: string;
  category: string;
  views: number;
}

interface AnalyticsData {
  totals: {
    totalEvents: number;
    totalLinkClicks: number;
    totalCodeCopies: number;
    totalGuideEvents: number;
    totalRegisteredGuidesViews: number;
  };
  topLinks: TopLink[];
  topCodes: TopCode[];
  topGuides: TopGuide[];
  categoryDistribution: Record<string, number>;
  recentEvents: Array<{
    id: string;
    event_type: string;
    label: string;
    category: string;
    created_at: string;
  }>;
}

export default function AdminAnalytics() {
  const [period, setPeriod] = useState<"today" | "7d" | "30d" | "all">("7d");
  const [activeTab, setActiveTab] = useState<"geral" | "links" | "codigos" | "guias">("geral");
  const [loading, setLoading] = useState(true);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [errorMsg, setErrorMsg] = useState("");

  const fetchMetrics = async (showLoading = true) => {
    if (showLoading) setLoading(true);
    try {
      const res = await fetch(`/api/analytics/summary?period=${period}`);
      const json = await res.json();
      if (!res.ok || json.error) {
        throw new Error(json.error || "Falha ao carregar métricas analíticas.");
      }
      setData(json);
      setErrorMsg("");
    } catch (err: any) {
      setErrorMsg(err.message || "Erro de conexão.");
    } finally {
      if (showLoading) setLoading(false);
    }
  };

  // Carga inicial e quando o período mudar
  useEffect(() => {
    fetchMetrics(true);
  }, [period]);

  // Polling automático a cada 5 segundos
  useEffect(() => {
    if (!autoRefresh) return;
    const interval = setInterval(() => {
      fetchMetrics(false);
    }, 5000);

    return () => clearInterval(interval);
  }, [period, autoRefresh]);

  const getCategoryBadge = (cat: string) => {
    switch (cat) {
      case "canais_oficiais":
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-cyan-500/10 text-cyan-400 border border-cyan-500/30">Oficial</span>;
      case "parceiros":
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-amber-500/10 text-amber-400 border border-amber-500/30">Parceiro</span>;
      case "redes":
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-indigo-500/10 text-indigo-400 border border-indigo-500/30">Comunidade</span>;
      case "guias":
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-[#00ff88]/10 text-[#00ff88] border border-[#00ff88]/30">Guia</span>;
      case "codigos":
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-yellow-500/10 text-yellow-400 border border-yellow-500/30">Código</span>;
      default:
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-slate-800 text-slate-400 border border-slate-700">{cat}</span>;
    }
  };

  return (
    <div className="space-y-6">
      {/* HEADER DO MÓDULO */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 rounded-3xl bg-[#101623]/90 border border-slate-800">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#00ff88]/10 border border-[#00ff88]/30 text-xs font-semibold text-[#00ff88] mb-2">
            <span>📊 Analytics & Rastreamento Inteligente</span>
          </div>
          <h2 className="text-2xl font-extrabold text-white">Relatórios de Comportamento</h2>
          <p className="text-xs text-slate-400 mt-1">
            Monitore em tempo real os links mais clicados, resgates de códigos e guias mais acessados.
          </p>
        </div>

        {/* FILTRO TEMPORAL, AUTO-REFRESH & ATUALIZAR */}
        <div className="flex flex-wrap items-center gap-2">
          {/* BOTÃO DE AUTO-REFRESH (5 SEGUNDOS) */}
          <button
            type="button"
            onClick={() => setAutoRefresh(!autoRefresh)}
            className={`px-3 py-1.5 rounded-2xl text-xs font-bold flex items-center gap-2 border transition-all ${
              autoRefresh
                ? "bg-[#00ff88]/10 border-[#00ff88]/40 text-[#00ff88]"
                : "bg-slate-900 border-slate-800 text-slate-500 hover:text-slate-300"
            }`}
            title="Alternar atualização automática a cada 5 segundos"
          >
            {autoRefresh ? (
              <>
                <span className="w-2 h-2 rounded-full bg-[#00ff88] animate-pulse"></span>
                <span>Auto-Refresh 5s: Ativo</span>
              </>
            ) : (
              <>
                <span className="w-2 h-2 rounded-full bg-slate-600"></span>
                <span>Auto-Refresh 5s: Pausado</span>
              </>
            )}
          </button>

          {/* SELETOR DE PERÍODO */}
          <div className="flex items-center bg-slate-900 p-1 rounded-2xl border border-slate-800">
            {[
              { id: "today", label: "Hoje" },
              { id: "7d", label: "7 Dias" },
              { id: "30d", label: "30 Dias" },
              { id: "all", label: "Total" },
            ].map((p) => (
              <button
                key={p.id}
                onClick={() => setPeriod(p.id as any)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  period === p.id
                    ? "bg-[#00ff88] text-slate-950 shadow-[0_0_10px_rgba(0,255,136,0.3)]"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>

          <button
            onClick={() => fetchMetrics(true)}
            disabled={loading}
            className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold border border-slate-700 transition-colors"
            title="Atualizar Agora"
          >
            🔄
          </button>
        </div>
      </div>

      {errorMsg && (
        <div className="p-4 rounded-2xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs font-semibold">
          {errorMsg}
        </div>
      )}

      {/* CARDS DE KPIS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* TOTAL DE CLIQUES EM LINKS */}
        <div className="p-5 rounded-3xl bg-[#101623]/90 border border-slate-800 space-y-2">
          <div className="flex items-center justify-between text-slate-400 text-xs font-mono">
            <span>🔗 CLIQUES EM LINKS</span>
            <span className="text-base">🚀</span>
          </div>
          <div className="text-3xl font-black text-white">
            {loading ? "..." : (data?.totals.totalLinkClicks ?? 0)}
          </div>
          <p className="text-[11px] text-slate-400">
            Canais Oficiais, Lojas e Parceiros
          </p>
        </div>

        {/* CÓDIGOS COPIADOS */}
        <div className="p-5 rounded-3xl bg-[#101623]/90 border border-slate-800 space-y-2">
          <div className="flex items-center justify-between text-slate-400 text-xs font-mono">
            <span>🎁 CÓDIGOS RESGATADOS</span>
            <span className="text-base">📋</span>
          </div>
          <div className="text-3xl font-black text-[#00ff88]">
            {loading ? "..." : (data?.totals.totalCodeCopies ?? 0)}
          </div>
          <p className="text-[11px] text-slate-400">
            Cópias e resgates no portal
          </p>
        </div>

        {/* VISUALIZAÇÕES DE GUIAS */}
        <div className="p-5 rounded-3xl bg-[#101623]/90 border border-slate-800 space-y-2">
          <div className="flex items-center justify-between text-slate-400 text-xs font-mono">
            <span>📖 LEITURAS DE GUIAS</span>
            <span className="text-base">📚</span>
          </div>
          <div className="text-3xl font-black text-cyan-400">
            {loading ? "..." : ((data?.totals.totalGuideEvents || 0) + (data?.totals.totalRegisteredGuidesViews || 0))}
          </div>
          <p className="text-[11px] text-slate-400">
            Artigos e tutoriais consultados
          </p>
        </div>

        {/* TOP CANAL DO PERÍODO */}
        <div className="p-5 rounded-3xl bg-[#101623]/90 border border-slate-800 space-y-2">
          <div className="flex items-center justify-between text-slate-400 text-xs font-mono">
            <span>💎 TOP LINK PRINCIPAL</span>
            <span className="text-base">🏆</span>
          </div>
          <div className="text-sm font-bold text-amber-400 truncate">
            {loading ? "..." : (data?.topLinks[0]?.label || "Nenhum clique ainda")}
          </div>
          <p className="text-[11px] text-slate-400">
            {data?.topLinks[0] ? `${data.topLinks[0].count} cliques no período` : "Aguardando interações"}
          </p>
        </div>
      </div>

      {/* NAVEGAÇÃO ENTRE ABAS DO ANALYTICS */}
      <div className="flex border-b border-slate-800 gap-2 pb-2 overflow-x-auto">
        {[
          { id: "geral", label: "📊 Visão Geral & Distribuição" },
          { id: "links", label: "🔗 Links de Parceiros & Oficiais" },
          { id: "codigos", label: "🎁 Códigos de Presente" },
          { id: "guias", label: "📖 Guias & Tutoriais" },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`px-4 py-2.5 rounded-2xl text-xs font-bold whitespace-nowrap transition-all ${
              activeTab === tab.id
                ? "bg-slate-800 text-[#00ff88] border border-[#00ff88]/30 shadow-md"
                : "text-slate-400 hover:text-white"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* CONTEÚDO DAS ABAS */}
      {loading ? (
        <div className="py-16 flex flex-col items-center justify-center gap-3">
          <div className="w-8 h-8 border-4 border-[#00ff88] border-t-transparent rounded-full animate-spin"></div>
          <span className="text-xs font-mono text-slate-400">Processando métricas...</span>
        </div>
      ) : (
        <>
          {/* TAB 1: VISÃO GERAL */}
          {activeTab === "geral" && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              
              {/* DISTRIBUIÇÃO POR CATEGORIA */}
              <div className="p-6 rounded-3xl bg-[#101623]/90 border border-slate-800 space-y-4">
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <span>📈</span> Distribuição de Cliques por Categoria
                </h3>

                {Object.keys(data?.categoryDistribution || {}).length === 0 ? (
                  <p className="text-xs text-slate-500 py-6 text-center">Nenhum dado registrado neste período.</p>
                ) : (
                  <div className="space-y-4">
                    {Object.entries(data?.categoryDistribution || {}).map(([cat, count]) => {
                      const totalClicks = data?.totals.totalLinkClicks || 1;
                      const pct = Math.round((count / totalClicks) * 100);
                      return (
                        <div key={cat} className="space-y-1.5">
                          <div className="flex items-center justify-between text-xs font-bold">
                            <span className="text-slate-300 capitalize">{cat.replace(/_/g, " ")}</span>
                            <span className="font-mono text-[#00ff88]">{count} ({pct}%)</span>
                          </div>
                          <div className="w-full h-2.5 bg-slate-950 rounded-full overflow-hidden border border-slate-800">
                            <div
                              className="h-full bg-gradient-to-r from-cyan-500 to-[#00ff88] rounded-full transition-all duration-500"
                              style={{ width: `${Math.max(pct, 4)}%` }}
                            ></div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* LOG DE ATIVIDADE RECENTE */}
              <div className="p-6 rounded-3xl bg-[#101623]/90 border border-slate-800 space-y-4">
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <span>⚡</span> Atividade em Tempo Real
                </h3>

                {(data?.recentEvents || []).length === 0 ? (
                  <p className="text-xs text-slate-500 py-6 text-center">Nenhum evento recente registrado.</p>
                ) : (
                  <div className="space-y-2.5 max-h-[300px] overflow-y-auto pr-1">
                    {(data?.recentEvents || []).map((ev) => (
                      <div
                        key={ev.id}
                        className="p-3 rounded-2xl bg-slate-900/70 border border-slate-800 flex items-center justify-between gap-3 text-xs"
                      >
                        <div className="flex items-center gap-2.5 truncate">
                          <span>{ev.event_type === "link_click" ? "🔗" : ev.event_type === "code_copy" ? "🎁" : "📖"}</span>
                          <span className="font-bold text-slate-200 truncate">{ev.label}</span>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          {getCategoryBadge(ev.category)}
                          <span className="text-[10px] font-mono text-slate-500">
                            {new Date(ev.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

            </div>
          )}

          {/* TAB 2: LINKS DE PARCEIROS & CANAIS OFICIAIS */}
          {activeTab === "links" && (
            <div className="p-6 rounded-3xl bg-[#101623]/90 border border-slate-800 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-bold text-white">Ranking de Cliques em Links Externos</h3>
                  <p className="text-xs text-slate-400">Rastreamento de canais oficiais, web shop e parceiros.</p>
                </div>
                <span className="text-xs font-mono text-[#00ff88] font-bold">
                  {data?.topLinks.length || 0} Links Identificados
                </span>
              </div>

              {(data?.topLinks || []).length === 0 ? (
                <p className="text-xs text-slate-500 py-8 text-center">Nenhum clique registrado no período selecionado.</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="border-b border-slate-800 text-slate-400 uppercase font-mono">
                        <th className="py-3 px-4">Link / Canal</th>
                        <th className="py-3 px-4">Categoria</th>
                        <th className="py-3 px-4">URL de Destino</th>
                        <th className="py-3 px-4 text-right">Cliques</th>
                        <th className="py-3 px-4 text-right">Participação</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/60 font-medium">
                      {(data?.topLinks || []).map((link, idx) => {
                        const total = data?.totals.totalLinkClicks || 1;
                        const pct = Math.round((link.count / total) * 100);
                        return (
                          <tr key={idx} className="hover:bg-slate-900/50 transition-colors">
                            <td className="py-3.5 px-4 font-bold text-white flex items-center gap-2">
                              <span className="text-slate-500 font-mono w-4">{idx + 1}.</span>
                              <span>{link.label}</span>
                            </td>
                            <td className="py-3.5 px-4">
                              {getCategoryBadge(link.category)}
                            </td>
                            <td className="py-3.5 px-4 font-mono text-[11px] text-slate-400 max-w-[220px] truncate">
                              <a href={link.url} target="_blank" rel="noopener noreferrer" className="hover:text-cyan-400 underline">
                                {link.url}
                              </a>
                            </td>
                            <td className="py-3.5 px-4 text-right font-black text-[#00ff88] text-sm">
                              {link.count}
                            </td>
                            <td className="py-3.5 px-4 text-right font-mono text-slate-400">
                              {pct}%
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* TAB 3: CÓDIGOS DE PRESENTE */}
          {activeTab === "codigos" && (
            <div className="p-6 rounded-3xl bg-[#101623]/90 border border-slate-800 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-bold text-white">Ranking de Códigos de Presente (Gift Codes)</h3>
                  <p className="text-xs text-slate-400">Métricas de cópia e engajamento dos jogadores por código.</p>
                </div>
              </div>

              {(data?.topCodes || []).length === 0 ? (
                <p className="text-xs text-slate-500 py-8 text-center">Nenhuma cópia de código registrada no período.</p>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {(data?.topCodes || []).map((code, idx) => (
                    <div
                      key={idx}
                      className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 flex items-center justify-between"
                    >
                      <div className="space-y-1">
                        <span className="text-[10px] font-mono text-slate-500 uppercase">Posição #{idx + 1}</span>
                        <div className="font-mono text-lg font-black text-white tracking-wider">
                          {code.code}
                        </div>
                        {code.lastCopied && (
                          <span className="text-[10px] text-slate-500 block">
                            Última cópia: {new Date(code.lastCopied).toLocaleDateString()}
                          </span>
                        )}
                      </div>
                      <div className="text-right">
                        <span className="text-2xl font-black text-[#00ff88]">{code.count}</span>
                        <span className="text-[10px] font-mono text-slate-400 block">cópias</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 4: GUIAS & TUTORIAIS */}
          {activeTab === "guias" && (
            <div className="p-6 rounded-3xl bg-[#101623]/90 border border-slate-800 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-bold text-white">Ranking de Artigos & Guias Mais Acessados</h3>
                  <p className="text-xs text-slate-400">Desempenho dos conteúdos estratégicos do portal.</p>
                </div>
              </div>

              {(data?.topGuides || []).length === 0 ? (
                <p className="text-xs text-slate-500 py-8 text-center">Nenhum guia registrado no sistema.</p>
              ) : (
                <div className="space-y-3">
                  {(data?.topGuides || []).map((guide, idx) => (
                    <div
                      key={guide.id}
                      className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 flex items-center justify-between gap-4"
                    >
                      <div className="flex items-center gap-3">
                        <span className="w-8 h-8 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center font-mono font-bold text-xs text-slate-300">
                          #{idx + 1}
                        </span>
                        <div>
                          <h4 className="text-sm font-bold text-white">{guide.title}</h4>
                          <span className="text-[10px] font-mono text-slate-400">Categoria: {guide.category}</span>
                        </div>
                      </div>
                      <div className="text-right shrink-0">
                        <span className="text-lg font-black text-cyan-400">{guide.views}</span>
                        <span className="text-[10px] font-mono text-slate-500 block">visualizações</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </>
      )}

    </div>
  );
}
