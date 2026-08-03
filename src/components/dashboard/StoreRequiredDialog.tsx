import React from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Store, AlertTriangle } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface StoreRequiredDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const StoreRequiredDialog: React.FC<StoreRequiredDialogProps> = ({ open, onOpenChange }) => {
  const navigate = useNavigate();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-amber-100 mb-4">
            <AlertTriangle className="h-6 w-6 text-amber-600" />
          </div>
          <DialogTitle className="text-center text-xl">Boutique requise</DialogTitle>
          <DialogDescription className="text-center pt-2">
            Vous ne pouvez pas publier de produit sans avoir au moins une boutique active. 
            Votre produit a été sauvegardé en <strong>Brouillon</strong>.
          </DialogDescription>
        </DialogHeader>
        
        <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 my-2 text-sm text-slate-600 text-center">
          Créez une boutique dès maintenant pour pouvoir publier vos produits et commencer à vendre.
        </div>

        <DialogFooter className="flex-col sm:flex-row gap-2 sm:gap-0 mt-4">
          <Button
            type="button"
            variant="outline"
            className="w-full"
            onClick={() => onOpenChange(false)}
          >
            Rester ici
          </Button>
          <Button
            type="button"
            className="w-full gap-2"
            onClick={() => {
              onOpenChange(false);
              navigate("/dashboard/stores");
            }}
          >
            <Store className="h-4 w-4" />
            Créer une boutique
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default StoreRequiredDialog;
