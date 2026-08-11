"use client";

import { useState, useEffect, Suspense } from "react";
import Image from "next/image";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { isSupabaseConfigured } from "@/lib/supabase";

interface NewsItem {
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

function NoticiasContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const activeSlug = searchParams.get("slug");

  // Se houver um slug antigo via query param (?slug=...), redireciona para a nova rota amigável /noticias/slug
  useEffect(() => {
    if (activeSlug) {
      router.replace(`/noticias/${activeSlug}`);
    }
  }, [activeSlug, router]);

  const [news, setNews] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Carrega a lista completa de notícias
  useEffect(() => {
    const fetchNews = async () => {
      try {
        if (isSupabaseConfigured) {
          const { supabase } = await import("@/lib/supabase");
          const { data, error } = await supabase
            .from("articles")
            .select("*")
            .eq("type", "noticia")
            .eq("status", "public")
            .order("created_at", { ascending: false });

          if (data) {
            const published = data.filter((item: any) =>
              !item.scheduled_at || new Date(item.scheduled_at).getTime() <= Date.now()
            );

            setNews(
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
                category: item.category || "Atualizações",
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
                item.type === "noticia" &&
                item.status === "public" &&
                (!item.scheduled_at || new Date(item.scheduled_at).getTime() <= Date.now())
            );
            setNews(
              published.map((item) => ({
                id: item.id || Math.random().toString(),
                title: item.title,
                summary: item.summary,
                slug: item.slug,
                date: "Recentemente",
                readTime: "3 min de leitura",
                category: item.category || "Atualizações",
                isFeatured: item.is_featured || false,
                image_url: item.image_url,
              }))
            );
          }
        }
      } catch (err) {
        console.error("Erro ao carregar notícias:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchNews();
  }, []);

  // Se estiver redirecionando, exibe loader
  if (activeSlug) {
    return (
      <div className="flex justify-center items-center py-20">
        <div className="w-12 h-12 border-4 border-[#00ff88] border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <>
      <div className="text-center max-w-3xl mx-auto mb-12">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-900/90 border border-[#00ff88]/30 text-xs font-semibold text-[#00ff88] mb-4">
          <span>📢 Comunicados & Notas de Atualização</span>
        </div>
        <h1 className="text-3xl sm:text-5xl font-extrabold text-white drop-shadow-md">
          Notícias & <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#00ff88] to-emerald-400">Updates</span>
        </h1>
        <p className="mt-3 text-slate-300 drop-shadow-sm font-medium">
          Fique por dentro das novidades, eventos do jogo e patches semanais do Last Asylum.
        </p>
      </div>

      {loading ? (
        <div className="flex justify-center items-center py-20">
          <div className="w-12 h-12 border-4 border-[#00ff88] border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : news.length === 0 ? (
        <div className="bg-[#101623]/95 border border-slate-800 rounded-3xl p-8 backdrop-blur-xl text-center space-y-4 shadow-2xl">
          <span className="text-4xl block">📰</span>
          <h3 className="text-xl font-bold text-white">Central de Updates em Breve</h3>
          <p className="text-sm text-slate-400 max-w-md mx-auto">
            Nenhuma notícia ou patch note foi publicado no momento. Fique de olho!
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {news.map((item) => (
            <article
              key={item.id}
              className="flex flex-col justify-between rounded-2xl bg-[#101623]/80 border border-slate-800 hover:border-[#00ff88]/30 transition-all duration-300 group hover:-translate-y-1 shadow-lg backdrop-blur-md overflow-hidden"
            >
              {/* Imagem no topo do card */}
              {item.image_url && (
                <div className="aspect-[16/9] w-full overflow-hidden border-b border-slate-850">
                  <img src={item.image_url} alt={item.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                </div>
              )}

              <div className="p-6 flex flex-col justify-between flex-1">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="px-3 py-1 rounded-full text-[11px] font-semibold bg-[#00ff88]/10 text-[#00ff88] border border-[#00ff88]/20">
                      {item.category}
                    </span>
                    <span className="text-[11px] font-mono text-slate-400">{item.date}</span>
                  </div>

                  <h3 className="text-lg font-bold text-white group-hover:text-[#00ff88] transition-colors leading-snug">
                    {item.title}
                  </h3>

                  <p className="text-xs sm:text-sm text-slate-400 line-clamp-3 leading-relaxed">
                    {item.summary}
                  </p>
                </div>

                <div className="pt-6 border-t border-slate-800/80 mt-6 flex items-center justify-between">
                  <span className="text-xs font-mono text-slate-500">{item.readTime}</span>
                  <Link
                    href={`/noticias/${item.slug}`}
                    className="text-xs font-bold text-[#00ff88] group-hover:translate-x-1 transition-transform flex items-center gap-1"
                  >
                    <span>Ler matéria</span>
                    <span>→</span>
                  </Link>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
    </>
  );
}

export default function NoticiasPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#080c14] flex items-center justify-center"><div className="w-12 h-12 border-4 border-[#00ff88] border-t-transparent rounded-full animate-spin"></div></div>}>
      <div className="relative min-h-screen flex flex-col bg-[#080c14] text-slate-100 selection:bg-[#00ff88] selection:text-slate-950 overflow-x-hidden">
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
            <NoticiasContent />
          </main>
          <Footer />
        </div>
      </div>
    </Suspense>
  );
}
