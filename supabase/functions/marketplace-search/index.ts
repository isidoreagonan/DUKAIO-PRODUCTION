// Marketplace text search across all published products (cross-stores)
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

const GRADE_RANK: Record<string, number> = { premium: 3, pro: 2, standard: 1 };

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const q = (url.searchParams.get("q") || "").trim();
    const category = url.searchParams.get("category") || "";
    const type = url.searchParams.get("type") || "";
    const sort = url.searchParams.get("sort") || "relevance"; // relevance | recent | popular | price_asc | price_desc | verified
    const minPrice = parseFloat(url.searchParams.get("min_price") || "0");
    const maxPrice = parseFloat(url.searchParams.get("max_price") || "0");
    const verified = (url.searchParams.get("verified") || "").toLowerCase(); // any | standard | pro | premium
    const limit = Math.min(parseInt(url.searchParams.get("limit") || "24"), 60);
    const page = Math.max(parseInt(url.searchParams.get("page") || "1"), 1);
    const offset = (page - 1) * limit;

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, serviceKey);

    // Fetch active badges first if a verified filter is requested or if we'll need to sort by it
    let badgesByUser: Record<string, { grade: string; expires_at: string | null }> = {};
    if (verified || sort === "verified") {
      const { data: badges } = await supabase
        .from("verified_badges")
        .select("user_id, grade, status, expires_at")
        .eq("status", "active");
      const now = Date.now();
      for (const b of badges || []) {
        if (!b.expires_at || new Date(b.expires_at).getTime() > now) {
          badgesByUser[b.user_id] = { grade: b.grade, expires_at: b.expires_at };
        }
      }
    }

    let query = supabase
      .from("products")
      .select(
        "id, title, description, price, original_price, thumbnail_url, type, category, sales_count, created_at, creator_id",
        { count: "exact" },
      )
      .eq("is_published", true);

    if (q) {
      query = query.or(`title.ilike.%${q}%,description.ilike.%${q}%`);
    }
    if (category) query = query.eq("category", category);
    if (type) query = query.eq("type", type);
    if (minPrice > 0) query = query.gte("price", minPrice);
    if (maxPrice > 0) query = query.lte("price", maxPrice);

    // Filter by verified status
    if (verified === "any") {
      const ids = Object.keys(badgesByUser);
      if (ids.length === 0) {
        return new Response(
          JSON.stringify({ products: [], total: 0, page, limit }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } },
        );
      }
      query = query.in("creator_id", ids);
    } else if (["standard", "pro", "premium"].includes(verified)) {
      const ids = Object.entries(badgesByUser)
        .filter(([, b]) => b.grade === verified)
        .map(([uid]) => uid);
      if (ids.length === 0) {
        return new Response(
          JSON.stringify({ products: [], total: 0, page, limit }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } },
        );
      }
      query = query.in("creator_id", ids);
    }

    switch (sort) {
      case "recent":
        query = query.order("created_at", { ascending: false });
        break;
      case "popular":
        query = query.order("sales_count", { ascending: false });
        break;
      case "price_asc":
        query = query.order("price", { ascending: true });
        break;
      case "price_desc":
        query = query.order("price", { ascending: false });
        break;
      case "verified":
        // We'll re-sort in memory below; default DB order = popular
        query = query.order("sales_count", { ascending: false });
        break;
      default:
        query = query
          .order("sales_count", { ascending: false })
          .order("created_at", { ascending: false });
    }

    if (sort !== "verified") {
      query = query.range(offset, offset + limit - 1);
    } else {
      // Pull a wider window so the in-memory sort by badge has enough rows
      query = query.range(0, Math.max(offset + limit * 4, 200) - 1);
    }

    const { data: products, error, count } = await query;
    if (error) throw error;

    // Enrich with store/creator info
    const creatorIds = [...new Set((products || []).map((p) => p.creator_id))];
    let creators: Record<string, any> = {};
    if (creatorIds.length) {
      const { data: profs } = await supabase
        .from("profiles")
        .select("id, display_name, store_slug, store_logo_url, avatar_url")
        .in("id", creatorIds);
      creators = Object.fromEntries((profs || []).map((p) => [p.id, p]));
    }

    // If verified sort requested but we haven't loaded badges yet, load them now
    if (sort === "verified" && Object.keys(badgesByUser).length === 0) {
      const { data: badges } = await supabase
        .from("verified_badges")
        .select("user_id, grade, status, expires_at")
        .eq("status", "active")
        .in("user_id", creatorIds);
      const now = Date.now();
      for (const b of badges || []) {
        if (!b.expires_at || new Date(b.expires_at).getTime() > now) {
          badgesByUser[b.user_id] = { grade: b.grade, expires_at: b.expires_at };
        }
      }
    }

    let enriched = (products || []).map((p) => ({
      ...p,
      store: creators[p.creator_id] || null,
      seller_badge: badgesByUser[p.creator_id]?.grade || null,
      seller_badge_expires_at: badgesByUser[p.creator_id]?.expires_at || null,
    }));

    if (sort === "verified") {
      enriched.sort((a, b) => {
        const ra = GRADE_RANK[a.seller_badge || ""] || 0;
        const rb = GRADE_RANK[b.seller_badge || ""] || 0;
        if (rb !== ra) return rb - ra;
        return (b.sales_count || 0) - (a.sales_count || 0);
      });
      enriched = enriched.slice(offset, offset + limit);
    }

    return new Response(
      JSON.stringify({ products: enriched, total: count || 0, page, limit }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      },
    );
  } catch (err) {
    console.error("marketplace-search error:", err);
    return new Response(
      JSON.stringify({ error: err instanceof Error ? err.message : "Unknown" }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      },
    );
  }
});
