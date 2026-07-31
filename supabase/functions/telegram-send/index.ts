// Helper edge function: send a Telegram message via the Lovable connector gateway.
// Other functions (notify-sale, admin-kyc, etc.) call this internally.
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const GATEWAY_URL = "https://connector-gateway.lovable.dev/telegram";

type SendTarget =
  | { chat_id: number | string }
  | { user_id: string }
  | { admin: true };

interface SendRequest {
  target: SendTarget;
  text: string;
  parse_mode?: "HTML" | "Markdown" | "MarkdownV2";
  disable_web_page_preview?: boolean;
}

async function sendOne(chatId: number | string, text: string, parseMode = "HTML", noPreview = true) {
  const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
  const TELEGRAM_API_KEY = Deno.env.get("TELEGRAM_API_KEY");
  if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY missing");
  if (!TELEGRAM_API_KEY) throw new Error("TELEGRAM_API_KEY missing");

  const res = await fetch(`${GATEWAY_URL}/sendMessage`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${LOVABLE_API_KEY}`,
      "X-Connection-Api-Key": TELEGRAM_API_KEY,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      chat_id: chatId,
      text,
      parse_mode: parseMode,
      disable_web_page_preview: noPreview,
    }),
  });
  const data = await res.json();
  if (!res.ok) {
    console.error("telegram sendMessage failed", res.status, data);
    throw new Error(`Telegram error ${res.status}: ${JSON.stringify(data)}`);
  }
  return data;
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const body = (await req.json()) as SendRequest;
    if (!body?.text || !body?.target) {
      return new Response(JSON.stringify({ error: "target and text required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    const targets: (number | string)[] = [];

    if ("chat_id" in body.target) {
      targets.push(body.target.chat_id);
    } else if ("user_id" in body.target) {
      const { data } = await supabase
        .from("telegram_links")
        .select("chat_id")
        .eq("user_id", body.target.user_id)
        .maybeSingle();
      if (data?.chat_id) targets.push(data.chat_id);
    } else if ("admin" in body.target && body.target.admin) {
      const { data } = await supabase.from("telegram_admin_chats").select("chat_id");
      (data ?? []).forEach((r) => targets.push(r.chat_id));
    }

    if (targets.length === 0) {
      return new Response(JSON.stringify({ ok: true, skipped: true, reason: "no target chat" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const results = await Promise.allSettled(
      targets.map((id) => sendOne(id, body.text, body.parse_mode ?? "HTML", body.disable_web_page_preview ?? true)),
    );

    return new Response(
      JSON.stringify({ ok: true, sent: results.filter((r) => r.status === "fulfilled").length, total: targets.length }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (e) {
    console.error("telegram-send error", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "unknown" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
