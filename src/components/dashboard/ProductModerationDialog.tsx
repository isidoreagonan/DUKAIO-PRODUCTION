import { Ban, CheckCircle2, ShieldAlert } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";

export interface ProductModerationReview {
  status: "approved" | "needs_review" | "rejected";
  summary: string;
  issues: string[];
  suggested_fixes: string[];
  reviewed_at?: string;
}

const statusConfig = {
  approved: {
    label: "Approuvé",
    icon: CheckCircle2,
    badgeClass: "border-emerald-500/20 bg-emerald-500/10 text-emerald-700",
    panelClass: "border-emerald-500/20 bg-emerald-500/5",
  },
  rejected: {
    label: "Bloqué",
    icon: Ban,
    badgeClass: "border-destructive/20 bg-destructive/10 text-destructive",
    panelClass: "border-destructive/20 bg-destructive/5",
  },
} as const;

interface ProductModerationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  review: ProductModerationReview | null;
}

const ProductModerationDialog = ({ open, onOpenChange, review }: ProductModerationDialogProps) => {
  // Don't show dialog for needs_review (silently handled) or missing review
  if (!review || review.status === "needs_review") return null;

  const config = statusConfig[review.status];
  if (!config) return null;
  const StatusIcon = config.icon;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm border-border bg-background">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className={`flex h-9 w-9 items-center justify-center rounded-xl border ${config.panelClass}`}>
              <ShieldAlert className="h-4 w-4 text-foreground" />
            </div>
            <div>
              <DialogTitle className="text-base">Analyse du produit</DialogTitle>
              <DialogDescription className="text-xs">
                Vérification avant publication
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-3">
          <div className={`rounded-xl border p-3 ${config.panelClass}`}>
            <div className="mb-2 flex items-center gap-2">
              <Badge variant="outline" className={`text-xs ${config.badgeClass}`}>
                <StatusIcon className="mr-1 h-3 w-3" />
                {config.label}
              </Badge>
            </div>
            <p className="text-sm leading-5 text-foreground">{review.summary}</p>
          </div>

          {review.status === "rejected" && review.issues.length > 0 && (
            <div className="space-y-1.5">
              <h3 className="text-xs font-semibold text-foreground">Raisons</h3>
              <ul className="space-y-1">
                {review.issues.map((issue, index) => (
                  <li key={`${issue}-${index}`} className="rounded-lg border border-border bg-card px-3 py-2 text-xs text-foreground">
                    {issue}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ProductModerationDialog;
