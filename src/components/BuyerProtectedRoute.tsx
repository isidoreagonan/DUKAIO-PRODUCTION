import { useEffect, useState, type ReactNode } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import {
  getBuyerSession,
  clearBuyerSession,
  isBuyerInactive,
  needsBuyerOtpReverify,
  updateBuyerActivity,
} from "@/lib/buyerSession";

const BuyerProtectedRoute = ({ children }: { children: ReactNode }) => {
  const [status, setStatus] = useState<"checking" | "ok" | "login" | "otp">("checking");
  const location = useLocation();

  useEffect(() => {
    let cancelled = false;
    (async () => {
      // 1. Inactivity check
      if (isBuyerInactive()) {
        await supabase.auth.signOut().catch(() => {});
        clearBuyerSession();
        if (!cancelled) setStatus("login");
        return;
      }

      // 2. Must have buyer session
      const session = getBuyerSession();
      if (!session) {
        if (!cancelled) setStatus("login");
        return;
      }

      // 3. Periodic OTP re-verification (7 days)
      if (needsBuyerOtpReverify()) {
        if (!cancelled) setStatus("otp");
        return;
      }

      updateBuyerActivity();
      if (!cancelled) setStatus("ok");
    })();

    // Track activity
    const onVis = () => {
      if (document.visibilityState === "visible") updateBuyerActivity();
    };
    document.addEventListener("visibilitychange", onVis);
    const interval = window.setInterval(updateBuyerActivity, 5 * 60 * 1000);

    return () => {
      cancelled = true;
      document.removeEventListener("visibilitychange", onVis);
      window.clearInterval(interval);
    };
  }, [location.pathname]);

  if (status === "checking") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }
  if (status === "login") return <Navigate to="/buyer-login" replace />;
  if (status === "otp") return <Navigate to="/buyer-verify-otp" replace state={{ from: location.pathname }} />;
  return <>{children}</>;
};

export default BuyerProtectedRoute;
