import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

export const useAnalytics = () => {
  const location = useLocation();

  useEffect(() => {
    // Record page view when path changes
    const trackPageview = async () => {
      try {
        await supabase.functions.invoke("track-visit", {
          body: {
            path: location.pathname,
            referrer: document.referrer || "direct"
          }
        });
      } catch (err) {
        // Silently fail so we don't bother the user with analytics errors
        console.error("Analytics error:", err);
      }
    };

    trackPageview();
  }, [location.pathname]);
};
