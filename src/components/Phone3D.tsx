import { motion } from "framer-motion";
import { CheckCircle, ArrowDownLeft } from "lucide-react";

const Phone3D = ({ compact = false }: { compact?: boolean }) => {
  return (
    <div className="relative" style={{ perspective: "1200px" }}>
      <motion.div
        initial={{ opacity: 0, rotateY: -30, rotateX: 5 }}
        animate={{ opacity: 1, rotateY: -15, rotateX: 5 }}
        transition={{ duration: 1, delay: 0.6, ease: "easeOut" }}
        className={compact 
          ? "relative w-[180px] h-[360px]" 
          : "relative w-[220px] h-[440px] md:w-[260px] md:h-[520px]"
        }
        style={{ transformStyle: "preserve-3d" }}
      >
        {/* Phone body */}
        <div className="absolute inset-0 rounded-[2.5rem] bg-gradient-to-br from-zinc-800 via-zinc-900 to-black shadow-2xl border border-zinc-700/50 overflow-hidden">
          <div className="absolute inset-[3px] rounded-[2.3rem] bg-gradient-to-b from-zinc-950 to-zinc-900 overflow-hidden">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-20 h-5 bg-black rounded-b-2xl z-10" />
            
            <div className="absolute inset-[2px] top-0 rounded-[2.2rem] bg-gradient-to-b from-background to-secondary/50 overflow-hidden p-3 pt-8">
              {/* Status bar */}
              <div className="flex items-center justify-between mb-4 px-2">
                <span className="text-[9px] font-semibold text-foreground/70">09:41</span>
                <div className="flex items-center gap-1">
                  <div className="w-3.5 h-1.5 rounded-sm border border-foreground/40 relative">
                    <div className="absolute inset-[1px] right-[2px] bg-primary rounded-[1px]" />
                  </div>
                </div>
              </div>

              {/* App header */}
              <div className="text-center mb-3">
                <p className={`${compact ? 'text-[9px]' : 'text-[11px]'} font-semibold text-foreground/60 uppercase tracking-wider`}>Dukaio</p>
                <p className={`${compact ? 'text-sm' : 'text-lg'} font-bold text-foreground mt-1`}>Mon Portefeuille</p>
              </div>

              {/* Balance card */}
              <div className="rounded-2xl bg-gradient-to-br from-primary to-primary/80 p-3 mb-3 shadow-lg shadow-primary/20">
                <p className="text-[9px] text-primary-foreground/70 mb-0.5">Solde disponible</p>
                <p className={`${compact ? 'text-base' : 'text-xl'} font-extrabold text-primary-foreground`}>1 250 000 F</p>
                <p className="text-[9px] text-primary-foreground/60 mt-0.5">≈ $2,083</p>
              </div>

              {/* Recent transactions */}
              <div className="space-y-1.5">
                <p className="text-[9px] font-semibold text-foreground/50 uppercase tracking-wider px-1">Récent</p>
                <div className="rounded-xl bg-card border border-border p-2.5 flex items-center gap-2">
                  <div className="h-7 w-7 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                    <ArrowDownLeft className="h-3.5 w-3.5 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[10px] font-semibold text-card-foreground truncate">Retrait Mobile Money</p>
                    <p className="text-[8px] text-muted-foreground">Aujourd'hui, 14:32</p>
                  </div>
                  <p className="text-[10px] font-bold text-primary shrink-0">500 000 F</p>
                </div>
                {!compact && (
                  <div className="rounded-xl bg-card border border-border p-2.5 flex items-center gap-2 opacity-60">
                    <div className="h-7 w-7 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                      <ArrowDownLeft className="h-3.5 w-3.5 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[10px] font-semibold text-card-foreground truncate">Vente - Formation React</p>
                      <p className="text-[8px] text-muted-foreground">Hier, 09:15</p>
                    </div>
                    <p className="text-[10px] font-bold text-primary shrink-0">25 000 F</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Side edge */}
        <div
          className="absolute top-4 bottom-4 -right-[3px] w-[3px] bg-gradient-to-b from-zinc-600 via-zinc-700 to-zinc-800 rounded-r-sm"
          style={{ transform: "rotateY(90deg)", transformOrigin: "left" }}
        />
      </motion.div>

      {/* Floating notification */}
      <motion.div
        initial={{ opacity: 0, x: 40, y: -20, scale: 0.8 }}
        animate={{ opacity: 1, x: 0, y: 0, scale: 1 }}
        transition={{ duration: 0.6, delay: 1.4, ease: "easeOut" }}
        className={compact 
          ? "absolute -top-2 -right-4 z-20" 
          : "absolute -top-4 -right-8 md:-right-16 z-20"
        }
      >
        <motion.div
          animate={{ y: [0, -6, 0] }}
          transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
          className={`flex items-center gap-2 rounded-2xl bg-card border border-border shadow-xl px-3 py-2 backdrop-blur-sm ${compact ? 'min-w-[170px]' : 'min-w-[200px] md:min-w-[240px]'}`}
        >
          <div className={`${compact ? 'h-8 w-8' : 'h-10 w-10'} rounded-full bg-primary/15 flex items-center justify-center shrink-0`}>
            <CheckCircle className={`${compact ? 'h-4 w-4' : 'h-5 w-5'} text-primary`} />
          </div>
          <div>
            <p className={`${compact ? 'text-[10px]' : 'text-xs'} font-bold text-card-foreground`}>Retrait effectué ✅</p>
            <p className={`${compact ? 'text-[8px]' : 'text-[10px]'} text-muted-foreground mt-0.5`}>Votre retrait a été bien effectué</p>
            <p className={`${compact ? 'text-[8px]' : 'text-[10px]'} font-semibold text-primary mt-0.5`}>500 000 FCFA</p>
          </div>
        </motion.div>
      </motion.div>

      {/* Glow */}
      <div className="absolute inset-0 -z-10 rounded-full bg-primary/15 blur-[60px] scale-150" />
    </div>
  );
};

export default Phone3D;
