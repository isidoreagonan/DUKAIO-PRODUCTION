import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { AlertCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface FileSizeLimitDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  maxSizeMB: number;
}

export function FileSizeLimitDialog({ open, onOpenChange, maxSizeMB }: FileSizeLimitDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md p-0 overflow-hidden bg-background/95 backdrop-blur-xl border border-border shadow-2xl rounded-2xl">
        <AnimatePresence>
          {open && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              transition={{ duration: 0.3, ease: "easeOut" }}
              className="p-6 relative"
            >
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-red-500 via-orange-500 to-red-500 opacity-80"></div>
              
              <DialogHeader className="pt-4 flex flex-col items-center text-center space-y-4">
                <div className="h-16 w-16 rounded-full bg-red-500/10 flex items-center justify-center border border-red-500/20 shadow-[0_0_15px_rgba(239,68,68,0.2)]">
                  <AlertCircle className="h-8 w-8 text-red-500" />
                </div>
                <div>
                  <DialogTitle className="text-2xl font-bold tracking-tight mb-2 text-foreground">Fichier trop volumineux</DialogTitle>
                  <DialogDescription className="text-base text-foreground/80">
                    La taille de votre fichier dépasse la limite autorisée. Veuillez sélectionner un fichier de <span className="font-bold text-foreground">moins de {maxSizeMB} Mo</span>.
                  </DialogDescription>
                </div>
              </DialogHeader>

              <DialogFooter className="mt-8 flex justify-center sm:justify-center">
                <Button 
                  onClick={() => onOpenChange(false)}
                  className="w-full sm:w-auto px-8 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground shadow-[0_0_20px_rgba(var(--primary),0.3)] transition-all"
                >
                  J'ai compris
                </Button>
              </DialogFooter>
            </motion.div>
          )}
        </AnimatePresence>
      </DialogContent>
    </Dialog>
  );
}
