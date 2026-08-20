import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";
import {
  generateArticleEmail,
  generateNewsEmail,
  generateCodeEmail,
  generatePromotionalEmail,
} from "@/lib/mailMarketing/templates";
import { sendMailMarketing } from "@/lib/mailMarketing/mailer";
import {
  MailMarketingPayload,
  ArticleMailData,
  NewsMailData,
  CodeMailData,
  PromotionalMailData,
  RecipientInfo,
} from "@/lib/mailMarketing/types";

export const dynamic = "force-dynamic";

// Cria cliente com Service Role se disponível para contornar RLS no servidor
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

export async function POST(request: Request) {
  try {
    const payload = (await request.json()) as MailMarketingPayload;

    if (!payload || !payload.type || !payload.data) {
      return NextResponse.json(
        { success: false, error: "Payload inválido. Tipo e dados são obrigatórios." },
        { status: 400 }
      );
    }

    let recipientsInfo: RecipientInfo[] = Array.isArray(payload.recipientsInfo)
      ? payload.recipientsInfo
      : [];

    // Se for envio de teste direcionado (ex: teste do admin)
    if (payload.testRecipient) {
      const cleanTest = payload.testRecipient.trim().toLowerCase();
      recipientsInfo = [{ email: cleanTest, unsubscribeToken: "demo-test-token" }];
    } else if (recipientsInfo.length === 0 && Array.isArray(payload.recipients) && payload.recipients.length > 0) {
      recipientsInfo = payload.recipients.map((em) => ({ email: em }));
    } else if (recipientsInfo.length === 0 && isSupabaseConfigured) {
      // FILTRAGEM RIGOROSA NO BANCO DE DADOS DE ACORDO COM A CATEGORIA DO DISPARO
      try {
        const client = getSupabaseServerClient();
        let query = client
          .from("profiles")
          .select("email, unsubscribe_token, receive_noticias, receive_guias, receive_codigos, receive_promocionais")
          .not("email", "is", null);

        // Aplica o filtro de opt-in de acordo com o tipo
        switch (payload.type) {
          case "noticia":
            query = query.neq("receive_noticias", false);
            break;
          case "artigo":
            query = query.neq("receive_guias", false);
            break;
          case "codigo":
            query = query.neq("receive_codigos", false);
            break;
          case "promocional":
            query = query.neq("receive_promocionais", false);
            break;
        }

        const { data: profiles, error: dbError } = await query;

        if (dbError) {
          console.error("[Mail Marketing] Erro ao buscar perfis filtrados no banco:", dbError);
        } else if (profiles && profiles.length > 0) {
          recipientsInfo = profiles
            .filter((p: any) => Boolean(p.email && typeof p.email === "string" && p.email.includes("@")))
            .map((p: any) => ({
              email: p.email.trim().toLowerCase(),
              unsubscribeToken: p.unsubscribe_token || undefined,
            }));
        }
      } catch (dbErr) {
        console.error("[Mail Marketing] Exceção ao consultar Supabase profiles no servidor:", dbErr);
      }
    }

    // Fallback se estiver em modo teste/local e não houver destinatários
    if (recipientsInfo.length === 0 && !isSupabaseConfigured) {
      recipientsInfo = [{ email: "admin@lastasylum.br", unsubscribeToken: "demo-admin-token" }];
    }

    console.log(`[Mail Marketing] Destinatários filtrados (${recipientsInfo.length}) para o tipo '${payload.type}':`, recipientsInfo.map(r => r.email));

    if (recipientsInfo.length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: "Nenhum usuário com permissão ativa para esta categoria de e-mail foi encontrado.",
          recipientCount: 0,
        },
        { status: 400 }
      );
    }

    // Renderiza o template de acordo com o tipo de mensagem
    let emailResult: { subject: string; html: string; text: string };

    switch (payload.type) {
      case "artigo": {
        const articleData = payload.data as ArticleMailData;
        if (!articleData.title || !articleData.slug) {
          return NextResponse.json(
            { success: false, error: "Dados incompletos para envio de Artigo/Guia." },
            { status: 400 }
          );
        }
        emailResult = generateArticleEmail(articleData, payload.siteUrl);
        break;
      }

      case "noticia": {
        const newsData = payload.data as NewsMailData;
        if (!newsData.title || !newsData.slug) {
          return NextResponse.json(
            { success: false, error: "Dados incompletos para envio de Notícia." },
            { status: 400 }
          );
        }
        emailResult = generateNewsEmail(newsData, payload.siteUrl);
        break;
      }

      case "codigo": {
        const codeData = payload.data as CodeMailData;
        if (!codeData.code) {
          return NextResponse.json(
            { success: false, error: "Código presente é obrigatório." },
            { status: 400 }
          );
        }
        emailResult = generateCodeEmail(codeData, payload.siteUrl);
        break;
      }

      case "promocional": {
        const promoData = payload.data as PromotionalMailData;
        if (!promoData.title) {
          return NextResponse.json(
            { success: false, error: "Título é obrigatório para envio Promocional." },
            { status: 400 }
          );
        }
        emailResult = generatePromotionalEmail(promoData, payload.siteUrl);
        break;
      }

      default:
        return NextResponse.json(
          { success: false, error: `Tipo de publicação '${payload.type}' não suportado.` },
          { status: 400 }
        );
    }

    // Dispara os e-mails com os tokens individuais
    const sendResult = await sendMailMarketing({
      subject: emailResult.subject,
      html: emailResult.html,
      text: emailResult.text,
      recipientsInfo,
      siteUrl: payload.siteUrl,
      testOnly: payload.testOnly,
    });

    return NextResponse.json({
      success: sendResult.success,
      message: sendResult.message,
      recipientCount: sendResult.recipientCount,
      simulated: sendResult.simulated,
      error: sendResult.error,
    });
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : String(err);
    console.error("[Mail Marketing API Route - Erro Não Tratado]:", errorMsg);

    return NextResponse.json(
      {
        success: false,
        error: `Falha interna no processamento do e-mail marketing: ${errorMsg}`,
      },
      { status: 500 }
    );
  }
}
