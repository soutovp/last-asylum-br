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

export async function POST(request: Request) {
  try {
    let payload;
    const contentType = request.headers.get("content-type") || "";

    if (contentType.includes("application/json")) {
      payload = await request.json();
    } else {
      // Suporte para navigator.sendBeacon com text/plain
      const text = await request.text();
      payload = JSON.parse(text);
    }

    const { event_type, url, label, category, page_location, metadata } = payload;

    if (!label) {
      return NextResponse.json({ error: "Label é obrigatório." }, { status: 400 });
    }

    const record = {
      event_type: event_type || "link_click",
      url: url || null,
      label: String(label).slice(0, 200),
      category: category || "geral",
      page_location: page_location || null,
      metadata: metadata || {},
    };

    if (isSupabaseConfigured) {
      const client = getSupabaseServerClient();
      const { error } = await client.from("analytics_events").insert([record]);
      if (error) {
        console.warn("[Analytics Track Insert]:", error.message || error);
      }
    }

    return NextResponse.json({ success: true });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
