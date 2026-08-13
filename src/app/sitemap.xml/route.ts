import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

import { headers } from "next/headers";

export async function GET() {
  const headersList = await headers();
  const host = headersList.get("host") || "lapbr.netlify.app";
  const protocol = host.startsWith("localhost") || host.startsWith("127.0.0.1") ? "http" : "https";
  const baseUrl = `${protocol}://${host}`;

  // 1. Rotas estáticas
  const staticRoutes = [
    "",
    "/calculadoras",
    "/eventos",
    "/herois",
    "/guias",
    "/noticias",
    "/codigos",
    "/guias-visuais",
    "/privacidade",
  ];

  // Inicia o XML com a tag de cabeçalho padrão e o namespace xmlns oficial exigido pelo Google
  let xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">`;

  // Adiciona rotas estáticas
  for (const route of staticRoutes) {
    const priority = route === "" ? "1.0" : "0.8";
    xml += `
  <url>
    <loc>${baseUrl}${route}</loc>
    <lastmod>${new Date().toISOString()}</lastmod>
    <changefreq>daily</changefreq>
    <priority>${priority}</priority>
  </url>`;
  }

  // 2. Rotas dinâmicas dos artigos no banco de dados
  try {
    const { data: articles } = await supabase
      .from("articles")
      .select("slug, type, created_at")
      .eq("status", "public");

    if (articles) {
      for (const article of articles) {
        const folder = article.type === "guia" ? "guias" : "noticias";
        xml += `
  <url>
    <loc>${baseUrl}/${folder}/${article.slug}</loc>
    <lastmod>${new Date(article.created_at).toISOString()}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.6</priority>
  </url>`;
      }
    }
  } catch (err) {
    console.error("Erro ao gerar sitemap dinâmico:", err);
  }

  xml += "\n</urlset>";

  // Retorna com o cabeçalho content-type correto de XML
  return new NextResponse(xml, {
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
    },
  });
}
