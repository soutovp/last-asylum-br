import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";
import { maskEmail } from "@/lib/auth";

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

// GET: Retorna as preferências do usuário associado ao token
export async function GET(
  request: Request,
  { params }: { params: Promise<{ token: string }> }
) {
  const { token } = await params;

  if (!token || token.trim() === "") {
    return NextResponse.json({ error: "Token de descadastro não informado." }, { status: 400 });
  }

  try {
    if (isSupabaseConfigured) {
      const client = getSupabaseServerClient();
      const { data: profile, error } = await client
        .from("profiles")
        .select("email, receive_noticias, receive_guias, receive_codigos, receive_promocionais")
        .eq("unsubscribe_token", token)
        .single();

      if (error || !profile) {
        return NextResponse.json(
          { error: "Token inválido ou não encontrado no sistema." },
          { status: 404 }
        );
      }

      return NextResponse.json({
        success: true,
        emailMasked: maskEmail(profile.email || ""),
        preferences: {
          receiveNoticias: profile.receive_noticias !== false,
          receiveGuias: profile.receive_guias !== false,
          receiveCodigos: profile.receive_codigos !== false,
          receivePromocionais: profile.receive_promocionais !== false,
        },
      });
    }

    // Fallback demo local
    return NextResponse.json({
      success: true,
      emailMasked: "fer***@hotmail.com",
      preferences: {
        receiveNoticias: true,
        receiveGuias: true,
        receiveCodigos: true,
        receivePromocionais: true,
      },
    });
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: `Erro ao consultar preferências: ${errorMsg}` }, { status: 500 });
  }
}

// POST: Atualiza as preferências do usuário através do token
export async function POST(
  request: Request,
  { params }: { params: Promise<{ token: string }> }
) {
  const { token } = await params;

  if (!token || token.trim() === "") {
    return NextResponse.json({ error: "Token de descadastro não informado." }, { status: 400 });
  }

  try {
    const body = await request.json();
    const { receiveNoticias, receiveGuias, receiveCodigos, receivePromocionais, unsubscribeAll } = body;

    const updates: any = {};
    if (unsubscribeAll === true) {
      updates.receive_noticias = false;
      updates.receive_guias = false;
      updates.receive_codigos = false;
      updates.receive_promocionais = false;
    } else {
      if (typeof receiveNoticias === "boolean") updates.receive_noticias = receiveNoticias;
      if (typeof receiveGuias === "boolean") updates.receive_guias = receiveGuias;
      if (typeof receiveCodigos === "boolean") updates.receive_codigos = receiveCodigos;
      if (typeof receivePromocionais === "boolean") updates.receive_promocionais = receivePromocionais;
    }

    if (isSupabaseConfigured) {
      const client = getSupabaseServerClient();
      const { error } = await client
        .from("profiles")
        .update(updates)
        .eq("unsubscribe_token", token);

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }
    }

    return NextResponse.json({
      success: true,
      message: unsubscribeAll
        ? "Você foi descadastrado de todas as comunicações por e-mail com sucesso."
        : "Suas preferências de e-mail foram atualizadas com sucesso!",
    });
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: `Erro ao salvar preferências: ${errorMsg}` }, { status: 500 });
  }
}
