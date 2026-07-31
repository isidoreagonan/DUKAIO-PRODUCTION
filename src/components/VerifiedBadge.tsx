import { motion } from "framer-motion";
import { ShieldCheck, Crown, Gem, ShieldAlert } from "lucide-react";
import { cn } from "@/lib/utils";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

export type BadgeGrade = "standard" | "pro" | "premium";

interface VerifiedBadgeProps {
  grade: BadgeGrade;
  size?: "xs" | "sm" | "md" | "lg";
  /** Show readable label "Standard" / "Pro" / "Premium" next to the icon */
  showLabel?: boolean;
  /** Optional expiration date (ISO string or Date) shown in the tooltip */
  expiresAt?: string | Date | null;
  className?: string;
  onClick?: (event: React.MouseEvent<HTMLSpanElement>) => void;
}

const config: Record<
  BadgeGrade,
  { short: string; label: string; description: string; icon: any; gradient: string; ring: string; text: string }
> = {
  standard: {
    short: "Standard",
    label: "Verify Standard",
    description: "Vendeur vérifié — 100 000 FCFA de ventes atteintes.",
    icon: ShieldCheck,
    gradient: "from-sky-400 to-blue-600",
    ring: "ring-blue-300/50",
    text: "text-white",
  },
  pro: {
    short: "Pro",
    label: "Verify Pro",
    description: "Vendeur Pro — 500 000 FCFA de ventes, parcours de qualité confirmé.",
    icon: Crown,
    gradient: "from-amber-300 via-yellow-400 to-amber-600",
    ring: "ring-amber-300/60",
    text: "text-amber-950",
  },
  premium: {
    short: "Premium",
    label: "Verify Premium",
    description: "Vendeur Premium — 1 000 000 FCFA de ventes, top performeur Dukaio.",
    icon: Gem,
    gradient: "from-violet-400 via-fuchsia-500 to-purple-700",
    ring: "ring-fuchsia-300/60",
    text: "text-white",
  },
};

const sizeMap = {
  xs: { icon: "h-2.5 w-2.5", pad: "p-0.5", label: "text-[9px] px-1.5 py-0.5" },
  sm: { icon: "h-3 w-3", pad: "p-1", label: "text-[10px] px-2 py-0.5" },
  md: { icon: "h-4 w-4", pad: "p-1.5", label: "text-xs px-2.5 py-0.5" },
  lg: { icon: "h-5 w-5", pad: "p-2", label: "text-sm px-3 py-1" },
};

const formatDate = (d: string | Date) => {
  const date = typeof d === "string" ? new Date(d) : d;
  if (isNaN(date.getTime())) return null;
  return date.toLocaleDateString("fr-FR", { day: "2-digit", month: "long", year: "numeric" });
};

export const isBadgeExpired = (expiresAt: string | Date | null | undefined): boolean => {
  if (!expiresAt) return false;
  const date = typeof expiresAt === "string" ? new Date(expiresAt) : expiresAt;
  if (isNaN(date.getTime())) return false;
  return date.getTime() < Date.now();
};

export const VerifiedBadge = ({
  grade,
  size = "sm",
  showLabel = false,
  expiresAt,
  className,
  onClick,
}: VerifiedBadgeProps) => {
  const c = config[grade];
  const s = sizeMap[size];
  const expired = isBadgeExpired(expiresAt);
  const Icon = expired ? ShieldAlert : c.icon;
  const expiresLabel = expiresAt ? formatDate(expiresAt) : null;

  // Expired visuals: greyed out, dashed ring, lower opacity, no gradient
  const expiredBgClass = "bg-muted ring-muted-foreground/30";
  const expiredTextClass = "text-muted-foreground";

  return (
    <TooltipProvider delayDuration={150}>
      <Tooltip>
        <TooltipTrigger asChild>
          <motion.span
            initial={{ scale: 0.7, opacity: 0 }}
            animate={{ scale: 1, opacity: expired ? 0.7 : 1 }}
            whileHover={{ scale: 1.05 }}
            data-testid="verified-badge"
            data-grade={grade}
            data-expired={expired ? "true" : "false"}
            onClick={(event) => {
              event.preventDefault();
              event.stopPropagation();
              onClick?.(event);
            }}
            className={cn(
              "inline-flex items-center gap-1 align-middle cursor-help",
              expired && "grayscale-[0.4]",
              className,
            )}
          >
            <span
              className={cn(
                "inline-flex items-center justify-center rounded-full shadow-md ring-2",
                expired ? expiredBgClass : cn("bg-gradient-to-br", c.gradient, c.ring),
                s.pad,
              )}
            >
              <Icon
                className={cn(s.icon, expired ? expiredTextClass : c.text, "drop-shadow-sm")}
                strokeWidth={2.5}
              />
            </span>
            {showLabel && (
              <span
                className={cn(
                  "rounded-full font-bold tracking-wide shadow-sm",
                  expired
                    ? "bg-muted text-muted-foreground line-through"
                    : cn("bg-gradient-to-r", c.gradient, c.text),
                  s.label,
                )}
              >
                {c.short}
                {expired && " (expiré)"}
              </span>
            )}
          </motion.span>
        </TooltipTrigger>
        <TooltipContent side="top" className="max-w-[260px]">
          <div className="space-y-1">
            <p className="text-xs font-bold flex items-center gap-1.5">
              <Icon className="h-3.5 w-3.5" />
              {expired ? `${c.label} (expiré)` : c.label}
            </p>
            <p className="text-[11px] leading-snug text-muted-foreground">{c.description}</p>
            {expiresLabel && (
              <p
                className={cn(
                  "text-[10px] font-medium pt-1 border-t border-border/40",
                  expired ? "text-destructive" : "text-muted-foreground",
                )}
              >
                {expired ? "Expiré le " : "Valide jusqu'au "}
                <span className="font-semibold">{expiresLabel}</span>
              </p>
            )}
            {expired && (
              <p className="text-[10px] text-destructive font-medium">
                Renouvelez l'abonnement pour réactiver le badge.
              </p>
            )}
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

export default VerifiedBadge;
