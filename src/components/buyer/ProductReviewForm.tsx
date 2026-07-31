import { useEffect, useState } from "react";
import { ThumbsUp, ThumbsDown, Loader2, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface Props {
  productId: string;
  customerId: string;
  brandColor?: string;
}

interface ReviewRow {
  id: string;
  sentiment: "positive" | "negative";
  title: string | null;
  comment: string;
}

const ProductReviewForm = ({ productId, customerId, brandColor = "#2563EB" }: Props) => {
  const [existing, setExisting] = useState<ReviewRow | null>(null);
  const [sentiment, setSentiment] = useState<"positive" | "negative">("positive");
  const [title, setTitle] = useState("");
  const [comment, setComment] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      const { data } = await supabase
        .from("product_reviews")
        .select("id, sentiment, title, comment")
        .eq("product_id", productId)
        .eq("customer_id", customerId)
        .maybeSingle();
      if (!cancelled && data) {
        const row = data as ReviewRow;
        setExisting(row);
        setSentiment(row.sentiment);
        setTitle(row.title || "");
        setComment(row.comment);
      }
      if (!cancelled) setLoading(false);
    })();
    return () => {
      cancelled = true;
    };
  }, [productId, customerId]);

  const submit = async () => {
    if (!comment.trim()) {
      toast.error("Veuillez rédiger votre avis.");
      return;
    }
    setSaving(true);
    try {
      if (existing) {
        const { error } = await supabase
          .from("product_reviews")
          .update({ sentiment, title: title.trim() || null, comment: comment.trim() })
          .eq("id", existing.id);
        if (error) throw error;
        toast.success("Votre avis a été mis à jour.");
      } else {
        const { data, error } = await supabase
          .from("product_reviews")
          .insert({
            product_id: productId,
            customer_id: customerId,
            sentiment,
            title: title.trim() || null,
            comment: comment.trim(),
            // store_owner_id & reviewer_name set by trigger
            store_owner_id: "00000000-0000-0000-0000-000000000000",
            reviewer_name: "_",
          } as any)
          .select("id, sentiment, title, comment")
          .single();
        if (error) throw error;
        setExisting(data as ReviewRow);
        toast.success("Merci pour votre avis !");
      }
    } catch (err: any) {
      toast.error(err.message || "Impossible d'enregistrer l'avis");
    } finally {
      setSaving(false);
    }
  };

  const remove = async () => {
    if (!existing) return;
    setSaving(true);
    const { error } = await supabase.from("product_reviews").delete().eq("id", existing.id);
    setSaving(false);
    if (error) {
      toast.error("Suppression impossible");
      return;
    }
    setExisting(null);
    setTitle("");
    setComment("");
    setSentiment("positive");
    toast.success("Avis supprimé");
  };

  if (loading) {
    return (
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Loader2 className="h-4 w-4 animate-spin" /> Chargement…
      </div>
    );
  }

  return (
    <div className="space-y-4 rounded-2xl border border-border bg-card/50 p-4">
      <div>
        <h4 className="text-sm font-semibold text-foreground">
          {existing ? "Modifier votre avis" : "Laisser un avis sur ce produit"}
        </h4>
        <p className="mt-0.5 text-xs text-muted-foreground">
          Vous ne pouvez laisser qu'un seul avis. Vous pourrez le modifier à tout moment.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <button
          type="button"
          onClick={() => setSentiment("positive")}
          className={`flex items-center justify-center gap-2 rounded-xl border px-3 py-2.5 text-sm font-medium transition-all ${
            sentiment === "positive"
              ? "border-emerald-300 bg-emerald-50 text-emerald-700 ring-2 ring-emerald-200"
              : "border-border bg-background text-foreground hover:bg-secondary"
          }`}
        >
          <ThumbsUp className="h-4 w-4" /> Super
        </button>
        <button
          type="button"
          onClick={() => setSentiment("negative")}
          className={`flex items-center justify-center gap-2 rounded-xl border px-3 py-2.5 text-sm font-medium transition-all ${
            sentiment === "negative"
              ? "border-rose-300 bg-rose-50 text-rose-700 ring-2 ring-rose-200"
              : "border-border bg-background text-foreground hover:bg-secondary"
          }`}
        >
          <ThumbsDown className="h-4 w-4" /> Pas super
        </button>
      </div>

      <Input
        placeholder="Titre (optionnel)"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        maxLength={120}
      />
      <Textarea
        placeholder="Partagez votre expérience avec ce produit…"
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        maxLength={1000}
        className="min-h-28"
      />

      <div className="flex flex-wrap items-center gap-2">
        <Button
          onClick={submit}
          disabled={saving}
          className="flex-1"
          style={{ backgroundColor: brandColor }}
        >
          {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : existing ? "Mettre à jour" : "Publier mon avis"}
        </Button>
        {existing && (
          <Button variant="outline" size="icon" onClick={remove} disabled={saving} title="Supprimer">
            <Trash2 className="h-4 w-4" />
          </Button>
        )}
      </div>
    </div>
  );
};

export default ProductReviewForm;
