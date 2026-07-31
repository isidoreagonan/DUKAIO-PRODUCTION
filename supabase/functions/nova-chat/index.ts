// Nova - Dukaio AI Assistant
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const GROQ_API_KEY = Deno.env.get("GROQ_API_KEY")!;
const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

const tools = [
  {
    type: "function",
    function: {
      name: "get_sales_stats",
      description: "Récupère les statistiques de ventes du vendeur (total, nombre, top produits, top pays, période).",
      parameters: {
        type: "object",
        properties: {
          period_days: { type: "number", description: "Période en jours (7, 30, 90, 365). Défaut 30." },
          store_id: { type: "string", description: "ID de boutique optionnel pour filtrer." },
        },
      },
    },
  },
  {
    type: "function",
    function: {
      name: "list_products",
      description: "Liste les produits du vendeur (id, titre, prix, type, ventes). Utiliser quand l'utilisateur veut créer un code promo ou parler d'un produit.",
      parameters: { type: "object", properties: {} },
    },
  },
  {
    type: "function",
    function: {
      name: "create_promo_code",
      description: "Crée un code promo. Demande confirmation à l'utilisateur AVANT d'appeler cette fonction (code, % de réduction, produits choisis, expiration, max utilisations).",
      parameters: {
        type: "object",
        properties: {
          code: { type: "string", description: "Code promo en MAJUSCULES sans espaces." },
          discount_percent: { type: "number", description: "% de réduction (1-100). Utiliser ceci OU discount_amount." },
          discount_amount: { type: "number", description: "Montant fixe en FCFA. Utiliser ceci OU discount_percent." },
          product_ids: { type: "array", items: { type: "string" }, description: "Liste d'IDs produits concernés (vide = tous)." },
          max_uses: { type: "number", description: "Nombre max d'utilisations (optionnel)." },
          expires_in_days: { type: "number", description: "Validité en jours (optionnel)." },
        },
        required: ["code"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "audit_store",
      description: "Audit complet de la boutique : produits, prix, descriptions, ventes. Renvoie données brutes pour analyse.",
      parameters: { type: "object", properties: {} },
    },
  },
];

async function executeTool(name: string, args: any, userId: string) {
  const sb = createClient(SUPABASE_URL, SERVICE_KEY);

  if (name === "get_sales_stats") {
    const days = args.period_days || 30;
    const since = new Date(Date.now() - days * 86400000).toISOString();
    let q = sb.from("orders").select("amount,status,created_at,product_id,shipping_address,payment_method").eq("store_owner_id", userId).gte("created_at", since);
    const { data: orders } = await q;
    const completed = (orders || []).filter((o) => o.status === "completed");
    const total = completed.reduce((s, o) => s + Number(o.amount || 0), 0);
    const byCountry: Record<string, number> = {};
    const byProduct: Record<string, number> = {};
    const byMethod: Record<string, number> = {};
    for (const o of completed) {
      const c = (o.shipping_address as any)?.country || "?";
      byCountry[c] = (byCountry[c] || 0) + 1;
      byProduct[o.product_id] = (byProduct[o.product_id] || 0) + Number(o.amount || 0);
      const m = o.payment_method || "?";
      byMethod[m] = (byMethod[m] || 0) + 1;
    }
    const topProductIds = Object.entries(byProduct).sort((a, b) => b[1] - a[1]).slice(0, 5).map(([id]) => id);
    const { data: prods } = await sb.from("products").select("id,title").in("id", topProductIds);
    const topProducts = topProductIds.map((id) => ({ id, title: prods?.find((p) => p.id === id)?.title, revenue: byProduct[id] }));
    return { period_days: days, total_revenue_fcfa: total, completed_orders: completed.length, total_orders: orders?.length || 0, top_countries: Object.entries(byCountry).sort((a, b) => b[1] - a[1]).slice(0, 5), top_products: topProducts, payment_methods: byMethod };
  }

  if (name === "list_products") {
    const { data } = await sb.from("products").select("id,title,price,type,sales_count,is_published").eq("creator_id", userId).order("created_at", { ascending: false }).limit(50);
    return { products: data || [] };
  }

  if (name === "create_promo_code") {
    const insert: any = {
      code: String(args.code).toUpperCase().trim(),
      creator_id: userId,
      is_active: true,
      product_ids: args.product_ids || [],
    };
    if (args.discount_percent) insert.discount_percent = args.discount_percent;
    if (args.discount_amount) insert.discount_amount = args.discount_amount;
    if (args.max_uses) insert.max_uses = args.max_uses;
    if (args.expires_in_days) insert.expires_at = new Date(Date.now() + args.expires_in_days * 86400000).toISOString();
    const { data, error } = await sb.from("promo_codes").insert(insert).select().single();
    if (error) return { success: false, error: error.message };
    return { success: true, promo: data };
  }

  if (name === "audit_store") {
    const { data: products } = await sb.from("products").select("id,title,price,description,thumbnail_url,is_published,sales_count,type").eq("creator_id", userId);
    const { data: orders } = await sb.from("orders").select("amount,status,created_at").eq("store_owner_id", userId);
    const { data: stores } = await sb.from("stores").select("id,name,description,logo_url,banner_url").eq("owner_id", userId).eq("is_archived", false);
    const completed = (orders || []).filter((o) => o.status === "completed");
    return {
      stores: stores || [],
      products_count: products?.length || 0,
      published_count: products?.filter((p) => p.is_published).length || 0,
      products_without_thumbnail: products?.filter((p) => !p.thumbnail_url).map((p) => p.title) || [],
      products_short_description: products?.filter((p) => !p.description || p.description.length < 100).map((p) => p.title) || [],
      total_revenue: completed.reduce((s, o) => s + Number(o.amount || 0), 0),
      total_sales: completed.length,
      products: products?.slice(0, 20),
    };
  }

  return { error: "Outil inconnu" };
}

const SYSTEM_PROMPT = `Tu es **Nova**, l'IA assistante de Dukaio (plateforme e-commerce de produits numériques en Afrique : fichiers, formations, licences).

Tu aides le vendeur connecté à :
- Analyser ses ventes, revenus, pays, méthodes de paiement
- Auditer sa boutique et donner des actions prioritaires concrètes
- Rédiger des descriptions produit optimisées (en HTML riche)
- Créer des codes promo (TOUJOURS lister les produits d'abord avec list_products, faire choisir le vendeur, RÉCAPITULER puis demander confirmation explicite avant d'appeler create_promo_code)
- Proposer des angles marketing personnalisés selon ses ventes/pays
- Répondre aux questions générales sur Dukaio

RÈGLES :
- Réponds en français, ton chaleureux mais pro, concis
- Utilise markdown (titres, listes, **gras**) pour les réponses structurées
- Pour analyser : appelle d'abord get_sales_stats ou audit_store
- Pour créer un code promo : 1) list_products 2) propose les produits numérotés 3) demande au vendeur les paramètres (code, %, produits) 4) RÉCAPITULE 5) demande "Je crée ce code promo ?" 6) crée seulement après confirmation
- Donne des conseils ACTIONNABLES, pas des généralités
- Ne révèle jamais les détails techniques internes`;

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const auth = req.headers.get("Authorization");
    if (!auth) return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } });

    const sbUser = createClient(SUPABASE_URL, Deno.env.get("SUPABASE_ANON_KEY")!, { global: { headers: { Authorization: auth } } });
    const { data: { user } } = await sbUser.auth.getUser();
    if (!user) return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } });

    const { messages, thread_id } = await req.json();
    if (!Array.isArray(messages)) return new Response(JSON.stringify({ error: "messages required" }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });

    const sb = createClient(SUPABASE_URL, SERVICE_KEY);

    // Persist last user message
    const lastUser = [...messages].reverse().find((m: any) => m.role === "user");
    if (thread_id && lastUser) {
      await sb.from("nova_messages").insert({ thread_id, user_id: user.id, role: "user", content: { text: lastUser.content } });
      // Update thread title from first user msg if still default
      const { data: t } = await sb.from("nova_threads").select("title").eq("id", thread_id).single();
      if (t?.title === "Nouvelle conversation") {
        await sb.from("nova_threads").update({ title: String(lastUser.content).slice(0, 60) }).eq("id", thread_id);
      } else {
        await sb.from("nova_threads").update({ updated_at: new Date().toISOString() }).eq("id", thread_id);
      }
    }

    let convo: any[] = [{ role: "system", content: SYSTEM_PROMPT }, ...messages];
    const toolCallsLog: any[] = [];
    let finalText = "";

    for (let step = 0; step < 8; step++) {
      const resp = await fetch("https://api.groq.com/openai/v1/chat/completions", {
        method: "POST",
        headers: { Authorization: `Bearer ${GROQ_API_KEY}`, "Content-Type": "application/json" },
        body: JSON.stringify({ model: "llama-3.3-70b-versatile", messages: convo, tools, tool_choice: "auto" }),
      });

      if (resp.status === 429) return new Response(JSON.stringify({ error: "Trop de requêtes, réessayez." }), { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      if (resp.status === 402) return new Response(JSON.stringify({ error: "Crédits IA épuisés." }), { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      if (!resp.ok) {
        const t = await resp.text();
        console.error("AI error", resp.status, t);
        return new Response(JSON.stringify({ error: "Erreur IA" }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      }

      const data = await resp.json();
      const msg = data.choices?.[0]?.message;
      if (!msg) break;

      const calls = msg.tool_calls;
      if (calls && calls.length > 0) {
        convo.push(msg);
        for (const c of calls) {
          let args: any = {};
          try { args = JSON.parse(c.function.arguments || "{}"); } catch {}
          const result = await executeTool(c.function.name, args, user.id);
          toolCallsLog.push({ name: c.function.name, args, result });
          convo.push({ role: "tool", tool_call_id: c.id, content: JSON.stringify(result) });
        }
        continue;
      }

      finalText = msg.content || "";
      break;
    }

    if (thread_id && finalText) {
      await sb.from("nova_messages").insert({ thread_id, user_id: user.id, role: "assistant", content: { text: finalText, tools: toolCallsLog } });
    }

    return new Response(JSON.stringify({ message: finalText, tools: toolCallsLog }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
  } catch (e) {
    console.error("nova-chat error", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown" }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
});
