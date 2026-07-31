import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";
import { FileText, Music, Video, KeyRound, GraduationCap, Image as ImageIcon, Store, ShieldCheck, CheckCircle2 } from "lucide-react";
import orangeLogo from "@/assets/payment-logos/providers/orange.png";
import mtnLogo from "@/assets/payment-logos/providers/mtn.png";
import moovLogo from "@/assets/payment-logos/providers/moov.png";
import airtelLogo from "@/assets/payment-logos/providers/airtel.png";
import mpesaLogo from "@/assets/payment-logos/providers/mpesa.png";
import vodacomLogo from "@/assets/payment-logos/providers/vodacom.png";

const fallingProducts = [
  { Icon: FileText, color: "from-blue-500 to-cyan-500", label: "Fichier", delay: 0 },
  { Icon: Music, color: "from-pink-500 to-rose-500", label: "Audio", delay: 0.25 },
  { Icon: Video, color: "from-red-500 to-orange-500", label: "Vidéo", delay: 0.5 },
  { Icon: KeyRound, color: "from-amber-500 to-yellow-500", label: "Licence", delay: 0.75 },
  { Icon: GraduationCap, color: "from-emerald-500 to-teal-500", label: "Cours", delay: 1 },
  { Icon: ImageIcon, color: "from-violet-500 to-fuchsia-500", label: "Pack", delay: 1.25 },
];

const paymentLogos = [
  { src: orangeLogo, name: "Orange Money" },
  { src: mtnLogo, name: "MTN MoMo" },
  { src: moovLogo, name: "Moov Money" },
  { src: airtelLogo, name: "Airtel Money" },
  { src: mpesaLogo, name: "M-Pesa" },
  { src: vodacomLogo, name: "Vodacom" },
];

// Approximate normalized positions on our stylized Africa shape (% of container)
const africaTargets = [
  { name: "Sénégal", x: 18, y: 38 },
  { name: "Côte d'Ivoire", x: 26, y: 52 },
  { name: "Bénin", x: 36, y: 52 },
  { name: "Cameroun", x: 46, y: 58 },
  { name: "RDC", x: 56, y: 70 },
  { name: "Kenya", x: 72, y: 68 },
];

const SCENE_DURATION = 4500; // ms per scene

const HeroVisual = () => {
  const [scene, setScene] = useState(0);

  useEffect(() => {
    const id = setInterval(() => setScene((s) => (s + 1) % 3), SCENE_DURATION);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="relative w-full max-w-[520px] mx-auto aspect-[4/5]" style={{ perspective: "1400px" }}>
      {/* Ambient glow */}
      <div className="absolute -top-16 -left-16 h-72 w-72 rounded-full bg-primary/30 blur-[110px]" />
      <div className="absolute -bottom-16 -right-12 h-80 w-80 rounded-full bg-accent/30 blur-[120px]" />

      {/* Stage card */}
      <motion.div
        initial={{ opacity: 0, rotateX: 12, y: 30 }}
        animate={{ opacity: 1, rotateX: 6, y: 0 }}
        transition={{ duration: 0.9, ease: "easeOut" }}
        style={{ transformStyle: "preserve-3d" }}
        className="relative h-full w-full rounded-[32px] border border-border bg-gradient-to-br from-card via-card to-secondary/40 shadow-[0_30px_80px_-20px_hsl(var(--primary)/0.45)] overflow-hidden"
      >
        {/* Grid floor */}
        <div
          className="absolute inset-0 opacity-[0.06]"
          style={{
            backgroundImage:
              "linear-gradient(hsl(var(--foreground)) 1px, transparent 1px), linear-gradient(90deg, hsl(var(--foreground)) 1px, transparent 1px)",
            backgroundSize: "36px 36px",
          }}
        />

        {/* Scene indicator dots */}
        <div className="absolute top-4 left-1/2 -translate-x-1/2 z-30 flex gap-1.5">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className={`h-1.5 rounded-full transition-all duration-500 ${
                scene === i ? "w-8 bg-gradient-to-r from-primary to-accent" : "w-1.5 bg-border"
              }`}
            />
          ))}
        </div>

        <AnimatePresence mode="wait">
          {/* SCENE 1: Products falling into shop */}
          {scene === 0 && (
            <motion.div
              key="scene-shop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.4 }}
              className="absolute inset-0"
            >
              <div className="absolute top-12 left-0 right-0 text-center">
                <p className="text-[10px] uppercase tracking-[0.2em] font-bold text-muted-foreground">Étape 1</p>
                <p className="text-sm font-bold text-foreground mt-1">Vos produits arrivent</p>
              </div>

              {/* Falling products */}
              {fallingProducts.map(({ Icon, color, label, delay }, i) => {
                const xPos = 12 + (i * 76) / fallingProducts.length;
                return (
                  <motion.div
                    key={label}
                    initial={{ y: -120, opacity: 0, rotate: -20, scale: 0.6 }}
                    animate={{
                      y: [-120, 180, 200, 195],
                      opacity: [0, 1, 1, 1],
                      rotate: [-20, 5, -3, 0],
                      scale: [0.6, 1, 0.95, 1],
                    }}
                    transition={{
                      duration: 1.6,
                      delay,
                      times: [0, 0.7, 0.85, 1],
                      ease: "easeIn",
                    }}
                    className="absolute"
                    style={{ left: `${xPos}%`, top: "20%" }}
                  >
                    <div className={`flex flex-col items-center gap-1`}>
                      <div className={`h-12 w-12 rounded-2xl bg-gradient-to-br ${color} shadow-xl flex items-center justify-center`}>
                        <Icon className="h-6 w-6 text-white" strokeWidth={2.5} />
                      </div>
                      <span className="text-[9px] font-bold text-foreground/70">{label}</span>
                    </div>
                  </motion.div>
                );
              })}

              {/* Shop at bottom */}
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.6 }}
                className="absolute bottom-8 left-1/2 -translate-x-1/2 w-[80%]"
              >
                <div className="relative">
                  {/* Shop body */}
                  <div className="relative rounded-2xl bg-gradient-to-br from-primary to-accent p-4 shadow-2xl shadow-primary/40">
                    <div className="flex items-center gap-3">
                      <div className="h-12 w-12 rounded-xl bg-white/15 backdrop-blur flex items-center justify-center border border-white/20">
                        <Store className="h-6 w-6 text-white" />
                      </div>
                      <div className="flex-1">
                        <p className="text-[10px] uppercase tracking-wider text-white/80 font-bold">Votre boutique</p>
                        <p className="text-sm font-extrabold text-white">dukaio.com/ma-boutique</p>
                      </div>
                      <motion.div
                        animate={{ scale: [1, 1.15, 1] }}
                        transition={{ duration: 1.2, repeat: Infinity }}
                        className="h-2.5 w-2.5 rounded-full bg-emerald-400 shadow-lg shadow-emerald-400/60"
                      />
                    </div>
                  </div>
                  {/* Shop reflection */}
                  <div className="absolute inset-x-4 -bottom-3 h-3 bg-primary/30 blur-md rounded-full" />
                </div>
              </motion.div>
            </motion.div>
          )}

          {/* SCENE 2: Payment with logos */}
          {scene === 1 && (
            <motion.div
              key="scene-payment"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.4 }}
              className="absolute inset-0 flex flex-col items-center justify-center px-6"
            >
              <div className="text-center mb-6">
                <p className="text-[10px] uppercase tracking-[0.2em] font-bold text-muted-foreground">Étape 2</p>
                <p className="text-sm font-bold text-foreground mt-1">Paiements Mobile Money</p>
              </div>

              {/* Payment terminal */}
              <motion.div
                initial={{ scale: 0.8, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="w-full max-w-[280px] rounded-2xl bg-background border-2 border-primary/30 shadow-2xl shadow-primary/20 p-4 mb-4"
              >
                <div className="flex items-center justify-between mb-3">
                  <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider">Total</span>
                  <motion.span
                    key={scene}
                    initial={{ opacity: 0, y: -5 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-lg font-extrabold text-foreground"
                  >
                    25 000 <span className="text-xs text-muted-foreground">FCFA</span>
                  </motion.span>
                </div>

                <div className="grid grid-cols-3 gap-2">
                  {paymentLogos.map((logo, i) => (
                    <motion.div
                      key={logo.name}
                      initial={{ opacity: 0, scale: 0.6, y: 10 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      transition={{ delay: 0.3 + i * 0.08, type: "spring", stiffness: 200 }}
                      className="aspect-square rounded-xl bg-secondary/60 border border-border flex items-center justify-center p-2 hover:border-primary/40 transition-colors"
                    >
                      <img src={logo.src} alt={logo.name} className="max-h-full max-w-full object-contain" />
                    </motion.div>
                  ))}
                </div>
              </motion.div>

              {/* Processing pulse */}
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 1.2, duration: 0.4 }}
                className="flex items-center gap-2 rounded-full bg-emerald-500/10 border border-emerald-500/30 px-4 py-2"
              >
                <motion.div
                  animate={{ scale: [1, 1.3, 1], opacity: [1, 0.6, 1] }}
                  transition={{ duration: 1, repeat: Infinity }}
                >
                  <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                </motion.div>
                <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">Paiement sécurisé</span>
              </motion.div>
            </motion.div>
          )}

          {/* SCENE 3: Africa map */}
          {scene === 2 && (
            <motion.div
              key="scene-africa"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.4 }}
              className="absolute inset-0"
            >
              <div className="absolute top-12 left-0 right-0 text-center">
                <p className="text-[10px] uppercase tracking-[0.2em] font-bold text-muted-foreground">Étape 3</p>
                <p className="text-sm font-bold text-foreground mt-1">Distribution panafricaine</p>
              </div>

              {/* Africa SVG */}
              <div className="absolute inset-0 flex items-center justify-center pt-16 pb-8 px-6">
                <div className="relative w-full h-full">
                  <svg viewBox="0 0 100 110" className="absolute inset-0 w-full h-full" preserveAspectRatio="xMidYMid meet">
                    <defs>
                      <linearGradient id="africaGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity="0.35" />
                        <stop offset="100%" stopColor="hsl(var(--accent))" stopOpacity="0.35" />
                      </linearGradient>
                      <filter id="glow">
                        <feGaussianBlur stdDeviation="0.8" result="b" />
                        <feMerge>
                          <feMergeNode in="b" />
                          <feMergeNode in="SourceGraphic" />
                        </feMerge>
                      </filter>
                    </defs>
                    {/* Stylized Africa silhouette */}
                    <motion.path
                      initial={{ pathLength: 0, opacity: 0 }}
                      animate={{ pathLength: 1, opacity: 1 }}
                      transition={{ duration: 1.4, ease: "easeOut" }}
                      d="M40 8 L55 7 L65 12 L72 18 L78 28 L82 38 L85 50 L82 62 L78 72 L72 82 L68 92 L60 100 L52 102 L46 98 L42 90 L38 82 L32 76 L28 70 L25 62 L22 52 L20 42 L22 30 L26 20 L32 12 Z"
                      fill="url(#africaGrad)"
                      stroke="hsl(var(--primary))"
                      strokeWidth="0.4"
                      strokeOpacity="0.6"
                    />

                    {/* Hub point (center / origin) */}
                    <motion.circle
                      cx="50" cy="55" r="2"
                      fill="hsl(var(--primary))"
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: 0.6 }}
                      filter="url(#glow)"
                    />

                    {/* Connection lines from hub to each target */}
                    {africaTargets.map((t, i) => (
                      <motion.line
                        key={`line-${t.name}`}
                        x1="50" y1="55"
                        x2={t.x} y2={t.y}
                        stroke="url(#africaGrad)"
                        strokeWidth="0.5"
                        strokeDasharray="2 1.5"
                        initial={{ pathLength: 0, opacity: 0 }}
                        animate={{ pathLength: 1, opacity: 0.8 }}
                        transition={{ delay: 0.8 + i * 0.15, duration: 0.6 }}
                      />
                    ))}

                    {/* Country pins */}
                    {africaTargets.map((t, i) => (
                      <g key={t.name}>
                        <motion.circle
                          cx={t.x} cy={t.y} r="3"
                          fill="hsl(var(--accent))"
                          initial={{ scale: 0 }}
                          animate={{ scale: [0, 1.4, 1] }}
                          transition={{ delay: 1 + i * 0.15, duration: 0.5 }}
                          filter="url(#glow)"
                        />
                        <motion.circle
                          cx={t.x} cy={t.y} r="3"
                          fill="none"
                          stroke="hsl(var(--accent))"
                          strokeWidth="0.5"
                          initial={{ scale: 1, opacity: 0 }}
                          animate={{ scale: [1, 3], opacity: [0.8, 0] }}
                          transition={{ delay: 1 + i * 0.15, duration: 1.6, repeat: Infinity, repeatDelay: 0.5 }}
                        />
                      </g>
                    ))}
                  </svg>

                  {/* Country labels */}
                  {africaTargets.map((t, i) => (
                    <motion.div
                      key={`label-${t.name}`}
                      initial={{ opacity: 0, y: 4 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 1.2 + i * 0.15 }}
                      className="absolute -translate-x-1/2 -translate-y-[160%] whitespace-nowrap"
                      style={{ left: `${t.x}%`, top: `${t.y}%` }}
                    >
                      <span className="text-[9px] font-bold text-foreground bg-background/90 backdrop-blur border border-border rounded-md px-1.5 py-0.5 shadow-sm">
                        {t.name}
                      </span>
                    </motion.div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Persistent floating badge — top right */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.8 }}
          className="absolute top-16 right-3 z-20"
        >
          <motion.div
            animate={{ y: [0, -5, 0] }}
            transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
            className="flex items-center gap-2 rounded-full bg-background/95 backdrop-blur-xl border border-border shadow-lg px-3 py-1.5"
          >
            <ShieldCheck className="h-3.5 w-3.5 text-primary" />
            <span className="text-[10px] font-bold text-foreground">100% sécurisé</span>
          </motion.div>
        </motion.div>
      </motion.div>

      {/* Card reflection / shadow */}
      <div className="absolute -bottom-6 left-8 right-8 h-8 bg-primary/20 blur-2xl rounded-full" />
    </div>
  );
};

export default HeroVisual;
