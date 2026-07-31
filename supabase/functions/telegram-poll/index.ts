// Telegram bot — long-polling worker invoked every minute by pg_cron.
// Receives messages, handles commands (/start, /link, /help, /stats),
// and falls back to the Lovable AI gateway (Gemini) for free-form questions.
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const GATEWAY_URL = "https://connector-gateway.lovable.dev/telegram";
const ADMIN_EMAIL = "isidoreagonan@gmail.com";

const MAX_RUNTIME_MS = 55_000;
const MIN_REMAINING_MS = 5_000;

const SYSTEM_PROMPT = `Tu es l'assistant officiel d'Dukaio sur Telegram.

Dukaio est une plateforme africaine permettant à des créateurs de vendre des produits numériques (fichiers, formations, licences) via leur boutique en ligne. Paiements via Mobile Money (MTN, Orange, Moov, Wave) et carte. Commission plateforme : 10%. Retrait minimum : 100 FCFA. Délai de maturité des fonds : 5 jours.

RÈGLES :
- Réponds toujours en français, ton chaleureux et professionnel
- Sois concis : 2 à 5 phrases maximum (Telegram = court)
- Tu peux utiliser du HTML simple : <b>gras</b>, <i>italique</i>, <code>code</code>
- Pour les vendeurs liés (commande /link), tu peux les guider sur leur dashboard
- Si un utilisateur demande à parler à un humain, dis-lui de se rendre sur https://dukaio.com/dashboard/support et termine ta réponse par [ESCALATE]
- Ne révèle jamais d'infos techniques internes (clés API, noms de tables, etc.)
- Si tu ne sais pas, dis-le honnêtement`;

async function tg(method: string, body: unknown) {
  const res = await fetch(`${GATEWAY_URL}/${method}`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${Deno.env.get("GROQ_API_KEY")}`,
      "X-Connection-Api-Key": Deno.env.get("TELEGRAM_API_KEY")!,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });
  const data = await res.json();
  if (!res.ok) console.error(`tg ${method} failed`, res.status, data);
  return data;
}

async function send(chatId: number, text: string) {
  return tg("sendMessage", { chat_id: chatId, text, parse_mode: "HTML", disable_web_page_preview: true });
}

async function aiReply(history: { role: "user" | "assistant"; content: string }[]): Promise<string> {
  const apiKey = Deno.env.get("GROQ_API_KEY");
  if (!apiKey) return "L'IA n'est pas configurée.";

  const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      model: "llama-3.3-70b-versatile",
      messages: [{ role: "system", content: SYSTEM_PROMPT }, ...history.slice(-10)],
      max_tokens: 600,
    }),
  });

  if (!res.ok) {
    const txt = await res.text();
    console.error("AI gateway error", res.status, txt);
    if (res.status === 429) return "⏳ Trop de requêtes, réessaie dans un instant.";
    if (res.status === 402) return "⚠️ Crédit IA épuisé, contacte l'admin.";
    return "Désolé, je n'ai pas pu générer de réponse.";
  }
  const data = await res.json();
  return data.choices?.[0]?.message?.content ?? "Désolé, pas de réponse.";
}

interface CommandCtx {
  supabase: ReturnType<typeof createClient>;
  chatId: number;
  fromUserId: number;
  username?: string;
  firstName?: string;
  text: string;
}

async function handleCommand(ctx: CommandCtx): Promise<boolean> {
  const { supabase, chatId, text } = ctx;
  const trimmed = text.trim();
  const [cmd, ...args] = trimmed.split(/\s+/);

  switch (cmd.toLowerCase()) {
    case "/start":
      await send(
        chatId,
        `👋 <b>Bienvenue sur Dukaio !</b>\n\nJe suis l'assistant IA officiel.\n\n🔗 <b>Lier ton compte vendeur</b> : connecte-toi sur <a href="https://dukaio.com/dashboard/settings">ton dashboard</a>, génère un code, puis envoie-moi :\n<code>/link TON_CODE</code>\n\n💬 Tu peux aussi me poser n'importe quelle question sur la plateforme.\n\nTape /help pour voir les commandes.`,
      );
      return true;

    case "/help":
      await send(
        chatId,
        `📖 <b>Commandes disponibles</b>\n\n/start — démarrer\n/link CODE — lier ton compte vendeur\n/unlink — délier ton compte\n/stats — voir tes ventes (vendeur lié)\n/help — afficher cette aide\n\nOu écris-moi librement, je te réponds avec l'IA 🤖`,
      );
      return true;

    case "/link": {
      const token = args[0]?.toUpperCase();
      if (!token) {
        await send(chatId, "❌ Usage : <code>/link CODE</code>\n\nGénère un code depuis ton dashboard Dukaio → Réglages → Telegram.");
        return true;
      }
      const { data: tk } = await supabase
        .from("telegram_link_tokens")
        .select("user_id, expires_at, used_at")
        .eq("token", token)
        .maybeSingle();

      if (!tk || tk.used_at || new Date(tk.expires_at) < new Date()) {
        await send(chatId, "❌ Code invalide ou expiré. Génère un nouveau code dans ton dashboard.");
        return true;
      }

      // upsert link
      const { error: upErr } = await supabase.from("telegram_links").upsert(
        {
          user_id: tk.user_id,
          chat_id: chatId,
          username: ctx.username ?? null,
          first_name: ctx.firstName ?? null,
        },
        { onConflict: "user_id" },
      );
      if (upErr) {
        console.error("link upsert error", upErr);
        await send(chatId, "❌ Erreur lors de la liaison. Réessaie.");
        return true;
      }
      await supabase.from("telegram_link_tokens").update({ used_at: new Date().toISOString() }).eq("token", token);

      // If linked user is admin, also register as admin chat
      const { data: prof } = await supabase
        .from("profiles")
        .select("id, display_name")
        .eq("id", tk.user_id)
        .maybeSingle();
      const { data: authUser } = await supabase.auth.admin.getUserById(tk.user_id);
      if (authUser?.user?.email === ADMIN_EMAIL) {
        await supabase.from("telegram_admin_chats").upsert(
          { chat_id: chatId, username: ctx.username ?? null, first_name: ctx.firstName ?? null },
          { onConflict: "chat_id" },
        );
      }

      await send(
        chatId,
        `✅ <b>Compte lié avec succès !</b>\n\nBonjour ${prof?.display_name ?? "👋"}, tu recevras désormais ici toutes tes notifications de ventes, retraits et alertes importantes.`,
      );
      return true;
    }

    case "/unlink": {
      await supabase.from("telegram_links").delete().eq("chat_id", chatId);
      await supabase.from("telegram_admin_chats").delete().eq("chat_id", chatId);
      await send(chatId, "🔌 Compte délié. Tu ne recevras plus de notifications.");
      return true;
    }

    case "/stats": {
      const { data: link } = await supabase
        .from("telegram_links")
        .select("user_id")
        .eq("chat_id", chatId)
        .maybeSingle();
      if (!link) {
        await send(chatId, "❌ Aucun compte lié. Utilise /link CODE depuis ton dashboard.");
        return true;
      }
      const since = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
      const { data: orders } = await supabase
        .from("orders")
        .select("amount, status, created_at")
        .eq("store_owner_id", link.user_id)
        .gte("created_at", since);
      const paid = (orders ?? []).filter((o: any) => o.status === "paid");
      const total = paid.reduce((s: number, o: any) => s + Number(o.amount ?? 0), 0);
      await send(
        chatId,
        `📊 <b>Tes 30 derniers jours</b>\n\n💰 Revenus : <b>${total.toLocaleString("fr-FR")} FCFA</b>\n🛒 Ventes : <b>${paid.length}</b>\n📦 Commandes totales : <b>${orders?.length ?? 0}</b>\n\n👉 <a href="https://dukaio.com/dashboard">Ouvrir le dashboard</a>`,
      );
      return true;
    }

    default:
      return false;
  }
}

serve(async () => {
  const startTime = Date.now();

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
  );

  const { data: state, error: stateErr } = await supabase
    .from("telegram_bot_state")
    .select("update_offset")
    .eq("id", 1)
    .single();
  if (stateErr) {
    return new Response(JSON.stringify({ error: stateErr.message }), { status: 500 });
  }
  let currentOffset: number = state.update_offset;
  let processed = 0;

  while (true) {
    const remaining = MAX_RUNTIME_MS - (Date.now() - startTime);
    if (remaining < MIN_REMAINING_MS) break;
    const timeout = Math.min(50, Math.floor(remaining / 1000) - 5);
    if (timeout < 1) break;

    const updates = await tg("getUpdates", {
      offset: currentOffset,
      timeout,
      allowed_updates: ["message"],
    });

    const list = updates?.result ?? [];
    if (!Array.isArray(list) || list.length === 0) continue;

    for (const u of list) {
      const msg = u.message;
      if (!msg) continue;
      const chatId: number = msg.chat.id;
      const text: string = msg.text ?? "";
      const fromUserId: number = msg.from?.id ?? 0;
      const username: string | undefined = msg.from?.username;
      const firstName: string | undefined = msg.from?.first_name;

      // Persist message
      await supabase.from("telegram_messages").upsert(
        {
          update_id: u.update_id,
          chat_id: chatId,
          from_user_id: fromUserId,
          username: username ?? null,
          text,
          raw_update: u,
        },
        { onConflict: "update_id" },
      );

      try {
        if (text.startsWith("/")) {
          const handled = await handleCommand({
            supabase,
            chatId,
            fromUserId,
            username,
            firstName,
            text,
          });
          if (handled) continue;
        }

        // AI fallback — pull last 8 messages from this chat for context
        const { data: history } = await supabase
          .from("telegram_messages")
          .select("text, ai_reply, created_at")
          .eq("chat_id", chatId)
          .order("created_at", { ascending: false })
          .limit(8);

        const messages: { role: "user" | "assistant"; content: string }[] = [];
        for (const h of (history ?? []).reverse()) {
          if (h.text) messages.push({ role: "user", content: h.text });
          if (h.ai_reply) messages.push({ role: "assistant", content: h.ai_reply });
        }
        // ensure last user message is the current one
        if (messages[messages.length - 1]?.content !== text) {
          messages.push({ role: "user", content: text });
        }

        let reply = await aiReply(messages);
        const escalate = reply.includes("[ESCALATE]");
        reply = reply.replace("[ESCALATE]", "").trim();
        await send(chatId, reply);
        await supabase.from("telegram_messages").update({ ai_reply: reply }).eq("update_id", u.update_id);

        if (escalate) {
          // notify admin chats
          const { data: admins } = await supabase.from("telegram_admin_chats").select("chat_id");
          for (const a of admins ?? []) {
            await send(
              a.chat_id,
              `🚨 <b>Escalade Telegram</b>\nUtilisateur @${username ?? "inconnu"} (chat ${chatId}) demande un humain.\n\nDernier message :\n<i>${text.slice(0, 400)}</i>`,
            );
          }
        }
      } catch (e) {
        console.error("message handling error", e);
      }
    }

    processed += list.length;
    const newOffset = Math.max(...list.map((u: any) => u.update_id)) + 1;
    await supabase
      .from("telegram_bot_state")
      .update({ update_offset: newOffset, updated_at: new Date().toISOString() })
      .eq("id", 1);
    currentOffset = newOffset;
  }

  return new Response(JSON.stringify({ ok: true, processed, finalOffset: currentOffset }), {
    headers: { "Content-Type": "application/json" },
  });
});
