import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { AlertCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface MissingContentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onEdit: () => void;
}

export function MissingContentDialog({ open, onOpenChange, onEdit }: MissingContentDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md p-0 overflow-hidden bg-white/95 dark:bg-zinc-950/95 backdrop-blur-2xl border border-white/20 dark:border-zinc-800/50 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.1)] dark:shadow-[0_20px_60px_-15px_rgba(0,0,0,0.5)] rounded-3xl">
        <AnimatePresence>
          {open && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="relative w-full h-full flex flex-col"
            >
              {/* Premium Background Effects */}
              <div className="absolute inset-0 -z-10 overflow-hidden pointer-events-none rounded-3xl">
                <div className="absolute -top-24 -right-24 w-48 h-48 bg-blue-500/10 blur-[50px] rounded-full" />
                <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-blue-600/10 blur-[50px] rounded-full" />
              </div>
              
              <div className="p-8">
                <DialogHeader className="pt-2 flex flex-col items-center text-center space-y-6">
                  {/* Premium Icon Container */}
                  <motion.div 
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.1, type: "spring", damping: 15 }}
                    className="relative"
                  >
                    <div className="absolute inset-0 bg-gradient-to-tr from-red-500 to-rose-400 blur-xl opacity-30 rounded-full" />
                    <div className="h-20 w-20 relative bg-gradient-to-tr from-white to-red-50 dark:from-zinc-900 dark:to-zinc-800 rounded-2xl flex items-center justify-center border border-red-100 dark:border-red-900/30 shadow-xl rotate-3">
                      <div className="absolute inset-0 bg-gradient-to-tr from-red-500 to-rose-400 opacity-[0.03] rounded-2xl" />
                      <AlertCircle className="h-10 w-10 text-red-500 -rotate-3 drop-shadow-sm" />
                    </div>
                  </motion.div>

                  <div className="space-y-3">
                    <DialogTitle className="text-2xl font-black tracking-tight bg-clip-text text-transparent bg-gradient-to-br from-zinc-900 to-zinc-600 dark:from-white dark:to-zinc-400">
                      Oups, contenu manquant !
                    </DialogTitle>
                    <DialogDescription className="text-[15px] leading-relaxed text-zinc-600 dark:text-zinc-400 max-w-[90%] mx-auto font-medium">
                      Votre produit est vide. Impossible de le publier sans lui ajouter au moins un fichier ou un module.
                    </DialogDescription>
                  </div>
                </DialogHeader>

                <DialogFooter className="mt-10 flex flex-col sm:flex-row gap-3 justify-center w-full">
                  <Button 
                    variant="ghost"
                    onClick={() => onOpenChange(false)}
                    className="rounded-2xl w-full sm:w-1/2 h-12 font-semibold text-zinc-500 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800/50 transition-all"
                  >
                    Plus tard
                  </Button>
                  <Button 
                    onClick={() => {
                      onEdit();
                      onOpenChange(false);
                    }}
                    className="rounded-2xl h-12 w-full sm:w-1/2 font-bold text-white bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 border-none shadow-[0_8px_20px_rgba(59,130,246,0.25)] hover:shadow-[0_12px_25px_rgba(59,130,246,0.35)] hover:-translate-y-0.5 transition-all duration-300"
                  >
                    Ajouter du contenu
                  </Button>
                </DialogFooter>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </DialogContent>
    </Dialog>
  );
}
