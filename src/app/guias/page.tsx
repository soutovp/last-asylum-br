"use client";

import { useState, useEffect, Suspense } from "react";
import Image from "next/image";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { isSupabaseConfigured } from "@/lib/supabase";

interface GuideItem {
  id: string;
  title: string;
  summary: string;
  slug: string;
  date: string;
  readTime: string;
  category: string;
  isFeatured: boolean;
  image_url?: string;
}

const ITEMS_PER_PAGE = 20;

function GuiasContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const activeSlug = searchParams.get("slug");

  // Se houver um slug antigo via query param (?slug=...), redireciona para a nova rota amigável /guias/slug
  useEffect(() => {
    if (activeSlug) {
      router.replace(`/guias/${activeSlug}`);
    }
  }, [activeSlug, router]);

  const [guides, setGuides] = useState<GuideItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Estados do Carrossel de Destaques
  const [carouselIndex, setCarouselIndex] = useState(0);

  // Estados de Paginação
  const [currentPage, setCurrentPage] = useState(1);

  // Carrega a lista completa de guias
  useEffect(() => {
    const fetchGuides = async () => {
      try {
        if (isSupabaseConfigured) {
          const { supabase } = await import("@/lib/supabase");
          const { data, error } = await supabase
            .from("articles")
            .select("*")
            .eq("type", "guia")
            .eq("status", "public")
            .order("created_at", { ascending: false });

          if (data) {
            const published = data.filter((item: any) =>
              !item.scheduled_at || new Date(item.scheduled_at).getTime() <= Date.now()
            );

            setGuides(
              published.map((item: any) => ({
                id: item.id,
                title: item.title,
                summary: item.summary,
                slug: item.slug,
                date: new Date(item.created_at).toLocaleDateString("pt-BR", {
                  day: "2-digit",
                  month: "long",
                  year: "numeric",
                }),
                readTime: `${Math.max(2, Math.ceil((item.content || "").length / 800))} min de leitura`,
                category: item.category || "Guias",
                isFeatured: item.is_featured || false,
                image_url: item.image_url,
              }))
            );
          }
        } else {
          // Fallback Local Storage
          const stored = localStorage.getItem("local_articles");
          if (stored) {
            const list = JSON.parse(stored) as any[];
            const published = list.filter(
              (item) =>
                item.type === "guia" &&
                item.status === "public" &&
                (!item.scheduled_at || new Date(item.scheduled_at).getTime() <= Date.now())
            );
            setGuides(
              published.map((item) => ({
                id: item.id || Math.random().toString(),
                title: item.title,
                summary: item.summary,
                slug: item.slug,
                date: "Hoje",
                readTime: "5 min de leitura",
                category: item.category || "Guias",
                isFeatured: item.is_featured || false,
                image_url: item.image_url,
              }))
            );
          }
        }
      } catch (err) {
        console.error("Erro ao carregar guias:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchGuides();
  }, []);

  const [searchTerm, setSearchTerm] = useState("");

  // Filtros de guias em destaque
  const featuredGuides = guides.filter((g) => g.isFeatured);

  // Rotação automática do carrossel de destaques (a cada 6 segundos)
  useEffect(() => {
    if (featuredGuides.length <= 1) return;
    const interval = setInterval(() => {
      setCarouselIndex((prev) => (prev + 1) % featuredGuides.length);
    }, 6000);
    return () => clearInterval(interval);
  }, [featuredGuides.length]);

  // Filtragem por busca
  const filteredGuides = guides.filter((g) => {
    if (!searchTerm.trim()) return true;
    const term = searchTerm.toLowerCase();
    return (
      g.title.toLowerCase().includes(term) ||
      g.summary.toLowerCase().includes(term) ||
      g.category.toLowerCase().includes(term)
    );
  });

  // Paginação aplicada sobre a lista filtrada
  const totalPages = Math.ceil(filteredGuides.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const currentGuidesList = filteredGuides.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Se estiver redirecionando, exibe skeleton suave
  if (activeSlug) {
    return (
      <div className="max-w-4xl mx-auto py-12 px-4 animate-pulse">
        <div className="h-80 rounded-3xl bg-slate-900/50 border border-slate-800" />
      </div>
    );
  }

  return (
    <>
      {/* CARROSSEL DE DESTAQUES (Renderizado acima do título) */}
      {!loading && featuredGuides.length > 0 && !searchTerm && (
        <div className="relative group mb-12 overflow-hidden rounded-3xl border border-slate-850 bg-[#0c101b] shadow-2xl min-h-[340px] md:min-h-[260px] md:h-[260px] w-full">
          {featuredGuides.map((guide, idx) => {
            const isActive = idx === carouselIndex;
            return (
              <div
                key={guide.id}
                className={`absolute inset-0 flex flex-col md:flex-row justify-between transition-opacity duration-500 ease-in-out ${
                  isActive ? "opacity-100 z-10" : "opacity-0 pointer-events-none z-0"
                }`}
              >
                {/* Imagem do destaque */}
                {guide.image_url && (
                  <div className="w-full md:w-3/5 h-2/5 md:h-full relative overflow-hidden shrink-0">
                    <div className="absolute inset-0 bg-gradient-to-t md:bg-gradient-to-r from-slate-950 via-transparent to-transparent z-10" />
                    <Image
                      src={guide.image_url}
                      alt={guide.title}
                      fill
                      priority={idx === 0}
                      sizes="(max-width: 1024px) 100vw, 60vw"
                      className="object-cover object-center"
                    />
                  </div>
                )}

                {/* Texto do destaque */}
                <div className="flex-1 p-5 md:p-7 flex flex-col justify-center gap-3 z-20">
                  <div className="flex items-center gap-3 shrink-0">
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-cyan-500/10 text-cyan-400 border border-cyan-500/30">
                      {guide.category}
                    </span>
                    <span className="text-xs font-mono text-slate-400" suppressHydrationWarning>{guide.date}</span>
                    <span className="text-xs font-mono text-cyan-400">★ Destaque</span>
                  </div>

                  <h3 className="text-base sm:text-lg md:text-2xl font-black text-white hover:text-cyan-400 transition-colors leading-tight line-clamp-2">
                    <Link href={`/guias/${guide.slug}`}>
                      {guide.title}
                    </Link>
                  </h3>

                  <p className="text-xs sm:text-sm text-slate-300 leading-relaxed line-clamp-2 md:line-clamp-3">
                    {guide.summary}
                  </p>

                  <div className="pt-1.5 shrink-0">
                    <Link
                      href={`/guias/${guide.slug}`}
                      className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-cyan-400 text-slate-950 font-bold text-xs sm:text-sm shadow-[0_0_20px_rgba(34,211,238,0.3)] hover:bg-cyan-300 transition-all transform hover:-translate-y-0.5"
                    >
                      <span>Ler Guia Completo</span>
                      <span>→</span>
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}

          {/* CONTROLES DO CARROSSEL */}
          {featuredGuides.length > 1 && (
            <>
              {/* Indicadores (Dots) */}
              <div className="absolute top-3 right-3 md:top-auto md:right-auto md:bottom-4 md:left-1/2 md:-translate-x-1/2 flex items-center gap-1.5 z-30 bg-slate-950/70 backdrop-blur-md px-2.5 py-1.5 rounded-full border border-slate-800/80 shadow-lg w-fit">
                {featuredGuides.map((_, dotIdx) => (
                  <button
                    key={dotIdx}
                    onClick={() => setCarouselIndex(dotIdx)}
                    aria-label={`Ver guia em destaque ${dotIdx + 1}`}
                    className={`w-2 h-2 rounded-full transition-all cursor-pointer ${
                      carouselIndex === dotIdx ? "bg-cyan-400 scale-125 w-4" : "bg-slate-600 hover:bg-slate-400"
                    }`}
                  />
                ))}
              </div>

              {/* Seta Esquerda */}
              <button
                onClick={() => setCarouselIndex((prev) => (prev - 1 + featuredGuides.length) % featuredGuides.length)}
                aria-label="Guia anterior"
                className="absolute left-3 top-1/2 transform -translate-y-1/2 w-8 h-8 rounded-full bg-slate-900/80 border border-slate-800 flex items-center justify-center text-white text-xs opacity-0 group-hover:opacity-100 transition-opacity hover:border-cyan-400 z-20"
              >
                ◀
              </button>

              {/* Seta Direita */}
              <button
                onClick={() => setCarouselIndex((prev) => (prev + 1) % featuredGuides.length)}
                aria-label="Próximo guia"
                className="absolute right-3 top-1/2 transform -translate-y-1/2 w-8 h-8 rounded-full bg-slate-900/80 border border-slate-800 flex items-center justify-center text-white text-xs opacity-0 group-hover:opacity-100 transition-opacity hover:border-cyan-400 z-20"
              >
                ▶
              </button>
            </>
          )}
        </div>
      )}

      {/* CABEÇALHO DA PÁGINA */}
      <div className="text-center max-w-3xl mx-auto mb-10">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-900/90 border border-cyan-500/30 text-xs font-semibold text-cyan-400 mb-4">
          <span>📚 Base de Conhecimento</span>
        </div>
        <h1 className="text-3xl sm:text-5xl font-extrabold text-white drop-shadow-md">
          Guias & <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-cyan-200">Tutoriais</span>
        </h1>
        <p className="mt-3 text-slate-300 drop-shadow-sm font-medium">
          Aprenda estratégias de evolução rápida, defesa de base e otimização de recursos no Last Asylum.
        </p>
      </div>

      {/* CAMPO DE PESQUISA */}
      <div className="max-w-md mx-auto mb-10 relative">
        <input
          type="text"
          placeholder="Buscar guias ou estratégias..."
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value);
            setCurrentPage(1);
          }}
          className="w-full px-4 py-3 pl-11 rounded-2xl bg-slate-900/90 border border-slate-800 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 transition-all shadow-inner"
        />
        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 text-sm pointer-events-none">
          🔍
        </span>
        {searchTerm && (
          <button
            onClick={() => {
              setSearchTerm("");
              setCurrentPage(1);
            }}
            className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-white"
          >
            ✕
          </button>
        )}
      </div>

      {loading ? (
        <div className="space-y-6 animate-pulse">
          <div className="h-60 rounded-3xl bg-slate-900/50 border border-slate-800" />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="h-64 rounded-2xl bg-slate-900/50 border border-slate-800" />
            <div className="h-64 rounded-2xl bg-slate-900/50 border border-slate-800" />
            <div className="h-64 rounded-2xl bg-slate-900/50 border border-slate-800" />
          </div>
        </div>
      ) : filteredGuides.length === 0 ? (
        <div className="bg-[#101623]/95 border border-slate-800 rounded-3xl p-8 backdrop-blur-xl text-center space-y-4 shadow-2xl">
          <span className="text-4xl block">📖</span>
          <h3 className="text-xl font-bold text-white">
            {searchTerm ? "Nenhum guia encontrado" : "Central de Guias em Breve"}
          </h3>
          <p className="text-sm text-slate-400 max-w-md mx-auto">
            {searchTerm
              ? `Não encontramos guias correspondentes a "${searchTerm}". Tente outros termos.`
              : "Nenhum guia foi publicado no momento. Fique atento às atualizações do painel!"}
          </p>
        </div>
      ) : (
        <div className="space-y-12">
          {/* LISTA GERAL DE GUIAS (PAGINADA) */}
          <div className="space-y-6">
            <h3 className="text-xl font-bold text-white border-l-4 border-cyan-400 pl-3">Todos os Guias & Tutoriais</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {currentGuidesList.map((guide) => (
                <article
                  key={guide.id}
                  className="flex flex-col justify-between rounded-2xl bg-[#101623]/80 border border-slate-800 hover:border-cyan-400/30 transition-all duration-300 group hover:-translate-y-1 shadow-lg backdrop-blur-md overflow-hidden"
                >
                  {/* Imagem no topo do card fora dos destaques */}
                  {guide.image_url && (
                    <div className="aspect-[16/9] w-full overflow-hidden border-b border-slate-850">
                      <img src={guide.image_url} alt={guide.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    </div>
                  )}

                  <div className="p-6 flex flex-col justify-between flex-1">
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="px-3 py-1 rounded-full text-[11px] font-semibold bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                          {guide.category}
                        </span>
                        <span className="text-[11px] font-mono text-slate-400">{guide.date}</span>
                      </div>

                      <h3 className="text-lg font-bold text-white group-hover:text-cyan-400 transition-colors leading-snug">
                        {guide.title}
                      </h3>

                      <p className="text-xs sm:text-sm text-slate-400 line-clamp-3 leading-relaxed">
                        {guide.summary}
                      </p>
                    </div>

                    <div className="pt-6 border-t border-slate-800/80 mt-6 flex items-center justify-between">
                      <span className="text-xs font-mono text-slate-500">{guide.readTime}</span>
                      <Link
                        href={`/guias/${guide.slug}`}
                        className="text-xs font-bold text-cyan-400 group-hover:translate-x-1 transition-transform flex items-center gap-1"
                      >
                        <span>Estudar guia</span>
                        <span>→</span>
                      </Link>
                    </div>
                  </div>

                </article>
              ))}
            </div>

            {/* CONTROLES DE PAGINAÇÃO */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 pt-8 border-t border-slate-900/60 mt-10">
                <button
                  onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                  className="px-4 py-2 rounded-xl text-xs font-bold bg-slate-900 text-slate-400 hover:text-white border border-slate-800 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  ◀ Anterior
                </button>
                
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                  <button
                    key={page}
                    onClick={() => handlePageChange(page)}
                    className={`w-9 h-9 rounded-xl text-xs font-bold border transition-all ${
                      currentPage === page
                        ? "bg-cyan-400 text-slate-950 border-cyan-400 shadow-[0_0_12px_rgba(34,211,238,0.3)]"
                        : "bg-slate-900 text-slate-400 border-slate-800 hover:text-white"
                    }`}
                  >
                    {page}
                  </button>
                ))}

                <button
                  onClick={() => handlePageChange(Math.min(totalPages, currentPage + 1))}
                  disabled={currentPage === totalPages}
                  className="px-4 py-2 rounded-xl text-xs font-bold bg-slate-900 text-slate-400 hover:text-white border border-slate-800 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Próxima ▶
                </button>
              </div>
            )}

          </div>
        </div>
      )}
    </>
  );
}

export default function GuiasPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#080c14] flex items-center justify-center"><div className="w-12 h-12 border-4 border-cyan-400 border-t-transparent rounded-full animate-spin"></div></div>}>
      <div className="relative min-h-screen flex flex-col bg-[#080c14] text-slate-100 selection:bg-cyan-400 selection:text-slate-950 overflow-x-hidden">
        {/* BACKGROUND VILA */}
        <div className="fixed inset-0 z-0 pointer-events-none">
          <Image
            src="/images/village_banner_2.png"
            alt="Visão Ilustrada Oficial da Vila de Last Asylum Plague"
            fill
            priority
            sizes="100vw"
            className="object-cover object-center opacity-85 scale-105"
          />
          <div className="absolute inset-0 bg-[#080c14]/30 backdrop-blur-[1px]"></div>
          <div className="absolute inset-0 bg-gradient-to-b from-[#080c14]/75 via-[#080c14]/65 to-[#080c14]/85"></div>
        </div>

        <div className="relative z-10 flex flex-col min-h-screen">
          <Header />
          <main className="flex-1 py-12 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
            <GuiasContent />
          </main>
          <Footer />
        </div>
      </div>
    </Suspense>
  );
}
