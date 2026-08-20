import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";

export const dynamic = "force-dynamic";

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

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const period = searchParams.get("period") || "7d"; // 'today' | '7d' | '30d' | 'all'

  // Calcula a data limite para o filtro
  let dateFilter: string | null = null;
  const now = new Date();

  if (period === "today") {
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    dateFilter = today.toISOString();
  } else if (period === "7d") {
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    dateFilter = sevenDaysAgo.toISOString();
  } else if (period === "30d") {
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    dateFilter = thirtyDaysAgo.toISOString();
  }

  try {
    if (isSupabaseConfigured) {
      const client = getSupabaseServerClient();
      let query = client.from("analytics_events").select("*");

      if (dateFilter) {
        query = query.gte("created_at", dateFilter);
      }

      const { data: events, error } = await query.order("created_at", { ascending: false }).limit(2000);

      if (error) {
        console.warn("[Analytics Summary] Tabela analytics_events ou consulta Supabase:", error.message || error);
      }

      // Também busca a lista de artigos (guias e notícias) para consolidar nomes e categorias
      const { data: articles, error: articlesErr } = await client
        .from("articles")
        .select("id, title, type, category, slug");

      if (articlesErr) {
        console.warn("[Analytics Summary] Consulta de articles:", articlesErr.message || articlesErr);
      }

      const allEvents = events || [];

      // 1. Agrupamento por Categoria de Link
      const linkClicks = allEvents.filter((e) => e.event_type === "link_click");
      const codeCopies = allEvents.filter((e) => e.event_type === "code_copy");
      const guideViews = allEvents.filter((e) => e.event_type === "guide_view");

      // Agrupa links por label/url
      const linkMap: Record<string, { label: string; url: string; category: string; count: number }> = {};
      linkClicks.forEach((e) => {
        const key = e.url || e.label;
        if (!linkMap[key]) {
          linkMap[key] = {
            label: e.label,
            url: e.url || "",
            category: e.category || "geral",
            count: 0,
          };
        }
        linkMap[key].count++;
      });

      const topLinks = Object.values(linkMap).sort((a, b) => b.count - a.count);

      // Agrupa códigos de resgate por código
      const codeMap: Record<string, { code: string; label: string; count: number; lastCopied: string }> = {};
      codeCopies.forEach((e) => {
        const codeKey = e.label.replace(/^Código:\s*/i, "").trim().toUpperCase();
        if (!codeMap[codeKey]) {
          codeMap[codeKey] = {
            code: codeKey,
            label: e.label,
            count: 0,
            lastCopied: e.created_at,
          };
        }
        codeMap[codeKey].count++;
      });

      const topCodes = Object.values(codeMap).sort((a, b) => b.count - a.count);

      // Agrupamento de Guias (contando a partir dos eventos capturados e dos artigos)
      const guideEventCounts: Record<string, number> = {};
      guideViews.forEach((e) => {
        const key = (e.metadata?.slug || e.label || "").toLowerCase();
        guideEventCounts[key] = (guideEventCounts[key] || 0) + 1;
      });

      const guidesList = (articles || [])
        .filter((a) => a.type === "guia")
        .map((g) => {
          const countFromEvents = (guideEventCounts[g.slug.toLowerCase()] || 0) + (guideEventCounts[g.title.toLowerCase()] || 0);
          return {
            id: g.id,
            title: g.title,
            slug: g.slug,
            category: g.category || "Guias",
            views: countFromEvents,
          };
        })
        .sort((a, b) => b.views - a.views);

      // Distribuição por categoria de links
      const categoryDistribution: Record<string, number> = {};
      linkClicks.forEach((e) => {
        const cat = e.category || "outros";
        categoryDistribution[cat] = (categoryDistribution[cat] || 0) + 1;
      });

      return NextResponse.json({
        success: true,
        period,
        totals: {
          totalEvents: allEvents.length,
          totalLinkClicks: linkClicks.length,
          totalCodeCopies: codeCopies.length,
          totalGuideEvents: guideViews.length,
          totalRegisteredGuidesViews: guidesList.reduce((acc, g) => acc + (g.views || 0), 0),
        },
        topLinks,
        topCodes,
        topGuides: guidesList,
        categoryDistribution,
        recentEvents: allEvents.slice(0, 30),
      });
    }

    // Fallback Mock Local para desenvolvimento
    return NextResponse.json({
      success: true,
      period,
      totals: {
        totalEvents: 428,
        totalLinkClicks: 215,
        totalCodeCopies: 142,
        totalGuideEvents: 71,
        totalRegisteredGuidesViews: 1250,
      },
      topLinks: [
        { label: "Recarga Oficial (Web Shop 💎)", url: "https://s.globallap.com/s/71plzq", category: "canais_oficiais", count: 98 },
        { label: "Download Android (Play Store)", url: "https://play.google.com/store/apps/details?id=com.phs.global", category: "canais_oficiais", count: 47 },
        { label: "Discord da Comunidade Last Asylum BR", url: "https://discord.gg/UVY4uycSK", category: "redes", count: 35 },
        { label: "Discord Oficial do Jogo", url: "https://discord.com/invite/rxVwBW5d9f", category: "canais_oficiais", count: 21 },
        { label: "Download iOS (App Store)", url: "https://apps.apple.com/us/app/last-asylum-plague/id6756989323", category: "canais_oficiais", count: 14 },
      ],
      topCodes: [
        { code: "PLAGUE2026", label: "Código PLAGUE2026", count: 68, lastCopied: new Date().toISOString() },
        { code: "SURVIVOR88", label: "Código SURVIVOR88", count: 44, lastCopied: new Date().toISOString() },
        { code: "WELCOMEASYLUM", label: "Código WELCOMEASYLUM", count: 30, lastCopied: new Date().toISOString() },
      ],
      topGuides: [
        { id: "1", title: "Guia Definitivo do Médico da Praga", slug: "guia-definitivo-medico-da-praga", category: "Guias", views: 480 },
        { id: "2", title: "Melhores Composições de Tropas e Defesa da Vila", slug: "melhores-composicoes-tropas-defesa", category: "Guias", views: 320 },
        { id: "3", title: "Como Otimizar o Consumo de Recursos na Fazenda", slug: "como-otimizar-recursos-fazenda", category: "Guias", views: 210 },
      ],
      categoryDistribution: {
        canais_oficiais: 180,
        redes: 35,
        parceiros: 0,
      },
      recentEvents: [],
    });
  } catch (err: unknown) {
    const errorMsg =
      err instanceof Error
        ? err.message
        : typeof err === "object" && err !== null && "message" in err
        ? String((err as any).message)
        : String(err);
    console.error("[Analytics Summary Route Catch]:", errorMsg);
    return NextResponse.json({ error: `Erro ao processar métricas analíticas: ${errorMsg}` }, { status: 500 });
  }
}
