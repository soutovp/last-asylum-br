"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
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
}

const getCategoryStyles = (category: string) => {
  switch (category) {
    case "Eventos":
      return "bg-amber-500/20 text-amber-400 border-amber-500/30";
    case "Atualizações":
      return "bg-[#00ff88]/20 text-[#00ff88] border-[#00ff88]/30";
    case "Guias":
      return "bg-cyan-500/20 text-cyan-400 border-cyan-500/30";
    case "Manutenção":
      return "bg-purple-500/20 text-purple-400 border-purple-500/30";
    default:
      return "bg-slate-500/20 text-slate-400 border-slate-500/30";
  }
};

interface NewsSectionProps {
  initialArticles?: any[];
}

export default function NewsSection({ initialArticles = [] }: NewsSectionProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>("Todos");
  
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
    }));
  };

  const [newsList, setNewsList] = useState<NewsItem[]>(() => formatArticles(initialArticles));
  const [loading, setLoading] = useState(initialArticles.length === 0);
  const [carouselIndex, setCarouselIndex] = useState(0);

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

  // Lista normal de artigos (filtrando a categoria selecionada)
  const filteredNews = newsList.filter((news) => {
    if (selectedCategory === "Todos") return true;
    return news.category === selectedCategory;
  });

  // Limitamos os cards da página inicial a no máximo 6 itens mais recentes
  const displayedNews = filteredNews.slice(0, 6);

  // Auto-play do Carrossel de Destaques
  useEffect(() => {
    if (featuredItems.length <= 1) return;
    const interval = setInterval(() => {
      setCarouselIndex((prev) => (prev + 1) % featuredItems.length);
    }, 6000);
    return () => clearInterval(interval);
  }, [featuredItems.length]);

  return (
    <section id="noticias" className="py-24 relative overflow-hidden bg-slate-950/20">
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#101623]/25 to-transparent"></div>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* TÍTULO DA SEÇÃO */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
          <div>
            <h2 className="text-3xl sm:text-5xl font-black text-white tracking-tight">
              Central de <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#00ff88] to-cyan-400">Atualizações</span>
            </h2>
            <p className="text-slate-400 mt-2 text-sm sm:text-base font-medium">
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
                }}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all border ${
                  selectedCategory === category
                    ? "bg-[#00ff88] text-slate-950 border-[#00ff88] shadow-[0_0_15px_rgba(0,255,136,0.3)]"
                    : "bg-slate-900/80 text-slate-400 border-slate-800 hover:text-white"
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center items-center py-20">
            <div className="w-12 h-12 border-4 border-[#00ff88] border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : (
          <>
            {/* CARROSSEL DE DESTAQUES (Se houver artigos destacados e aba "Todos" ativa) */}
            {featuredItems.length > 0 && selectedCategory === "Todos" && (
              <div className="relative mb-12 group rounded-3xl overflow-hidden bg-gradient-to-br from-[#101623] via-[#101623]/80 to-slate-950 border border-[#00ff88]/30 shadow-[0_20px_50px_rgba(0,0,0,0.7)] hover:border-[#00ff88]/60 transition-all duration-300">
                
                {/* SLIDE CORRENTE */}
                {featuredItems.map((item, idx) => {
                  if (idx !== carouselIndex) return null;
                  return (
                    <div key={item.id} className="p-8 sm:p-12 flex flex-col md:flex-row gap-8 items-center animate-in fade-in duration-300">
                      
                      {/* IMAGEM DO DESTAQUE (Com fallback) */}
                      <Link 
                        href={item.type === "guia" ? `/guias/${item.slug}` : `/noticias/${item.slug}`}
                        className="w-full md:w-1/2 aspect-[16/9] rounded-2xl bg-slate-900 border border-slate-800 relative overflow-hidden flex items-center justify-center block"
                      >
                        {item.image_url ? (
                          <Image 
                            src={item.image_url} 
                            alt={item.title} 
                            fill
                            sizes="(max-width: 768px) 100vw, 50vw"
                            className="object-cover" 
                          />
                        ) : (
                          <>
                            <div className="absolute inset-0 bg-gradient-to-tr from-[#00ff88]/10 via-transparent to-amber-500/10"></div>
                            <div className="relative z-10 text-center">
                              <span className="text-4xl sm:text-6xl mb-3 block">☣️</span>
                              <span className="text-xs font-mono uppercase tracking-widest text-[#00ff88] font-bold">
                                Destaque do Canal
                              </span>
                              <h4 className="text-lg font-bold text-white mt-1 px-4">
                                {item.title}
                              </h4>
                            </div>
                          </>
                        )}
                      </Link>

                      {/* DETALHES DO DESTAQUE */}
                      <div className="w-full md:w-1/2 space-y-4">
                        <div className="flex items-center gap-3">
                          <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${item.tagColor}`}>
                            {item.category}
                          </span>
                          <span className="text-xs font-mono text-slate-400" suppressHydrationWarning>{item.date}</span>
                          <span className="text-xs font-mono text-slate-500">• {item.readTime}</span>
                        </div>

                         <h3 className="text-2xl sm:text-3xl font-extrabold text-white group-hover:text-[#00ff88] transition-colors leading-tight">
                          <Link href={item.type === "guia" ? `/guias/${item.slug}` : `/noticias/${item.slug}`}>
                            {item.title}
                          </Link>
                        </h3>

                        <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
                          {item.summary}
                        </p>

                        <div className="pt-2">
                          <Link
                            href={item.type === "guia" ? `/guias/${item.slug}` : `/noticias/${item.slug}`}
                            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-[#00ff88] text-slate-950 font-bold text-sm shadow-[0_0_20px_rgba(0,255,136,0.3)] hover:bg-[#15ff96] transition-all transform hover:-translate-y-0.5"
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
                          className={`w-2.5 h-2.5 rounded-full transition-all ${
                            carouselIndex === dotIdx ? "bg-[#00ff88] scale-110" : "bg-slate-700 hover:bg-slate-600"
                          }`}
                        />
                      ))}
                    </div>

                    {/* Seta Esquerda */}
                    <button
                      onClick={() => setCarouselIndex((prev) => (prev - 1 + featuredItems.length) % featuredItems.length)}
                      aria-label="Matéria anterior"
                      className="absolute left-4 top-1/2 transform -translate-y-1/2 w-9 h-9 rounded-full bg-slate-900/80 hover:bg-[#00ff88] hover:text-slate-950 border border-slate-800 flex items-center justify-center text-white text-sm transition-all opacity-0 group-hover:opacity-100 z-20"
                    >
                      ◀
                    </button>

                    {/* Seta Direita */}
                    <button
                      onClick={() => setCarouselIndex((prev) => (prev + 1) % featuredItems.length)}
                      aria-label="Próxima matéria"
                      className="absolute right-4 top-1/2 transform -translate-y-1/2 w-9 h-9 rounded-full bg-slate-900/80 hover:bg-[#00ff88] hover:text-slate-950 border border-slate-800 flex items-center justify-center text-white text-sm transition-all opacity-0 group-hover:opacity-100 z-20"
                    >
                      ▶
                    </button>
                  </>
                )}

              </div>
            )}

            {/* GRID DE NOTÍCIAS (Limitado a 6 itens) */}
            {displayedNews.length === 0 ? (
              <div className="text-center py-12 bg-slate-900/50 border border-slate-800 rounded-2xl">
                <span className="text-3xl block mb-2">📰</span>
                <h4 className="text-sm font-bold text-white">Nenhuma notícia encontrada</h4>
                <p className="text-xs text-slate-400">Tente novamente mais tarde ou selecione outra categoria.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {displayedNews.map((news) => (
                  <article
                    key={news.id}
                    className="flex flex-col justify-between rounded-2xl bg-[#101623]/80 border border-slate-800/90 hover:border-[#00ff88]/40 transition-all duration-300 group hover:-translate-y-1 shadow-lg overflow-hidden"
                  >
                    
                    {/* Imagem Destaque no topo do card */}
                    {news.image_url && (
                      <Link 
                        href={news.type === "guia" ? `/guias/${news.slug}` : `/noticias/${news.slug}`}
                        className="aspect-[16/9] w-full overflow-hidden border-b border-slate-850 relative block"
                      >
                        <Image 
                          src={news.image_url} 
                          alt={news.title} 
                          fill
                          sizes="(max-width: 768px) 100vw, 33vw"
                          className="object-cover group-hover:scale-105 transition-transform duration-500" 
                        />
                      </Link>
                    )}

                    <div className="p-6 flex flex-col justify-between flex-1">
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <span className={`px-3 py-1 rounded-full text-[11px] font-semibold border ${news.tagColor}`}>
                            {news.category}
                          </span>
                          <span className="text-[11px] font-mono text-slate-400" suppressHydrationWarning>{news.date}</span>
                        </div>

                        <h3 className="text-lg font-bold text-white group-hover:text-[#00ff88] transition-colors leading-snug">
                          <Link href={news.type === "guia" ? `/guias/${news.slug}` : `/noticias/${news.slug}`}>
                            {news.title}
                          </Link>
                        </h3>

                        <p className="text-xs sm:text-sm text-slate-400 line-clamp-3 leading-relaxed">
                          {news.summary}
                        </p>
                      </div>

                      <div className="pt-6 border-t border-slate-800/80 mt-6 flex items-center justify-between">
                        <span className="text-xs font-mono text-slate-500">{news.readTime}</span>
                        <Link
                          href={news.type === "guia" ? `/guias/${news.slug}` : `/noticias/${news.slug}`}
                          className="text-xs font-bold text-[#00ff88] group-hover:translate-x-1 transition-transform flex items-center gap-1"
                        >
                          <span>Leia mais</span>
                          <span>→</span>
                        </Link>
                      </div>
                    </div>

                  </article>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </section>
  );
}
