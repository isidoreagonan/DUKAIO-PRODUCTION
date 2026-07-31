import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Upload, Loader2, ImageIcon, X } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { MarketplaceProductCard, MarketplaceProduct } from "./MarketplaceProductCard";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const VisualSearchDialog = ({ open, onOpenChange }: Props) => {
  const [preview, setPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [keywords, setKeywords] = useState("");
  const [results, setResults] = useState<MarketplaceProduct[]>([]);

  const reset = () => {
    setPreview(null);
    setKeywords("");
    setResults([]);
  };

  const handleFile = async (file: File) => {
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image trop lourde (max 5 Mo)");
      return;
    }
    const reader = new FileReader();
    reader.onload = async (e) => {
      const dataUrl = e.target?.result as string;
      setPreview(dataUrl);
      const base64 = dataUrl.split(",")[1];
      setLoading(true);
      setResults([]);
      try {
        const { data, error } = await supabase.functions.invoke("visual-search", {
          body: { image_base64: base64, image_mime: file.type },
        });
        if (error) throw error;
        setKeywords(data.keywords || "");
        setResults(data.products || []);
        if (!data.products?.length) {
          toast.info("Aucun produit trouvé pour cette image. Essayez une autre.");
        }
      } catch (err: any) {
        console.error(err);
        toast.error(err.message || "Erreur de recherche visuelle");
      } finally {
        setLoading(false);
      }
    };
    reader.readAsDataURL(file);
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(o) => {
        onOpenChange(o);
        if (!o) reset();
      }}
    >
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ImageIcon className="h-5 w-5 text-primary" /> Recherche par image
          </DialogTitle>
          <DialogDescription>
            Téléchargez une photo, notre IA identifie ce que vous cherchez et trouve les produits correspondants.
          </DialogDescription>
        </DialogHeader>

        {!preview && (
          <label className="flex cursor-pointer flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed border-border bg-secondary/30 p-10 text-center transition-colors hover:border-primary hover:bg-secondary/50">
            <Upload className="h-10 w-10 text-muted-foreground" />
            <div>
              <p className="font-medium text-foreground">Cliquez pour télécharger une image</p>
              <p className="text-xs text-muted-foreground">JPG, PNG · Max 5 Mo</p>
            </div>
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) handleFile(f);
              }}
            />
          </label>
        )}

        {preview && (
          <div className="space-y-4">
            <div className="relative inline-block">
              <img src={preview} alt="Aperçu" className="max-h-48 rounded-xl" />
              <button
                onClick={reset}
                className="absolute -right-2 -top-2 rounded-full bg-background p-1 shadow-md hover:bg-destructive hover:text-destructive-foreground"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            {loading && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin" />
                L'IA analyse votre image…
              </div>
            )}
            {keywords && !loading && (
              <p className="text-sm text-muted-foreground">
                <span className="font-medium text-foreground">Mots-clés détectés :</span> {keywords}
              </p>
            )}
            {results.length > 0 && (
              <div>
                <h4 className="mb-3 font-semibold text-foreground">
                  {results.length} produit{results.length > 1 ? "s" : ""} trouvé{results.length > 1 ? "s" : ""}
                </h4>
                <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
                  {results.map((p, i) => (
                    <MarketplaceProductCard key={p.id} product={p} index={i} />
                  ))}
                </div>
              </div>
            )}
            {!loading && results.length === 0 && keywords && (
              <Button onClick={reset} variant="outline" className="w-full">
                Essayer une autre image
              </Button>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};
