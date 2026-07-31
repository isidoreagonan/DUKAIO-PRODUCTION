import { useEffect, useMemo, useState } from "react";
import { ThumbsUp, ThumbsDown, MessageSquare } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Badge } from "@/components/ui/badge";
import KycBadge from "@/components/KycBadge";
import { useCustomersKyc } from "@/hooks/useCustomersKyc";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

interface Review {
  id: string;
  customer_id: string;
  reviewer_name: string;
  sentiment: "positive" | "negative";
  title: string | null;
  comment: string;
  created_at: string;
}

interface Props {
  productId: string;
  brandColor?: string;
}

const ProductReviewsSection = ({ productId, brandColor = "#2563EB" }: Props) => {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      const { data } = await supabase
        .from("product_reviews")
        .select("id, customer_id, reviewer_name, sentiment, title, comment, created_at")
        .eq("product_id", productId)
        .eq("is_public", true)
        .order("created_at", { ascending: false });
      if (!cancelled) {
        setReviews((data as Review[]) || []);
        setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [productId]);

  const verifiedKyc = useCustomersKyc(reviews.map((r) => r.customer_id));

  const stats = useMemo(() => {
    const total = reviews.length;
    const positive = reviews.filter((r) => r.sentiment === "positive").length;
    return {
      total,
      positive,
      negative: total - positive,
      rate: total ? Math.round((positive / total) * 100) : 0,
    };
  }, [reviews]);

  if (loading) {
    return (
      <div className="rounded-2xl border border-gray-100 bg-white p-5 sm:p-7">
        <div className="text-sm text-gray-400">Chargement des avis…</div>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-gray-100 bg-white p-5 sm:p-7 space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
            <MessageSquare className="h-5 w-5" style={{ color: brandColor }} />
            Avis des clients
          </h2>
          <p className="mt-1 text-sm text-gray-500">
            {stats.total === 0
              ? "Aucun avis pour le moment."
              : `${stats.rate}% recommandent ce produit · ${stats.total} avis`}
          </p>
        </div>
        {stats.total > 0 && (
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="border-emerald-200 bg-emerald-50 text-emerald-700">
              <ThumbsUp className="mr-1 h-3.5 w-3.5" /> {stats.positive}
            </Badge>
            <Badge variant="outline" className="border-rose-200 bg-rose-50 text-rose-700">
              <ThumbsDown className="mr-1 h-3.5 w-3.5" /> {stats.negative}
            </Badge>
          </div>
        )}
      </div>

      {reviews.length === 0 ? (
        <p className="rounded-xl border border-dashed border-gray-200 bg-gray-50/60 p-6 text-center text-sm text-gray-400">
          Soyez le premier à laisser un avis depuis votre espace « Mes achats ».
        </p>
      ) : reviews.length > 3 ? (
        <div
          className="group relative overflow-hidden"
          style={{
            maskImage: "linear-gradient(to right, transparent, black 6%, black 94%, transparent)",
            WebkitMaskImage: "linear-gradient(to right, transparent, black 6%, black 94%, transparent)",
          }}
        >
          <div className="flex gap-4 w-max animate-marquee group-hover:[animation-play-state:paused]">
            {[...reviews, ...reviews].map((r, idx) => {
              const isVerified = verifiedKyc.has(r.customer_id);
              return (
                <article
                  key={`${r.id}-${idx}`}
                  className="w-[300px] sm:w-[340px] shrink-0 rounded-xl border border-gray-100 bg-gray-50/40 p-4"
                >
                  <div className="flex items-start gap-3">
                    <Avatar className="h-9 w-9">
                      <AvatarFallback className="bg-white text-xs font-semibold text-gray-700 border border-gray-100">
                        {r.reviewer_name?.charAt(0)?.toUpperCase() || "C"}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-sm font-semibold text-gray-900 truncate max-w-[140px]">
                          {r.reviewer_name}
                        </span>
                        {isVerified && <KycBadge size="sm" />}
                      </div>
                      <div className="mt-1 flex items-center gap-2">
                        <Badge
                          variant="outline"
                          className={
                            r.sentiment === "positive"
                              ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                              : "border-rose-200 bg-rose-50 text-rose-700"
                          }
                        >
                          {r.sentiment === "positive" ? (
                            <>
                              <ThumbsUp className="mr-1 h-3 w-3" /> Recommande
                            </>
                          ) : (
                            <>
                              <ThumbsDown className="mr-1 h-3 w-3" /> Déçu
                            </>
                          )}
                        </Badge>
                        <span className="text-[11px] text-gray-400">
                          {new Date(r.created_at).toLocaleDateString("fr-FR", {
                            day: "2-digit",
                            month: "short",
                          })}
                        </span>
                      </div>
                      {r.title && (
                        <p className="mt-2 text-sm font-semibold text-gray-900 line-clamp-1">{r.title}</p>
                      )}
                      <p className="mt-1 text-sm leading-6 text-gray-600 line-clamp-4">
                        {r.comment}
                      </p>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        </div>
      ) : (
        <ul className="space-y-4">
          {reviews.map((r) => {
            const isVerified = verifiedKyc.has(r.customer_id);
            return (
              <li key={r.id} className="rounded-xl border border-gray-100 bg-gray-50/40 p-4">
                <div className="flex items-start gap-3">
                  <Avatar className="h-9 w-9">
                    <AvatarFallback className="bg-white text-xs font-semibold text-gray-700 border border-gray-100">
                      {r.reviewer_name?.charAt(0)?.toUpperCase() || "C"}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-sm font-semibold text-gray-900">
                        {r.reviewer_name}
                      </span>
                      {isVerified && <KycBadge size="sm" />}
                      <Badge
                        variant="outline"
                        className={
                          r.sentiment === "positive"
                            ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                            : "border-rose-200 bg-rose-50 text-rose-700"
                        }
                      >
                        {r.sentiment === "positive" ? (
                          <>
                            <ThumbsUp className="mr-1 h-3 w-3" /> Recommande
                          </>
                        ) : (
                          <>
                            <ThumbsDown className="mr-1 h-3 w-3" /> Déçu
                          </>
                        )}
                      </Badge>
                      <span className="text-[11px] text-gray-400">
                        {new Date(r.created_at).toLocaleDateString("fr-FR", {
                          day: "2-digit",
                          month: "short",
                          year: "numeric",
                        })}
                      </span>
                    </div>
                    {r.title && (
                      <p className="mt-1 text-sm font-semibold text-gray-900">{r.title}</p>
                    )}
                    <p className="mt-1 text-sm leading-6 text-gray-600 whitespace-pre-wrap">
                      {r.comment}
                    </p>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
};

export default ProductReviewsSection;
