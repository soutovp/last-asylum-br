"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import AdBanner from "@/components/AdBanner";
import { isSupabaseConfigured } from "@/lib/supabase";

interface NewsItem {
  id: string;
  title: string;
  category: "Atualizações" | "Eventos" | "Guias" | "Manutenção";
  date: string;
  readTime: string;
  summary: string;
  isFeatured?: boolean;
  tagColor: string;
  slug: string;
  type: "noticia" | "guia";
  image_url?: string;
  content?: string;
}

const getCleanPreview = (htmlContent: string = "", fallback: string = "") => {
  if (!htmlContent) return fallback;
  // Remove HTML tags
  const cleanText = htmlContent.replace(/<[^>]*>/g, " ");
  // Normalize spacing
  const normalized = cleanText.replace(/\s+/g, " ").trim();
  if (normalized.length > 350) {
    return normalized.slice(0, 350) + "...";
  }
  return normalized || fallback;
};

const getCategoryStyles = (category: string) => {
  switch (category) {
    case "Eventos":
      return "bg-amber-950/70 text-amber-300 border-amber-500/30";
    case "Atualizações":
      return "bg-emerald-950/70 text-emerald-300 border-emerald-500/30";
    case "Guias":
      return "bg-sky-950/70 text-sky-300 border-sky-500/30";
    case "Manutenção":
      return "bg-purple-950/70 text-purple-300 border-purple-500/30";
    default:
      return "bg-slate-900/80 text-slate-300 border-slate-700/50";
  }
};

interface NewsSectionProps {
  initialArticles?: any[];
}

export default function NewsSection({ initialArticles = [] }: NewsSectionProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>("Todos");
  const [currentPage, setCurrentPage] = useState(1);

  // Função auxiliar para formatar notícias vindas do banco ou fallback
  const formatArticles = (list: any[]) => {
    const published = list.filter((item: any) => 
      !item.scheduled_at || new Date(item.scheduled_at).getTime() <= Date.now()
    );

    return published.map((item: any) => ({
      id: item.id,
      title: item.title,
      category: item.category || "Atualizações",
      date: new Date(item.created_at).toLocaleDateString("pt-BR", {
        day: "2-digit",
        month: "long",
        year: "numeric",
      }),
      readTime: `${Math.max(2, Math.ceil((item.content || "").length / 800))} min de leitura`,
      summary: item.summary,
      isFeatured: item.is_featured || false,
      tagColor: getCategoryStyles(item.category || "Atualizações"),
      slug: item.slug,
      type: item.type,
      image_url: item.image_url,
      content: item.content || "",
    }));
  };

  const [newsList, setNewsList] = useState<NewsItem[]>(() => formatArticles(initialArticles));
  const [loading, setLoading] = useState(initialArticles.length === 0);
  const [carouselIndex, setCarouselIndex] = useState(0);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    // Se já temos notícias carregadas pelo servidor, não precisamos fazer fetch no client-side
    if (initialArticles.length > 0) {
      setLoading(false);
      return;
    }

    const fetchNews = async () => {
      try {
        if (isSupabaseConfigured) {
          const { supabase } = await import("@/lib/supabase");
          const { data, error } = await supabase
            .from("articles")
            .select("*")
            .eq("status", "public")
            .order("created_at", { ascending: false });

          if (data) {
            setNewsList(formatArticles(data));
          }
        } else {
          // Fallback Local Storage
          const stored = localStorage.getItem("local_articles");
          if (stored) {
            const list = JSON.parse(stored) as any[];
            const published = list.filter(
              (item) =>
                (item.type === "noticia" || item.type === "guia") &&
                item.status === "public" &&
                (!item.scheduled_at || new Date(item.scheduled_at).getTime() <= Date.now())
            );
            setNewsList(
              published.map((item) => ({
                id: item.id || Math.random().toString(),
                title: item.title,
                category: item.category || "Atualizações",
                date: "Hoje",
                readTime: "3 min de leitura",
                summary: item.summary,
                isFeatured: item.is_featured || false,
                tagColor: getCategoryStyles(item.category || "Atualizações"),
                slug: item.slug,
                type: item.type,
                image_url: item.image_url,
                content: item.content || "",
              }))
            );
          }
        }
      } catch (err) {
        console.error("Erro ao carregar notícias na Home:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchNews();
  }, [initialArticles]);

  // Filtros e destaque
  const categories = ["Todos", "Atualizações", "Eventos", "Guias", "Manutenção"];
  
  // Destaques (apenas os marcados como isFeatured)
  const featuredItems = newsList.filter((n) => n.isFeatured);

  // Lista normal de artigos (filtrando a categoria selecionada e termo de busca)
  const filteredNews = newsList.filter((news) => {
    const matchesCategory = selectedCategory === "Todos" || news.category === selectedCategory;
    if (!matchesCategory) return false;
    if (!searchTerm.trim()) return true;
    const term = searchTerm.toLowerCase();
    return (
      news.title.toLowerCase().includes(term) ||
      news.summary.toLowerCase().includes(term)
    );
  });

  // PAGINAÇÃO DINÂMICA (Limite de 10 artigos por página)
  const ITEMS_PER_PAGE = 10;
  const totalPages = Math.ceil(filteredNews.length / ITEMS_PER_PAGE);
  const displayedNews = filteredNews.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

  // Auto-play do Carrossel de Destaques
  useEffect(() => {
    if (featuredItems.length <= 1) return;
    const interval = setInterval(() => {
      setCarouselIndex((prev) => (prev + 1) % featuredItems.length);
    }, 6000);
    return () => clearInterval(interval);
  }, [featuredItems.length]);

  return (
    <section id="noticias" className="py-12 sm:py-16 relative overflow-hidden bg-slate-950/20">
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#0e1420]/30 to-transparent pointer-events-none"></div>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* CARROSSEL DE DESTAQUES */}
        {!loading && featuredItems.length > 0 && selectedCategory === "Todos" && !searchTerm && (
          <div className="relative group mb-12 overflow-hidden rounded-2xl border border-slate-800 bg-[#0e1420] shadow-2xl h-[340px] md:h-[240px] w-full">
            {featuredItems.map((item, idx) => {
              const isActive = idx === carouselIndex;
              return (
                <div
                  key={item.id}
                  className={`absolute inset-0 flex flex-col md:flex-row justify-between transition-opacity duration-500 ease-in-out ${
                    isActive ? "opacity-100 z-10" : "opacity-0 pointer-events-none z-0"
                  }`}
                >
                  {/* Imagem do destaque */}
                  {item.image_url && (
                    <div className="w-full md:w-3/5 h-2/5 md:h-full relative overflow-hidden">
                      <div className="absolute inset-0 bg-gradient-to-t md:bg-gradient-to-r from-[#0e1420] via-transparent to-transparent z-10" />
                      <Image
                        src={item.image_url}
                        alt={item.title}
                        fill
                        priority={idx === 0}
                        sizes="(max-width: 1024px) 100vw, 60vw"
                        className="object-cover object-center"
                      />
                    </div>
                  )}

                  {/* Texto do destaque */}
                  <div className="flex-1 p-5 sm:p-6 md:p-8 flex flex-col justify-center space-y-3 md:space-y-4 z-20">
                    <div className="flex items-center gap-3">
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-semibold border ${item.tagColor}`}>
                        {item.category}
                      </span>
                      <span className="text-xs font-mono text-slate-400" suppressHydrationWarning>{item.date}</span>
                      <span className="text-xs font-mono text-amber-400 font-semibold">★ Destaque</span>
                    </div>

                    <h3 className="text-base sm:text-lg md:text-2xl font-black text-white hover:text-emerald-300 transition-colors leading-tight">
                      <Link href={item.type === "guia" ? `/guias/${item.slug}` : `/noticias/${item.slug}`}>
                        {item.title}
                      </Link>
                    </h3>

                    <p className="text-xs sm:text-sm text-slate-300 leading-relaxed line-clamp-2 md:line-clamp-3">
                      {item.summary}
                    </p>

                    <div className="pt-1.5">
                      <Link
                        href={item.type === "guia" ? `/guias/${item.slug}` : `/noticias/${item.slug}`}
                        className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-500 text-slate-950 font-bold text-xs sm:text-sm shadow-[0_0_15px_rgba(16,185,129,0.25)] hover:bg-emerald-400 transition-all transform hover:-translate-y-0.5"
                      >
                        <span>Ler Matéria Completa</span>
                        <span>→</span>
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })}

            {/* CONTROLES DO CARROSSEL */}
            {featuredItems.length > 1 && (
              <>
                {/* Indicadores (Dots) */}
                <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-1.5 z-20">
                  {featuredItems.map((_, dotIdx) => (
                    <button
                      key={dotIdx}
                      onClick={() => setCarouselIndex(dotIdx)}
                      aria-label={`Ver matéria em destaque ${dotIdx + 1}`}
                      className={`w-2 h-2 rounded-full transition-all ${
                        carouselIndex === dotIdx ? "bg-emerald-400 scale-110" : "bg-slate-700 hover:bg-slate-600"
                      }`}
                    />
                  ))}
                </div>

                {/* Seta Esquerda */}
                <button
                  type="button"
                  onClick={() => setCarouselIndex((prev) => (prev - 1 + featuredItems.length) % featuredItems.length)}
                  aria-label="Matéria anterior"
                  className="carousel-nav-btn absolute left-4 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 z-20 shadow-xl"
                >
                  ◀
                </button>

                {/* Seta Direita */}
                <button
                  type="button"
                  onClick={() => setCarouselIndex((prev) => (prev + 1) % featuredItems.length)}
                  aria-label="Próxima matéria"
                  className="carousel-nav-btn absolute right-4 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 z-20 shadow-xl"
                >
                  ▶
                </button>
              </>
            )}
          </div>
        )}

        {/* TÍTULO DA SEÇÃO */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-900/90 border border-emerald-500/20 text-[11px] font-semibold text-emerald-400 mb-3">
              <span>📜 Registros do Santuário</span>
            </div>
            <h2 className="text-2xl sm:text-4xl font-black text-white tracking-tight">
              Central de <span className="text-emerald-400">Atualizações</span>
            </h2>
            <p className="text-slate-400 mt-2 text-xs sm:text-sm font-medium">
              Acompanhe as últimas notícias, guias de sobrevivência e patch notes do Last Asylum.
            </p>
          </div>

          {/* ABAS DE CATEGORIA */}
          <div className="flex flex-wrap gap-2">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => {
                  setSelectedCategory(category);
                  setCarouselIndex(0);
                  setCurrentPage(1);
                }}
                className={`px-3.5 py-1.5 sm:px-4 sm:py-2 rounded-xl text-xs font-bold transition-all border ${
                  selectedCategory === category
                    ? "bg-emerald-500 text-slate-950 border-emerald-500 shadow-[0_0_12px_rgba(16,185,129,0.25)]"
                    : "bg-slate-900/80 text-slate-400 border-slate-800 hover:text-white hover:border-slate-700"
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        </div>

        {/* CAMPO DE PESQUISA */}
        <div className="max-w-md mb-8 relative">
          <input
            type="text"
            placeholder="Buscar artigos por título ou assunto..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full px-4 py-2.5 pl-10 rounded-xl bg-slate-900/90 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition-all shadow-inner"
          />
          <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 text-xs pointer-events-none">
            🔍
          </span>
          {searchTerm && (
            <button
              onClick={() => {
                setSearchTerm("");
                setCurrentPage(1);
              }}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-white"
            >
              ✕
            </button>
          )}
        </div>

        {loading ? (
          <div className="space-y-6">
            <div className="w-full h-[340px] md:h-[240px] rounded-2xl bg-slate-900/40 border border-slate-800 animate-pulse mb-12" />
            <div className="p-6 rounded-2xl bg-[#0e1420]/80 border border-slate-800 space-y-4 animate-pulse">
              <div className="h-24 bg-slate-900/60 rounded-xl" />
              <div className="h-24 bg-slate-900/60 rounded-xl" />
              <div className="h-24 bg-slate-900/60 rounded-xl" />
            </div>
          </div>
        ) : (
          <>
            {/* FEED DE NOTÍCIAS */}
            {displayedNews.length === 0 ? (
              <div className="text-center py-12 bg-slate-900/50 border border-slate-800 rounded-2xl">
                <span className="text-3xl block mb-2">📰</span>
                <h4 className="text-sm font-bold text-white">Nenhum registro encontrado</h4>
                <p className="text-xs text-slate-400">Tente novamente mais tarde ou selecione outra categoria.</p>
              </div>
            ) : (
              <div className="p-6 sm:p-8 rounded-2xl sanctuary-card shadow-2xl divide-y divide-slate-800/60">
                {displayedNews.map((news, idx) => (
                  <React.Fragment key={news.id}>
                    <article
                      className={`flex flex-col md:flex-row gap-5 relative overflow-hidden group ${
                        idx === 0 ? "pb-6" : "py-6"
                      }`}
                    >
                      {/* Imagem Destaque */}
                      {news.image_url ? (
                        <Link 
                          href={news.type === "guia" ? `/guias/${news.slug}` : `/noticias/${news.slug}`}
                          className="w-full md:w-60 aspect-[16/10] shrink-0 rounded-xl overflow-hidden border border-slate-800 relative block bg-slate-900"
                        >
                          <Image 
                            src={news.image_url} 
                            alt={news.title} 
                            fill
                            sizes="(max-width: 768px) 100vw, 240px"
                            className="object-cover group-hover:scale-105 transition-transform duration-500" 
                          />
                        </Link>
                      ) : (
                        <div className="w-full md:w-60 aspect-[16/10] shrink-0 rounded-xl border border-slate-800 bg-slate-900/50 flex flex-col items-center justify-center text-slate-600 font-mono text-[10px] uppercase tracking-wider relative overflow-hidden select-none">
                          <div className="absolute inset-0 bg-gradient-to-tr from-emerald-500/5 via-transparent to-transparent"></div>
                          <span className="text-2xl mb-1.5 block">☣️</span>
                          <span>Sem Imagem</span>
                        </div>
                      )}

                      {/* Conteúdo */}
                      <div className="flex-1 flex flex-col justify-between min-w-0">
                        <div>
                          {/* Tags e Data */}
                          <div className="flex items-center gap-3">
                            <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-semibold border ${news.tagColor}`}>
                              {news.category}
                            </span>
                            <span className="text-[11px] font-mono text-slate-400" suppressHydrationWarning>{news.date}</span>
                            <span className="text-[11px] font-mono text-slate-500">• {news.readTime}</span>
                          </div>

                          {/* Título */}
                          <h3 className="text-base sm:text-lg font-bold text-white group-hover:text-emerald-300 transition-colors leading-snug mt-2.5">
                            <Link href={news.type === "guia" ? `/guias/${news.slug}` : `/noticias/${news.slug}`}>
                              {news.title}
                            </Link>
                          </h3>

                          {/* Resumo/Primeiros parágrafos */}
                          <p className="text-xs sm:text-sm text-slate-400 mt-2.5 leading-relaxed">
                            {getCleanPreview(news.content, news.summary)}
                          </p>
                        </div>

                        {/* Link de Ler Mais */}
                        <div className="pt-4 mt-4 border-t border-slate-800/80 flex items-center justify-end">
                          <Link
                            href={news.type === "guia" ? `/guias/${news.slug}` : `/noticias/${news.slug}`}
                            className="text-xs font-bold text-emerald-400 group-hover:translate-x-0.5 transition-transform flex items-center gap-1 hover:underline"
                          >
                            <span>Leia mais</span>
                            <span>→</span>
                          </Link>
                        </div>
                      </div>
                    </article>

                    {/* ESPAÇO PUBLICITÁRIO GOOGLE ADSENSE NO FEED (Após o 3º artigo) */}
                    {idx === 2 && (
                      <div className="py-6">
                        <AdBanner slot="default" format="fluid" />
                      </div>
                    )}
                  </React.Fragment>
                ))}
              </div>
            )}

            {/* CONTROLES DE PAGINAÇÃO */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-4 mt-12 pt-6 border-t border-slate-900/60">
                <button
                  onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                  className="px-4 py-2 rounded-xl text-xs font-bold border border-slate-800 bg-slate-900/80 text-slate-300 hover:text-white disabled:opacity-40 disabled:hover:text-slate-300 transition-all flex items-center gap-1 cursor-pointer"
                >
                  ← Anterior
                </button>
                
                <span className="text-xs font-mono text-slate-400">
                  Página <strong className="text-white">{currentPage}</strong> de <strong className="text-white">{totalPages}</strong>
                </span>

                <button
                  onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
                  disabled={currentPage === totalPages}
                  className="px-4 py-2 rounded-xl text-xs font-bold border border-slate-800 bg-slate-900/80 text-slate-300 hover:text-white disabled:opacity-40 disabled:hover:text-slate-300 transition-all flex items-center gap-1 cursor-pointer"
                >
                  Próxima →
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </section>
  );
}
