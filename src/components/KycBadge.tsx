import { BadgeCheck } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Blue KYC verified badge. Distinct from the platform "Verified" badge.
 * Shown next to customer/buyer reviews when the buyer has a validated KYC.
 */
export const KycBadge = ({
  size = "sm",
  className,
}: {
  size?: "sm" | "md";
  className?: string;
}) => {
  const dim = size === "md" ? "h-5 w-5" : "h-4 w-4";
  return (
    <span
      title="Identité vérifiée par KYC"
      className={cn(
        "inline-flex items-center justify-center text-sky-500",
        className,
      )}
    >
      <BadgeCheck className={cn(dim, "fill-sky-500/15")} />
    </span>
  );
};

export default KycBadge;
