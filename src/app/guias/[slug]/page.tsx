import { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { supabase } from "@/lib/supabase";
import { createClient } from "@supabase/supabase-js";
import { ROLES_REGISTRY } from "@/lib/permissions";
import { UserRole } from "@/lib/permissions";
import ViewCounterTrigger from "@/components/ViewCounterTrigger";
import AdInitializer from "@/components/AdInitializer";
import CommentsSection from "@/components/CommentsSection";

function getSupabaseServerClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (supabaseUrl && serviceRoleKey) {
    return createClient(supabaseUrl, serviceRoleKey, {
      auth: { persistSession: false, autoRefreshToken: false },
    });
  }
  return supabase;
}

// Métodos de geração de Metadados em tempo de execução
export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  try {
    const { data: article } = await supabase
      .from("articles")
      .select("title, summary, seo_title, seo_description, image_url")
      .eq("slug", slug)
      .single();

    if (!article) return { title: "Guia Não Encontrado - Last Asylum BR" };

    return {
      title: `${article.seo_title || article.title} - Last Asylum BR`,
      description: article.seo_description || article.summary,
      openGraph: {
        title: article.seo_title || article.title,
        description: article.seo_description || article.summary,
        images: [
          {
            url: article.image_url || "https://res.cloudinary.com/orrs3pvy/image/upload/v1786313785/preview-link-url_rcc5uk.webp"
          }
        ],
        type: "article",
      },
    };
  } catch (err) {
    return { title: "Last Asylum BR" };
  }
}

export default async function GuiaDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  
  // Busca o artigo no banco junto com o perfil do autor
  const serverClient = getSupabaseServerClient();
  const { data: article } = await serverClient
    .from("articles")
    .select("*, profiles:profiles!fk_articles_author_email (first_name, last_name, role, avatar_url)")
    .eq("slug", slug)
    .eq("type", "guia")
    .single();

  if (!article) {
    return (
      <div className="relative min-h-screen flex flex-col bg-[#080c14] text-slate-100 overflow-x-hidden">
        <Header />
        <main className="flex-1 py-12 max-w-4xl mx-auto px-4 w-full flex items-center justify-center relative z-10">
          <div className="bg-[#101623]/95 border border-slate-800 rounded-3xl p-12 text-center space-y-4 shadow-2xl backdrop-blur-xl w-full">
            <span className="text-4xl block">🔍</span>
            <h3 className="text-xl font-bold text-white">Guia Não Encontrado</h3>
            <p className="text-sm text-slate-400 max-w-md mx-auto">
              O guia solicitado não existe ou foi removido.
            </p>
            <div className="pt-2">
              <Link href="/guias" className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-white">
                ← Voltar para Guias
              </Link>
            </div>
          </div>
        </main>
      </div>
    );
  }

  // Busca dados do autor
  let authorName = "Fernando Souto";
  let authorRole = "Administrador";
  let authorAvatar = "/images/avatar-default.svg";

  if (article.profiles) {
    const profile = article.profiles as any;
    authorName = `${profile.first_name} ${profile.last_name}`;
    authorRole = ROLES_REGISTRY[profile.role as UserRole]?.name || "Administrador";
    if (profile.avatar_url && !profile.avatar_url.includes("lastasylumplague.com")) {
      authorAvatar = profile.avatar_url;
    }
  }

  const formattedDate = new Date(article.created_at).toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });

  // Lógica para injetar o anúncio In-Article após a primeira <section> (ou parágrafo em caso de fallback)
  const injectAdIntoContent = (content: string) => {
    if (!content) return "";
    const sections = content.split("</section>");
    
    if (sections.length <= 1) {
      // Fallback: se não houver tags de section no HTML, injeta após o segundo parágrafo
      const paragraphs = content.split("</p>");
      if (paragraphs.length <= 2) return content;
      const adMarker = `
        </p>
        <div id="in-article-ad" class="my-6 border border-dashed border-slate-700/60 rounded-2xl p-4 bg-slate-900/30 min-h-[150px] flex flex-col items-center justify-center">
          <span class="text-[10px] font-mono text-slate-500 mb-2 uppercase tracking-wider block">Publicidade (Google AdSense)</span>
          <ins class="adsbygoogle"
               style="display:block; text-align:center; min-height:100px; width:100%;"
               data-ad-layout="in-article"
               data-ad-format="fluid"
               data-ad-client="ca-pub-8887540917989782"
               data-ad-slot="default"></ins>
        </div>
      `;
      paragraphs[1] = paragraphs[1] + adMarker;
      return paragraphs.join("</p>");
    }

    // Injeta o anúncio logo após o fechamento da primeira </section> (fora dela)
    const adMarker = `
      </section>
      <div id="in-article-ad" class="my-6 border border-dashed border-slate-700/60 rounded-2xl p-4 bg-slate-900/30 min-h-[150px] flex flex-col items-center justify-center">
        <span class="text-[10px] font-mono text-slate-500 mb-2 uppercase tracking-wider block">Publicidade (Google AdSense)</span>
        <ins class="adsbygoogle"
             style="display:block; text-align:center; min-height:100px; width:100%;"
             data-ad-layout="in-article"
             data-ad-format="fluid"
             data-ad-client="ca-pub-8887540917989782"
             data-ad-slot="default"></ins>
      </div>
    `;
    sections[0] = sections[0] + adMarker;
    return sections.join("</section>");
  };

  const processedContent = injectAdIntoContent(article.content || "");

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
          className="object-cover object-center opacity-85 scale-105"
        />
        <div className="absolute inset-0 bg-[#080c14]/30 backdrop-blur-[1px]"></div>
        <div className="absolute inset-0 bg-gradient-to-b from-[#080c14]/75 via-transparent to-[#080c14]/85"></div>
      </div>

      <div className="relative z-10 flex flex-col min-h-screen">
        <Header />
        <main className="flex-1 py-12 max-w-4xl mx-auto px-4 w-full">
          <article className="bg-[#101623]/95 border border-slate-800 rounded-3xl p-6 sm:p-10 backdrop-blur-xl shadow-2xl space-y-8">
            <header className="space-y-6">
              {/* Breadcrumb e Badge */}
              <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800/80 pb-5">
                <Link href="/guias" className="text-xs font-mono font-bold text-cyan-400 hover:text-cyan-300 transition-colors flex items-center gap-1.5">
                  <span>←</span> <span>Base de Guias</span>
                </Link>
                <div className="flex items-center gap-3">
                  <span className="px-3 py-1 rounded-full text-xs font-semibold bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                    {article.category || "Guias"}
                  </span>
                  <span className="text-xs font-mono text-slate-400">
                    Publicado em <time dateTime={article.created_at.slice(0, 10)}>{formattedDate}</time>
                  </span>
                  <span className="text-xs font-mono text-slate-500 flex items-center gap-1.5">
                    <span>👁️</span> <span>{article.views || 0} visualizações</span>
                  </span>
                </div>
              </div>

              {/* Título & Resumo */}
              <div className="space-y-4">
                <h1 className="text-3xl sm:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-[#00ff88] tracking-tight leading-tight drop-shadow">
                  {article.title}
                </h1>
                <p className="text-sm sm:text-base text-slate-300 leading-relaxed border-l-4 border-cyan-400 pl-4 italic">
                  {article.summary}
                </p>
              </div>

              {/* Imagem de Capa do Artigo */}
              {article.image_url && (
                <div className="w-full aspect-[21/9] rounded-2xl overflow-hidden border border-slate-800 shadow-2xl relative">
                  <img src={article.image_url} alt={article.title} className="w-full h-full object-cover" />
                </div>
              )}
            </header>

            {/* Conteúdo Renderizado com Anúncio Injetado */}
            <section>
              <div 
                dangerouslySetInnerHTML={{ __html: processedContent }} 
                className="prose prose-invert max-w-none text-slate-200 leading-relaxed text-sm sm:text-base border-t border-slate-800/80 pt-6
                  [&_h2]:text-2xl [&_h2]:font-extrabold [&_h2]:text-cyan-400 [&_h2]:border-b [&_h2]:border-cyan-500/20 [&_h2]:pb-2 [&_h2]:mt-8 [&_h2]:mb-4
                  [&_h3]:text-xl [&_h3]:font-bold [&_h3]:text-slate-200 [&_h3]:mt-6 [&_h3]:mb-3
                  [&_p]:mb-4 [&_p]:leading-relaxed
                  [&_ul]:list-disc [&_ul]:pl-6 [&_ul]:mb-4
                  [&_ol]:list-decimal [&_ol]:pl-6 [&_ol]:mb-4
                  [&_a]:text-cyan-400 [&_a]:underline [&_a]:font-bold [&_a]:hover:text-cyan-300
                  [&_img]:max-w-full [&_img]:rounded-2xl [&_img]:shadow-xl [&_img]:my-6 [&_img]:mx-auto [&_img]:block
                  [&_table]:w-full [&_table]:my-6 [&_table]:border-collapse [&_table]:rounded-xl [&_table]:overflow-hidden [&_table]:bg-slate-900/50 [&_table]:border [&_table]:border-slate-800
                  [&_th]:bg-cyan-500/10 [&_th]:text-cyan-400 [&_th]:font-bold [&_th]:text-xs [&_th]:uppercase [&_th]:tracking-wider [&_th]:p-3 [&_th]:text-left [&_th]:border-b [&_th]:border-slate-800
                  [&_td]:p-3 [&_td]:text-xs [&_td]:sm:text-sm [&_td]:text-slate-300 [&_td]:border-b [&_td]:border-slate-850 [&_td]:transition-colors [&_tr:hover]:bg-slate-800/30 [&_tr:nth-child(even)]:bg-slate-900/20"
              />
            </section>

            {/* Rodapé Semântico com Autor e Categorias */}
            <footer className="border-t border-slate-800/80 pt-6">
              {/* Cartão do Autor */}
              <div className="flex items-center gap-3.5 p-4 rounded-2xl bg-slate-900/60 border border-slate-850 max-w-sm">
                <img src={authorAvatar} alt={authorName} className="w-10 h-10 rounded-full object-cover border border-cyan-400" />
                <div>
                  <h4 className="text-xs sm:text-sm font-bold text-white leading-none">
                    {authorName}
                  </h4>
                  <span className="inline-block text-[9px] font-mono text-cyan-400 mt-1 uppercase font-bold tracking-wider">
                    {authorRole} • Autor
                  </span>
                </div>
              </div>
            </footer>
          </article>

          {/* Comentários do Guia */}
          <CommentsSection articleSlug={slug} />
        </main>
        <Footer />
      </div>
      <ViewCounterTrigger articleId={article.id} />
      <AdInitializer />
    </div>
  );
}
