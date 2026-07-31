import { ShieldCheck, Fingerprint, Lock, Sparkles } from "lucide-react";
import { motion } from "framer-motion";

const badges = [
  { icon: Fingerprint, label: "KYC Didit.me" },
  { icon: ShieldCheck, label: "Anti-fraude IA" },
  { icon: Lock, label: "Paiements chiffrés" },
  { icon: Sparkles, label: "Modération humaine" },
];

const TrustBadgesStrip = ({ className = "" }: { className?: string }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.5 }}
      className={`flex flex-wrap items-center gap-2 ${className}`}
    >
      {badges.map((b) => (
        <span
          key={b.label}
          className="inline-flex items-center gap-1.5 rounded-full border border-border bg-background/70 px-3 py-1 text-[11px] font-medium text-muted-foreground backdrop-blur-sm"
        >
          <b.icon className="h-3 w-3 text-primary" /> {b.label}
        </span>
      ))}
    </motion.div>
  );
};

export default TrustBadgesStrip;
