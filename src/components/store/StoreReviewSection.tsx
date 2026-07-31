import { useEffect, useMemo, useState } from "react";
import { MessageSquarePlus, MinusCircle, PlusCircle, Star } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { getBuyerSession } from "@/lib/buyerSession";
import { toast } from "sonner";

interface StoreReview {
  id: string;
  reviewer_name: string;
  sentiment: "positive" | "negative";
  title: string | null;
  comment: string;
  created_at: string;
}

interface StoreReviewSectionProps {
  storeId: string;
  storeName: string;
}

const StoreReviewSection = ({ storeId, storeName }: StoreReviewSectionProps) => {
  const [reviews, setReviews] = useState<StoreReview[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [sentiment, setSentiment] = useState<"positive" | "negative">("positive");
  const [title, setTitle] = useState("");
  const [comment, setComment] = useState("");

  const buyerSession = getBuyerSession();

  const loadReviews = async () => {
    setLoading(true);
    const { data, error } = await (supabase as any)
      .from("store_reviews")
      .select("id, reviewer_name, sentiment, title, comment, created_at")
      .eq("store_id", storeId)
      .eq("is_public", true)
      .order("created_at", { ascending: false });

    if (error) {
      toast.error("Impossible de charger les avis");
    } else {
      setReviews((data as StoreReview[]) || []);
    }
    setLoading(false);
  };

  useEffect(() => {
    void loadReviews();
  }, [storeId]);

  const summary = useMemo(() => {
    const total = reviews.length;
    const positive = reviews.filter((review) => review.sentiment === "positive").length;
    const negative = total - positive;
    return {
      total,
      positive,
      negative,
      positiveRate: total ? Math.round((positive / total) * 100) : 0,
    };
  }, [reviews]);

  const submitReview = async () => {
    if (!buyerSession) {
      toast.info("Connectez-vous à Mes achats pour laisser un avis.");
      return;
    }

    if (!comment.trim()) {
      toast.error("Votre avis est requis.");
      return;
    }

    setSubmitting(true);
    try {
      const { data, error } = await supabase.functions.invoke("submit-store-review", {
        body: {
          storeId,
          customerId: buyerSession.customerId,
          customerEmail: buyerSession.email,
          sentiment,
          title: title.trim(),
          comment: comment.trim(),
        } as any,
      });

      if (error) throw error;
      if (data?.error) throw new Error(data.error);

      toast.success("Votre avis a été publié.");
      setOpen(false);
      setTitle("");
      setComment("");
      setSentiment("positive");
      await loadReviews();
    } catch (error: any) {
      toast.error(error.message || "Impossible d'envoyer votre avis");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className="mx-auto max-w-4xl space-y-6 px-4 py-10 sm:px-6">
      <div className="flex flex-col gap-4 rounded-3xl border border-border bg-card p-6 shadow-sm sm:flex-row sm:items-end sm:justify-between">
        <div>
          <div className="mb-3 flex items-center gap-2">
            <Badge variant="outline" className="border-border bg-background">Avis publics</Badge>
            <Badge variant="outline" className="border-emerald-500/20 bg-emerald-500/10 text-emerald-700">
              <PlusCircle className="mr-1 h-3.5 w-3.5" />
              {summary.positive} positifs
            </Badge>
            <Badge variant="outline" className="border-destructive/20 bg-destructive/10 text-destructive">
              <MinusCircle className="mr-1 h-3.5 w-3.5" />
              {summary.negative} négatifs
            </Badge>
          </div>
          <h2 className="text-2xl font-bold text-foreground">Ce que disent les clients</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            {summary.total > 0
              ? `${summary.positiveRate}% d'avis positifs sur ${summary.total} avis pour ${storeName}.`
              : `Soyez le premier à donner un avis public sur ${storeName}.`}
          </p>
        </div>

        <Button onClick={() => buyerSession ? setOpen(true) : toast.info("Connectez-vous à Mes achats pour laisser un avis.") } className="gap-2">
          <MessageSquarePlus className="h-4 w-4" />
          Laisser un avis
        </Button>
      </div>

      {loading ? (
        <div className="rounded-3xl border border-border bg-card p-8 text-center text-sm text-muted-foreground">
          Chargement des avis...
        </div>
      ) : reviews.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-border bg-card p-8 text-center text-sm text-muted-foreground">
          Aucun avis public pour le moment.
        </div>
      ) : (
        <div className="grid gap-4">
          {reviews.map((review) => (
            <article key={review.id} className="rounded-3xl border border-border bg-card p-5 shadow-sm">
              <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="font-semibold text-foreground">{review.reviewer_name}</p>
                  <p className="text-xs text-muted-foreground">
                    {new Date(review.created_at).toLocaleDateString("fr-FR", {
                      day: "2-digit",
                      month: "long",
                      year: "numeric",
                    })}
                  </p>
                </div>
                <Badge
                  variant="outline"
                  className={review.sentiment === "positive"
                    ? "border-emerald-500/20 bg-emerald-500/10 text-emerald-700"
                    : "border-destructive/20 bg-destructive/10 text-destructive"}
                >
                  <Star className="mr-1 h-3.5 w-3.5" />
                  {review.sentiment === "positive" ? "Avis positif" : "Avis négatif"}
                </Badge>
              </div>
              {review.title ? <h3 className="mb-2 text-base font-semibold text-foreground">{review.title}</h3> : null}
              <p className="text-sm leading-6 text-muted-foreground">{review.comment}</p>
            </article>
          ))}
        </div>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="border-border bg-background">
          <DialogHeader>
            <DialogTitle>Laisser un avis</DialogTitle>
            <DialogDescription>
              Votre avis sera affiché publiquement sur la boutique de {storeName}.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setSentiment("positive")}
                className={`rounded-2xl border px-4 py-3 text-sm font-medium transition-colors ${
                  sentiment === "positive"
                    ? "border-emerald-500/20 bg-emerald-500/10 text-emerald-700"
                    : "border-border bg-card text-foreground"
                }`}
              >
                Sticker positif
              </button>
              <button
                type="button"
                onClick={() => setSentiment("negative")}
                className={`rounded-2xl border px-4 py-3 text-sm font-medium transition-colors ${
                  sentiment === "negative"
                    ? "border-destructive/20 bg-destructive/10 text-destructive"
                    : "border-border bg-card text-foreground"
                }`}
              >
                Sticker négatif
              </button>
            </div>

            <Input
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              maxLength={120}
              placeholder="Titre de votre avis (optionnel)"
            />
            <Textarea
              value={comment}
              onChange={(event) => setComment(event.target.value)}
              maxLength={800}
              placeholder="Décrivez votre expérience avec cette boutique"
              className="min-h-32"
            />

            <Button onClick={submitReview} disabled={submitting} className="w-full">
              {submitting ? "Publication..." : "Publier mon avis"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </section>
  );
};

export default StoreReviewSection;
