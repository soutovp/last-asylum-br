import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";
import {
  generateArticleEmail,
  generateNewsEmail,
  generateCodeEmail,
} from "@/lib/mailMarketing/templates";
import { sendMailMarketing } from "@/lib/mailMarketing/mailer";
import {
  MailMarketingPayload,
  ArticleMailData,
  NewsMailData,
  CodeMailData,
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

    let recipients: string[] = Array.isArray(payload.recipients) ? payload.recipients : [];

    // Se destinatários não foram passados diretamente pelo front-end autenticado, busca no banco
    if (recipients.length === 0 && isSupabaseConfigured) {
      try {
        const client = getSupabaseServerClient();
        const { data: profiles, error: dbError } = await client
          .from("profiles")
          .select("email")
          .not("email", "is", null);

        if (dbError) {
          console.error("[Mail Marketing] Erro ao buscar perfis no banco:", dbError);
        } else if (profiles && profiles.length > 0) {
          recipients = profiles
            .map((p: any) => p.email)
            .filter((email: any): email is string => Boolean(email && typeof email === "string" && email.includes("@")));
        }
      } catch (dbErr) {
        console.error("[Mail Marketing] Exceção ao consultar Supabase profiles no servidor:", dbErr);
      }
    }

    console.log(`[Mail Marketing] Destinatários identificados para envio (${recipients.length}):`, recipients);

    if (recipients.length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: "Nenhum usuário cadastrado com e-mail válido foi encontrado para receber o disparo.",
          recipientCount: 0,
        },
        { status: 400 }
      );
    }

    // Renderiza o template de acordo com a regra de negócio do tipo de dado
    let emailResult: { subject: string; html: string; text: string };

    switch (payload.type) {
      case "artigo": {
        const articleData = payload.data as ArticleMailData;
        if (!articleData.title || !articleData.slug) {
          return NextResponse.json(
            { success: false, error: "Dados incompletos para envio de Artigo." },
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

      default:
        return NextResponse.json(
          { success: false, error: `Tipo de publicação '${payload.type}' não suportado.` },
          { status: 400 }
        );
    }

    // Dispara os e-mails
    const sendResult = await sendMailMarketing({
      subject: emailResult.subject,
      html: emailResult.html,
      text: emailResult.text,
      recipients,
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
