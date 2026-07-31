import { useState } from "react";
import { AlertTriangle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { getBuyerSession } from "@/lib/buyerSession";
import { toast } from "sonner";

interface ProductReportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  productId: string;
  productTitle: string;
}

const ProductReportDialog = ({ open, onOpenChange, productId, productTitle }: ProductReportDialogProps) => {
  const [reason, setReason] = useState("contenu_trompeur");
  const [details, setDetails] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const buyerSession = getBuyerSession();

  const submitReport = async () => {
    if (!buyerSession) {
      toast.info("Connectez-vous à Mes achats pour signaler un produit.");
      return;
    }

    setSubmitting(true);
    try {
      const { data, error } = await supabase.functions.invoke("submit-product-report", {
        body: {
          productId,
          customerId: buyerSession.customerId,
          customerEmail: buyerSession.email,
          reason,
          details: details.trim(),
        },
      });

      if (error) throw error;
      if (data?.error) throw new Error(data.error);

      toast.success("Le signalement a bien été envoyé.");
      setDetails("");
      setReason("contenu_trompeur");
      onOpenChange(false);
    } catch (error: any) {
      toast.error(error.message || "Impossible d'envoyer le signalement");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="border-border bg-background">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-destructive" />
            Signaler un produit
          </DialogTitle>
          <DialogDescription>
            Signalez {productTitle} si la promesse est trompeuse, interdite ou non conforme.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <Select value={reason} onValueChange={setReason}>
            <SelectTrigger>
              <SelectValue placeholder="Motif du signalement" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="contenu_trompeur">Promesse trompeuse</SelectItem>
              <SelectItem value="contenu_illegal">Contenu illégal</SelectItem>
              <SelectItem value="arnaque">Suspicion d'arnaque</SelectItem>
              <SelectItem value="copyright">Violation de droits</SelectItem>
              <SelectItem value="autre">Autre</SelectItem>
            </SelectContent>
          </Select>

          <Textarea
            value={details}
            onChange={(event) => setDetails(event.target.value)}
            maxLength={1000}
            placeholder="Ajoutez des détails utiles pour l'équipe de modération"
            className="min-h-32"
          />

          <Button onClick={submitReport} disabled={submitting} className="w-full">
            {submitting ? "Envoi..." : "Envoyer le signalement"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ProductReportDialog;
