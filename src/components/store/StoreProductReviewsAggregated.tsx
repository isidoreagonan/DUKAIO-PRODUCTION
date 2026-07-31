import { useEffect, useMemo, useState } from "react";
import { ThumbsUp, ThumbsDown, Star } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import KycBadge from "@/components/KycBadge";
import { useCustomersKyc } from "@/hooks/useCustomersKyc";
import { Link } from "react-router-dom";

interface Review {
  id: string;
  product_id: string;
  customer_id: string;
  reviewer_name: string;
  sentiment: "positive" | "negative";
  title: string | null;
  comment: string;
  created_at: string;
}

interface Props {
  storeOwnerId: string;
  storeSlug: string;
  brandColor?: string;
}

const StoreProductReviewsAggregated = ({ storeOwnerId, storeSlug, brandColor = "#2563EB" }: Props) => {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [productMap, setProductMap] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      const { data } = await supabase
        .from("product_reviews")
        .select("id, product_id, customer_id, reviewer_name, sentiment, title, comment, created_at")
        .eq("store_owner_id", storeOwnerId)
        .eq("is_public", true)
        .order("created_at", { ascending: false })
        .limit(50);
      const rs = (data as Review[]) || [];
      if (cancelled) return;
      setReviews(rs);
      const ids = Array.from(new Set(rs.map((r) => r.product_id)));
      if (ids.length) {
        const { data: prods } = await supabase
          .from("products").select("id, title").in("id", ids);
        const map: Record<string, string> = {};
        (prods || []).forEach((p: any) => (map[p.id] = p.title));
        if (!cancelled) setProductMap(map);
      }
      if (!cancelled) setLoading(false);
    })();
    return () => { cancelled = true; };
  }, [storeOwnerId]);

  const verifiedKyc = useCustomersKyc(reviews.map((r) => r.customer_id));

  const stats = useMemo(() => {
    const total = reviews.length;
    const positive = reviews.filter((r) => r.sentiment === "positive").length;
    return { total, positive, negative: total - positive, rate: total ? Math.round((positive / total) * 100) : 0 };
  }, [reviews]);

  if (loading) {
    return <div className="text-center text-sm text-muted-foreground py-8">Chargement…</div>;
  }

  if (reviews.length === 0) return null;

  return (
    <section className="mx-auto max-w-4xl space-y-4 px-4 py-6 sm:px-6">
      <div className="flex flex-col gap-3 rounded-3xl border border-border bg-card p-6 shadow-sm sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-bold text-foreground">Avis sur les produits</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            {stats.rate}% recommandent · {stats.total} avis sur les produits de cette boutique
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="border-emerald-200 bg-emerald-50 text-emerald-700">
            <ThumbsUp className="mr-1 h-3.5 w-3.5" /> {stats.positive}
          </Badge>
          <Badge variant="outline" className="border-rose-200 bg-rose-50 text-rose-700">
            <ThumbsDown className="mr-1 h-3.5 w-3.5" /> {stats.negative}
          </Badge>
        </div>
      </div>

      <div className="grid gap-3">
        {reviews.map((r) => {
          const isVerified = verifiedKyc.has(r.customer_id);
          return (
            <article key={r.id} className="rounded-2xl border border-border bg-card p-4">
              <div className="flex items-start gap-3">
                <Avatar className="h-9 w-9">
                  <AvatarFallback className="text-xs">
                    {r.reviewer_name?.charAt(0)?.toUpperCase() || "C"}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-sm font-semibold text-foreground">{r.reviewer_name}</span>
                    {isVerified && <KycBadge size="sm" />}
                    <Badge
                      variant="outline"
                      className={r.sentiment === "positive"
                        ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                        : "border-rose-200 bg-rose-50 text-rose-700"}
                    >
                      <Star className="mr-1 h-3 w-3" />
                      {r.sentiment === "positive" ? "Recommande" : "Déçu"}
                    </Badge>
                    <span className="text-[11px] text-muted-foreground">
                      {new Date(r.created_at).toLocaleDateString("fr-FR", { day: "2-digit", month: "short", year: "numeric" })}
                    </span>
                  </div>
                  {productMap[r.product_id] && (
                    <Link
                      to={`/store/${storeSlug}/${r.product_id}`}
                      className="mt-1 block text-xs text-primary hover:underline"
                      style={{ color: brandColor }}
                    >
                      {productMap[r.product_id]}
                    </Link>
                  )}
                  {r.title && <p className="mt-1 text-sm font-semibold text-foreground">{r.title}</p>}
                  <p className="mt-1 text-sm leading-6 text-muted-foreground whitespace-pre-wrap">{r.comment}</p>
                </div>
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
};

export default StoreProductReviewsAggregated;
